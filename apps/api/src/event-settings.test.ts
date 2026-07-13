import type { Event, EventSection } from "@lumiere/types";
import { describe, expect, it } from "vitest";

import {
  buildEventSectionDefaults,
  evaluatePublishingReadiness,
  reconcileEventTypeSections,
} from "./events";

const event: Event = {
  createdAt: "2026-07-10T00:00:00.000Z",
  eventType: "launch",
  id: "00000000-0000-4000-8000-000000000100",
  hasPublicAccessCode: false,
  ownerUserId: "00000000-0000-4000-8000-000000000101",
  publicSettings: {},
  rsvpSettings: {
    collectGuestMessage: true,
    collectGuestNames: true,
    enabled: true,
  },
  selectedThemeId: "lumiere-default",
  slug: "launch-night",
  startsAt: "2026-12-01T11:00:00.000Z",
  status: "draft",
  themeConfig: {},
  themeMode: "system",
  timezone: "Asia/Singapore",
  title: "Launch Night",
  updatedAt: "2026-07-10T00:00:00.000Z",
  venueAddress: "1 Marina Boulevard, Singapore",
  venueName: "Harbour Hall",
};

describe("event settings model", () => {
  it("creates persisted draft defaults from the event-type blueprint", () => {
    const defaults = buildEventSectionDefaults(event);

    expect(defaults.map((section) => section.sectionType).slice(0, 5)).toEqual([
      "introduction",
      "date",
      "details",
      "location",
      "rsvp",
    ]);
    expect(defaults.find((section) => section.sectionType === "introduction")).toMatchObject({
      content: {
        title: "Launch Night",
      },
      enabled: false,
      visibility: "public",
    });
    expect(defaults.find((section) => section.sectionType === "rsvp")).toMatchObject({
      visibility: "guest_only",
    });
  });

  it("reconciles sections when event type changes and preserves compatible content", () => {
    const existing = toSections(buildEventSectionDefaults(event)).map((section) =>
      section.sectionType === "introduction"
        ? {
            ...section,
            content: { title: "A preserved welcome" },
            enabled: true,
          }
        : section,
    );
    existing.push({
      ...existing[0]!,
      id: "00000000-0000-4000-8000-000000000999",
      sectionKey: "brand-story",
      sectionType: "profile",
    });

    const reconciled = reconcileEventTypeSections({ ...event, eventType: "kids_party" }, existing);

    expect(reconciled.find((section) => section.sectionType === "introduction")).toMatchObject({
      content: { title: "A preserved welcome" },
      enabled: true,
    });
    expect(reconciled.some((section) => section.sectionType === "profile")).toBe(false);
    expect(reconciled.map((section) => section.sectionType)).toContain("rsvp");
  });

  it("reports enablement and required-content issues before publishing", () => {
    const defaults = toSections(buildEventSectionDefaults(event));
    const missingSections = evaluatePublishingReadiness({ event, sections: defaults });

    expect(missingSections.ready).toBe(false);
    expect(missingSections.issues.map((issue) => issue.message)).toContain(
      "Introduction is required before publishing Launch events",
    );

    const requiredEnabled = defaults.map((section) => ({
      ...section,
      enabled: ["introduction", "date", "details", "location", "rsvp"].includes(
        section.sectionType,
      ),
    }));
    const ready = evaluatePublishingReadiness({ event, sections: requiredEnabled });

    expect(ready).toMatchObject({
      blockers: [],
      issues: [],
      ready: true,
      rsvpStatus: "open",
      updatePolicy: "immediate",
      warnings: [],
    });

    const closedRsvp = evaluatePublishingReadiness({
      event: {
        ...event,
        rsvpSettings: { ...event.rsvpSettings, enabled: false },
      },
      sections: requiredEnabled,
    });

    expect(closedRsvp.ready).toBe(true);
    expect(closedRsvp.warnings).toContainEqual({
      code: "rsvp.closed",
      destination: "rsvp",
      message: "The RSVP section is included, but guest responses are currently closed",
      path: ["rsvpSettings"],
    });

    const missingContent = requiredEnabled.map((section) =>
      section.sectionType === "introduction" ? { ...section, content: {} } : section,
    );
    const invalid = evaluatePublishingReadiness({ event, sections: missingContent });

    expect(invalid.ready).toBe(false);
    expect(invalid.issues).toContainEqual({
      message: "introduction: Invalid input: expected string, received undefined",
      path: ["sections", 0],
    });
  });
});

const toSections = (sections: ReturnType<typeof buildEventSectionDefaults>): EventSection[] =>
  sections.map((section, index) => ({
    ...section,
    createdAt: event.createdAt,
    eventId: event.id,
    id: `00000000-0000-4000-8000-${String(index + 200).padStart(12, "0")}`,
    updatedAt: event.updatedAt,
  }));
