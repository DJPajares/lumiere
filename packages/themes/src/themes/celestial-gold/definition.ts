import type { ThemeDefinition } from "../../contracts";
import { editorialRsvpCopyOverrides } from "../../rsvp-copy";
import {
  allInviteSections,
  createRendererSlots,
  expansionEventTypes,
  publicCoreSections,
} from "../../theme-shared";
import { celestialGoldEffects, celestialGoldPresentation } from "./visual";

export const celestialGoldTheme = {
  id: "celestial-gold",
  label: "Celestial Gold",
  description:
    "Luminous evening invitation for formal celebrations, birthdays, and private events.",
  designRead:
    "Midnight cinematic composition with warm gold type, orbital hairlines, and measured depth.",
  supportedEventTypes: [...expansionEventTypes, "dinner", "holiday"],
  supportedModes: ["light", "dark", "system", "toggleable"],
  defaultMode: "dark",
  presentation: celestialGoldPresentation,
  modeToggle: {
    defaultPreference: "dark",
    labels: { control: "Invitation appearance", dark: "Midnight", light: "Moonlight" },
    placement: "top-start",
    style: "celestial",
  },
  rsvpCopy: {
    ...editorialRsvpCopyOverrides,
    eyebrow: "Your evening reply",
  },
  supportedSections: allInviteSections,
  requiredSections: ["introduction", "date", "location", "rsvp"],
  recommendedSections: [
    "introduction",
    "date",
    "profile",
    "story",
    "details",
    "gallery",
    "location",
    "rsvp",
    "outro",
  ],
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
      background: "#f2eee4",
      foreground: "#19192a",
      surface: "#faf7ef",
      surfaceMuted: "#e1dacb",
      border: "#b8ab91",
      accent: "#9a6d24",
      accentStrong: "#684614",
      success: "#306d55",
      warning: "#8e5e18",
      error: "#9f3f42",
      focus: "#9a6d24",
    },
    dark: {
      background: "#0d1022",
      foreground: "#f4ecd9",
      surface: "#161a31",
      surfaceMuted: "#232741",
      border: "#4a4760",
      accent: "#d6ad62",
      accentStrong: "#f1d18e",
      success: "#78b89c",
      warning: "#e2b76e",
      error: "#df858a",
      focus: "#d6ad62",
    },
  },
  composition: {
    ambientMedia: {
      audioSlot: "optional",
      controlStrategy: "external-controls",
      defaultAutoplay: false,
      mood: "Slow atmospheric instrumental or evening ambience with explicit controls.",
    },
    backgroundTreatment:
      "Deep indigo field with quiet radial light and sparse orbital hairline geometry.",
    effects: celestialGoldEffects,
    visualSystem: {
      cardStackPolicy:
        "Use cinematic dark chapters and layered media; practical fields sit within the scene rather than a stack of light cards.",
      compositionMap: "celestial-evening",
      imageStrategy:
        "Use cinematic evening portraits and venue images with dark overlays that preserve faces and captions.",
      motionProfile: "immersive",
      parallaxProfile: "hero-and-media",
    },
    hero: {
      composition: "layered-portrait",
      fullViewport: true,
      mediaTreatment: "Cinematic portrait within a luminous oval field and fine orbital rules.",
    },
    map: { aspect: "wide", frame: "celestial", overlay: "soft-vignette" },
    rsvpDesign: "editorial",
    sectionDefaults: {
      date: { composition: "full-bleed", density: "spacious", motion: "section-reveal" },
      details: {
        composition: "editorial-split",
        density: "balanced",
        motion: "section-reveal",
      },
      dress_code: { composition: "framed", density: "balanced", motion: "card-reveal" },
      entourage: {
        composition: "editorial-split",
        density: "balanced",
        motion: "media-reveal",
      },
      gallery: {
        composition: "gallery-feature",
        density: "spacious",
        layout: "evening-feature",
        motion: "gallery-drift",
      },
      location: {
        composition: "editorial-split",
        density: "spacious",
        motion: "media-reveal",
      },
      outro: {
        composition: "layered-media",
        density: "spacious",
        motion: "media-parallax",
      },
      profile: {
        composition: "layered-media",
        density: "spacious",
        layout: "luminous-portrait",
        motion: "media-reveal",
      },
      rsvp: {
        composition: "layered-media",
        density: "spacious",
        motion: "section-reveal",
      },
      story: {
        composition: "layered-media",
        density: "spacious",
        layout: "night-depth",
        motion: "media-parallax",
      },
    },
  },
  radius: { sm: "0.25rem", md: "0.5rem", lg: "1rem" },
  typography: {
    display: "luminous high-contrast serif",
    body: "clean geometric sans",
    css: {
      bodyFamily: "Avenir, Montserrat, ui-sans-serif, system-ui, sans-serif",
      displayFamily: 'Didot, "Bodoni 72", Baskerville, ui-serif, serif',
      eyebrowLetterSpacing: "0.28em",
    },
    scale: "editorial",
  },
  imageTreatment:
    "Cinematic evening crops with indigo overlays, luminous edge light, and preserved faces.",
  rsvpTreatment: "A luminous final chapter with formal reply copy and restrained gold focus.",
  compatibility: {
    backdropStrategy: "Deep indigo atmosphere with sparse radial light and night-sky depth.",
    fontPairing: { body: "clean geometric sans", display: "luminous high-contrast serif" },
    motionLevel: "immersive",
    ornamentStrategy:
      "Sparse orbital hairlines and luminous arcs; never dense star fields or novelty constellations.",
    rendererSlots: createRendererSlots({ specialized: allInviteSections }),
  },
  dashboardPreview: {
    swatch: "#d6ad62",
    summary: "Midnight atmosphere with luminous gold type and cinematic depth.",
  },
  previewData: {
    eventTitle: "Under the Evening Sky",
    eyebrow: "An evening celebration",
    subtitle: "A luminous gathering shaped by music, dinner, and midnight blue.",
    venueName: "The Observatory Hall",
    heroImageAlt: "Guests arriving at an illuminated hall beneath a deep blue evening sky",
    sections: [
      {
        type: "date",
        title: "When night falls",
        summary: "The date opens as a luminous full-width chapter against indigo.",
      },
      {
        type: "gallery",
        title: "After dark",
        summary: "One cinematic image leads a narrow sequence of evening moments.",
      },
      {
        type: "rsvp",
        title: "Join the gathering",
        summary: "The reply becomes a measured final scene rather than a utility card.",
      },
    ],
  },
  accessibilityNotes: [
    "Gold is reserved for accents and never used as the sole status indicator.",
    "Dark overlays preserve subject visibility while maintaining readable foreground contrast.",
  ],
} satisfies ThemeDefinition;
