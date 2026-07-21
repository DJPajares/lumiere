import type { Database } from "@lumiere/db";
import {
  and,
  asc,
  desc,
  eq,
  guestGroupMembers,
  guestGroups,
  inArray,
  rsvpResponses,
  sql,
} from "@lumiere/db";
import type { GuestGroup, GuestGroupMember, GuestGroupMutation } from "@lumiere/types";
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes } from "node:crypto";

import { ApiHttpError } from "./errors";
import { toIsoDateTime } from "./serialization";

type GuestGroupRow = typeof guestGroups.$inferSelect;
type GuestGroupMemberRow = typeof guestGroupMembers.$inferSelect;

export type InviteTokenRecord = {
  inviteCode: string;
  inviteTokenEncrypted?: string;
  inviteTokenHash: string;
};

export type GuestGroupWithInviteToken = GuestGroup & { inviteTokenEncrypted?: string };

export type GuestGroupStore = {
  createGuestGroup(
    eventId: string,
    input: GuestGroupMutation,
    invite: InviteTokenRecord,
  ): Promise<GuestGroup>;
  disableGuestGroup(eventId: string, groupId: string): Promise<GuestGroup | null>;
  listGuestGroups(eventId: string): Promise<GuestGroupWithInviteToken[]>;
  regenerateInvite(
    eventId: string,
    groupId: string,
    invite: InviteTokenRecord,
  ): Promise<GuestGroup | null>;
  updateGuestGroup(
    eventId: string,
    groupId: string,
    input: GuestGroupMutation,
  ): Promise<GuestGroup | null>;
};

export type GeneratedInvite = InviteTokenRecord & {
  token: string;
};

export const resolveManagerGuestGroupStatus = ({
  currentStatus,
  lastOpenedAt,
  requestedStatus,
  responseStatus,
}: {
  currentStatus: GuestGroup["status"];
  lastOpenedAt?: string | null;
  requestedStatus?: GuestGroupMutation["status"];
  responseStatus?: "attending" | "maybe" | "not_attending" | null;
}): GuestGroup["status"] => {
  if (!requestedStatus || requestedStatus === currentStatus) {
    return currentStatus;
  }

  if (requestedStatus === "pending" || requestedStatus === "disabled") {
    return requestedStatus;
  }

  if (requestedStatus === "opened" && lastOpenedAt) {
    return "opened";
  }

  if (
    requestedStatus === "responded" &&
    (responseStatus === "attending" || responseStatus === "maybe")
  ) {
    return "responded";
  }

  if (requestedStatus === "declined" && responseStatus === "not_attending") {
    return "declined";
  }

  throw new ApiHttpError(
    "VALIDATION_ERROR",
    `${formatGuestGroupStatus(requestedStatus)} requires matching guest activity or RSVP history`,
    {
      fields: [
        {
          message:
            requestedStatus === "opened"
              ? "The invite must have an open timestamp before it can be marked Opened"
              : `A matching ${formatGuestGroupStatus(requestedStatus)} RSVP must exist before using this status`,
          path: ["status"],
        },
      ],
    },
  );
};

export const createDrizzleGuestGroupStore = (db: Database): GuestGroupStore => ({
  async createGuestGroup(eventId, input, invite) {
    return withInviteConflictHandling(async () => {
      const status = resolveManagerGuestGroupStatus({
        currentStatus: "pending",
        requestedStatus: input.status,
      });
      const result = await db.transaction(async (tx) => {
        const [guestGroup] = await tx
          .insert(guestGroups)
          .values({
            contactEmail: input.contactEmail,
            contactName: input.contactName,
            eventId,
            inviteCode: invite.inviteCode,
            inviteTokenEncrypted: invite.inviteTokenEncrypted,
            inviteTokenHash: invite.inviteTokenHash,
            label: input.label,
            maxPax: input.maxPax,
            notes: input.notes,
            status,
          })
          .returning();

        if (!guestGroup) {
          throw new ApiHttpError("INTERNAL_ERROR", "Unable to create guest group");
        }

        if (input.members && input.members.length > 0) {
          await tx.insert(guestGroupMembers).values(
            input.members.map((member, sortOrder) => ({
              guestGroupId: guestGroup.id,
              name: member.name,
              sortOrder,
            })),
          );
        }

        return guestGroup;
      });

      const members = await listGuestGroupMembers(db, result.id);
      return toApiGuestGroup(result, members);
    });
  },

  async disableGuestGroup(eventId, groupId) {
    const [guestGroup] = await db
      .update(guestGroups)
      .set({
        status: "disabled",
        updatedAt: sql`now()`,
      })
      .where(and(eq(guestGroups.eventId, eventId), eq(guestGroups.id, groupId)))
      .returning();

    return guestGroup
      ? toApiGuestGroup(guestGroup, await listGuestGroupMembers(db, guestGroup.id))
      : null;
  },

  async listGuestGroups(eventId) {
    const rows = await db
      .select()
      .from(guestGroups)
      .where(eq(guestGroups.eventId, eventId))
      .orderBy(desc(guestGroups.createdAt));

    const memberRows = rows.length
      ? await db
          .select()
          .from(guestGroupMembers)
          .where(
            inArray(
              guestGroupMembers.guestGroupId,
              rows.map((row) => row.id),
            ),
          )
          .orderBy(asc(guestGroupMembers.sortOrder), asc(guestGroupMembers.createdAt))
      : [];
    const membersByGroup = groupMembersByGroupId(memberRows);

    return rows.map((row) => ({
      ...toApiGuestGroup(row, membersByGroup.get(row.id) ?? []),
      ...(row.inviteTokenEncrypted ? { inviteTokenEncrypted: row.inviteTokenEncrypted } : {}),
    }));
  },

  async regenerateInvite(eventId, groupId, invite) {
    return withInviteConflictHandling(async () => {
      const [guestGroup] = await db
        .update(guestGroups)
        .set({
          inviteCode: invite.inviteCode,
          inviteTokenEncrypted: invite.inviteTokenEncrypted,
          inviteTokenHash: invite.inviteTokenHash,
          lastOpenedAt: null,
          status: "pending",
          updatedAt: sql`now()`,
        })
        .where(and(eq(guestGroups.eventId, eventId), eq(guestGroups.id, groupId)))
        .returning();

      return guestGroup
        ? toApiGuestGroup(guestGroup, await listGuestGroupMembers(db, guestGroup.id))
        : null;
    });
  },

  async updateGuestGroup(eventId, groupId, input) {
    const result = await db.transaction(async (tx) => {
      const [existingGroup] = await tx
        .select({
          lastOpenedAt: guestGroups.lastOpenedAt,
          status: guestGroups.status,
        })
        .from(guestGroups)
        .where(and(eq(guestGroups.eventId, eventId), eq(guestGroups.id, groupId)))
        .limit(1);

      if (!existingGroup) {
        return null;
      }

      const existingMembers = await tx
        .select({ id: guestGroupMembers.id })
        .from(guestGroupMembers)
        .where(eq(guestGroupMembers.guestGroupId, groupId));

      let responseStatus: "attending" | "maybe" | "not_attending" | null = null;

      if (
        input.status !== existingGroup.status &&
        (input.status === "responded" || input.status === "declined")
      ) {
        const [response] = await tx
          .select({ responseStatus: rsvpResponses.responseStatus })
          .from(rsvpResponses)
          .where(eq(rsvpResponses.guestGroupId, groupId))
          .limit(1);

        responseStatus = response?.responseStatus ?? null;
      }

      const status = resolveManagerGuestGroupStatus({
        currentStatus: existingGroup.status,
        lastOpenedAt: existingGroup.lastOpenedAt,
        requestedStatus: input.status,
        responseStatus,
      });

      if (input.members === undefined && existingMembers.length > input.maxPax) {
        throw new ApiHttpError(
          "VALIDATION_ERROR",
          "Maximum party size cannot be lower than the number of named members",
          {
            fields: [
              {
                message: "Increase max pax or remove named members before saving",
                path: ["maxPax"],
              },
            ],
          },
        );
      }

      const [guestGroup] = await tx
        .update(guestGroups)
        .set({
          contactEmail: input.contactEmail,
          contactName: input.contactName,
          label: input.label,
          maxPax: input.maxPax,
          notes: input.notes,
          status,
          updatedAt: sql`now()`,
        })
        .where(and(eq(guestGroups.eventId, eventId), eq(guestGroups.id, groupId)))
        .returning();

      if (!guestGroup) {
        return null;
      }

      if (input.members !== undefined) {
        const existingMemberIds = new Set(existingMembers.map((member) => member.id));

        await tx.delete(guestGroupMembers).where(eq(guestGroupMembers.guestGroupId, groupId));

        if (input.members.length > 0) {
          await tx.insert(guestGroupMembers).values(
            input.members.map((member, sortOrder) => ({
              ...(member.id && existingMemberIds.has(member.id) ? { id: member.id } : {}),
              guestGroupId: groupId,
              name: member.name,
              sortOrder,
            })),
          );
        }
      }

      return guestGroup;
    });

    return result ? toApiGuestGroup(result, await listGuestGroupMembers(db, result.id)) : null;
  },
});

export const generateInvite = (inviteTokenSecret: string): GeneratedInvite => {
  const token = randomBytes(32).toString("base64url");

  return {
    inviteTokenEncrypted: encryptInviteToken(token, inviteTokenSecret),
    inviteCode: randomBytes(8).toString("base64url"),
    inviteTokenHash: hashInviteToken(token, inviteTokenSecret),
    token,
  };
};

export const hashInviteToken = (token: string, inviteTokenSecret: string) =>
  createHmac("sha256", inviteTokenSecret).update(token).digest("hex");

export const decryptInviteToken = (value: string, secret: string) => {
  try {
    const [ivValue, tagValue, encryptedValue] = value.split(".");
    if (!ivValue || !tagValue || !encryptedValue) return undefined;
    const decipher = createDecipheriv(
      "aes-256-gcm",
      createHash("sha256").update(secret).digest(),
      Buffer.from(ivValue, "base64url"),
    );
    decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
    return Buffer.concat([
      decipher.update(Buffer.from(encryptedValue, "base64url")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    return undefined;
  }
};

export const buildGuestInviteLink = ({
  baseUrl,
  eventSlug,
  token,
}: {
  baseUrl: string;
  eventSlug: string;
  token: string;
}) => `${baseUrl.replace(/\/+$/, "")}/e/${eventSlug}/g/${token}`;

const encryptInviteToken = (token: string, secret: string) => {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", createHash("sha256").update(secret).digest(), iv);
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  return [
    iv.toString("base64url"),
    cipher.getAuthTag().toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".");
};

export const toApiGuestGroup = (
  guestGroup: GuestGroupRow,
  members: GuestGroupMemberRow[] = [],
): GuestGroup => ({
  contactEmail: guestGroup.contactEmail ?? undefined,
  contactName: guestGroup.contactName ?? undefined,
  createdAt: toIsoDateTime(guestGroup.createdAt),
  eventId: guestGroup.eventId,
  id: guestGroup.id,
  inviteCode: guestGroup.inviteCode,
  label: guestGroup.label,
  lastOpenedAt: guestGroup.lastOpenedAt ? toIsoDateTime(guestGroup.lastOpenedAt) : undefined,
  members: members.map(toApiGuestGroupMember),
  maxPax: guestGroup.maxPax,
  notes: guestGroup.notes ?? undefined,
  status: guestGroup.status,
  updatedAt: toIsoDateTime(guestGroup.updatedAt),
});

const listGuestGroupMembers = async (db: Database, guestGroupId: string) =>
  db
    .select()
    .from(guestGroupMembers)
    .where(eq(guestGroupMembers.guestGroupId, guestGroupId))
    .orderBy(asc(guestGroupMembers.sortOrder), asc(guestGroupMembers.createdAt));

const groupMembersByGroupId = (members: GuestGroupMemberRow[]) => {
  const grouped = new Map<string, GuestGroupMemberRow[]>();

  for (const member of members) {
    const group = grouped.get(member.guestGroupId) ?? [];
    group.push(member);
    grouped.set(member.guestGroupId, group);
  }

  return grouped;
};

const toApiGuestGroupMember = (member: GuestGroupMemberRow): GuestGroupMember => ({
  id: member.id,
  name: member.name,
  sortOrder: member.sortOrder,
});

const formatGuestGroupStatus = (status: GuestGroup["status"]) =>
  status.charAt(0).toUpperCase() + status.slice(1);

const withInviteConflictHandling = async <TValue>(operation: () => Promise<TValue>) => {
  try {
    return await operation();
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ApiHttpError("CONFLICT", "Guest invite token could not be generated");
    }

    throw error;
  }
};

const isUniqueViolation = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  (error as { code?: unknown }).code === "23505";
