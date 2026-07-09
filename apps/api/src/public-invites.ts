import type { Database } from "@lumiere/db";
import { eventSections, events, guestGroups, rsvpResponses } from "@lumiere/db";
import type { Event, EventSection, PublicEventSummary, PublicGuestContext } from "@lumiere/types";
import { and, asc, eq, inArray } from "drizzle-orm";

import { toIsoDateTime } from "./serialization";
import { toApiEventSection } from "./theme-sections";

type PublicEventRow = Pick<
  typeof events.$inferSelect,
  | "endsAt"
  | "eventType"
  | "id"
  | "publicSettingsJson"
  | "selectedThemeId"
  | "slug"
  | "startsAt"
  | "status"
  | "themeConfigJson"
  | "themeMode"
  | "timezone"
  | "title"
  | "venueAddress"
  | "venueName"
>;

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
      sections: await listPublicSections(db, publicEvent.event.id),
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
      sections: await listGuestSections(db, publicEvent.event.id),
    };
  },
});

const getPublishedEvent = async (db: Database, eventSlug: string) => {
  const [event] = await db
    .select({
      endsAt: events.endsAt,
      eventType: events.eventType,
      id: events.id,
      publicSettingsJson: events.publicSettingsJson,
      selectedThemeId: events.selectedThemeId,
      slug: events.slug,
      startsAt: events.startsAt,
      status: events.status,
      themeConfigJson: events.themeConfigJson,
      themeMode: events.themeMode,
      timezone: events.timezone,
      title: events.title,
      venueAddress: events.venueAddress,
      venueName: events.venueName,
    })
    .from(events)
    .where(and(eq(events.slug, eventSlug), eq(events.status, "published")))
    .limit(1);

  return event ? toPublicEventRecord(event) : null;
};

const listPublicSections = async (db: Database, eventId: string) => {
  const sections = await listEnabledSections(db, eventId, ["public"]);

  return sections.map(toApiEventSection);
};

const listGuestSections = async (db: Database, eventId: string) => {
  const sections = await listEnabledSections(db, eventId, ["public", "guest_only"]);

  return sections.map(toApiEventSection);
};

const listEnabledSections = (
  db: Database,
  eventId: string,
  visibility: EventSection["visibility"][],
) =>
  db
    .select()
    .from(eventSections)
    .where(
      and(
        eq(eventSections.eventId, eventId),
        eq(eventSections.enabled, true),
        inArray(eventSections.visibility, visibility),
      ),
    )
    .orderBy(asc(eventSections.sortOrder), asc(eventSections.createdAt));

export const toPublicEventRecord = (
  event: PublicEventRow,
): Omit<PublicEventRecord, "sections"> => ({
  event: {
    endsAt: event.endsAt ? toIsoDateTime(event.endsAt) : undefined,
    eventType: event.eventType,
    id: event.id,
    publicSettings: event.publicSettingsJson as Event["publicSettings"],
    slug: event.slug,
    startsAt: toIsoDateTime(event.startsAt),
    status: event.status,
    timezone: event.timezone,
    title: event.title,
    venueAddress: event.venueAddress ?? undefined,
    venueName: event.venueName ?? undefined,
  },
  selectedThemeId: event.selectedThemeId ?? undefined,
  themeConfig: event.themeConfigJson as Event["themeConfig"],
  themeMode: event.themeMode,
});
