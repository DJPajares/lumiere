import type { ThemeDefinition } from "../../contracts";
import { editorialRsvpCopyOverrides } from "../../rsvp-copy";
import { allInviteSections, createRendererSlots, expansionEventTypes } from "../../theme-shared";
import { porcelainBlueEffects, porcelainBluePresentation } from "./visual";

export const porcelainBlueTheme = {
  id: "porcelain-blue",
  label: "Porcelain Blue",
  description:
    "Luminous blue-and-white gallery invitation for refined daytime and evening gatherings.",
  designRead:
    "A quiet porcelain gallery with floating landscape imagery, cobalt ink lines, and generous museum-like breathing room.",
  supportedEventTypes: [...expansionEventTypes, "dinner", "launch", "holiday"],
  supportedModes: ["light", "dark", "system", "toggleable"],
  defaultMode: "system",
  presentation: porcelainBluePresentation,
  modeToggle: {
    defaultPreference: "system",
    labels: { control: "Invitation appearance", dark: "Blue hour", light: "Porcelain" },
    placement: "top-start",
    style: "editorial",
  },
  rsvpCopy: {
    ...editorialRsvpCopyOverrides,
    eyebrow: "Your reply",
    sectionTitle: "Will you join us?",
  },
  supportedSections: allInviteSections,
  requiredSections: ["introduction", "date", "location", "rsvp"],
  recommendedSections: [
    "introduction",
    "date",
    "details",
    "profile",
    "story",
    "gallery",
    "location",
    "rsvp",
    "outro",
  ],
  sectionRhythm: [
    "introduction",
    "date",
    "details",
    "profile",
    "story",
    "entourage",
    "dress_code",
    "gallery",
    "location",
    "rsvp",
    "outro",
  ],
  tokens: {
    light: {
      background: "#eef3f3",
      foreground: "#172f3a",
      surface: "#fbfcfa",
      surfaceMuted: "#dce7e7",
      border: "#a8bec1",
      accent: "#2d6680",
      accentStrong: "#17465c",
      success: "#2d6f59",
      warning: "#88611e",
      error: "#9c3f45",
      focus: "#2d6680",
    },
    dark: {
      background: "#0f2028",
      foreground: "#e7f0ec",
      surface: "#172e38",
      surfaceMuted: "#23414a",
      border: "#4d6a70",
      accent: "#8ebfd0",
      accentStrong: "#b8dbe3",
      success: "#7ab9a0",
      warning: "#d7ad64",
      error: "#df858b",
      focus: "#8ebfd0",
    },
  },
  composition: {
    ambientMedia: {
      audioSlot: "optional",
      controlStrategy: "external-controls",
      defaultAutoplay: false,
      mood: "Piano, water, or room ambience may be offered quietly through explicit controls.",
    },
    backgroundTreatment:
      "Cool porcelain fields, translucent celadon bands, floating cobalt rings, and wide gallery margins.",
    effects: porcelainBlueEffects,
    visualSystem: {
      cardStackPolicy:
        "Use continuous gallery walls, floating media, and ledger rules; only compact facts receive a single framed treatment.",
      compositionMap: "porcelain-gallery",
      imageStrategy:
        "Favor wide daylight landscapes and intimate still-life details with cool whites, clear subjects, and spare captions.",
      motionProfile: "calm",
      parallaxProfile: "hero-only",
    },
    hero: {
      composition: "centered-media",
      fullViewport: true,
      mediaTreatment:
        "A broad landscape image floats low in a porcelain field, framed by one offset cobalt line.",
    },
    map: { aspect: "wide", frame: "editorial", overlay: "accent-wash" },
    rsvpDesign: "editorial",
    sectionDefaults: {
      date: { composition: "full-bleed", density: "spacious", motion: "section-reveal" },
      details: {
        composition: "editorial-split",
        density: "balanced",
        layout: "porcelain-ledger",
        motion: "section-reveal",
      },
      dress_code: { composition: "framed", density: "compact", motion: "card-reveal" },
      entourage: {
        composition: "editorial-split",
        density: "balanced",
        motion: "section-reveal",
      },
      gallery: {
        composition: "gallery-feature",
        density: "spacious",
        layout: "gallery-wall",
        motion: "media-reveal",
      },
      location: {
        composition: "editorial-split",
        density: "spacious",
        motion: "media-reveal",
      },
      outro: { composition: "full-bleed", density: "spacious", motion: "section-reveal" },
      profile: {
        composition: "editorial-split",
        density: "spacious",
        layout: "floating-studies",
        motion: "media-reveal",
      },
      rsvp: {
        composition: "editorial-split",
        density: "spacious",
        layout: "reply-ledger",
        motion: "section-reveal",
      },
      story: {
        composition: "full-bleed",
        density: "spacious",
        layout: "essay-field",
        motion: "media-reveal",
      },
    },
  },
  radius: { sm: "0.75rem", md: "1.5rem", lg: "2.5rem" },
  typography: {
    display: "soft old-style gallery serif",
    body: "precise neo-grotesk sans",
    css: {
      bodyFamily: '"Manrope Variable", Manrope, ui-sans-serif, system-ui, sans-serif',
      displayFamily: '"Fraunces Variable", Fraunces, Optima, Palatino, ui-serif, serif',
      eyebrowLetterSpacing: "0.22em",
    },
    scale: "editorial",
  },
  imageTreatment:
    "Cool natural color, soft daylight, wide landscape crops, and thin porcelain-white borders.",
  rsvpTreatment:
    "An airy two-column reply ledger with cobalt focus, generous field spacing, and a calm confirmation panel.",
  compatibility: {
    backdropStrategy:
      "Subtle paper-mineral texture with translucent celadon bands and sparse offset cobalt rings.",
    fontPairing: {
      body: "precise neo-grotesk sans",
      display: "soft old-style gallery serif",
    },
    motionLevel: "calm",
    ornamentStrategy:
      "Two or three abstract porcelain rings and fine ink rules; never literal china patterns, waves, or painted clip art.",
    rendererSlots: createRendererSlots({ specialized: allInviteSections }),
  },
  dashboardPreview: {
    swatch: "#2d6680",
    summary: "Porcelain light, cobalt ink, and a calm floating gallery wall.",
  },
  previewData: {
    eventTitle: "A Study in Blue",
    eyebrow: "Gathering No. 09",
    subtitle: "An open afternoon of conversation, dinner, and quiet celebration.",
    venueName: "The Glass Gallery",
    heroImageAlt: "A sunlit gallery table arranged with blue glass and white ceramics",
    sections: [
      {
        type: "date",
        title: "The afternoon",
        summary: "Time and arrival details sit within one pale uninterrupted field.",
      },
      {
        type: "gallery",
        title: "Collected moments",
        summary: "One landscape anchor and two smaller studies form a quiet gallery wall.",
      },
      {
        type: "rsvp",
        title: "Your reply",
        summary: "The response rests beside the closing note in a spacious two-column ledger.",
      },
    ],
  },
  accessibilityNotes: [
    "Pale surfaces use dark ink text; decorative rings never sit behind controls or essential copy.",
    "Wide type measures collapse to a single readable column before tablet widths.",
  ],
} satisfies ThemeDefinition;
