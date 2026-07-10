import type { Database } from "@lumiere/db";
import {
  eventSectionContents,
  eventSections,
  eventRsvpSettings,
  eventThemeSettings,
  eventPublications,
  events,
  guestGroups,
  rsvpResponses,
} from "@lumiere/db";
import type { Event, EventSection, PublicEventSummary, PublicGuestContext } from "@lumiere/types";
import { and, asc, eq, getTableColumns } from "drizzle-orm";

import { toIsoDateTime } from "./serialization";
import { toApiEventSection } from "./theme-sections";

type PublicEventRow = {
  event: typeof events.$inferSelect;
  publication: typeof eventPublications.$inferSelect;
};

export type PublicEventRecord = {
  event: PublicEventSummary;
  selectedThemeId?: string;
  sections: EventSection[];
  themeConfig: Event["themeConfig"];
  themeMode: Event["themeMode"];
};

export type PublicGuestInviteRecord = PublicEventRecord & {
  guest: PublicGuestContext;
};

export type PublicInviteStore = {
  getPublicEventBySlug(eventSlug: string): Promise<PublicEventRecord | null>;
  getPublicGuestInvite(input: {
    eventSlug: string;
    inviteTokenHash: string;
  }): Promise<PublicGuestInviteRecord | "disabled" | null>;
};

export const createDrizzlePublicInviteStore = (db: Database): PublicInviteStore => ({
  async getPublicEventBySlug(eventSlug) {
    const publicEvent = await getPublishedEvent(db, eventSlug);

    if (!publicEvent) {
      return null;
    }

    return {
      ...publicEvent,
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

    const [rsvpResponse] = await db
      .select({
        responseStatus: rsvpResponses.responseStatus,
      })
      .from(rsvpResponses)
      .where(eq(rsvpResponses.guestGroupId, guestGroup.id))
      .limit(1);

    return {
      ...publicEvent,
      guest: {
        guestGroup: {
          label: guestGroup.label,
          maxPax: guestGroup.maxPax,
          status: guestGroup.status,
        },
        responseStatus: rsvpResponse?.responseStatus ?? null,
      },
      sections: listGuestSections(publicEvent.sections),
    };
  },
});

const getPublishedEvent = async (db: Database, eventSlug: string) => {
  const [event] = await db
    .select({
      event: events,
      rsvpSettings: eventRsvpSettings,
      themeSettings: eventThemeSettings,
    })
    .from(events)
    .leftJoin(eventRsvpSettings, eq(eventRsvpSettings.eventId, events.id))
    .leftJoin(eventThemeSettings, eq(eventThemeSettings.eventId, events.id))
    .where(and(eq(events.publicSlug, eventSlug), eq(events.status, "published")))
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
  selectedThemeId: event.publication.selectedThemeId,
  themeConfig: event.publication.themeConfigJson as Event["themeConfig"],
  themeMode: event.publication.themeMode,
  sections: event.publication.sectionsJson,
});

type LivePublicEventRow = {
  event: typeof events.$inferSelect;
  rsvpSettings: typeof eventRsvpSettings.$inferSelect | null;
  sections: EventSection[];
  themeSettings: typeof eventThemeSettings.$inferSelect | null;
};

const toLivePublicEventRecord = (event: LivePublicEventRow): PublicEventRecord => ({
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
  selectedThemeId: event.themeSettings?.selectedThemeId ?? undefined,
  sections: event.sections,
  themeConfig: (event.themeSettings?.configJson ?? {}) as Event["themeConfig"],
  themeMode: event.themeSettings?.themeMode ?? "system",
});
