import type { Database } from "@lumiere/db";
import {
  activityEvents,
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
import {
  eventDeletionRetentionDays,
  rsvpSettingsSchema,
  type ApiFieldError,
  type Event,
  type EventCreate,
  type EventPublishingDiagnostic,
  type EventPublishingReadiness,
  type EventSection,
  type EventSectionMutation,
  type EventUpdate,
} from "@lumiere/types";
import { and, asc, desc, eq, getTableColumns, gt, isNotNull, isNull, ne, sql } from "drizzle-orm";

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

export type PublishingReadiness = Omit<EventPublishingReadiness, "publicUrl"> & {
  publicPath: string;
};

export type EventStore = {
  createEvent(ownerUserId: string, input: EventCreatePersistence): Promise<Event>;
  deleteEvent(
    eventId: string,
    actorUserId: string,
    confirmationTitle: string,
  ): Promise<Event | null>;
  getEvent(eventId: string): Promise<Event | null>;
  getEventBySlug(slug: string): Promise<Event | null>;
  getPublishingReadiness(eventId: string): Promise<PublishingReadiness | null>;
  isEventSlugAvailable(slug: string, options?: { exceptEventId?: string }): Promise<boolean>;
  listDeletedEvents(userId: string): Promise<Event[]>;
  listManagedEvents(userId: string): Promise<Event[]>;
  restoreEvent(eventId: string, actorUserId: string): Promise<EventRestoreResult>;
  updateEvent(eventId: string, input: EventUpdatePersistence): Promise<Event | null>;
};

export type EventRestoreResult = Event | "expired" | "not_deleted" | null;

export type EventCreatePersistence = Omit<EventCreate, "publicAccessCode"> & {
  publicAccessCodeHash?: string;
};

export type EventUpdatePersistence = Omit<EventUpdate, "publicAccessCode"> & {
  actorUserId?: string;
  publicAccessCodeHash?: string | null;
};

export const createDrizzleEventStore = (db: Database): EventStore => ({
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

  async deleteEvent(eventId, actorUserId, confirmationTitle) {
    return db.transaction(async (tx) => {
      const database = tx as unknown as StoreDatabase;
      const current = await getManagerEventRecord(database, eq(events.id, eventId), {
        includeDeleted: true,
      });

      if (!current) {
        return null;
      }

      if (current.event.title !== confirmationTitle) {
        throw new ApiHttpError("VALIDATION_ERROR", "Event title confirmation does not match", {
          fields: [
            {
              message: `Type ${current.event.title} exactly to delete this event`,
              path: ["confirmationTitle"],
            },
          ],
        });
      }

      if (current.event.deletedAt) {
        return toApiEvent(current.event, current.themeSettings, current.rsvpSettings);
      }

      const [event] = await tx
        .update(events)
        .set({
          deletedAt: sql`now()`,
          deletedByUserId: actorUserId,
          purgeAfter: sql`now() + (${eventDeletionRetentionDays} * interval '1 day')`,
          status: "archived",
          updatedAt: sql`now()`,
        })
        .where(and(eq(events.id, eventId), isNull(events.deletedAt)))
        .returning();

      if (!event) {
        const deleted = await getManagerEventRecord(database, eq(events.id, eventId), {
          includeDeleted: true,
        });

        return deleted?.event.deletedAt
          ? toApiEvent(deleted.event, deleted.themeSettings, deleted.rsvpSettings)
          : null;
      }

      await tx.insert(activityEvents).values({
        actorId: actorUserId,
        actorType: "manager",
        activityType: "event_deleted",
        eventId,
        metadataJson: {
          previousStatus: current.event.status,
          purgeAfter: event.purgeAfter,
          retentionDays: eventDeletionRetentionDays,
        },
      });

      return toApiEvent(event, current.themeSettings, current.rsvpSettings);
    });
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
        and(
          isNull(events.deletedAt),
          sql`(${events.ownerUserId} = ${userId} or exists (
          select 1 from ${eventManagers}
          where ${eventManagers.eventId} = ${events.id}
            and ${eventManagers.userId} = ${userId}
        ))`,
        ),
      )
      .orderBy(desc(events.createdAt));

    return records.map((record) =>
      toApiEvent(record.event, record.themeSettings, record.rsvpSettings),
    );
  },

  async listDeletedEvents(userId) {
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
        and(
          isNotNull(events.deletedAt),
          sql`(${events.ownerUserId} = ${userId} or exists (
            select 1 from ${eventManagers}
            where ${eventManagers.eventId} = ${events.id}
              and ${eventManagers.userId} = ${userId}
              and ${eventManagers.role} = 'owner'
          ))`,
        ),
      )
      .orderBy(desc(events.deletedAt));

    return records.map((record) =>
      toApiEvent(record.event, record.themeSettings, record.rsvpSettings),
    );
  },

  async restoreEvent(eventId, actorUserId) {
    return db.transaction(async (tx) => {
      const database = tx as unknown as StoreDatabase;
      const current = await getManagerEventRecord(database, eq(events.id, eventId), {
        includeDeleted: true,
      });

      if (!current) {
        return null;
      }

      if (!current.event.deletedAt) {
        return "not_deleted";
      }

      const [event] = await tx
        .update(events)
        .set({
          deletedAt: null,
          deletedByUserId: null,
          purgeAfter: null,
          status: "draft",
          updatedAt: sql`now()`,
        })
        .where(
          and(
            eq(events.id, eventId),
            isNotNull(events.deletedAt),
            gt(events.purgeAfter, sql`now()`),
          ),
        )
        .returning();

      if (!event) {
        return "expired";
      }

      await tx.insert(activityEvents).values({
        actorId: actorUserId,
        actorType: "manager",
        activityType: "event_restored",
        eventId,
        metadataJson: {
          restoredAsStatus: "draft",
        },
      });

      return toApiEvent(event, current.themeSettings, current.rsvpSettings);
    });
  },

  async updateEvent(eventId, input) {
    return withDuplicateSlugHandling(async () =>
      db.transaction(async (tx) => {
        const database = tx as unknown as StoreDatabase;
        const current = await getManagerEventRecord(database, eq(events.id, eventId));

        if (!current) {
          return null;
        }

        if (
          input.expectedUpdatedAt &&
          Date.parse(input.expectedUpdatedAt) !== Date.parse(toIsoDateTime(current.event.updatedAt))
        ) {
          throw new ApiHttpError(
            "CONFLICT",
            "Event changed since publishing readiness was checked",
          );
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
          .where(
            and(
              eq(events.id, eventId),
              isNull(events.deletedAt),
              input.expectedUpdatedAt
                ? sql`date_trunc('milliseconds', ${events.updatedAt}) = date_trunc('milliseconds', ${input.expectedUpdatedAt}::timestamptz)`
                : undefined,
            ),
          )
          .returning();

        if (!event) {
          if (input.expectedUpdatedAt) {
            throw new ApiHttpError(
              "CONFLICT",
              "Event changed since publishing readiness was checked",
            );
          }

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

        if (input.rsvpSettings !== undefined && event.status === "published") {
          await tx
            .update(eventPublications)
            .set({
              rsvpSettingsJson: managerEvent.rsvpSettings,
            })
            .where(eq(eventPublications.eventId, eventId));
        }

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

          if (input.actorUserId) {
            await tx.insert(activityEvents).values({
              actorId: input.actorUserId,
              actorType: "manager",
              activityType: "event_published",
              eventId,
              metadataJson: {
                previousStatus: current.event.status,
              },
            });
          }
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
  const blockers: EventPublishingDiagnostic[] = [];
  const warnings: EventPublishingDiagnostic[] = [];
  let selectedTheme: PublishingReadiness["theme"];

  const addBlocker = (
    code: string,
    message: string,
    path: ApiFieldError["path"],
    destination: EventPublishingDiagnostic["destination"],
  ) => blockers.push({ code, destination, message, path });

  const addWarning = (
    code: string,
    message: string,
    path: ApiFieldError["path"],
    destination: EventPublishingDiagnostic["destination"],
  ) => warnings.push({ code, destination, message, path });

  if (!event.title.trim()) {
    addBlocker("event.title", "Add an event title before publishing", ["title"], "details");
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(event.slug)) {
    addBlocker("event.slug", "Choose a valid public URL slug", ["slug"], "details");
  }

  const startsAt = Date.parse(event.startsAt);

  if (Number.isNaN(startsAt)) {
    addBlocker("event.starts_at", "Choose a valid event start time", ["startsAt"], "details");
  }

  if (event.endsAt && !Number.isNaN(startsAt) && Date.parse(event.endsAt) <= startsAt) {
    addBlocker(
      "event.ends_at",
      "Event end time must be after the start time",
      ["endsAt"],
      "details",
    );
  }

  if (!event.timezone.trim()) {
    addBlocker("event.timezone", "Choose an event timezone", ["timezone"], "details");
  }

  if (!event.venueName || !event.venueAddress) {
    addWarning(
      "event.venue",
      "Add a venue name and address so guests know where to go",
      ["venueName"],
      "details",
    );
  }

  if (!event.selectedThemeId || !isThemeId(event.selectedThemeId)) {
    addBlocker(
      "theme.selection",
      "Select a valid theme before publishing",
      ["selectedThemeId"],
      "theme",
    );
  } else {
    const theme = getTheme(event.selectedThemeId);

    if (!theme) {
      addBlocker(
        "theme.selection",
        "Select a valid theme before publishing",
        ["selectedThemeId"],
        "theme",
      );
    } else {
      selectedTheme = {
        id: theme.id,
        mode: event.themeMode,
        name: theme.label,
      };
      const compatibility = evaluateThemeCompatibility({
        eventType: event.eventType,
        mode: event.themeMode,
        theme,
      });
      compatibility.issues.forEach((issue) =>
        addBlocker("theme.compatibility", issue.message, [...issue.path], "theme"),
      );
      sections.forEach((section, index) => {
        if (!section.enabled) {
          return;
        }

        const result = validateThemeSections(theme.id, [section])[0]!;

        if (!result.ok) {
          result.issues.forEach((message) =>
            addBlocker("section.validation", message, ["sections", index], "sections"),
          );
        }
      });
    }
  }

  validateEventTypeSections({
    eventStatus: "published",
    eventType: event.eventType,
    sections,
  }).forEach((issue) => addBlocker("section.required", issue.message, [...issue.path], "sections"));

  const rsvpSection = sections.find(
    (section) =>
      section.enabled && section.sectionType === "rsvp" && section.visibility !== "hidden",
  );
  const rsvpEnabled = event.rsvpSettings.enabled === true;
  const rsvpClosed = event.rsvpSettings.closed === true;
  const closesAt =
    typeof event.rsvpSettings.closesAt === "string"
      ? Date.parse(event.rsvpSettings.closesAt)
      : Number.NaN;
  const rsvpStatus: PublishingReadiness["rsvpStatus"] = !rsvpSection
    ? "not_included"
    : rsvpEnabled && !rsvpClosed && (Number.isNaN(closesAt) || closesAt > Date.now())
      ? "open"
      : "closed";

  if (rsvpSection && rsvpStatus === "closed") {
    addWarning(
      "rsvp.closed",
      "The RSVP section is included, but guest responses are currently closed",
      ["rsvpSettings"],
      "rsvp",
    );
  }

  return {
    blockers,
    eventUpdatedAt: event.updatedAt,
    issues: blockers.map(({ message, path }) => ({ message, path })),
    publicPath: `/e/${event.slug}`,
    ready: blockers.length === 0,
    rsvpStatus,
    status: event.status,
    theme: selectedTheme,
    updatePolicy: "immediate",
    warnings,
  };
};

export const toApiEvent = (
  event: EventRow,
  themeSettings?: ThemeSettingsRow | null,
  rsvpSettings?: RsvpSettingsRow | null,
): Event => ({
  createdAt: toIsoDateTime(event.createdAt),
  deletedAt: event.deletedAt ? toIsoDateTime(event.deletedAt) : undefined,
  endsAt: event.endsAt ? toIsoDateTime(event.endsAt) : undefined,
  eventType: event.eventType,
  id: event.id,
  ownerUserId: event.ownerUserId,
  publicSettings: event.publicSettingsJson as Event["publicSettings"],
  purgeAfter: event.purgeAfter ? toIsoDateTime(event.purgeAfter) : undefined,
  hasPublicAccessCode: event.publicAccessCodeHash !== null,
  rsvpSettings: rsvpSettingsSchema.parse(rsvpSettings?.settingsJson ?? {}),
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
  options: { includeDeleted?: boolean } = {},
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
    .where(options.includeDeleted ? predicate : and(predicate, isNull(events.deletedAt)))
    .limit(1);

  return record ?? null;
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

  const settingsJson = rsvpSettingsSchema.parse({
    ...(current?.settingsJson ?? {}),
    ...input.rsvpSettings,
  });

  const [settings] = await db
    .insert(eventRsvpSettings)
    .values({
      eventId,
      settingsJson,
    })
    .onConflictDoUpdate({
      target: eventRsvpSettings.eventId,
      set: {
        settingsJson,
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
