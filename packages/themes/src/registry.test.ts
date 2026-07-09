import { describe, expect, it } from "vitest";

import {
  availableThemeIds,
  getThemesForEventType,
  sectionDefinitions,
  themeRegistry,
  validateThemeSection,
  validateThemeSections,
} from ".";

const baseSections = [
  {
    sectionType: "introduction",
    sectionKey: "welcome",
    sortOrder: 0,
    visibility: "public",
    content: {
      eyebrow: "You are invited",
      title: "Amara and Jules",
      subtitle: "A candlelit dinner celebration",
    },
    settings: {
      layout: "editorial",
      density: "spacious",
    },
  },
  {
    sectionType: "date",
    sectionKey: "date",
    sortOrder: 1,
    visibility: "public",
    content: {
      startsAt: "2026-12-24T18:30:00+08:00",
      timezone: "Asia/Singapore",
      displayText: "Christmas Eve, 6:30 PM",
    },
    settings: {
      showCountdown: true,
    },
  },
  {
    sectionType: "location",
    sectionKey: "venue",
    sortOrder: 2,
    visibility: "public",
    content: {
      venueName: "The Glasshouse",
      address: "12 Orchard Road, Singapore",
      mapUrl: "https://maps.example.com/the-glasshouse",
    },
    settings: {
      showMapPreview: true,
    },
  },
  {
    sectionType: "rsvp",
    sectionKey: "rsvp",
    sortOrder: 3,
    visibility: "guest_only",
    content: {
      title: "RSVP",
      description: "Let us know who can join.",
      questions: [
        {
          key: "meal-choice",
          label: "Meal preference",
          type: "single_choice",
          options: ["Classic", "Vegetarian"],
        },
      ],
    },
    settings: {
      requireGuestToken: true,
    },
  },
] as const;

describe("theme registry", () => {
  it("exports the initial theme set", () => {
    expect(availableThemeIds).toEqual(["lumiere-default", "premium", "kids", "noel"]);
    expect(themeRegistry.premium.supportedModes).toContain("toggleable");
    expect(themeRegistry.kids.supportedEventTypes).toContain("kids_party");
  });

  it("exposes section definitions as schemas and renderer keys", () => {
    expect(sectionDefinitions.rsvp.rendererKey).toBe("section.rsvp");
    expect(sectionDefinitions.rsvp.requiresGuestContext).toBe(true);
    expect(typeof sectionDefinitions.rsvp.rendererKey).toBe("string");
  });

  it("keeps renderer contracts as identifiers instead of executable database content", () => {
    const rendererKeys = Object.values(sectionDefinitions).map(
      (definition) => definition.rendererKey,
    );

    expect(rendererKeys.every((rendererKey) => typeof rendererKey === "string")).toBe(true);
    expect(
      Object.values(themeRegistry).every(
        (theme) => typeof theme.dashboardPreview.summary === "string",
      ),
    ).toBe(true);
  });

  it("defines visual composition, RSVP treatment, and preview data for every initial theme", () => {
    expect(
      Object.values(themeRegistry).every(
        (theme) =>
          theme.composition.rsvpDesign &&
          theme.composition.hero.composition &&
          theme.composition.sectionDefaults.rsvp &&
          theme.previewData.sections.length > 0,
      ),
    ).toBe(true);
  });

  it("sets Premium apart as a full-viewport editorial invitation theme", () => {
    const premium = themeRegistry.premium;
    const premiumCompositions = new Set(
      Object.values(premium.composition.sectionDefaults).map((section) => section.composition),
    );

    expect(premium.composition.hero.fullViewport).toBe(true);
    expect(premium.composition.hero.composition).toBe("layered-portrait");
    expect(premium.composition.rsvpDesign).toBe("premium");
    expect(premium.composition.ambientMedia).toMatchObject({
      audioSlot: "optional",
      controlStrategy: "external-controls",
      defaultAutoplay: false,
    });
    expect(premiumCompositions.size).toBeGreaterThan(3);
    expect(premium.composition.sectionDefaults.gallery?.composition).toBe("gallery-feature");
    expect(premium.composition.sectionDefaults.story?.composition).toBe("timeline");
  });

  it("validates sample event sections against a supported theme", () => {
    const results = validateThemeSections("premium", [...baseSections]);

    expect(results.every((result) => result.ok)).toBe(true);
  });

  it("rejects public RSVP sections", () => {
    const result = validateThemeSection("premium", {
      ...baseSections[3],
      visibility: "public",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.join(" ")).toContain("cannot be public");
    }
  });

  it("rejects unsafe executable markup in section content", () => {
    const result = validateThemeSection("premium", {
      ...baseSections[0],
      content: {
        title: "Launch Night",
        body: '<img src="x" onerror="alert(1)">',
      },
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.join(" ")).toContain("contains unsafe markup or script");
      expect(result.issues.join(" ")).toContain("content.body");
    }
  });

  it("rejects non-http media and map URLs", () => {
    const result = validateThemeSection("premium", {
      ...baseSections[2],
      content: {
        venueName: "The Glasshouse",
        address: "12 Orchard Road, Singapore",
        mapUrl: "ftp://maps.example.com/the-glasshouse",
      },
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.join(" ")).toContain("Use HTTP or HTTPS URLs");
    }
  });

  it("rejects unsupported theme sections", () => {
    const result = validateThemeSection("kids", {
      sectionType: "entourage",
      sectionKey: "wedding-party",
      sortOrder: 4,
      visibility: "public",
      content: {
        title: "Wedding Party",
        groups: [{ label: "Friends", names: ["Mina"] }],
      },
      settings: {},
    });

    expect(result.ok).toBe(false);
  });

  it("filters themes by event type", () => {
    expect(getThemesForEventType("holiday").map((theme) => theme.id)).toContain("noel");
    expect(getThemesForEventType("kids_party").map((theme) => theme.id)).toEqual(["kids"]);
  });
});
