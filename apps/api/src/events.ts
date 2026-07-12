import type { Database } from "@lumiere/db";
import {
  eventManagers,
  eventPublications,
  eventRsvpSettings,
  eventSectionContents,
  eventSections,
  events,
  eventThemeSettings,
  eventSlugAliases,
} from "@lumiere/db";
import {
  evaluateThemeCompatibility,
  getBlueprintSectionsForEventType,
  getTheme,
  isThemeId,
  validateEventTypeSections,
  validateThemeSections,
} from "@lumiere/themes";
import type {
  ApiFieldError,
  Event,
  EventCreate,
  EventSection,
  EventSectionMutation,
  EventUpdate,
} from "@lumiere/types";
import { and, asc, desc, eq, getTableColumns, ne, sql } from "drizzle-orm";

import { ApiHttpError } from "./errors";
import { toIsoDateTime } from "./serialization";
import { toApiEventSection } from "./theme-sections";

type EventRow = typeof events.$inferSelect;
type ThemeSettingsRow = typeof eventThemeSettings.$inferSelect;
type RsvpSettingsRow = typeof eventRsvpSettings.$inferSelect;
type StoreDatabase = Database;

type ManagerEventRecord = {
  event: EventRow;
  rsvpSettings: RsvpSettingsRow | null;
  themeSettings: ThemeSettingsRow | null;
};

export type PublishingReadiness = {
  issues: ApiFieldError[];
  ready: boolean;
};

export type EventStore = {
  archiveEvent(eventId: string): Promise<Event | null>;
  createEvent(ownerUserId: string, input: EventCreatePersistence): Promise<Event>;
  getEvent(eventId: string): Promise<Event | null>;
  getEventBySlug(slug: string): Promise<Event | null>;
  getPublishingReadiness(eventId: string): Promise<PublishingReadiness | null>;
  isEventSlugAvailable(slug: string, options?: { exceptEventId?: string }): Promise<boolean>;
  listManagedEvents(userId: string): Promise<Event[]>;
  updateEvent(eventId: string, input: EventUpdatePersistence): Promise<Event | null>;
};

export type EventCreatePersistence = Omit<EventCreate, "publicAccessCode"> & {
  publicAccessCodeHash?: string;
};

export type EventUpdatePersistence = Omit<EventUpdate, "publicAccessCode"> & {
  publicAccessCodeHash?: string | null;
};

export const createDrizzleEventStore = (db: Database): EventStore => ({
  async archiveEvent(eventId) {
    const [event] = await db
      .update(events)
      .set({
        status: "archived",
        updatedAt: sql`now()`,
      })
      .where(eq(events.id, eventId))
      .returning();

    if (!event) {
      return null;
    }

    const settings = await getEventSettings(db, event.id);

    return toApiEvent(event, settings?.themeSettings, settings?.rsvpSettings);
  },

  async createEvent(ownerUserId, input) {
    return withDuplicateSlugHandling(async () =>
      db.transaction(async (tx) => {
        await assertSlugNotClaimed(tx as unknown as StoreDatabase, input.slug);
        const [event] = await tx
          .insert(events)
          .values({
            endsAt: input.endsAt,
            eventType: input.eventType,
            ownerUserId,
            publicSettingsJson: input.publicSettings,
            publicAccessCodeHash: input.publicAccessCodeHash,
            publicSlug: input.slug,
            startsAt: input.startsAt,
            timezone: input.timezone,
            title: input.title,
            venueAddress: input.venueAddress,
            venueName: input.venueName,
          })
          .returning();

        if (!event) {
          throw new ApiHttpError("INTERNAL_ERROR", "Unable to create event");
        }

        const [themeSettings] = await tx
          .insert(eventThemeSettings)
          .values({
            eventId: event.id,
            selectedThemeId: input.selectedThemeId,
            themeMode: input.themeMode,
          })
          .returning();
        const [rsvpSettings] = await tx
          .insert(eventRsvpSettings)
          .values({
            eventId: event.id,
            settingsJson: input.rsvpSettings,
          })
          .returning();

        await tx.insert(eventManagers).values({
          eventId: event.id,
          role: "owner",
          userId: ownerUserId,
        });
        await replaceDraftSections(
          tx as unknown as StoreDatabase,
          event.id,
          buildEventSectionDefaults(toApiEvent(event, themeSettings, rsvpSettings)),
        );

        return toApiEvent(event, themeSettings, rsvpSettings);
      }),
    );
  },

  async getEvent(eventId) {
    const record = await getManagerEventRecord(db, eq(events.id, eventId));

    return record ? toApiEvent(record.event, record.themeSettings, record.rsvpSettings) : null;
  },

  async getEventBySlug(slug) {
    const record = await getManagerEventRecord(db, eq(events.publicSlug, slug));

    return record ? toApiEvent(record.event, record.themeSettings, record.rsvpSettings) : null;
  },

  async getPublishingReadiness(eventId) {
    const record = await getManagerEventRecord(db, eq(events.id, eventId));

    if (!record) {
      return null;
    }

    const sections = await listDraftSections(db, eventId);

    return evaluatePublishingReadiness({
      event: toApiEvent(record.event, record.themeSettings, record.rsvpSettings),
      sections,
    });
  },

  async isEventSlugAvailable(slug, options = {}) {
    const [event] = await db
      .select({ id: events.id })
      .from(events)
      .where(
        options.exceptEventId
          ? and(eq(events.publicSlug, slug), ne(events.id, options.exceptEventId))
          : eq(events.publicSlug, slug),
      )
      .limit(1);

    const [alias] = await db
      .select({ eventId: eventSlugAliases.eventId })
      .from(eventSlugAliases)
      .where(eq(eventSlugAliases.slug, slug))
      .limit(1);

    return !event && (!alias || alias.eventId === options.exceptEventId);
  },

  async listManagedEvents(userId) {
    const records = await db
      .select({
        event: events,
        rsvpSettings: eventRsvpSettings,
        themeSettings: eventThemeSettings,
      })
      .from(events)
      .leftJoin(eventThemeSettings, eq(eventThemeSettings.eventId, events.id))
      .leftJoin(eventRsvpSettings, eq(eventRsvpSettings.eventId, events.id))
      .where(
        sql`${events.ownerUserId} = ${userId} or exists (
          select 1 from ${eventManagers}
          where ${eventManagers.eventId} = ${events.id}
            and ${eventManagers.userId} = ${userId}
        )`,
      )
      .orderBy(desc(events.createdAt));

    return records.map((record) =>
      toApiEvent(record.event, record.themeSettings, record.rsvpSettings),
    );
  },

  async updateEvent(eventId, input) {
    return withDuplicateSlugHandling(async () =>
      db.transaction(async (tx) => {
        const database = tx as unknown as StoreDatabase;
        const current = await getManagerEventRecord(database, eq(events.id, eventId));

        if (!current) {
          return null;
        }

        if (input.slug && input.slug !== current.event.publicSlug) {
          await assertSlugNotClaimed(database, input.slug, eventId);
          await tx
            .insert(eventSlugAliases)
            .values({
              eventId,
              slug: current.event.publicSlug,
            })
            .onConflictDoNothing();
        }

        const [event] = await tx
          .update(events)
          .set({
            ...toEventUpdateSet(input),
            ...(input.eventType &&
            input.eventType !== current.event.eventType &&
            current.event.status === "published" &&
            input.status === undefined
              ? { status: "draft" as const }
              : {}),
            updatedAt: sql`now()`,
          })
          .where(eq(events.id, eventId))
          .returning();

        if (!event) {
          return null;
        }

        let themeSettings = await updateThemeSettings(
          database,
          current.themeSettings,
          eventId,
          input,
        );
        const rsvpSettings = await updateRsvpSettings(
          database,
          current.rsvpSettings,
          eventId,
          input,
        );

        if (input.eventType && input.eventType !== current.event.eventType) {
          const managerEvent = toApiEvent(event, themeSettings, rsvpSettings);
          const previousSections = await listDraftSections(database, eventId);

          await replaceDraftSections(
            database,
            eventId,
            reconcileEventTypeSections(managerEvent, previousSections),
          );

          if (
            themeSettings?.selectedThemeId &&
            !getTheme(themeSettings.selectedThemeId)?.supportedEventTypes.includes(input.eventType)
          ) {
            const [clearedThemeSettings] = await tx
              .update(eventThemeSettings)
              .set({
                configJson: {},
                selectedThemeId: null,
                updatedAt: sql`now()`,
              })
              .where(eq(eventThemeSettings.eventId, eventId))
              .returning();
            themeSettings = clearedThemeSettings ?? themeSettings;
          }
        }

        const managerEvent = toApiEvent(event, themeSettings, rsvpSettings);

        if (input.status === "published") {
          const sections = await listDraftSections(database, eventId);
          const readiness = evaluatePublishingReadiness({ event: managerEvent, sections });

          if (!readiness.ready) {
            throw new ApiHttpError("VALIDATION_ERROR", "Event is not ready to publish", {
              fields: readiness.issues,
            });
          }

          await tx
            .insert(eventPublications)
            .values({
              eventId,
              publicSettingsJson: managerEvent.publicSettings,
              rsvpSettingsJson: managerEvent.rsvpSettings,
              sectionsJson: sections.filter(
                (section) => section.enabled && section.visibility !== "hidden",
              ),
              selectedThemeId: managerEvent.selectedThemeId!,
              themeConfigJson: managerEvent.themeConfig,
              themeMode: managerEvent.themeMode,
            })
            .onConflictDoUpdate({
              target: eventPublications.eventId,
              set: {
                publicSettingsJson: managerEvent.publicSettings,
                publishedAt: sql`now()`,
                rsvpSettingsJson: managerEvent.rsvpSettings,
                sectionsJson: sections.filter(
                  (section) => section.enabled && section.visibility !== "hidden",
                ),
                selectedThemeId: managerEvent.selectedThemeId!,
                themeConfigJson: managerEvent.themeConfig,
                themeMode: managerEvent.themeMode,
              },
            });
        }

        return managerEvent;
      }),
    );
  },
});

export const buildEventSectionDefaults = (event: Event): EventSectionMutation[] =>
  getBlueprintSectionsForEventType(event.eventType).map((blueprint, sortOrder) => ({
    content: blueprint.createDefaultContent(event) as EventSectionMutation["content"],
    enabled: blueprint.defaultEnabled,
    sectionKey: blueprint.sectionKey,
    sectionType: blueprint.sectionType,
    settings: blueprint.createDefaultSettings() as EventSectionMutation["settings"],
    sortOrder,
    visibility: blueprint.defaultVisibility,
  }));

export const reconcileEventTypeSections = (
  event: Event,
  existingSections: EventSection[],
): EventSectionMutation[] => {
  const existingByType = new Map(existingSections.map((section) => [section.sectionType, section]));

  return buildEventSectionDefaults(event).map((section) => {
    const existing = existingByType.get(section.sectionType);

    return existing
      ? {
          content: existing.content,
          enabled: existing.enabled,
          sectionKey: section.sectionKey,
          sectionType: section.sectionType,
          settings: existing.settings,
          sortOrder: section.sortOrder,
          visibility: existing.visibility,
        }
      : section;
  });
};

export const evaluatePublishingReadiness = ({
  event,
  sections,
}: {
  event: Event;
  sections: EventSection[];
}): PublishingReadiness => {
  const issues: ApiFieldError[] = [];

  if (!event.selectedThemeId || !isThemeId(event.selectedThemeId)) {
    issues.push({
      message: "Select a valid theme before publishing",
      path: ["selectedThemeId"],
    });
  } else {
    const theme = getTheme(event.selectedThemeId);

    if (!theme) {
      issues.push({
        message: "Select a valid theme before publishing",
        path: ["selectedThemeId"],
      });
    } else {
      const compatibility = evaluateThemeCompatibility({
        eventType: event.eventType,
        mode: event.themeMode,
        theme,
      });
      issues.push(
        ...compatibility.issues.map((issue) => ({
          message: issue.message,
          path: issue.path,
        })),
      );
      issues.push(
        ...sections.flatMap((section, index) => {
          if (!section.enabled) {
            return [];
          }

          const result = validateThemeSections(theme.id, [section])[0]!;

          return result.ok
            ? []
            : result.issues.map((message) => ({
                message,
                path: ["sections", index],
              }));
        }),
      );
    }
  }

  issues.push(
    ...validateEventTypeSections({
      eventStatus: "published",
      eventType: event.eventType,
      sections,
    }).map((issue) => ({
      message: issue.message,
      path: issue.path,
    })),
  );

  return {
    issues,
    ready: issues.length === 0,
  };
};

export const toApiEvent = (
  event: EventRow,
  themeSettings?: ThemeSettingsRow | null,
  rsvpSettings?: RsvpSettingsRow | null,
): Event => ({
  createdAt: toIsoDateTime(event.createdAt),
  endsAt: event.endsAt ? toIsoDateTime(event.endsAt) : undefined,
  eventType: event.eventType,
  id: event.id,
  ownerUserId: event.ownerUserId,
  publicSettings: event.publicSettingsJson as Event["publicSettings"],
  hasPublicAccessCode: event.publicAccessCodeHash !== null,
  rsvpSettings: (rsvpSettings?.settingsJson ?? {}) as Event["rsvpSettings"],
  selectedThemeId: themeSettings?.selectedThemeId ?? undefined,
  slug: event.publicSlug,
  startsAt: toIsoDateTime(event.startsAt),
  status: event.status,
  themeConfig: (themeSettings?.configJson ?? {}) as Event["themeConfig"],
  themeMode: themeSettings?.themeMode ?? "system",
  timezone: event.timezone,
  title: event.title,
  updatedAt: toIsoDateTime(event.updatedAt),
  venueAddress: event.venueAddress ?? undefined,
  venueName: event.venueName ?? undefined,
});

const getManagerEventRecord = async (
  db: StoreDatabase,
  predicate: ReturnType<typeof eq>,
): Promise<ManagerEventRecord | null> => {
  const [record] = await db
    .select({
      event: events,
      rsvpSettings: eventRsvpSettings,
      themeSettings: eventThemeSettings,
    })
    .from(events)
    .leftJoin(eventThemeSettings, eq(eventThemeSettings.eventId, events.id))
    .leftJoin(eventRsvpSettings, eq(eventRsvpSettings.eventId, events.id))
    .where(predicate)
    .limit(1);

  return record ?? null;
};

const getEventSettings = async (db: StoreDatabase, eventId: string) => {
  const record = await getManagerEventRecord(db, eq(events.id, eventId));

  return record
    ? {
        rsvpSettings: record.rsvpSettings,
        themeSettings: record.themeSettings,
      }
    : null;
};

const listDraftSections = async (db: StoreDatabase, eventId: string): Promise<EventSection[]> => {
  const sectionRows = await db
    .select({
      ...getTableColumns(eventSections),
      contentJson: eventSectionContents.contentJson,
    })
    .from(eventSections)
    .leftJoin(eventSectionContents, eq(eventSectionContents.eventSectionId, eventSections.id))
    .where(eq(eventSections.eventId, eventId))
    .orderBy(asc(eventSections.sortOrder), asc(eventSections.createdAt));

  return sectionRows.map((section) =>
    toApiEventSection({
      ...section,
      contentJson: (section.contentJson ?? {}) as EventSection["content"],
    }),
  );
};

const replaceDraftSections = async (
  db: StoreDatabase,
  eventId: string,
  sections: EventSectionMutation[],
) => {
  await db.delete(eventSections).where(eq(eventSections.eventId, eventId));

  if (sections.length === 0) {
    return;
  }

  const inserted = await db
    .insert(eventSections)
    .values(
      sections.map((section) => ({
        enabled: section.enabled,
        eventId,
        sectionKey: section.sectionKey,
        sectionType: section.sectionType,
        settingsJson: section.settings,
        sortOrder: section.sortOrder,
        visibility: section.visibility,
      })),
    )
    .returning({ id: eventSections.id });

  await db.insert(eventSectionContents).values(
    inserted.map((section, index) => ({
      contentJson: sections[index]?.content ?? {},
      eventSectionId: section.id,
    })),
  );
};

const updateThemeSettings = async (
  db: StoreDatabase,
  current: ThemeSettingsRow | null,
  eventId: string,
  input: EventUpdate,
) => {
  if (input.selectedThemeId === undefined && input.themeMode === undefined) {
    return current;
  }

  const [settings] = await db
    .insert(eventThemeSettings)
    .values({
      configJson: current?.configJson ?? {},
      eventId,
      selectedThemeId: input.selectedThemeId ?? current?.selectedThemeId,
      themeMode: input.themeMode ?? current?.themeMode ?? "system",
    })
    .onConflictDoUpdate({
      target: eventThemeSettings.eventId,
      set: {
        ...(input.selectedThemeId !== undefined ? { selectedThemeId: input.selectedThemeId } : {}),
        ...(input.themeMode !== undefined ? { themeMode: input.themeMode } : {}),
        updatedAt: sql`now()`,
      },
    })
    .returning();

  return settings ?? current;
};

const updateRsvpSettings = async (
  db: StoreDatabase,
  current: RsvpSettingsRow | null,
  eventId: string,
  input: EventUpdate,
) => {
  if (input.rsvpSettings === undefined) {
    return current;
  }

  const [settings] = await db
    .insert(eventRsvpSettings)
    .values({
      eventId,
      settingsJson: input.rsvpSettings,
    })
    .onConflictDoUpdate({
      target: eventRsvpSettings.eventId,
      set: {
        settingsJson: input.rsvpSettings,
        updatedAt: sql`now()`,
      },
    })
    .returning();

  return settings ?? current;
};

const toEventUpdateSet = (input: EventUpdatePersistence) => ({
  ...(input.slug !== undefined ? { publicSlug: input.slug } : {}),
  ...(input.title !== undefined ? { title: input.title } : {}),
  ...(input.eventType !== undefined ? { eventType: input.eventType } : {}),
  ...(input.status !== undefined ? { status: input.status } : {}),
  ...(input.timezone !== undefined ? { timezone: input.timezone } : {}),
  ...(input.startsAt !== undefined ? { startsAt: input.startsAt } : {}),
  ...(input.endsAt !== undefined ? { endsAt: input.endsAt } : {}),
  ...(input.venueName !== undefined ? { venueName: input.venueName } : {}),
  ...(input.venueAddress !== undefined ? { venueAddress: input.venueAddress } : {}),
  ...(input.publicSettings !== undefined ? { publicSettingsJson: input.publicSettings } : {}),
  ...(input.publicAccessCodeHash !== undefined
    ? { publicAccessCodeHash: input.publicAccessCodeHash }
    : {}),
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

const assertSlugNotClaimed = async (db: StoreDatabase, slug: string, eventId?: string) => {
  await db.execute(sql`select pg_advisory_xact_lock(hashtext(${`event-public-slug:${slug}`}))`);

  const [current] = await db
    .select({ id: events.id })
    .from(events)
    .where(
      eventId
        ? and(eq(events.publicSlug, slug), ne(events.id, eventId))
        : eq(events.publicSlug, slug),
    )
    .limit(1);
  const [alias] = await db
    .select({ eventId: eventSlugAliases.eventId })
    .from(eventSlugAliases)
    .where(eq(eventSlugAliases.slug, slug))
    .limit(1);

  if (current || (alias && alias.eventId !== eventId)) {
    throw new ApiHttpError("CONFLICT", "Event slug is already in use");
  }
};

const isUniqueViolation = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  (error as { code?: unknown }).code === "23505";
