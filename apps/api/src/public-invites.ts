import type { Database } from "@lumiere/db";
import {
  activityEvents,
  and,
  asc,
  eq,
  eventManagers,
  eventSectionContents,
  eventSections,
  eventThemeSettings,
  eventPublications,
  eventSlugAliases,
  events,
  getTableColumns,
  guestGroupMembers,
  guestGroups,
  isNull,
  notifications,
  or,
  rsvpResponses,
  sql,
} from "@lumiere/db";
import { sanitizePublicLocationContent } from "@lumiere/themes";
import {
  isInviteAccessExpired,
  rsvpResponseFieldsSchema,
  type Event,
  type EventSection,
  type GuestGroupStatus,
  type PublicEventSummary,
  type PublicGuestContext,
  type RsvpResponseFields,
} from "@lumiere/types";

import { toIsoDateTime } from "./serialization";
import { toApiEventSection } from "./theme-sections";

type PublicEventRow = {
  event: typeof events.$inferSelect;
  publication: typeof eventPublications.$inferSelect;
};

export type PublicEventRecord = {
  event: PublicEventSummary & { id: string };
  rsvpFields: RsvpResponseFields;
  selectedThemeId?: string;
  sections: EventSection[];
  themeConfig: Event["themeConfig"];
  themeMode: Event["themeMode"];
};

export type PublicGuestInviteRecord = PublicEventRecord & {
  guest: PublicGuestContext;
};

export type PublicInviteStore = {
  getPublicEventBySlug(input: {
    eventSlug: string;
    publicAccessCodeHash?: string;
  }): Promise<PublicEventRecord | "access_required" | "expired" | null>;
  getPublicGuestInvite(input: {
    eventSlug: string;
    inviteTokenHash: string;
  }): Promise<PublicGuestInviteRecord | "disabled" | "expired" | null>;
};

export const createDrizzlePublicInviteStore = (db: Database): PublicInviteStore => ({
  async getPublicEventBySlug({ eventSlug, publicAccessCodeHash }) {
    const publicEvent = await getPublishedEvent(db, eventSlug);

    if (!publicEvent) {
      return null;
    }

    if (isInviteAccessExpired(publicEvent.accessExpiresAt)) {
      return "expired";
    }

    if (
      publicEvent.publicAccessCodeHash &&
      publicEvent.publicAccessCodeHash !== publicAccessCodeHash
    ) {
      return "access_required";
    }

    const {
      accessExpiresAt: _accessExpiresAt,
      publicAccessCodeHash: _publicAccessCodeHash,
      ...safePublicEvent
    } = publicEvent;

    return {
      ...safePublicEvent,
      sections: listPublicSections(publicEvent.sections),
    };
  },

  async getPublicGuestInvite({ eventSlug, inviteTokenHash }) {
    const publicEvent = await getPublishedEvent(db, eventSlug);

    if (!publicEvent) {
      return null;
    }

    if (isInviteAccessExpired(publicEvent.accessExpiresAt)) {
      return "expired";
    }

    const [guestGroup] = await db
      .select({
        accessExpiresAt: guestGroups.accessExpiresAt,
        id: guestGroups.id,
        label: guestGroups.label,
        maxPax: guestGroups.maxPax,
        status: guestGroups.status,
      })
      .from(guestGroups)
      .where(
        and(
          eq(guestGroups.eventId, publicEvent.event.id),
          eq(guestGroups.inviteTokenHash, inviteTokenHash),
        ),
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

    let trackedStatus: GuestGroupStatus = guestGroup.status;

    try {
      trackedStatus = await recordGuestInviteOpen(db, {
        eventId: publicEvent.event.id,
        eventTitle: publicEvent.event.title,
        guestGroupId: guestGroup.id,
      });
    } catch (error) {
      console.error("Unable to record a valid guest invite open", {
        cause: error instanceof Error ? error.message : "Unknown tracking error",
        eventId: publicEvent.event.id,
        guestGroupId: guestGroup.id,
      });
    }

    const memberRows = await db
      .select({
        name: guestGroupMembers.name,
        sortOrder: guestGroupMembers.sortOrder,
      })
      .from(guestGroupMembers)
      .where(eq(guestGroupMembers.guestGroupId, guestGroup.id))
      .orderBy(asc(guestGroupMembers.sortOrder), asc(guestGroupMembers.createdAt));

    const [rsvpResponse] = await db
      .select({
        attendeeCount: rsvpResponses.attendeeCount,
        guestNames: rsvpResponses.guestNamesJson,
        responseStatus: rsvpResponses.responseStatus,
      })
      .from(rsvpResponses)
      .where(eq(rsvpResponses.guestGroupId, guestGroup.id))
      .limit(1);

    const currentResponse =
      trackedStatus === "responded" || trackedStatus === "declined" ? rsvpResponse : undefined;
    const {
      accessExpiresAt: _accessExpiresAt,
      publicAccessCodeHash: _publicAccessCodeHash,
      ...safePublicEvent
    } = publicEvent;

    return {
      ...safePublicEvent,
      guest: {
        guestGroup: {
          label: guestGroup.label,
          members: memberRows,
          maxPax: guestGroup.maxPax,
          status: trackedStatus,
        },
        response: currentResponse
          ? {
              attendeeCount: currentResponse.attendeeCount,
              guestNames: currentResponse.guestNames,
              responseStatus: currentResponse.responseStatus,
            }
          : null,
        responseRequiredAgain: Boolean(rsvpResponse && !currentResponse),
        responseStatus: currentResponse?.responseStatus ?? null,
      },
      sections: listGuestSections(publicEvent.sections),
    };
  },
});

const recordGuestInviteOpen = async (
  db: Database,
  input: {
    eventId: string;
    eventTitle: string;
    guestGroupId: string;
  },
) =>
  db.transaction(async (tx) => {
    const [firstOpen] = await tx
      .update(guestGroups)
      .set({
        firstOpenedAt: sql`now()`,
        lastOpenedAt: sql`now()`,
        status: sql`case when ${guestGroups.status} = 'pending' then 'opened'::lumiere.guest_group_status else ${guestGroups.status} end`,
        updatedAt: sql`now()`,
      })
      .where(
        and(
          eq(guestGroups.eventId, input.eventId),
          eq(guestGroups.id, input.guestGroupId),
          isNull(guestGroups.firstOpenedAt),
          isNull(guestGroups.lastOpenedAt),
        ),
      )
      .returning({ status: guestGroups.status });

    const [trackedGroup] = firstOpen
      ? [firstOpen]
      : await tx
          .update(guestGroups)
          .set({
            firstOpenedAt: sql`coalesce(${guestGroups.firstOpenedAt}, ${guestGroups.lastOpenedAt}, now())`,
            lastOpenedAt: sql`now()`,
            status: sql`case when ${guestGroups.status} = 'pending' then 'opened'::lumiere.guest_group_status else ${guestGroups.status} end`,
            updatedAt: sql`now()`,
          })
          .where(
            and(eq(guestGroups.eventId, input.eventId), eq(guestGroups.id, input.guestGroupId)),
          )
          .returning({ status: guestGroups.status });

    if (!trackedGroup) {
      throw new Error("Guest invite disappeared while recording an open");
    }

    if (firstOpen) {
      await tx.insert(activityEvents).values({
        actorId: input.guestGroupId,
        actorType: "guest",
        activityType: "guest_invite_opened",
        eventId: input.eventId,
        metadataJson: { guestGroupId: input.guestGroupId },
      });

      const [event] = await tx
        .select({ ownerUserId: events.ownerUserId })
        .from(events)
        .where(eq(events.id, input.eventId))
        .limit(1);
      const managerRecipients = await tx
        .select({ userId: eventManagers.userId })
        .from(eventManagers)
        .where(eq(eventManagers.eventId, input.eventId));
      const recipientUserIds = Array.from(
        new Set([
          ...(event ? [event.ownerUserId] : []),
          ...managerRecipients.map((recipient) => recipient.userId),
        ]),
      );

      if (recipientUserIds.length > 0) {
        await tx.insert(notifications).values(
          recipientUserIds.map((userId) => ({
            eventId: input.eventId,
            message: `A guest invite was opened for ${input.eventTitle}.`,
            metadataJson: { guestGroupId: input.guestGroupId },
            notificationType: "guest_opened_invite" as const,
            title: "Guest invite opened",
            userId,
          })),
        );
      }
    }

    return trackedGroup.status;
  });

const getPublishedEvent = async (db: Database, eventSlug: string) => {
  const [event] = await db
    .select({
      event: events,
      publication: eventPublications,
      themeSettings: eventThemeSettings,
    })
    .from(events)
    .leftJoin(eventSlugAliases, eq(eventSlugAliases.eventId, events.id))
    .innerJoin(eventPublications, eq(eventPublications.eventId, events.id))
    .leftJoin(eventThemeSettings, eq(eventThemeSettings.eventId, events.id))
    .where(
      and(
        or(eq(events.publicSlug, eventSlug), eq(eventSlugAliases.slug, eventSlug)),
        isNull(events.deletedAt),
        eq(events.status, "published"),
      ),
    )
    .limit(1);

  if (!event) {
    return null;
  }

  const sectionRows = await db
    .select({
      ...getTableColumns(eventSections),
      contentJson: eventSectionContents.contentJson,
    })
    .from(eventSections)
    .leftJoin(eventSectionContents, eq(eventSectionContents.eventSectionId, eventSections.id))
    .where(eq(eventSections.eventId, event.event.id))
    .orderBy(asc(eventSections.sortOrder), asc(eventSections.createdAt));

  return toLivePublicEventRecord({
    ...event,
    sections: sectionRows.map((section) =>
      toApiEventSection({
        ...section,
        contentJson: (section.contentJson ?? {}) as EventSection["content"],
      }),
    ),
  });
};

const listPublicSections = (sections: EventSection[]) =>
  sections.filter((section) => section.enabled && section.visibility === "public");

const listGuestSections = (sections: EventSection[]) =>
  sections.filter(
    (section) =>
      section.enabled && (section.visibility === "public" || section.visibility === "guest_only"),
  );

export const toPublicEventRecord = (event: PublicEventRow): PublicEventRecord => ({
  event: {
    endsAt: event.event.endsAt ? toIsoDateTime(event.event.endsAt) : undefined,
    eventType: event.event.eventType,
    id: event.event.id,
    publicSettings: event.publication.publicSettingsJson as Event["publicSettings"],
    slug: event.event.publicSlug,
    startsAt: toIsoDateTime(event.event.startsAt),
    status: event.event.status,
    timezone: event.event.timezone,
    title: event.event.title,
    venueAddress: event.event.venueAddress ?? undefined,
    venueName: event.event.venueName ?? undefined,
  },
  rsvpFields: rsvpResponseFieldsSchema.parse(event.publication.rsvpSettingsJson),
  selectedThemeId: event.publication.selectedThemeId,
  themeConfig: event.publication.themeConfigJson as Event["themeConfig"],
  themeMode: event.publication.themeMode,
  sections: normalizePublicLocationSections(event.publication.sectionsJson),
});

type LivePublicEventRow = {
  event: typeof events.$inferSelect;
  publication: typeof eventPublications.$inferSelect;
  sections: EventSection[];
  themeSettings: typeof eventThemeSettings.$inferSelect | null;
};

const toLivePublicEventRecord = (
  event: LivePublicEventRow,
): PublicEventRecord & {
  accessExpiresAt: string | null;
  publicAccessCodeHash: string | null;
} => ({
  accessExpiresAt: event.event.accessExpiresAt ? toIsoDateTime(event.event.accessExpiresAt) : null,
  event: {
    endsAt: event.event.endsAt ? toIsoDateTime(event.event.endsAt) : undefined,
    eventType: event.event.eventType,
    id: event.event.id,
    publicSettings: event.event.publicSettingsJson as Event["publicSettings"],
    slug: event.event.publicSlug,
    startsAt: toIsoDateTime(event.event.startsAt),
    status: event.event.status,
    timezone: event.event.timezone,
    title: event.event.title,
    venueAddress: event.event.venueAddress ?? undefined,
    venueName: event.event.venueName ?? undefined,
  },
  rsvpFields: rsvpResponseFieldsSchema.parse(event.publication.rsvpSettingsJson),
  selectedThemeId: event.themeSettings?.selectedThemeId ?? undefined,
  sections: normalizePublicLocationSections(event.sections),
  themeConfig: (event.themeSettings?.configJson ?? {}) as Event["themeConfig"],
  themeMode: event.themeSettings?.themeMode ?? "system",
  publicAccessCodeHash: event.event.publicAccessCodeHash,
});

const normalizePublicLocationSections = (sections: EventSection[]) =>
  sections.map((section) =>
    section.sectionType === "location"
      ? {
          ...section,
          content: sanitizePublicLocationContent(section.content) as EventSection["content"],
        }
      : section,
  );
