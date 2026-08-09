import type { Database } from "@lumiere/db";
import {
  asc,
  and,
  eq,
  eventSectionContents,
  eventSections,
  events,
  getTableColumns,
  eventThemeSettings,
  sql,
} from "@lumiere/db";
import type { ThemeDefinition } from "@lumiere/themes";
import type {
  Event,
  EventSection,
  EventSectionMutation,
  EventSectionUpdate,
  EventStatus,
  EventThemeUpdate,
  EventType,
  Theme,
  ThemeMode,
} from "@lumiere/types";

import { ApiHttpError } from "./errors";
import { toIsoDateTime } from "./serialization";

type EventSectionRow = typeof eventSections.$inferSelect;
type EventSectionSource = EventSectionRow & {
  contentJson: EventSection["content"];
};
type JsonObject = Event["themeConfig"];

export type EventThemeState = {
  eventId: string;
  eventStatus: EventStatus;
  eventType: EventType;
  selectedThemeId?: string;
  themeConfig: JsonObject;
  themeMode: ThemeMode;
};

export type ThemeSectionStore = {
  getEventTheme(eventId: string): Promise<EventThemeState | null>;
  listSections(eventId: string): Promise<EventSection[]>;
  reorderSections(
    eventId: string,
    expectedSectionKeys: string[],
    sectionKeys: string[],
  ): Promise<EventSection[] | null>;
  replaceSections(eventId: string, sections: EventSectionMutation[]): Promise<EventSection[]>;
  updateSection(
    eventId: string,
    sectionKey: string,
    input: EventSectionUpdate,
  ): Promise<EventSection | null>;
  updateEventTheme(eventId: string, input: EventThemeUpdate): Promise<EventThemeState | null>;
};

export const createDrizzleThemeSectionStore = (db: Database): ThemeSectionStore => ({
  async getEventTheme(eventId) {
    return getEventThemeState(db, eventId);
  },

  async listSections(eventId) {
    return listSectionsFromDatabase(db, eventId);
  },

  async reorderSections(eventId, expectedSectionKeys, sectionKeys) {
    return db.transaction(async (tx) => {
      const database = tx as unknown as Database;
      const lockedSections = await tx
        .select({
          id: eventSections.id,
          sectionKey: eventSections.sectionKey,
          sortOrder: eventSections.sortOrder,
        })
        .from(eventSections)
        .where(eq(eventSections.eventId, eventId))
        .orderBy(asc(eventSections.sortOrder), asc(eventSections.createdAt))
        .for("update");
      const currentSectionKeys = lockedSections.map((section) => section.sectionKey);

      if (!sameStringArray(currentSectionKeys, expectedSectionKeys)) {
        throw new ApiHttpError(
          "CONFLICT",
          "Sections were reordered by another manager. Review the latest order before saving.",
        );
      }

      if (!sameStringSet(currentSectionKeys, sectionKeys)) {
        throw new ApiHttpError("VALIDATION_ERROR", "Reorder must include every configured section");
      }

      const sectionByKey = new Map(lockedSections.map((section) => [section.sectionKey, section]));

      for (const [sortOrder, sectionKey] of sectionKeys.entries()) {
        const section = sectionByKey.get(sectionKey);

        if (section && section.sortOrder !== sortOrder) {
          await tx
            .update(eventSections)
            .set({ sortOrder })
            .where(eq(eventSections.id, section.id));
        }
      }

      await tx
        .update(events)
        .set({ updatedAt: sql`now()` })
        .where(eq(events.id, eventId));

      return listSectionsFromDatabase(database, eventId);
    });
  },

  async replaceSections(eventId, sections) {
    return db.transaction(async (tx) => {
      await tx.delete(eventSections).where(eq(eventSections.eventId, eventId));
      await tx
        .update(events)
        .set({ updatedAt: sql`now()` })
        .where(eq(events.id, eventId));

      if (sections.length === 0) {
        return [];
      }

      const insertedSections = await tx
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
        .returning();

      await tx.insert(eventSectionContents).values(
        insertedSections.map((section, index) => ({
          contentJson: sections[index]?.content ?? {},
          eventSectionId: section.id,
        })),
      );

      return insertedSections
        .map((section, index) =>
          toApiEventSection({
            ...section,
            contentJson: sections[index]?.content ?? {},
          }),
        )
        .sort((first, second) => first.sortOrder - second.sortOrder);
    });
  },

  async updateSection(eventId, sectionKey, input) {
    return db.transaction(async (tx) => {
      const database = tx as unknown as Database;
      const [current] = await tx
        .select()
        .from(eventSections)
        .where(and(eq(eventSections.eventId, eventId), eq(eventSections.sectionKey, sectionKey)))
        .limit(1);

      if (current) {
        if (
          (input.id !== undefined && input.id !== current.id) ||
          input.sectionType !== current.sectionType
        ) {
          throw new ApiHttpError(
            "CONFLICT",
            "This section identity changed. Refresh before saving.",
          );
        }

        const [updated] = await tx
          .update(eventSections)
          .set({
            enabled: input.enabled,
            settingsJson: input.settings,
            updatedAt: sql`now()`,
            visibility: input.visibility,
          })
          .where(
            and(
              eq(eventSections.id, current.id),
              input.expectedUpdatedAt
                ? sql`date_trunc('milliseconds', ${eventSections.updatedAt}) = date_trunc('milliseconds', ${input.expectedUpdatedAt}::timestamptz)`
                : undefined,
            ),
          )
          .returning();

        if (!updated) {
          throw new ApiHttpError(
            "CONFLICT",
            "This section changed by another manager. Review the latest section before saving.",
          );
        }

        await tx
          .insert(eventSectionContents)
          .values({
            contentJson: input.content,
            eventSectionId: current.id,
          })
          .onConflictDoUpdate({
            target: eventSectionContents.eventSectionId,
            set: {
              contentJson: input.content,
              updatedAt: sql`now()`,
            },
          });
        await tx
          .update(events)
          .set({ updatedAt: sql`now()` })
          .where(eq(events.id, eventId));

        return toApiEventSection({
          ...updated,
          contentJson: input.content,
        });
      }

      if (input.expectedUpdatedAt || input.id !== undefined) {
        throw new ApiHttpError(
          "CONFLICT",
          "This section was created by another manager. Refresh before saving.",
        );
      }

      const [created] = await tx
        .insert(eventSections)
        .values({
          enabled: input.enabled,
          eventId,
          sectionKey,
          sectionType: input.sectionType,
          settingsJson: input.settings,
          sortOrder: input.sortOrder,
          visibility: input.visibility,
        })
        .returning();

      if (!created) {
        return null;
      }

      await tx.insert(eventSectionContents).values({
        contentJson: input.content,
        eventSectionId: created.id,
      });
      await tx
        .update(events)
        .set({ updatedAt: sql`now()` })
        .where(eq(events.id, eventId));

      return toApiEventSection({
        ...created,
        contentJson: input.content,
      });
    });
  },

  async updateEventTheme(eventId, input) {
    await db.transaction(async (tx) => {
      await tx
        .insert(eventThemeSettings)
        .values({
          configJson: input.themeConfig,
          eventId,
          selectedThemeId: input.selectedThemeId,
          themeMode: input.themeMode,
        })
        .onConflictDoUpdate({
          target: eventThemeSettings.eventId,
          set: {
            configJson: input.themeConfig,
            selectedThemeId: input.selectedThemeId,
            themeMode: input.themeMode,
            updatedAt: sql`now()`,
          },
        });
      await tx
        .update(events)
        .set({ updatedAt: sql`now()` })
        .where(eq(events.id, eventId));
    });

    return getEventThemeState(db, eventId);
  },
});

const listSectionsFromDatabase = async (db: Database, eventId: string): Promise<EventSection[]> => {
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

const sameStringArray = (first: string[], second: string[]) =>
  first.length === second.length && first.every((value, index) => value === second[index]);

const sameStringSet = (first: string[], second: string[]) =>
  first.length === second.length && new Set(first).size === new Set(second).size &&
  first.every((value) => second.includes(value));

const getEventThemeState = async (
  db: Database,
  eventId: string,
): Promise<EventThemeState | null> => {
  const [event] = await db
    .select({
      eventType: events.eventType,
      id: events.id,
      selectedThemeId: eventThemeSettings.selectedThemeId,
      status: events.status,
      themeConfigJson: eventThemeSettings.configJson,
      themeMode: eventThemeSettings.themeMode,
    })
    .from(events)
    .leftJoin(eventThemeSettings, eq(eventThemeSettings.eventId, events.id))
    .where(eq(events.id, eventId))
    .limit(1);

  return event
    ? {
        eventId: event.id,
        eventStatus: event.status,
        eventType: event.eventType,
        selectedThemeId: event.selectedThemeId ?? undefined,
        themeConfig: (event.themeConfigJson ?? {}) as JsonObject,
        themeMode: event.themeMode ?? "system",
      }
    : null;
};

export const toApiTheme = (theme: ThemeDefinition): Theme => ({
  defaultMode: theme.defaultMode,
  eventTypes: theme.supportedEventTypes,
  id: theme.id,
  metadata: {
    accessibilityNotes: theme.accessibilityNotes,
    compatibility: theme.compatibility,
    composition: theme.composition,
    dashboardPreview: theme.dashboardPreview,
    description: theme.description,
    designRead: theme.designRead,
    imageTreatment: theme.imageTreatment,
    previewData: theme.previewData,
    radius: theme.radius,
    recommendedSections: theme.recommendedSections,
    requiredSections: theme.requiredSections,
    rsvpTreatment: theme.rsvpTreatment,
    sectionRhythm: theme.sectionRhythm,
    supportedSections: theme.supportedSections,
    tokens: theme.tokens,
    typography: theme.typography,
  },
  name: theme.label,
  supportedModes: theme.supportedModes,
  version: "0.0.0",
});

export const toApiEventSection = (section: EventSectionSource): EventSection => ({
  content: section.contentJson as EventSection["content"],
  createdAt: toIsoDateTime(section.createdAt),
  enabled: section.enabled,
  eventId: section.eventId,
  id: section.id,
  sectionKey: section.sectionKey,
  sectionType: section.sectionType,
  settings: section.settingsJson as EventSection["settings"],
  sortOrder: section.sortOrder,
  updatedAt: toIsoDateTime(section.updatedAt),
  visibility: section.visibility,
});
