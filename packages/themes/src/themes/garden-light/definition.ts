import type { ThemeDefinition } from "../../contracts";
import {
  allInviteSections,
  createRendererSlots,
  expansionEventTypes,
  publicCoreSections,
} from "../../theme-shared";
import { gardenLightEffects } from "./visual";

export const gardenLightTheme = {
  id: "garden-light",
  label: "Garden Light",
  description:
    "Sunlit organic invitation for garden weddings, birthdays, and relaxed private events.",
  designRead:
    "Airy garden composition with dappled light, sage fields, and gently layered photography.",
  supportedEventTypes: [...expansionEventTypes, "dinner"],
  supportedModes: ["light", "dark", "toggleable"],
  defaultMode: "toggleable",
  modeToggle: {
    defaultPreference: "system",
    labels: { control: "Invitation appearance", dark: "Evening", light: "Daylight" },
    placement: "top-start",
    style: "organic",
  },
  rsvpCopy: {
    attendancePrompt: "Will you join us in the garden?",
    eyebrow: "Your garden reply",
  },
  supportedSections: allInviteSections,
  requiredSections: ["introduction", "date", "location", "rsvp"],
  recommendedSections: [
    "introduction",
    "date",
    "profile",
    "details",
    "story",
    "location",
    "gallery",
    "rsvp",
    "outro",
  ],
  sectionRhythm: [
    "introduction",
    "date",
    "profile",
    "details",
    "story",
    "dress_code",
    "entourage",
    "location",
    "gallery",
    "rsvp",
    "outro",
  ],
  tokens: {
    light: {
      background: "#f4f2e8",
      foreground: "#253128",
      surface: "#fbfaf3",
      surfaceMuted: "#dfe7d8",
      border: "#b7c5ae",
      accent: "#b35f43",
      accentStrong: "#7f3f2c",
      success: "#3f7557",
      warning: "#976922",
      error: "#a5443f",
      focus: "#b35f43",
    },
    dark: {
      background: "#142019",
      foreground: "#edf0e6",
      surface: "#1e2c23",
      surfaceMuted: "#2a3b2f",
      border: "#46604d",
      accent: "#e59a7d",
      accentStrong: "#ffc3a9",
      success: "#86c39c",
      warning: "#dfb46c",
      error: "#e28b85",
      focus: "#e59a7d",
    },
  },
  composition: {
    ambientMedia: {
      audioSlot: "optional",
      controlStrategy: "external-controls",
      defaultAutoplay: false,
      mood: "Light acoustic or garden ambience, always started by the guest.",
    },
    backgroundTreatment:
      "Warm daylight canvas with soft sage fields and restrained dappled radial light.",
    effects: gardenLightEffects,
    visualSystem: {
      cardStackPolicy:
        "Use broad organic bands and layered image moments; reserve framed panels for reply and compact facts.",
      compositionMap: "garden-celebration",
      imageStrategy:
        "Lead with real outdoor or celebrant imagery, using airy crops and botanical-color fact fields when absent.",
      motionProfile: "playful",
      parallaxProfile: "hero-only",
    },
    hero: {
      composition: "centered-media",
      fullViewport: true,
      mediaTreatment: "Wide sunlit image with an organic arch radius and soft edge highlight.",
    },
    map: { aspect: "landscape", frame: "organic", overlay: "accent-wash" },
    rsvpDesign: "default",
    sectionDefaults: {
      date: { composition: "full-bleed", density: "balanced", motion: "section-reveal" },
      details: {
        composition: "editorial-split",
        density: "balanced",
        motion: "section-reveal",
      },
      dress_code: { composition: "framed", density: "balanced", motion: "card-reveal" },
      entourage: {
        composition: "editorial-split",
        density: "balanced",
        motion: "section-reveal",
      },
      gallery: {
        composition: "gallery-feature",
        density: "spacious",
        layout: "airy-feature",
        motion: "gallery-drift",
      },
      location: {
        composition: "editorial-split",
        density: "balanced",
        motion: "media-reveal",
      },
      outro: {
        composition: "layered-media",
        density: "spacious",
        motion: "media-reveal",
      },
      profile: {
        composition: "editorial-split",
        density: "balanced",
        layout: "organic-split",
        motion: "media-reveal",
      },
      rsvp: { composition: "framed", density: "balanced", motion: "section-reveal" },
      story: {
        composition: "layered-media",
        density: "spacious",
        layout: "garden-path",
        motion: "media-reveal",
      },
    },
  },
  radius: { sm: "0.75rem", md: "1.25rem", lg: "2rem" },
  typography: {
    display: "soft humanist serif",
    body: "open humanist sans",
    css: {
      bodyFamily: 'Optima, Candara, "Noto Sans", ui-sans-serif, system-ui, sans-serif',
      displayFamily: 'Charter, "Bitstream Charter", Georgia, ui-serif, serif',
      eyebrowLetterSpacing: "0.14em",
    },
    scale: "playful",
  },
  imageTreatment:
    "Sunlit landscape and portrait crops with organic arches, preserved subjects, and airy captions.",
  rsvpTreatment: "Friendly garden reply panel grounded after the image-led invitation chapters.",
  compatibility: {
    backdropStrategy: "Dappled daylight fields, soft sage bands, and generous open space.",
    fontPairing: { body: "open humanist sans", display: "soft humanist serif" },
    motionLevel: "playful",
    ornamentStrategy:
      "Organic border arcs and leaf-like negative space only; avoids literal botanical clip art.",
    rendererSlots: createRendererSlots({ specialized: allInviteSections }),
  },
  dashboardPreview: {
    swatch: "#b35f43",
    summary: "Sunlit garden rhythm with sage fields and softly arched photography.",
  },
  previewData: {
    eventTitle: "Sunday in Bloom",
    eyebrow: "A garden celebration",
    subtitle: "Lunch, music, and warm light beneath the old trees.",
    venueName: "Willow Courtyard",
    heroImageAlt: "Long garden table beneath leafy trees in afternoon light",
    sections: [
      {
        type: "details",
        title: "The afternoon",
        summary: "Arrival, lunch, and music sit beside a light garden image rail.",
      },
      {
        type: "story",
        title: "Along the path",
        summary: "Softly layered photography gives the invitation an unhurried rhythm.",
      },
      {
        type: "location",
        title: "Willow Courtyard",
        summary: "Venue and arrival guidance remain practical within the organic layout.",
      },
    ],
  },
  accessibilityNotes: [
    "Dappled backgrounds stay behind decoration and never reduce text contrast.",
    "Organic shapes collapse to simple rounded frames on narrow viewports.",
  ],
} satisfies ThemeDefinition;
