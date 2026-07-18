import type { ThemeDefinition } from "../../contracts";
import { allInviteSections, createRendererSlots } from "../../theme-shared";
import { tidalGlassEffects, tidalGlassPresentation } from "./visual";

const specializedSections = [
  "introduction",
  "date",
  "profile",
  "story",
  "details",
  "gallery",
  "location",
  "rsvp",
  "outro",
] as const;
const fallbackSections = ["entourage", "dress_code", "custom"] as const;

export const tidalGlassTheme = {
  id: "tidal-glass",
  label: "Tidal Glass",
  description:
    "A calm contemporary invitation shaped by refracted daylight, translucent spatial bands, and wide location-led media.",
  designRead:
    "Daylight moving through water with deep ink, sea-glass aqua, fluid boundaries, geometric sans type, and a readable shoreline rail.",
  supportedEventTypes: ["wedding", "dinner", "holiday", "private_event", "other"],
  supportedModes: ["light", "dark", "system", "toggleable"],
  defaultMode: "light",
  presentation: tidalGlassPresentation,
  modeToggle: {
    defaultPreference: "light",
    labels: { control: "Water appearance", dark: "Deep water", light: "Day water" },
    placement: "top-end",
    style: "fluid",
  },
  rsvpCopy: {
    acceptLabel: "Join the gathering",
    attendancePrompt: "Will your party join us?",
    declineLabel: "Send regrets",
    eyebrow: "Shoreline reply",
    sectionDescription: "Settle your party details in one calm reply.",
    sectionTitle: "Come ashore",
    submitLabel: "Confirm reply",
    successDescription: "Your reply is safely with the host.",
    successTitle: "Reply received",
  },
  supportedSections: allInviteSections,
  requiredSections: ["introduction", "date", "location", "rsvp"],
  recommendedSections: [...specializedSections],
  sectionRhythm: [
    "introduction",
    "date",
    "profile",
    "story",
    "details",
    "entourage",
    "dress_code",
    "gallery",
    "location",
    "rsvp",
    "outro",
  ],
  tokens: {
    light: {
      background: "#eaf4f2",
      foreground: "#17333a",
      surface: "#f7fbfa",
      surfaceMuted: "#cfe5e2",
      border: "#8cb8b5",
      accent: "#247f82",
      accentStrong: "#155b62",
      success: "#2b7357",
      warning: "#876019",
      error: "#a13f4b",
      focus: "#176f7a",
    },
    dark: {
      background: "#0d252b",
      foreground: "#e5f3ef",
      surface: "#16343a",
      surfaceMuted: "#214a4f",
      border: "#52767a",
      accent: "#79d4cf",
      accentStrong: "#a9ebe4",
      success: "#79c5a5",
      warning: "#e3bb70",
      error: "#e68c96",
      focus: "#a9ebe4",
    },
  },
  composition: {
    ambientMedia: {
      audioSlot: "optional",
      controlStrategy: "external-controls",
      defaultAutoplay: false,
      mood: "Quiet water, room tone, or soft instrumental audio may use explicit guest controls.",
    },
    backgroundTreatment:
      "Broad translucent aqua layers and tide-line geometry create depth without a gallery of blurred cards.",
    effects: tidalGlassEffects,
    visualSystem: {
      cardStackPolicy:
        "Use continuous translucent bands and wide image fields; compact controls alone may sit on an opaque backing.",
      compositionMap: "tidal-glass",
      imageStrategy:
        "Favor wide crisp photography with protected focal points and soft refracted color at the edges.",
      motionProfile: "calm",
      parallaxProfile: "hero-only",
    },
    hero: {
      composition: "fluid-horizon",
      fullViewport: true,
      mediaTreatment:
        "A wide horizon image flows beneath a protected title and stable event-fact shoreline.",
    },
    map: { aspect: "wide", frame: "soft", overlay: "accent-wash" },
    rsvpDesign: "shoreline",
    sectionDefaults: {
      date: {
        composition: "full-bleed",
        density: "spacious",
        layout: "tide-mark",
        motion: "fluid-drift",
      },
      details: {
        composition: "editorial-split",
        density: "spacious",
        layout: "shoreline-rail",
        motion: "section-reveal",
      },
      dress_code: { composition: "framed", density: "balanced", motion: "section-reveal" },
      entourage: { composition: "editorial-split", density: "spacious", motion: "fluid-drift" },
      gallery: {
        composition: "gallery-feature",
        density: "spacious",
        layout: "wide-current",
        motion: "media-reveal",
      },
      location: {
        composition: "editorial-split",
        density: "spacious",
        layout: "anchored-shoreline",
        motion: "section-reveal",
      },
      outro: { composition: "full-bleed", density: "spacious", motion: "fluid-drift" },
      profile: { composition: "layered-media", density: "spacious", motion: "fluid-drift" },
      rsvp: {
        composition: "full-bleed",
        density: "spacious",
        layout: "shoreline-reply",
        motion: "fluid-drift",
      },
      story: { composition: "layered-media", density: "spacious", motion: "fluid-drift" },
    },
  },
  radius: { sm: "0.75rem", md: "1.5rem", lg: "3rem" },
  typography: {
    display: "soft geometric sans",
    body: "open humanist geometric sans",
    css: {
      bodyFamily: '"Manrope Variable", Manrope, ui-sans-serif, system-ui, sans-serif',
      displayFamily: '"Nunito Variable", Nunito, ui-sans-serif, system-ui, sans-serif',
      eyebrowLetterSpacing: "0.16em",
    },
    roles: {
      hero: {
        fontSize: "clamp(3.5rem, 9vw, 8.5rem)",
        fontWeight: "520",
        letterSpacing: "-0.055em",
        lineHeight: "0.88",
      },
      title: {
        fontSize: "clamp(2.8rem, 6vw, 6rem)",
        letterSpacing: "-0.045em",
        lineHeight: "0.92",
      },
    },
    scale: "restrained",
  },
  imageTreatment:
    "Wide crisp photography with protected focal points, text-safe zones, and soft refracted edge color.",
  rsvpTreatment:
    "A spacious shoreline flow with party capacity anchored above the fields, opaque text backings, local errors, preserved recovery, and quiet confirmation.",
  compatibility: {
    backdropStrategy:
      "Layered translucent gradients and tide lines; blur remains subordinate to contrast and reading order.",
    fontPairing: { body: "open humanist geometric sans", display: "soft geometric sans" },
    motionLevel: "calm",
    ornamentStrategy:
      "Broad tide-line arcs and refracted edge bands; no shells, beach clip art, or glass card stacks.",
    rendererSlots: createRendererSlots({
      fallback: [...fallbackSections],
      specialized: [...specializedSections],
    }),
  },
  dashboardPreview: {
    swatch: "#247f82",
    summary: "A refracted daylight horizon with wide imagery and an anchored shoreline reply.",
  },
  previewData: {
    eventTitle: "Low Tide Supper",
    eyebrow: "At the waterline",
    subtitle: "Dinner begins as the last daylight moves through the glass house.",
    venueName: "The Glass House",
    heroImageAlt: "A long dinner table beside water in soft daylight",
    sections: [
      {
        type: "story",
        title: "Between light and water",
        summary: "The gathering story moves through overlapping translucent bands.",
      },
      {
        type: "location",
        title: "The shoreline",
        summary: "Venue and arrival details remain anchored beside a wide practical map.",
      },
      {
        type: "rsvp",
        title: "Come ashore",
        summary: "A calm reply flow keeps party context visible from start to confirmation.",
      },
    ],
  },
  accessibilityNotes: [
    "Text-bearing translucent bands always resolve against a controlled opaque backing.",
    "Small copy never sits directly on photography, and focus rings remain opaque.",
    "Reduced motion freezes all layer drift while preserving overlap and reading order.",
  ],
} satisfies ThemeDefinition;
