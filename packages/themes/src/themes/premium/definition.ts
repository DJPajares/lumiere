import type { ThemeDefinition } from "../../contracts";
import { editorialRsvpCopyOverrides } from "../../rsvp-copy";
import {
  allInviteSections,
  createRendererSlots,
  expansionEventTypes,
  publicCoreSections,
} from "../../theme-shared";
import { premiumEffects, premiumPresentation } from "./visual";

export const premiumTheme = {
  id: "premium",
  label: "Premium",
  description: "Editorial, intimate design for weddings, dinners, and elevated private events.",
  designRead:
    "Cinematic wedding editorial with portrait-led hierarchy, spacious ceremony, and an invitation-native reply.",
  supportedEventTypes: ["wedding", "dinner", "private_event"],
  supportedModes: ["light", "dark", "toggleable"],
  defaultMode: "toggleable",
  presentation: premiumPresentation,
  modeToggle: {
    defaultPreference: "system",
    labels: { control: "Invitation appearance", dark: "Candlelight", light: "Daylight" },
    placement: "top-start",
    style: "soft-pill",
  },
  rsvpCopy: editorialRsvpCopyOverrides,
  supportedSections: [
    ...publicCoreSections,
    "profile",
    "story",
    "entourage",
    "dress_code",
    "gallery",
    "custom",
  ],
  requiredSections: ["introduction", "date", "location", "rsvp"],
  recommendedSections: [
    "introduction",
    "profile",
    "date",
    "story",
    "details",
    "dress_code",
    "location",
    "gallery",
    "rsvp",
    "outro",
  ],
  sectionRhythm: [
    "introduction",
    "profile",
    "date",
    "story",
    "details",
    "entourage",
    "dress_code",
    "location",
    "gallery",
    "rsvp",
    "outro",
  ],
  tokens: {
    light: {
      background: "#fbf6ed",
      foreground: "#241c17",
      surface: "#fffdf8",
      surfaceMuted: "#efe2cf",
      border: "#d9c7ab",
      accent: "#a36a2f",
      accentStrong: "#653b1d",
      success: "#246c50",
      warning: "#9b601b",
      error: "#a83b38",
      focus: "#a36a2f",
    },
    dark: {
      background: "#15100d",
      foreground: "#f5eadc",
      surface: "#211814",
      surfaceMuted: "#30231b",
      border: "#4a382a",
      accent: "#d8a567",
      accentStrong: "#f1c98d",
      success: "#70bf99",
      warning: "#e0a35a",
      error: "#dd7b78",
      focus: "#d8a567",
    },
  },
  composition: {
    ambientMedia: {
      audioSlot: "optional",
      controlStrategy: "external-controls",
      defaultAutoplay: false,
      mood: "Soft instrumental or venue ambience, controlled outside visual sections.",
    },
    backgroundTreatment:
      "Layered ivory field with candlelit radial light, editorial whitespace, and media-led section breaks.",
    effects: premiumEffects,
    visualSystem: {
      cardStackPolicy:
        "Use framed panels only for compact utility details; the page rhythm must mix full-bleed, editorial, timeline, gallery, and layered-media moments.",
      compositionMap: "wedding-editorial",
      imageStrategy:
        "Prioritize real editorial portrait, venue, and gallery imagery with large inspectable slots and graceful fact-panel fallbacks.",
      motionProfile: "immersive",
      parallaxProfile: "hero-and-media",
    },
    hero: {
      composition: "layered-portrait",
      fullViewport: true,
      mediaTreatment:
        "Tall portrait media with offset frame, depth shadow, and subtle parallax hooks.",
    },
    map: { aspect: "wide", frame: "editorial", overlay: "soft-vignette" },
    rsvpDesign: "editorial",
    sectionDefaults: {
      date: {
        composition: "full-bleed",
        density: "spacious",
        motion: "section-reveal",
      },
      details: {
        composition: "editorial-split",
        density: "balanced",
        motion: "section-reveal",
      },
      dress_code: {
        composition: "framed",
        density: "balanced",
        motion: "card-reveal",
      },
      entourage: {
        composition: "editorial-split",
        density: "balanced",
        motion: "section-reveal",
      },
      gallery: {
        composition: "gallery-feature",
        density: "spacious",
        layout: "masonry",
        motion: "media-reveal",
      },
      location: {
        composition: "editorial-split",
        density: "spacious",
        motion: "media-reveal",
      },
      outro: {
        composition: "layered-media",
        density: "spacious",
        layout: "editorial",
        motion: "media-reveal",
      },
      profile: {
        composition: "editorial-split",
        density: "balanced",
        layout: "split",
        motion: "media-reveal",
      },
      rsvp: {
        composition: "full-bleed",
        density: "spacious",
        motion: "section-reveal",
      },
      story: {
        composition: "timeline",
        density: "spacious",
        layout: "timeline",
        motion: "timeline-reveal",
      },
    },
  },
  radius: { sm: "0.375rem", md: "0.625rem", lg: "0.875rem" },
  typography: {
    display: "editorial display serif when selected by theme renderer",
    body: "legible sans",
    css: {
      bodyFamily:
        'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      displayFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
      eyebrowLetterSpacing: "0.22em",
    },
    scale: "editorial",
  },
  imageTreatment: "Large editorial imagery with strong crops and generous whitespace.",
  rsvpTreatment: "Formal guest card with ceremony copy, attendee count, and field-level errors.",
  compatibility: {
    backdropStrategy:
      "Layered ivory and candlelit radial fields with full-viewport hero and media chapters.",
    fontPairing: {
      body: "legible sans",
      display: "editorial serif",
    },
    motionLevel: "immersive",
    ornamentStrategy:
      "Editorial frames, portrait depth, and light fields; no logo-as-ornament treatment.",
    rendererSlots: createRendererSlots({
      fallback: ["introduction", "custom"],
      specialized: [
        "date",
        "details",
        "dress_code",
        "entourage",
        "gallery",
        "location",
        "outro",
        "profile",
        "rsvp",
        "story",
      ],
    }),
  },
  dashboardPreview: {
    swatch: "#a36a2f",
    summary: "Refined editorial theme for formal celebrations.",
  },
  previewData: {
    eventTitle: "Amara & Jules",
    eyebrow: "You are invited",
    heroImageAlt: "Formal garden portrait framed by warm archways",
    sections: [
      {
        summary: "Full-viewport opening with portrait media and ceremony pacing.",
        title: "Opening portrait",
        type: "introduction",
      },
      {
        summary: "Story, date, and venue alternate between timeline and editorial compositions.",
        title: "The celebration",
        type: "story",
      },
      {
        summary: "Gallery and RSVP become feature moments instead of utility cards.",
        title: "Gallery and reply",
        type: "gallery",
      },
    ],
    subtitle: "An intimate garden celebration with candlelit rhythm.",
    venueName: "Emerald Gardens",
  },
  accessibilityNotes: [
    "Display typography must preserve readable line height on mobile.",
    "Gold accents must not be the only status indicator.",
  ],
} satisfies ThemeDefinition;
