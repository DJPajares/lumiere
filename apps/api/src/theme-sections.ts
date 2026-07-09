import type { Database } from "@lumiere/db";
import { eventSections, events } from "@lumiere/db";
import type { ThemeDefinition } from "@lumiere/themes";
import type {
  Event,
  EventSection,
  EventSectionMutation,
  EventThemeUpdate,
  EventType,
  Theme,
  ThemeMode,
} from "@lumiere/types";
import { asc, eq, sql } from "drizzle-orm";

import { toIsoDateTime } from "./serialization";

type EventSectionRow = typeof eventSections.$inferSelect;
type JsonObject = Event["themeConfig"];

export type EventThemeState = {
  eventId: string;
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
    const [event] = await db
      .select({
        eventType: events.eventType,
        id: events.id,
        selectedThemeId: events.selectedThemeId,
        themeConfigJson: events.themeConfigJson,
        themeMode: events.themeMode,
      })
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    return event
      ? {
          eventId: event.id,
          eventType: event.eventType,
          selectedThemeId: event.selectedThemeId ?? undefined,
          themeConfig: event.themeConfigJson as JsonObject,
          themeMode: event.themeMode,
        }
      : null;
  },

  async listSections(eventId) {
    const sectionRows = await db
      .select()
      .from(eventSections)
      .where(eq(eventSections.eventId, eventId))
      .orderBy(asc(eventSections.sortOrder), asc(eventSections.createdAt));

    return sectionRows.map(toApiEventSection);
  },

  async replaceSections(eventId, sections) {
    return db.transaction(async (tx) => {
      await tx.delete(eventSections).where(eq(eventSections.eventId, eventId));

      if (sections.length === 0) {
        return [];
      }

      const insertedSections = await tx
        .insert(eventSections)
        .values(
          sections.map((section) => ({
            contentJson: section.content,
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

      return insertedSections
        .map(toApiEventSection)
        .sort((first, second) => first.sortOrder - second.sortOrder);
    });
  },

  async updateEventTheme(eventId, input) {
    const [event] = await db
      .update(events)
      .set({
        selectedThemeId: input.selectedThemeId,
        themeConfigJson: input.themeConfig,
        themeMode: input.themeMode,
        updatedAt: sql`now()`,
      })
      .where(eq(events.id, eventId))
      .returning({
        eventType: events.eventType,
        id: events.id,
        selectedThemeId: events.selectedThemeId,
        themeConfigJson: events.themeConfigJson,
        themeMode: events.themeMode,
      });

    return event
      ? {
          eventId: event.id,
          eventType: event.eventType,
          selectedThemeId: event.selectedThemeId ?? undefined,
          themeConfig: event.themeConfigJson as JsonObject,
          themeMode: event.themeMode,
        }
      : null;
  },
});

export const toApiTheme = (theme: ThemeDefinition): Theme => ({
  defaultMode: theme.defaultMode,
  eventTypes: theme.supportedEventTypes,
  id: theme.id,
  metadata: {
    accessibilityNotes: theme.accessibilityNotes,
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

export const toApiEventSection = (section: EventSectionRow): EventSection => ({
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
