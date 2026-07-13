import type { Database } from "@lumiere/db";
import { eventSectionContents, eventSections, events, eventThemeSettings } from "@lumiere/db";
import type { ThemeDefinition } from "@lumiere/themes";
import type {
  Event,
  EventSection,
  EventSectionMutation,
  EventStatus,
  EventThemeUpdate,
  EventType,
  Theme,
  ThemeMode,
} from "@lumiere/types";
import { asc, eq, getTableColumns, sql } from "drizzle-orm";

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
  replaceSections(eventId: string, sections: EventSectionMutation[]): Promise<EventSection[]>;
  updateEventTheme(eventId: string, input: EventThemeUpdate): Promise<EventThemeState | null>;
};

export const createDrizzleThemeSectionStore = (db: Database): ThemeSectionStore => ({
  async getEventTheme(eventId) {
    return getEventThemeState(db, eventId);
  },

  async listSections(eventId) {
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
