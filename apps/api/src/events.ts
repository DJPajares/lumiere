import type { Database } from "@lumiere/db";
import { eventManagers, events } from "@lumiere/db";
import type { Event, EventCreate, EventUpdate } from "@lumiere/types";
import { desc, eq, sql } from "drizzle-orm";

import { ApiHttpError } from "./errors";
import { toIsoDateTime } from "./serialization";

type EventRow = typeof events.$inferSelect;

export type EventStore = {
  archiveEvent(eventId: string): Promise<Event | null>;
  createEvent(ownerUserId: string, input: EventCreate): Promise<Event>;
  getEvent(eventId: string): Promise<Event | null>;
  listManagedEvents(userId: string): Promise<Event[]>;
  updateEvent(eventId: string, input: EventUpdate): Promise<Event | null>;
};

export const createDrizzleEventStore = (db: Database): EventStore => ({
  async archiveEvent(eventId) {
    return withDuplicateSlugHandling(async () => {
      const [event] = await db
        .update(events)
        .set({
          status: "archived",
          updatedAt: sql`now()`,
        })
        .where(eq(events.id, eventId))
        .returning();

      return event ? toApiEvent(event) : null;
    });
  },

  async createEvent(ownerUserId, input) {
    return withDuplicateSlugHandling(async () =>
      db.transaction(async (tx) => {
        const [event] = await tx
          .insert(events)
          .values({
            endsAt: input.endsAt,
            eventType: input.eventType,
            ownerUserId,
            publicSettingsJson: input.publicSettings,
            rsvpSettingsJson: input.rsvpSettings,
            selectedThemeId: input.selectedThemeId,
            slug: input.slug,
            startsAt: input.startsAt,
            themeMode: input.themeMode,
            timezone: input.timezone,
            title: input.title,
            venueAddress: input.venueAddress,
            venueName: input.venueName,
          })
          .returning();

        if (!event) {
          throw new ApiHttpError("INTERNAL_ERROR", "Unable to create event");
        }

        await tx.insert(eventManagers).values({
          eventId: event.id,
          role: "owner",
          userId: ownerUserId,
        });

        return toApiEvent(event);
      }),
    );
  },

  async getEvent(eventId) {
    const [event] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);

    return event ? toApiEvent(event) : null;
  },

  async listManagedEvents(userId) {
    const eventRows = await db
      .select()
      .from(events)
      .where(
        sql`${events.ownerUserId} = ${userId} or exists (
          select 1 from ${eventManagers}
          where ${eventManagers.eventId} = ${events.id}
            and ${eventManagers.userId} = ${userId}
        )`,
      )
      .orderBy(desc(events.createdAt));

    return eventRows.map(toApiEvent);
  },

  async updateEvent(eventId, input) {
    return withDuplicateSlugHandling(async () => {
      const [event] = await db
        .update(events)
        .set({
          ...toEventUpdateSet(input),
          updatedAt: sql`now()`,
        })
        .where(eq(events.id, eventId))
        .returning();

      return event ? toApiEvent(event) : null;
    });
  },
});

export const toApiEvent = (event: EventRow): Event => ({
  createdAt: toIsoDateTime(event.createdAt),
  endsAt: event.endsAt ? toIsoDateTime(event.endsAt) : undefined,
  eventType: event.eventType,
  id: event.id,
  ownerUserId: event.ownerUserId,
  publicSettings: event.publicSettingsJson as Event["publicSettings"],
  rsvpSettings: event.rsvpSettingsJson as Event["rsvpSettings"],
  selectedThemeId: event.selectedThemeId ?? undefined,
  slug: event.slug,
  startsAt: toIsoDateTime(event.startsAt),
  status: event.status,
  themeConfig: event.themeConfigJson as Event["themeConfig"],
  themeMode: event.themeMode,
  timezone: event.timezone,
  title: event.title,
  updatedAt: toIsoDateTime(event.updatedAt),
  venueAddress: event.venueAddress ?? undefined,
  venueName: event.venueName ?? undefined,
});

const toEventUpdateSet = (input: EventUpdate) => ({
  ...(input.slug !== undefined ? { slug: input.slug } : {}),
  ...(input.title !== undefined ? { title: input.title } : {}),
  ...(input.status !== undefined ? { status: input.status } : {}),
  ...(input.timezone !== undefined ? { timezone: input.timezone } : {}),
  ...(input.startsAt !== undefined ? { startsAt: input.startsAt } : {}),
  ...(input.endsAt !== undefined ? { endsAt: input.endsAt } : {}),
  ...(input.venueName !== undefined ? { venueName: input.venueName } : {}),
  ...(input.venueAddress !== undefined ? { venueAddress: input.venueAddress } : {}),
  ...(input.selectedThemeId !== undefined ? { selectedThemeId: input.selectedThemeId } : {}),
  ...(input.themeMode !== undefined ? { themeMode: input.themeMode } : {}),
  ...(input.publicSettings !== undefined ? { publicSettingsJson: input.publicSettings } : {}),
  ...(input.rsvpSettings !== undefined ? { rsvpSettingsJson: input.rsvpSettings } : {}),
});

const withDuplicateSlugHandling = async <TValue>(operation: () => Promise<TValue>) => {
  try {
    return await operation();
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ApiHttpError("CONFLICT", "Event slug is already in use");
    }

    throw error;
  }
};

const isUniqueViolation = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  (error as { code?: unknown }).code === "23505";
