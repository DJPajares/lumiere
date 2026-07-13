import { describe, expect, it } from "vitest";

import {
  availableThemeIds,
  buildThemeCompatibilityMatrix,
  canDisableBlueprintSection,
  defaultRsvpCopy,
  eventTypeBlueprints,
  evaluateThemeCompatibility,
  expansionInviteCompositionMaps,
  getBlueprintSectionRequirement,
  getBlueprintSectionsForEventType,
  getThemesForEventType,
  inviteCompositionFamilies,
  inviteMotionRules,
  inviteVisualCompositionSystem,
  normalizeLocationContent,
  reverieReferenceLinks,
  resolveThemeRsvpCopy,
  sectionDefinitions,
  sampleInviteCompositionMaps,
  themeRegistry,
  themeTemplateSpecIds,
  themeTemplateSpecs,
  type ThemeDefinition,
  validateThemeSection,
  validateEventTypeSections,
  validateThemeSections,
} from ".";

const expansionThemeIds = [
  "editorial-ivory",
  "garden-light",
  "modern-minimal",
  "celestial-gold",
] as const;

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
      latitude: 1.3048,
      longitude: 103.8318,
      mapUrl:
        "https://www.google.com/maps/dir/?api=1&destination=12%20Orchard%20Road%2C%20Singapore",
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
  it("exports the initial themes and four-direction expansion pack", () => {
    expect(availableThemeIds).toEqual([
      "lumiere-default",
      "premium",
      "kids",
      "noel",
      ...expansionThemeIds,
    ]);
    expect(themeRegistry.premium.supportedModes).toContain("toggleable");
    expect(themeRegistry.kids.supportedEventTypes).toContain("kids_party");
    expect(new Set(availableThemeIds).size).toBe(availableThemeIds.length);
    expect(Object.keys(themeRegistry)).toEqual(availableThemeIds);
    expect(
      Object.entries(themeRegistry).every(([registryId, theme]) => registryId === theme.id),
    ).toBe(true);

    expect(resolveThemeRsvpCopy(themeRegistry["lumiere-default"])).toEqual(defaultRsvpCopy);
    expect(resolveThemeRsvpCopy(themeRegistry.kids)).toMatchObject({
      attendancePrompt: "Can you join the party?",
      eyebrow: "Your party reply",
    });
    expect(resolveThemeRsvpCopy(themeRegistry["editorial-ivory"])).toMatchObject({
      eyebrow: "Kindly reply",
      updateLabel: "Update attendance",
    });
    expect(
      resolveThemeRsvpCopy(themeRegistry.kids, {
        sectionDescription: "Please answer by Friday.",
        sectionTitle: "Reply for dinner",
        submitLabel: "Send dinner reply",
      }),
    ).toMatchObject({
      attendancePrompt: "Can you join the party?",
      sectionDescription: "Please answer by Friday.",
      sectionTitle: "Reply for dinner",
      submitLabel: "Send dinner reply",
    });
    expect(
      resolveThemeRsvpCopy({ id: "lumiere-default", rsvpCopy: { eyebrow: "" } }),
    ).toMatchObject({
      eyebrow: defaultRsvpCopy.eyebrow,
      submitLabel: defaultRsvpCopy.submitLabel,
    });
  });

  it("keeps each expansion direction structurally distinct instead of recoloring one layout", () => {
    const signatures = expansionThemeIds.map((themeId) => {
      const theme = themeRegistry[themeId];

      return JSON.stringify({
        backdrop: theme.compatibility.backdropStrategy,
        body: theme.compatibility.fontPairing.body,
        compositionMap: theme.composition.visualSystem.compositionMap,
        display: theme.compatibility.fontPairing.display,
        hero: theme.composition.hero.composition,
        motion: theme.composition.visualSystem.motionProfile,
        ornament: theme.compatibility.ornamentStrategy,
        parallax: theme.composition.visualSystem.parallaxProfile,
        radius: theme.radius,
        rsvp: theme.composition.sectionDefaults.rsvp?.composition,
        story: theme.composition.sectionDefaults.story?.composition,
      });
    });

    expect(new Set(signatures).size).toBe(expansionThemeIds.length);
    expect(
      new Set(expansionThemeIds.map((themeId) => themeRegistry[themeId].typography.display)).size,
    ).toBe(expansionThemeIds.length);
    expect(new Set(expansionThemeIds.map((themeId) => themeRegistry[themeId].radius.lg)).size).toBe(
      expansionThemeIds.length,
    );
  });

  it("exposes section definitions as schemas and renderer keys", () => {
    expect(sectionDefinitions.rsvp.rendererKey).toBe("section.rsvp");
    expect(sectionDefinitions.rsvp.requiresGuestContext).toBe(true);
    expect(typeof sectionDefinitions.rsvp.rendererKey).toBe("string");
  });

  it("defines event-type section blueprints for wedding and birthday defaults", () => {
    const weddingSections = getBlueprintSectionsForEventType("wedding");
    const birthdaySections = getBlueprintSectionsForEventType("birthday");

    expect(eventTypeBlueprints.wedding.label).toBe("Wedding");
    expect(eventTypeBlueprints.other.label).toBe("Generic celebration");
    expect(weddingSections.map((section) => section.sectionType).slice(0, 4)).toEqual([
      "introduction",
      "date",
      "location",
      "rsvp",
    ]);
    expect(weddingSections.find((section) => section.sectionType === "profile")).toMatchObject({
      requirement: "recommended",
      rendererKey: "section.profile",
      sectionKey: "hosts",
    });
    expect(
      weddingSections.every((section) => section.contentSchema && section.settingsSchema),
    ).toBe(true);
    expect(birthdaySections.map((section) => section.sectionType)).toEqual(
      expect.arrayContaining(["introduction", "date", "details", "gallery", "rsvp"]),
    );
    expect(getBlueprintSectionRequirement("birthday", "entourage")).toBe("optional");
  });

  it("validates required and unsupported sections against event type blueprints", () => {
    expect(
      validateEventTypeSections({
        eventStatus: "published",
        eventType: "wedding",
        sections: [
          {
            content: {
              title: "Welcome",
            },
            sectionKey: "welcome",
            sectionType: "introduction",
            sortOrder: 0,
            visibility: "public",
          },
        ],
      }).map((issue) => issue.message),
    ).toEqual(
      expect.arrayContaining([
        "Date and Time is required before publishing Wedding events",
        "Location is required before publishing Wedding events",
        "RSVP is required before publishing Wedding events",
      ]),
    );

    expect(
      validateEventTypeSections({
        eventStatus: "published",
        eventType: "wedding",
        sections: [
          {
            content: {
              startsAt: "2026-12-24T18:30:00+08:00",
              timezone: "Asia/Singapore",
            },
            enabled: false,
            sectionKey: "date",
            sectionType: "date",
            sortOrder: 0,
            visibility: "public",
          },
        ],
      }).map((issue) => issue.message),
    ).toContain("Date and Time is required before publishing Wedding events");
    expect(
      canDisableBlueprintSection({
        eventStatus: "draft",
        eventType: "wedding",
        sectionType: "date",
      }),
    ).toBe(true);
    expect(
      canDisableBlueprintSection({
        eventStatus: "published",
        eventType: "wedding",
        sectionType: "date",
      }),
    ).toBe(false);
    expect(
      canDisableBlueprintSection({
        eventStatus: "published",
        eventType: "wedding",
        sectionType: "custom",
      }),
    ).toBe(true);

    expect(
      validateEventTypeSections({
        eventStatus: "draft",
        eventType: "kids_party",
        sections: [
          {
            content: {
              people: [{ name: "Host" }],
              title: "Hosts",
            },
            sectionKey: "hosts",
            sectionType: "profile",
            sortOrder: 0,
            visibility: "public",
          },
        ],
      }),
    ).toContainEqual({
      message: "Profile is not supported for Kids party events",
      path: ["sections", 0, "sectionType"],
    });
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
    const themes: ThemeDefinition[] = Object.values(themeRegistry);

    expect(
      themes.every(
        (theme) =>
          theme.composition.rsvpDesign &&
          theme.composition.hero.composition &&
          theme.composition.visualSystem.compositionMap &&
          theme.composition.visualSystem.motionProfile &&
          theme.composition.visualSystem.parallaxProfile &&
          theme.composition.map.aspect &&
          theme.composition.map.frame &&
          theme.composition.map.overlay &&
          theme.composition.sectionDefaults.rsvp &&
          theme.previewData.sections.length > 0 &&
          theme.supportedModes.length > 0 &&
          theme.supportedModes.includes(theme.defaultMode) &&
          (!theme.supportedModes.includes("dark") || Boolean(theme.tokens.dark)) &&
          (theme.supportedModes.includes("toggleable")
            ? Boolean(
                theme.modeToggle &&
                theme.tokens.dark &&
                theme.modeToggle.labels.control &&
                theme.modeToggle.labels.dark &&
                theme.modeToggle.labels.light,
              )
            : theme.modeToggle === undefined),
      ),
    ).toBe(true);
  });

  it("defines theme-safe backdrop, texture, ornament, divider, frame, and image effects", () => {
    const themes: ThemeDefinition[] = Object.values(themeRegistry);
    const backdropTypes = new Set(themes.map((theme) => theme.composition.effects.backdrop.type));

    expect(backdropTypes).toEqual(
      new Set(["editorial-whitespace", "gradient", "image", "solid", "texture"]),
    );
    expect(
      themes.every((theme) => {
        const effects = theme.composition.effects;
        const ornamentStateIsValid = effects.ornaments.enabled
          ? effects.ornaments.set !== "none" && effects.ornaments.density !== "none"
          : effects.ornaments.set === "none" && effects.ornaments.density === "none";
        const textureStateIsValid =
          effects.texture.policy === "none"
            ? effects.texture.strength === "none"
            : effects.texture.strength !== "none";
        const imageStateIsValid =
          effects.backdrop.type === "image"
            ? effects.backdrop.imageSource === "cover"
            : effects.backdrop.imageSource === "none";

        return ornamentStateIsValid && textureStateIsValid && imageStateIsValid;
      }),
    ).toBe(true);
    expect(themeRegistry["modern-minimal"].composition.effects.ornaments.enabled).toBe(false);
    expect(themeRegistry.premium.composition.effects).toMatchObject({
      backdrop: { type: "gradient" },
      dividerStyle: "luminous",
      frameStyle: "double-line",
      imageTreatment: "cinematic",
      ornaments: { enabled: true, set: "candlelight" },
    });
    expect(themeRegistry["celestial-gold"].composition.effects.backdrop).toMatchObject({
      imageSource: "cover",
      overlay: "strong",
      type: "image",
    });
  });

  it("declares compatibility metadata for every theme", () => {
    expect(
      Object.values(themeRegistry).every(
        (theme) =>
          theme.compatibility.backdropStrategy &&
          theme.compatibility.fontPairing.body &&
          theme.compatibility.fontPairing.display &&
          theme.compatibility.motionLevel === theme.composition.visualSystem.motionProfile &&
          theme.compatibility.ornamentStrategy &&
          Object.keys(theme.compatibility.rendererSlots).length > 0 &&
          Object.keys(theme.compatibility.rendererSlots).every(
            (sectionType) => sectionType in sectionDefinitions,
          ),
      ),
    ).toBe(true);
  });

  it("builds a compatibility matrix for MVP event blueprints and theme modes", () => {
    const matrix = buildThemeCompatibilityMatrix({
      eventTypes: ["wedding", "birthday", "other"],
      modes: ["light", "dark"],
    });

    expect(matrix.length).toBe(availableThemeIds.length * 3 * 2);
    expect(matrix.every((entry) => entry.rendererSlots.length > 0)).toBe(true);
    expect(matrix.every((entry) => entry.canRenderRequiredSections)).toBe(true);
    expect(matrix.flatMap((entry) => entry.missingRequiredSections)).toEqual([]);
    expect(
      matrix.every((entry) =>
        entry.rendererSlots.every((slot) => slot.rendererKey.startsWith("section.")),
      ),
    ).toBe(true);

    const kidsWedding = evaluateThemeCompatibility({
      eventType: "wedding",
      mode: "light",
      theme: themeRegistry.kids,
    });
    const premiumWedding = evaluateThemeCompatibility({
      eventType: "wedding",
      mode: "light",
      theme: themeRegistry.premium,
    });

    expect(kidsWedding.canApply).toBe(false);
    expect(kidsWedding.issues).toContainEqual(
      expect.objectContaining({
        code: "unsupported_event_type",
        message: "Kids does not support wedding events",
      }),
    );
    expect(premiumWedding.canApply).toBe(true);
    expect(premiumWedding.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "fallback_renderer_slot",
          sectionType: "introduction",
        }),
      ]),
    );
  });

  it("renders wedding, birthday, and generic blueprints through every expansion theme", () => {
    for (const themeId of expansionThemeIds) {
      for (const eventType of ["wedding", "birthday", "other"] as const) {
        const result = evaluateThemeCompatibility({
          eventType,
          mode: "light",
          theme: themeRegistry[themeId],
        });

        expect(result.canApply, `${themeId} should apply to ${eventType}`).toBe(true);
        expect(result.canRenderRequiredSections).toBe(true);
        expect(result.missingRequiredSections).toEqual([]);
        expect(result.rendererSlots.every((slot) => slot.coverage === "specialized")).toBe(true);
      }
    }
  });

  it("documents the invite composition families across required public sections", () => {
    expect(inviteVisualCompositionSystem.coveredSections).toEqual(
      expect.arrayContaining([
        "introduction",
        "details",
        "story",
        "profile",
        "gallery",
        "location",
        "rsvp",
        "outro",
      ]),
    );
    expect(inviteCompositionFamilies.length).toBeGreaterThanOrEqual(4);
    expect(
      inviteCompositionFamilies.every(
        (family) =>
          family.viewport.mobile &&
          family.viewport.tablet &&
          family.viewport.desktop &&
          family.imageStrategy &&
          family.emptyState &&
          family.reducedMotion,
      ),
    ).toBe(true);
    expect(
      inviteCompositionFamilies.find((family) => family.id === "framed")?.avoidCardStackRule,
    ).toContain("avoid using it for every section");
  });

  it("specifies motion, parallax, sticky, gallery, and reduced-motion rules", () => {
    const motionRules = new Map(inviteMotionRules.map((rule) => [rule.id, rule]));

    expect([...motionRules.keys()]).toEqual(
      expect.arrayContaining([
        "hero-reveal",
        "section-reveal",
        "media-parallax",
        "sticky-pin",
        "gallery-drift",
      ]),
    );
    expect(motionRules.get("media-parallax")).toMatchObject({
      implementation: "css",
      reducedMotion: expect.stringContaining("Disable parallax"),
      rule: expect.stringContaining("requestAnimationFrame"),
    });
    expect(motionRules.get("media-parallax")?.rule).toContain("instead of React state updates");
    expect(motionRules.get("sticky-pin")?.implementation).toBe("intersection-observer");
    expect(motionRules.get("gallery-drift")?.reducedMotion).toContain("Disable drift");
  });

  it("provides wedding and birthday composition maps that avoid all-framed rhythm", () => {
    expect(sampleInviteCompositionMaps.wedding.id).toBe("wedding-editorial");
    expect(sampleInviteCompositionMaps.birthday.id).toBe("birthday-feature");
    expect(sampleInviteCompositionMaps.wedding.rhythm.map((item) => item.section)).toEqual(
      expect.arrayContaining(["introduction", "profile", "story", "gallery", "rsvp", "outro"]),
    );
    expect(sampleInviteCompositionMaps.birthday.rhythm.map((item) => item.section)).toEqual(
      expect.arrayContaining(["introduction", "details", "gallery", "rsvp"]),
    );
    expect(
      sampleInviteCompositionMaps.wedding.rhythm.every((item) => item.composition === "framed"),
    ).toBe(false);
    expect(
      sampleInviteCompositionMaps.birthday.rhythm.every((item) => item.composition === "framed"),
    ).toBe(false);
  });

  it("defines a unique non-card-stack composition map for every expansion direction", () => {
    const maps = Object.values(expansionInviteCompositionMaps);

    expect(maps).toHaveLength(expansionThemeIds.length);
    expect(new Set(maps.map((map) => map.id)).size).toBe(expansionThemeIds.length);
    expect(
      maps.every(
        (map) =>
          map.eventTypes.includes("wedding") &&
          map.eventTypes.includes("birthday") &&
          map.eventTypes.includes("other") &&
          map.rhythm.length >= 5 &&
          !map.rhythm.every((item) => item.composition === "framed"),
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
    expect(premium.composition.rsvpDesign).toBe("editorial");
    expect(premium.composition.visualSystem).toMatchObject({
      compositionMap: "wedding-editorial",
      motionProfile: "immersive",
      parallaxProfile: "hero-and-media",
    });
    expect(premium.composition.ambientMedia).toMatchObject({
      audioSlot: "optional",
      controlStrategy: "external-controls",
      defaultAutoplay: false,
    });
    expect(premiumCompositions.size).toBeGreaterThan(3);
    expect(premium.composition.sectionDefaults.gallery?.composition).toBe("gallery-feature");
    expect(premium.composition.sectionDefaults.story?.composition).toBe("timeline");
  });

  it("defines formal theme template specs for every shipped theme", () => {
    expect(themeTemplateSpecIds).toEqual(availableThemeIds);
    expect(
      availableThemeIds.every((themeId) => {
        const spec = themeTemplateSpecs[themeId];
        const theme = themeRegistry[themeId];

        return (
          spec.id === theme.id &&
          spec.designRead === theme.designRead &&
          spec.eventTypeFit.join(",") === theme.supportedEventTypes.join(",") &&
          spec.modeSupport.supported.join(",") === theme.supportedModes.join(",") &&
          spec.modeSupport.defaultMode === theme.defaultMode &&
          spec.moodBoardNotes.length >= 3 &&
          spec.antiSlopConstraints.length >= 3 &&
          Boolean(spec.tokenGuidance.light) &&
          Boolean(spec.tokenGuidance.accent) &&
          Boolean(spec.tokenGuidance.status) &&
          Boolean(spec.radiusGuidance) &&
          Boolean(spec.typographyGuidance) &&
          Boolean(spec.imageTreatment) &&
          spec.effects === theme.composition.effects &&
          spec.motion.compositionMap === theme.composition.visualSystem.compositionMap &&
          spec.motion.motionProfile === theme.composition.visualSystem.motionProfile &&
          spec.motion.parallaxProfile === theme.composition.visualSystem.parallaxProfile &&
          Boolean(spec.ambientMedia.policy) &&
          Boolean(spec.rsvp.styling) &&
          Boolean(spec.rsvp.successState) &&
          Boolean(spec.rsvp.closedState) &&
          Boolean(spec.rsvp.errorState) &&
          spec.dashboardPreview.requirements.length >= 2 &&
          Boolean(spec.dashboardPreview.samplePreviewData.eventTitle) &&
          Boolean(spec.namingGuidance)
        );
      }),
    ).toBe(true);
  });

  it("states section treatment guidance for all core invite moments", () => {
    const requiredSections = [
      "hero",
      "details",
      "story",
      "profile",
      "gallery",
      "location",
      "rsvp",
      "outro",
    ];

    expect(
      Object.values(themeTemplateSpecs).every((spec) => {
        const sections = spec.sectionTreatments.map((treatment) => treatment.section as string);

        return requiredSections.every((section) => sections.includes(section));
      }),
    ).toBe(true);
    expect(
      themeTemplateSpecs.premium.sectionTreatments.map((treatment) => treatment.treatment),
    ).toEqual(expect.arrayContaining(["cinematic", "full-bleed", "split-layout", "editorial"]));
    expect(
      themeTemplateSpecs.premium.sectionTreatments
        .map((treatment) => treatment.treatment as string)
        .includes("card-based"),
    ).toBe(false);
    expect(
      themeTemplateSpecs["lumiere-default"].sectionTreatments
        .map((treatment) => treatment.treatment as string)
        .includes("card-based"),
    ).toBe(true);
  });

  it("captures Reverie as Premium benchmark without direct imitation", () => {
    expect(reverieReferenceLinks).toEqual([
      "https://github.com/DJPajares/reverie",
      "https://reverie.wndrhive.com/",
    ]);
    expect(themeTemplateSpecs.premium.referenceNotes?.join(" ")).toContain("Reverie");
    expect(themeTemplateSpecs.premium.antiSlopConstraints.join(" ")).toContain(
      "Avoid copying Reverie visuals directly",
    );
    expect(themeTemplateSpecs.premium.motion).toMatchObject({
      compositionMap: "wedding-editorial",
      level: "immersive",
      parallaxProfile: "hero-and-media",
    });
  });

  it("validates sample event sections against a supported theme", () => {
    const results = validateThemeSections("premium", [...baseSections]);
    const legacyStory = validateThemeSection("premium", {
      sectionType: "story",
      sectionKey: "legacy-story",
      sortOrder: 4,
      visibility: "public",
      content: {
        paragraphs: ["A paragraph saved before story titles existed."],
        title: "Our story",
      },
      settings: {},
    });
    const structuredStory = validateThemeSection("premium", {
      sectionType: "story",
      sectionKey: "structured-story",
      sortOrder: 5,
      visibility: "public",
      content: {
        paragraphs: [
          { title: "Chapter one", body: "A titled paragraph." },
          { title: "", body: "An untitled paragraph." },
        ],
        title: "Our story",
      },
      settings: {},
    });
    const missingBody = validateThemeSection("premium", {
      sectionType: "story",
      sectionKey: "invalid-story",
      sortOrder: 6,
      visibility: "public",
      content: {
        paragraphs: [{ title: "A title is not enough" }],
        title: "Our story",
      },
      settings: {},
    });

    expect(results.every((result) => result.ok)).toBe(true);
    expect(legacyStory.ok).toBe(true);
    if (legacyStory.ok) {
      expect(legacyStory.section.content.paragraphs).toEqual([
        { body: "A paragraph saved before story titles existed." },
      ]);
    }
    expect(structuredStory.ok).toBe(true);
    if (structuredStory.ok) {
      expect(structuredStory.section.content.paragraphs).toEqual([
        { title: "Chapter one", body: "A titled paragraph." },
        { body: "An untitled paragraph." },
      ]);
    }
    expect(missingBody.ok).toBe(false);
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
    const unapprovedProvider = validateThemeSection("premium", {
      ...baseSections[2],
      content: {
        venueName: "The Glasshouse",
        address: "12 Orchard Road, Singapore",
        directionsUrl: "https://maps.example.com/the-glasshouse",
      },
    });
    const incompleteCoordinates = validateThemeSection("premium", {
      ...baseSections[2],
      content: {
        venueName: "The Glasshouse",
        address: "12 Orchard Road, Singapore",
        latitude: 1.3048,
      },
    });

    expect(unapprovedProvider.ok).toBe(false);
    expect(incompleteCoordinates.ok).toBe(false);
    expect(
      normalizeLocationContent({
        venueName: "The Glasshouse",
        address: "12 Orchard Road, Singapore",
        directionsUrl: "javascript:alert(1)",
      }),
    ).toMatchObject({
      directionsUrl: expect.stringContaining("https://www.google.com/maps/dir/"),
    });
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
