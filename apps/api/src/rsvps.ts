import type { Database } from "@lumiere/db";
import {
  and,
  activityEvents,
  eq,
  eventManagers,
  eventPublications,
  events,
  guestGroups,
  isNull,
  notifications,
  rsvpResponses,
  sql,
} from "@lumiere/db";
import {
  isInviteAccessExpired,
  rsvpSettingsSchema,
  type Event,
  type RsvpResponse,
  type RsvpSubmission,
} from "@lumiere/types";

import { toIsoDateTime } from "./serialization";

type RsvpResponseRow = typeof rsvpResponses.$inferSelect;
type RsvpNotificationType = "rsvp_submitted" | "rsvp_updated";

export type RsvpSubmissionRecord = {
  response: RsvpResponse;
  updatedExisting: boolean;
};

export type RsvpSubmissionRejected =
  | { reason: "closed" }
  | { reason: "guest_names_disabled" }
  | { maxPax: number; reason: "max_pax_exceeded" }
  | { reason: "maybe_disabled" }
  | { reason: "message_disabled" }
  | { reason: "updates_disabled" };

export type RsvpSubmissionResult =
  RsvpSubmissionRecord | RsvpSubmissionRejected | "disabled" | "expired" | null;

export type RsvpStore = {
  submitGuestRsvp(input: {
    eventSlug: string;
    inviteTokenHash: string;
    submission: RsvpSubmission;
  }): Promise<RsvpSubmissionResult>;
};

export const createDrizzleRsvpStore = (db: Database): RsvpStore => ({
  async submitGuestRsvp({ eventSlug, inviteTokenHash, submission }) {
    const [event] = await db
      .select({
        accessExpiresAt: events.accessExpiresAt,
        id: events.id,
        ownerUserId: events.ownerUserId,
        rsvpSettingsJson: eventPublications.rsvpSettingsJson,
        status: events.status,
        title: events.title,
      })
      .from(events)
      .innerJoin(eventPublications, eq(eventPublications.eventId, events.id))
      .where(
        and(
          eq(events.publicSlug, eventSlug),
          eq(events.status, "published"),
          isNull(events.deletedAt),
        ),
      )
      .limit(1);

    if (!event) {
      return null;
    }

    if (isInviteAccessExpired(event.accessExpiresAt)) {
      return "expired";
    }

    const settings = readRsvpSettings(event.rsvpSettingsJson as Event["rsvpSettings"]);

    const [guestGroup] = await db
      .select({
        accessExpiresAt: guestGroups.accessExpiresAt,
        eventId: guestGroups.eventId,
        id: guestGroups.id,
        inviteTokenHash: guestGroups.inviteTokenHash,
        label: guestGroups.label,
        maxPax: guestGroups.maxPax,
        status: guestGroups.status,
      })
      .from(guestGroups)
      .where(
        and(eq(guestGroups.eventId, event.id), eq(guestGroups.inviteTokenHash, inviteTokenHash)),
      )
      .limit(1);

    if (!guestGroup) {
      return null;
    }

    if (guestGroup.status === "disabled") {
      return "disabled";
    }

    if (isInviteAccessExpired(guestGroup.accessExpiresAt)) {
      return "expired";
    }

    if (!settings.enabled || settings.closed || isPast(settings.closesAt)) {
      return { reason: "closed" };
    }

    if (submission.responseStatus === "maybe" && !settings.allowMaybe) {
      return { reason: "maybe_disabled" };
    }

    if (submission.attendeeCount > guestGroup.maxPax) {
      return {
        maxPax: guestGroup.maxPax,
        reason: "max_pax_exceeded",
      };
    }

    if (!settings.collectGuestNames && submission.guestNames.length > 0) {
      return { reason: "guest_names_disabled" };
    }

    if (!settings.collectGuestMessage && submission.message !== undefined) {
      return { reason: "message_disabled" };
    }

    const existingResponse = await getExistingResponse(db, guestGroup.id);

    if (existingResponse && !settings.allowUpdates) {
      return { reason: "updates_disabled" };
    }

    return db.transaction(async (tx) => {
      const [response] = existingResponse
        ? await tx
            .update(rsvpResponses)
            .set({
              answersJson: submission.answers,
              attendeeCount: submission.attendeeCount,
              guestNamesJson: settings.collectGuestNames
                ? submission.guestNames
                : existingResponse.guestNamesJson,
              message: settings.collectGuestMessage ? submission.message : existingResponse.message,
              responseStatus: submission.responseStatus,
              updatedAt: sql`now()`,
            })
            .where(eq(rsvpResponses.id, existingResponse.id))
            .returning()
        : await tx
            .insert(rsvpResponses)
            .values({
              answersJson: submission.answers,
              attendeeCount: submission.attendeeCount,
              eventId: event.id,
              guestGroupId: guestGroup.id,
              guestNamesJson: submission.guestNames,
              message: submission.message,
              responseStatus: submission.responseStatus,
            })
            .returning();

      if (!response) {
        throw new Error("Unable to save RSVP response");
      }

      const updatedExisting = Boolean(existingResponse);
      const activityType: RsvpNotificationType = updatedExisting
        ? "rsvp_updated"
        : "rsvp_submitted";

      await tx
        .update(guestGroups)
        .set({
          status: submission.responseStatus === "not_attending" ? "declined" : "responded",
          updatedAt: sql`now()`,
        })
        .where(and(eq(guestGroups.eventId, event.id), eq(guestGroups.id, guestGroup.id)));

      await tx.insert(activityEvents).values({
        actorId: guestGroup.id,
        actorType: "guest",
        activityType,
        eventId: event.id,
        metadataJson: {
          attendeeCount: submission.attendeeCount,
          guestGroupId: guestGroup.id,
          guestGroupLabel: guestGroup.label,
          responseId: response.id,
          responseStatus: submission.responseStatus,
        },
      });

      const managerRecipients = await tx
        .select({
          userId: eventManagers.userId,
        })
        .from(eventManagers)
        .where(eq(eventManagers.eventId, event.id));
      const recipientUserIds = Array.from(
        new Set([event.ownerUserId, ...managerRecipients.map((recipient) => recipient.userId)]),
      );

      if (recipientUserIds.length > 0) {
        await tx.insert(notifications).values(
          recipientUserIds.map((userId) => ({
            eventId: event.id,
            message: `${guestGroup.label} ${updatedExisting ? "updated" : "submitted"} an RSVP for ${event.title}.`,
            metadataJson: {
              attendeeCount: submission.attendeeCount,
              guestGroupId: guestGroup.id,
              guestGroupLabel: guestGroup.label,
              responseId: response.id,
              responseStatus: submission.responseStatus,
            },
            notificationType: activityType,
            title: updatedExisting ? "RSVP updated" : "RSVP submitted",
            userId,
          })),
        );
      }

      return {
        response: toApiRsvpResponse(response),
        updatedExisting,
      };
    });
  },
});

const getExistingResponse = async (db: Database, guestGroupId: string) => {
  const [response] = await db
    .select()
    .from(rsvpResponses)
    .where(eq(rsvpResponses.guestGroupId, guestGroupId))
    .limit(1);

  return response ?? null;
};

const readRsvpSettings = (settings: Event["rsvpSettings"]) => {
  const parsed = rsvpSettingsSchema.parse(settings);

  return {
    allowMaybe: parsed.allowMaybe === true,
    allowUpdates: parsed.allowUpdates !== false,
    closed: parsed.closed === true,
    closesAt: typeof parsed.closesAt === "string" ? parsed.closesAt : undefined,
    collectGuestMessage: parsed.collectGuestMessage,
    collectGuestNames: parsed.collectGuestNames,
    enabled: parsed.enabled !== false,
  };
};

const isPast = (isoDateTime: string | undefined) =>
  isoDateTime
    ? Number.isFinite(Date.parse(isoDateTime)) && Date.parse(isoDateTime) <= Date.now()
    : false;

export const toApiRsvpResponse = (response: RsvpResponseRow): RsvpResponse => ({
  answers: response.answersJson,
  attendeeCount: response.attendeeCount,
  eventId: response.eventId,
  guestGroupId: response.guestGroupId,
  guestNames: response.guestNamesJson,
  id: response.id,
  message: response.message ?? undefined,
  responseStatus: response.responseStatus,
  submittedAt: toIsoDateTime(response.submittedAt),
  updatedAt: toIsoDateTime(response.updatedAt),
});
