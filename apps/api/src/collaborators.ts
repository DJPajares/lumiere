import type { Database } from "@lumiere/db";
import {
  activityEvents,
  and,
  asc,
  collaboratorInvitations,
  desc,
  eq,
  eventManagers,
  events,
  isNull,
  ne,
  sql,
  users,
} from "@lumiere/db";
import type {
  CollaboratorInvitation,
  CollaboratorInvitationInboxItem,
  CollaboratorRole,
  EventCollaborator,
} from "@lumiere/types";

import { ApiHttpError } from "./errors";
import { toIsoDateTime } from "./serialization";

type CollaboratorInvitationRow = typeof collaboratorInvitations.$inferSelect;
type EventManagerRow = typeof eventManagers.$inferSelect;
type StoreDatabase = Database;

export const collaboratorInvitationLifetimeDays = 7;

export type CollaboratorInvitationIssue =
  "expired" | "identity_mismatch" | "membership_exists" | "not_pending" | "pending_exists";

export type CollaboratorInvitationResult =
  CollaboratorInvitation | CollaboratorInvitationIssue | null;

export type CollaboratorInvitationAcceptanceResult =
  | {
      collaborator: EventCollaborator;
      invitation: CollaboratorInvitation;
    }
  | CollaboratorInvitationIssue
  | null;

export type CollaboratorRemovalResult = "owner" | boolean;
export type CollaboratorRoleUpdateResult = EventCollaborator | "owner" | null;

export type CollaboratorStore = {
  acceptInvitation(
    invitationId: string,
    manager: {
      displayName: string | null;
      email: string;
      userId: string;
    },
  ): Promise<CollaboratorInvitationAcceptanceResult>;
  createInvitation(input: {
    email: string;
    eventId: string;
    invitedByUserId: string;
    role: CollaboratorRole;
  }): Promise<CollaboratorInvitation | "membership_exists" | "pending_exists">;
  declineInvitation(
    invitationId: string,
    manager: { email: string; userId: string },
  ): Promise<CollaboratorInvitationResult>;
  listEventCollaboration(eventId: string): Promise<{
    collaborators: EventCollaborator[];
    invitations: CollaboratorInvitation[];
  }>;
  listPendingInvitations(email: string): Promise<CollaboratorInvitationInboxItem[]>;
  removeCollaborator(
    eventId: string,
    collaboratorUserId: string,
    actorUserId: string,
  ): Promise<CollaboratorRemovalResult>;
  resendInvitation(eventId: string, invitationId: string): Promise<CollaboratorInvitationResult>;
  revokeInvitation(eventId: string, invitationId: string): Promise<CollaboratorInvitationResult>;
  updateCollaboratorRole(
    eventId: string,
    collaboratorUserId: string,
    role: CollaboratorRole,
    actorUserId: string,
  ): Promise<CollaboratorRoleUpdateResult>;
};

export const createDrizzleCollaboratorStore = (db: Database): CollaboratorStore => ({
  async acceptInvitation(invitationId, manager) {
    return db.transaction(async (tx) => {
      const database = tx as unknown as StoreDatabase;
      const initialInvitation = await findInvitation(database, invitationId);

      if (!initialInvitation) {
        return null;
      }

      const normalizedEmail = normalizeCollaboratorEmail(manager.email);
      await lockCollaboratorIdentity(database, initialInvitation.eventId, initialInvitation.email);
      const invitation = await findInvitation(database, invitationId);

      if (!invitation) {
        return null;
      }

      if (invitation.email !== normalizedEmail) {
        return "identity_mismatch";
      }

      const eventAvailable = await isEventAvailable(database, invitation.eventId);

      if (!eventAvailable) {
        return null;
      }

      if (invitation.status !== "pending") {
        return invitation.status === "expired" ? "expired" : "not_pending";
      }

      if (hasExpired(invitation)) {
        await markInvitationExpired(database, invitation.id);
        return "expired";
      }

      const membershipExists = await hasActiveMembership(
        database,
        invitation.eventId,
        normalizedEmail,
        manager.userId,
      );

      if (membershipExists) {
        return "membership_exists";
      }

      const [acceptedInvitation] = await database
        .update(collaboratorInvitations)
        .set({
          respondedAt: sql`now()`,
          respondedByUserId: manager.userId,
          status: "accepted",
          updatedAt: sql`now()`,
        })
        .where(
          and(
            eq(collaboratorInvitations.id, invitation.id),
            eq(collaboratorInvitations.status, "pending"),
          ),
        )
        .returning();

      if (!acceptedInvitation) {
        return "not_pending";
      }

      const [membership] = await database
        .insert(eventManagers)
        .values({
          eventId: invitation.eventId,
          role: invitation.role,
          userId: manager.userId,
        })
        .returning();

      if (!membership) {
        throw new ApiHttpError("INTERNAL_ERROR", "Unable to create collaborator membership");
      }

      return {
        collaborator: toApiCollaborator({
          ...membership,
          displayName: manager.displayName,
          email: normalizedEmail,
        }),
        invitation: toApiCollaboratorInvitation(acceptedInvitation),
      };
    });
  },

  async createInvitation(input) {
    const normalizedEmail = normalizeCollaboratorEmail(input.email);

    return db.transaction(async (tx) => {
      const database = tx as unknown as StoreDatabase;
      await lockCollaboratorIdentity(database, input.eventId, normalizedEmail);
      await expirePendingInvitations(database, input.eventId, normalizedEmail);

      if (await hasActiveMembership(database, input.eventId, normalizedEmail)) {
        return "membership_exists";
      }

      const [pendingInvitation] = await database
        .select({ id: collaboratorInvitations.id })
        .from(collaboratorInvitations)
        .where(
          and(
            eq(collaboratorInvitations.eventId, input.eventId),
            eq(collaboratorInvitations.email, normalizedEmail),
            eq(collaboratorInvitations.status, "pending"),
          ),
        )
        .limit(1);

      if (pendingInvitation) {
        return "pending_exists";
      }

      const [invitation] = await database
        .insert(collaboratorInvitations)
        .values({
          email: normalizedEmail,
          eventId: input.eventId,
          expiresAt: invitationExpiry(),
          invitedByUserId: input.invitedByUserId,
          role: input.role,
        })
        .returning();

      if (!invitation) {
        throw new ApiHttpError("INTERNAL_ERROR", "Unable to create collaborator invitation");
      }

      return toApiCollaboratorInvitation(invitation);
    });
  },

  async declineInvitation(invitationId, manager) {
    return db.transaction(async (tx) => {
      const database = tx as unknown as StoreDatabase;
      const initialInvitation = await findInvitation(database, invitationId);

      if (!initialInvitation) {
        return null;
      }

      const normalizedEmail = normalizeCollaboratorEmail(manager.email);
      await lockCollaboratorIdentity(database, initialInvitation.eventId, initialInvitation.email);
      const invitation = await findInvitation(database, invitationId);

      if (!invitation) {
        return null;
      }

      if (invitation.email !== normalizedEmail) {
        return "identity_mismatch";
      }

      if (!(await isEventAvailable(database, invitation.eventId))) {
        return null;
      }

      if (invitation.status !== "pending") {
        return invitation.status === "expired" ? "expired" : "not_pending";
      }

      if (hasExpired(invitation)) {
        await markInvitationExpired(database, invitation.id);
        return "expired";
      }

      const [declinedInvitation] = await database
        .update(collaboratorInvitations)
        .set({
          respondedAt: sql`now()`,
          respondedByUserId: manager.userId,
          status: "declined",
          updatedAt: sql`now()`,
        })
        .where(
          and(
            eq(collaboratorInvitations.id, invitation.id),
            eq(collaboratorInvitations.status, "pending"),
          ),
        )
        .returning();

      return declinedInvitation ? toApiCollaboratorInvitation(declinedInvitation) : "not_pending";
    });
  },

  async listEventCollaboration(eventId) {
    await expirePendingInvitations(db, eventId);

    const [collaboratorRows, invitationRows] = await Promise.all([
      db
        .select({
          createdAt: eventManagers.createdAt,
          displayName: users.displayName,
          email: users.email,
          eventId: eventManagers.eventId,
          id: eventManagers.id,
          role: eventManagers.role,
          userId: eventManagers.userId,
        })
        .from(eventManagers)
        .innerJoin(users, eq(users.id, eventManagers.userId))
        .where(eq(eventManagers.eventId, eventId))
        .orderBy(asc(eventManagers.createdAt), asc(users.email)),
      db
        .select()
        .from(collaboratorInvitations)
        .where(eq(collaboratorInvitations.eventId, eventId))
        .orderBy(desc(collaboratorInvitations.createdAt)),
    ]);

    return {
      collaborators: collaboratorRows.map(toApiCollaborator),
      invitations: invitationRows.map(toApiCollaboratorInvitation),
    };
  },

  async listPendingInvitations(email) {
    const normalizedEmail = normalizeCollaboratorEmail(email);

    await db
      .update(collaboratorInvitations)
      .set({
        status: "expired",
        updatedAt: sql`now()`,
      })
      .where(
        and(
          eq(collaboratorInvitations.email, normalizedEmail),
          eq(collaboratorInvitations.status, "pending"),
          sql`${collaboratorInvitations.expiresAt} <= now()`,
        ),
      );

    const invitationRows = await db
      .select({
        eventTitle: events.title,
        invitation: collaboratorInvitations,
        invitedByDisplayName: users.displayName,
        invitedByEmail: users.email,
      })
      .from(collaboratorInvitations)
      .innerJoin(events, eq(events.id, collaboratorInvitations.eventId))
      .innerJoin(users, eq(users.id, collaboratorInvitations.invitedByUserId))
      .where(
        and(
          eq(collaboratorInvitations.email, normalizedEmail),
          eq(collaboratorInvitations.status, "pending"),
          isNull(events.deletedAt),
          sql`${collaboratorInvitations.expiresAt} > now()`,
        ),
      )
      .orderBy(asc(collaboratorInvitations.expiresAt), desc(collaboratorInvitations.createdAt));

    return invitationRows.map((row) => ({
      ...toApiCollaboratorInvitation(row.invitation),
      eventTitle: row.eventTitle,
      ...(row.invitedByDisplayName ? { invitedByDisplayName: row.invitedByDisplayName } : {}),
      invitedByEmail: row.invitedByEmail,
    }));
  },

  async removeCollaborator(eventId, collaboratorUserId, actorUserId) {
    return db.transaction(async (tx) => {
      const database = tx as unknown as StoreDatabase;
      const [event] = await database
        .select({ ownerUserId: events.ownerUserId })
        .from(events)
        .where(and(eq(events.id, eventId), isNull(events.deletedAt)))
        .limit(1);

      if (!event) {
        return false;
      }

      if (event.ownerUserId === collaboratorUserId) {
        return "owner";
      }

      const [membership] = await database
        .select({
          displayName: users.displayName,
          email: users.email,
          role: eventManagers.role,
        })
        .from(eventManagers)
        .innerJoin(users, eq(users.id, eventManagers.userId))
        .where(
          and(eq(eventManagers.eventId, eventId), eq(eventManagers.userId, collaboratorUserId)),
        )
        .limit(1);

      if (!membership) {
        return false;
      }

      if (membership.role === "owner") {
        return "owner";
      }

      const [removed] = await database
        .delete(eventManagers)
        .where(
          and(
            eq(eventManagers.eventId, eventId),
            eq(eventManagers.userId, collaboratorUserId),
            ne(eventManagers.role, "owner"),
          ),
        )
        .returning({ id: eventManagers.id });

      if (!removed) {
        return false;
      }

      await database.insert(activityEvents).values({
        actorId: actorUserId,
        actorType: "manager",
        activityType: "collaborator_removed",
        eventId,
        metadataJson: {
          collaboratorEmail: membership.email,
          collaboratorUserId,
          previousRole: membership.role,
        },
      });

      return true;
    });
  },

  async resendInvitation(eventId, invitationId) {
    return db.transaction(async (tx) => {
      const database = tx as unknown as StoreDatabase;
      const initialInvitation = await findInvitation(database, invitationId, eventId);

      if (!initialInvitation) {
        return null;
      }

      await lockCollaboratorIdentity(database, eventId, initialInvitation.email);
      await expirePendingInvitations(database, eventId, initialInvitation.email);
      const invitation = await findInvitation(database, invitationId, eventId);

      if (!invitation) {
        return null;
      }

      if (!["expired", "pending"].includes(invitation.status)) {
        return "not_pending";
      }

      if (await hasActiveMembership(database, eventId, invitation.email)) {
        return "membership_exists";
      }

      const [otherPendingInvitation] = await database
        .select({ id: collaboratorInvitations.id })
        .from(collaboratorInvitations)
        .where(
          and(
            eq(collaboratorInvitations.eventId, eventId),
            eq(collaboratorInvitations.email, invitation.email),
            eq(collaboratorInvitations.status, "pending"),
            ne(collaboratorInvitations.id, invitation.id),
          ),
        )
        .limit(1);

      if (otherPendingInvitation) {
        return "pending_exists";
      }

      const [resentInvitation] = await database
        .update(collaboratorInvitations)
        .set({
          expiresAt: invitationExpiry(),
          lastSentAt: sql`now()`,
          respondedAt: null,
          respondedByUserId: null,
          revokedAt: null,
          sendCount: sql`${collaboratorInvitations.sendCount} + 1`,
          status: "pending",
          updatedAt: sql`now()`,
        })
        .where(eq(collaboratorInvitations.id, invitation.id))
        .returning();

      return resentInvitation ? toApiCollaboratorInvitation(resentInvitation) : null;
    });
  },

  async revokeInvitation(eventId, invitationId) {
    return db.transaction(async (tx) => {
      const database = tx as unknown as StoreDatabase;
      const initialInvitation = await findInvitation(database, invitationId, eventId);

      if (!initialInvitation) {
        return null;
      }

      await lockCollaboratorIdentity(database, eventId, initialInvitation.email);
      await expirePendingInvitations(database, eventId, initialInvitation.email);
      const invitation = await findInvitation(database, invitationId, eventId);

      if (!invitation) {
        return null;
      }

      if (invitation.status !== "pending") {
        return invitation.status === "expired" ? "expired" : "not_pending";
      }

      const [revokedInvitation] = await database
        .update(collaboratorInvitations)
        .set({
          revokedAt: sql`now()`,
          status: "revoked",
          updatedAt: sql`now()`,
        })
        .where(
          and(
            eq(collaboratorInvitations.id, invitation.id),
            eq(collaboratorInvitations.status, "pending"),
          ),
        )
        .returning();

      return revokedInvitation ? toApiCollaboratorInvitation(revokedInvitation) : "not_pending";
    });
  },

  async updateCollaboratorRole(eventId, collaboratorUserId, role, actorUserId) {
    return db.transaction(async (tx) => {
      const database = tx as unknown as StoreDatabase;
      const [event] = await database
        .select({ ownerUserId: events.ownerUserId })
        .from(events)
        .where(and(eq(events.id, eventId), isNull(events.deletedAt)))
        .limit(1);

      if (!event) {
        return null;
      }

      if (event.ownerUserId === collaboratorUserId) {
        return "owner";
      }

      const [membership] = await database
        .select({
          createdAt: eventManagers.createdAt,
          displayName: users.displayName,
          email: users.email,
          eventId: eventManagers.eventId,
          id: eventManagers.id,
          role: eventManagers.role,
          userId: eventManagers.userId,
        })
        .from(eventManagers)
        .innerJoin(users, eq(users.id, eventManagers.userId))
        .where(
          and(eq(eventManagers.eventId, eventId), eq(eventManagers.userId, collaboratorUserId)),
        )
        .limit(1);

      if (!membership) {
        return null;
      }

      if (membership.role === "owner") {
        return "owner";
      }

      if (membership.role === role) {
        return toApiCollaborator(membership);
      }

      const [updatedMembership] = await database
        .update(eventManagers)
        .set({ role })
        .where(
          and(
            eq(eventManagers.eventId, eventId),
            eq(eventManagers.userId, collaboratorUserId),
            ne(eventManagers.role, "owner"),
          ),
        )
        .returning();

      if (!updatedMembership) {
        return null;
      }

      await database.insert(activityEvents).values({
        actorId: actorUserId,
        actorType: "manager",
        activityType: "collaborator_role_changed",
        eventId,
        metadataJson: {
          collaboratorEmail: membership.email,
          collaboratorUserId,
          previousRole: membership.role,
          role,
        },
      });

      return toApiCollaborator({
        ...updatedMembership,
        displayName: membership.displayName,
        email: membership.email,
      });
    });
  },
});

const findInvitation = async (database: StoreDatabase, invitationId: string, eventId?: string) => {
  const [invitation] = await database
    .select()
    .from(collaboratorInvitations)
    .where(
      eventId
        ? and(
            eq(collaboratorInvitations.id, invitationId),
            eq(collaboratorInvitations.eventId, eventId),
          )
        : eq(collaboratorInvitations.id, invitationId),
    )
    .limit(1);

  return invitation ?? null;
};

const expirePendingInvitations = async (
  database: StoreDatabase,
  eventId: string,
  email?: string,
) => {
  await database
    .update(collaboratorInvitations)
    .set({
      status: "expired",
      updatedAt: sql`now()`,
    })
    .where(
      and(
        eq(collaboratorInvitations.eventId, eventId),
        eq(collaboratorInvitations.status, "pending"),
        sql`${collaboratorInvitations.expiresAt} <= now()`,
        ...(email ? [eq(collaboratorInvitations.email, email)] : []),
      ),
    );
};

const markInvitationExpired = async (database: StoreDatabase, invitationId: string) => {
  await database
    .update(collaboratorInvitations)
    .set({
      status: "expired",
      updatedAt: sql`now()`,
    })
    .where(
      and(
        eq(collaboratorInvitations.id, invitationId),
        eq(collaboratorInvitations.status, "pending"),
      ),
    );
};

const hasActiveMembership = async (
  database: StoreDatabase,
  eventId: string,
  email: string,
  userId?: string,
) => {
  const [ownerIdentity] = await database
    .select({ userId: users.id })
    .from(events)
    .innerJoin(users, eq(users.id, events.ownerUserId))
    .where(
      and(eq(events.id, eventId), isNull(events.deletedAt), sql`lower(${users.email}) = ${email}`),
    )
    .limit(1);

  if (ownerIdentity) {
    return true;
  }

  const [membership] = await database
    .select({ userId: eventManagers.userId })
    .from(eventManagers)
    .innerJoin(users, eq(users.id, eventManagers.userId))
    .where(
      and(
        eq(eventManagers.eventId, eventId),
        userId
          ? sql`(${eventManagers.userId} = ${userId} or lower(${users.email}) = ${email})`
          : sql`lower(${users.email}) = ${email}`,
      ),
    )
    .limit(1);

  return Boolean(membership);
};

const isEventAvailable = async (database: StoreDatabase, eventId: string) => {
  const [event] = await database
    .select({ id: events.id })
    .from(events)
    .where(and(eq(events.id, eventId), isNull(events.deletedAt)))
    .limit(1);

  return Boolean(event);
};

const lockCollaboratorIdentity = async (
  database: StoreDatabase,
  eventId: string,
  email: string,
) => {
  await database.execute(
    sql`select pg_advisory_xact_lock(hashtextextended(${`${eventId}:${email}`}, 0))`,
  );
};

const invitationExpiry = () =>
  new Date(Date.now() + collaboratorInvitationLifetimeDays * 24 * 60 * 60 * 1000).toISOString();

const hasExpired = (invitation: CollaboratorInvitationRow) =>
  Date.parse(invitation.expiresAt) <= Date.now();

export const normalizeCollaboratorEmail = (email: string) => email.trim().toLowerCase();

const toApiCollaboratorInvitation = (
  invitation: CollaboratorInvitationRow,
): CollaboratorInvitation => ({
  createdAt: toIsoDateTime(invitation.createdAt),
  email: invitation.email,
  eventId: invitation.eventId,
  expiresAt: toIsoDateTime(invitation.expiresAt),
  id: invitation.id,
  invitedByUserId: invitation.invitedByUserId,
  lastSentAt: toIsoDateTime(invitation.lastSentAt),
  ...(invitation.respondedAt ? { respondedAt: toIsoDateTime(invitation.respondedAt) } : {}),
  ...(invitation.respondedByUserId ? { respondedByUserId: invitation.respondedByUserId } : {}),
  ...(invitation.revokedAt ? { revokedAt: toIsoDateTime(invitation.revokedAt) } : {}),
  role: invitation.role as CollaboratorRole,
  sendCount: invitation.sendCount,
  status: invitation.status,
  updatedAt: toIsoDateTime(invitation.updatedAt),
});

const toApiCollaborator = (
  collaborator: EventManagerRow & {
    displayName: string | null;
    email: string;
  },
): EventCollaborator => ({
  createdAt: toIsoDateTime(collaborator.createdAt),
  ...(collaborator.displayName ? { displayName: collaborator.displayName } : {}),
  email: collaborator.email,
  eventId: collaborator.eventId,
  id: collaborator.id,
  role: collaborator.role,
  userId: collaborator.userId,
});
