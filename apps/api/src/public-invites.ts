import type { Database } from "@lumiere/db";
import {
  and,
  asc,
  eq,
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
  or,
  rsvpResponses,
} from "@lumiere/db";
import { sanitizePublicLocationContent } from "@lumiere/themes";
import {
  rsvpResponseFieldsSchema,
  type Event,
  type EventSection,
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
  }): Promise<PublicEventRecord | "access_required" | null>;
  getPublicGuestInvite(input: {
    eventSlug: string;
    inviteTokenHash: string;
  }): Promise<PublicGuestInviteRecord | "disabled" | null>;
};

export const createDrizzlePublicInviteStore = (db: Database): PublicInviteStore => ({
  async getPublicEventBySlug({ eventSlug, publicAccessCodeHash }) {
    const publicEvent = await getPublishedEvent(db, eventSlug);

    if (!publicEvent) {
      return null;
    }

    if (
      publicEvent.publicAccessCodeHash &&
      publicEvent.publicAccessCodeHash !== publicAccessCodeHash
    ) {
      return "access_required";
    }

    return {
      ...publicEvent,
      publicAccessCodeHash: undefined,
      sections: listPublicSections(publicEvent.sections),
    };
  },

  async getPublicGuestInvite({ eventSlug, inviteTokenHash }) {
    const publicEvent = await getPublishedEvent(db, eventSlug);

    if (!publicEvent) {
      return null;
    }

    const [guestGroup] = await db
      .select({
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
      guestGroup.status === "responded" || guestGroup.status === "declined"
        ? rsvpResponse
        : undefined;

    return {
      ...publicEvent,
      guest: {
        guestGroup: {
          label: guestGroup.label,
          members: memberRows,
          maxPax: guestGroup.maxPax,
          status: guestGroup.status,
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
): PublicEventRecord & { publicAccessCodeHash: string | null } => ({
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
