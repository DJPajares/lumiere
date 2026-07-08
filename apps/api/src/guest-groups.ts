import type { Database } from "@lumiere/db";
import { guestGroups } from "@lumiere/db";
import type { GuestGroup, GuestGroupMutation } from "@lumiere/types";
import { and, desc, eq, sql } from "drizzle-orm";
import { createHmac, randomBytes } from "node:crypto";

import { ApiHttpError } from "./errors";

type GuestGroupRow = typeof guestGroups.$inferSelect;

export type InviteTokenRecord = {
  inviteCode: string;
  inviteTokenHash: string;
};

export type GuestGroupStore = {
  createGuestGroup(
    eventId: string,
    input: GuestGroupMutation,
    invite: InviteTokenRecord,
  ): Promise<GuestGroup>;
  disableGuestGroup(eventId: string, groupId: string): Promise<GuestGroup | null>;
  listGuestGroups(eventId: string): Promise<GuestGroup[]>;
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

export const createDrizzleGuestGroupStore = (db: Database): GuestGroupStore => ({
  async createGuestGroup(eventId, input, invite) {
    return withInviteConflictHandling(async () => {
      const [guestGroup] = await db
        .insert(guestGroups)
        .values({
          contactEmail: input.contactEmail,
          contactName: input.contactName,
          eventId,
          inviteCode: invite.inviteCode,
          inviteTokenHash: invite.inviteTokenHash,
          label: input.label,
          maxPax: input.maxPax,
          notes: input.notes,
          status: input.status ?? "pending",
        })
        .returning();

      if (!guestGroup) {
        throw new ApiHttpError("INTERNAL_ERROR", "Unable to create guest group");
      }

      return toApiGuestGroup(guestGroup);
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

    return guestGroup ? toApiGuestGroup(guestGroup) : null;
  },

  async listGuestGroups(eventId) {
    const rows = await db
      .select()
      .from(guestGroups)
      .where(eq(guestGroups.eventId, eventId))
      .orderBy(desc(guestGroups.createdAt));

    return rows.map(toApiGuestGroup);
  },

  async regenerateInvite(eventId, groupId, invite) {
    return withInviteConflictHandling(async () => {
      const [guestGroup] = await db
        .update(guestGroups)
        .set({
          inviteCode: invite.inviteCode,
          inviteTokenHash: invite.inviteTokenHash,
          lastOpenedAt: null,
          status: "pending",
          updatedAt: sql`now()`,
        })
        .where(and(eq(guestGroups.eventId, eventId), eq(guestGroups.id, groupId)))
        .returning();

      return guestGroup ? toApiGuestGroup(guestGroup) : null;
    });
  },

  async updateGuestGroup(eventId, groupId, input) {
    const [guestGroup] = await db
      .update(guestGroups)
      .set({
        contactEmail: input.contactEmail,
        contactName: input.contactName,
        label: input.label,
        maxPax: input.maxPax,
        notes: input.notes,
        ...(input.status ? { status: input.status } : {}),
        updatedAt: sql`now()`,
      })
      .where(and(eq(guestGroups.eventId, eventId), eq(guestGroups.id, groupId)))
      .returning();

    return guestGroup ? toApiGuestGroup(guestGroup) : null;
  },
});

export const generateInvite = (inviteTokenSecret: string): GeneratedInvite => {
  const token = randomBytes(32).toString("base64url");

  return {
    inviteCode: randomBytes(8).toString("base64url"),
    inviteTokenHash: hashInviteToken(token, inviteTokenSecret),
    token,
  };
};

export const hashInviteToken = (token: string, inviteTokenSecret: string) =>
  createHmac("sha256", inviteTokenSecret).update(token).digest("hex");

export const buildGuestInviteLink = ({
  baseUrl,
  eventSlug,
  token,
}: {
  baseUrl: string;
  eventSlug: string;
  token: string;
}) => `${baseUrl.replace(/\/+$/, "")}/e/${eventSlug}/g/${token}`;

export const toApiGuestGroup = (guestGroup: GuestGroupRow): GuestGroup => ({
  contactEmail: guestGroup.contactEmail ?? undefined,
  contactName: guestGroup.contactName ?? undefined,
  createdAt: guestGroup.createdAt,
  eventId: guestGroup.eventId,
  id: guestGroup.id,
  inviteCode: guestGroup.inviteCode,
  label: guestGroup.label,
  lastOpenedAt: guestGroup.lastOpenedAt ?? undefined,
  maxPax: guestGroup.maxPax,
  notes: guestGroup.notes ?? undefined,
  status: guestGroup.status,
  updatedAt: guestGroup.updatedAt,
});

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
