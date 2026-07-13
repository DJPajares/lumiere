import type { ThemeDefinition } from "../../contracts";
import {
  allInviteSections,
  createRendererSlots,
  expansionEventTypes,
  publicCoreSections,
} from "../../theme-shared";
import { noelEffects } from "./visual";

export const noelTheme = {
  id: "noel",
  label: "Noel",
  description: "Seasonal holiday invitation for Christmas and year-end gatherings.",
  designRead: "Cozy seasonal layout with evergreen accents and warm candlelit surfaces.",
  supportedEventTypes: ["holiday", "dinner", "private_event"],
  supportedModes: ["light", "dark", "toggleable"],
  defaultMode: "toggleable",
  modeToggle: {
    defaultPreference: "system",
    labels: { control: "Invitation appearance", dark: "Candlelight", light: "Snowlight" },
    placement: "top-start",
    style: "seasonal",
  },
  supportedSections: [...publicCoreSections, "story", "details", "dress_code", "gallery", "custom"],
  requiredSections: ["introduction", "date", "location"],
  recommendedSections: [
    "introduction",
    "date",
    "details",
    "dress_code",
    "location",
    "gallery",
    "rsvp",
    "outro",
  ],
  sectionRhythm: [
    "introduction",
    "date",
    "details",
    "story",
    "dress_code",
    "gallery",
    "location",
    "rsvp",
    "outro",
  ],
  tokens: {
    light: {
      background: "#fbf4e8",
      foreground: "#1f2f28",
      surface: "#fffdf8",
      surfaceMuted: "#e9ddc5",
      border: "#cdbd9f",
      accent: "#2f6d52",
      accentStrong: "#1f4a39",
      success: "#2f6d52",
      warning: "#a36b24",
      error: "#a83b38",
      focus: "#2f6d52",
    },
    dark: {
      background: "#101a16",
      foreground: "#f4eadb",
      surface: "#182620",
      surfaceMuted: "#22352d",
      border: "#375043",
      accent: "#8bc6a6",
      accentStrong: "#bde0ca",
      success: "#8bc6a6",
      warning: "#e0a35a",
      error: "#e18480",
      focus: "#8bc6a6",
    },
  },
  composition: {
    ambientMedia: {
      audioSlot: "optional",
      controlStrategy: "external-controls",
      defaultAutoplay: false,
      mood: "Warm acoustic holiday music with guest-controlled playback.",
    },
    backgroundTreatment:
      "Evergreen and candlelight layers with cozy framed details, never emoji-heavy clutter.",
    effects: noelEffects,
    visualSystem: {
      cardStackPolicy:
        "Use cozy framed details selectively; seasonal hero, gallery, and story moments should carry depth and atmosphere.",
      compositionMap: "wedding-editorial",
      imageStrategy:
        "Prefer real table, venue, or gathering imagery with warm captions; missing media becomes a candlelit fact rail, not festive clutter.",
      motionProfile: "seasonal",
      parallaxProfile: "story-depth",
    },
    hero: {
      composition: "seasonal-tableau",
      fullViewport: true,
      mediaTreatment: "Warm table or gathering image with evergreen framing and soft light.",
    },
    map: { aspect: "landscape", frame: "seasonal", overlay: "accent-wash" },
    rsvpDesign: "noel",
    sectionDefaults: {
      date: {
        composition: "full-bleed",
        density: "balanced",
        motion: "section-reveal",
      },
      details: {
        composition: "framed",
        density: "balanced",
        motion: "card-reveal",
      },
      dress_code: {
        composition: "framed",
        density: "balanced",
        motion: "card-reveal",
      },
      gallery: {
        composition: "gallery-feature",
        density: "balanced",
        layout: "grid",
        motion: "media-reveal",
      },
      location: {
        composition: "editorial-split",
        density: "balanced",
        motion: "section-reveal",
      },
      rsvp: {
        composition: "framed",
        density: "balanced",
        motion: "section-reveal",
      },
      story: {
        composition: "editorial-split",
        density: "balanced",
        motion: "section-reveal",
      },
    },
  },
  radius: { sm: "0.5rem", md: "0.75rem", lg: "1rem" },
  typography: {
    display: "warm serif or humanist sans depending on renderer",
    body: "humanist sans",
    css: {
      bodyFamily:
        'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      displayFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
      eyebrowLetterSpacing: "0.18em",
    },
    scale: "editorial",
  },
  imageTreatment: "Warm gallery frames with seasonal captions and preserved aspect ratios.",
  rsvpTreatment: "Cozy RSVP panel with clear attendance state and host message support.",
  compatibility: {
    backdropStrategy: "Evergreen and candlelit surfaces with cozy full-width seasonal chapters.",
    fontPairing: {
      body: "humanist sans",
      display: "warm serif",
    },
    motionLevel: "seasonal",
    ornamentStrategy:
      "Seasonal light, evergreen framing, and warm tablescape cues without festive clutter.",
    rendererSlots: createRendererSlots({
      fallback: ["introduction", "outro", "custom"],
      specialized: ["date", "details", "dress_code", "gallery", "location", "rsvp", "story"],
    }),
  },
  dashboardPreview: {
    swatch: "#2f6d52",
    summary: "Seasonal holiday theme with light and candlelit dark variants.",
  },
  previewData: {
    eventTitle: "Noel Supper",
    eyebrow: "Holiday gathering",
    heroImageAlt: "Candlelit holiday table with evergreen branches",
    sections: [
      {
        summary: "Seasonal opening with warm table imagery and cozy pacing.",
        title: "Gathering",
        type: "introduction",
      },
      {
        summary: "Dinner details, dress notes, and venue use restrained festive framing.",
        title: "Candlelit details",
        type: "details",
      },
      {
        summary: "Holiday RSVP stays warm, brief, and accessible.",
        title: "Holiday reply",
        type: "rsvp",
      },
    ],
    subtitle: "A cozy year-end invitation with evergreen restraint.",
    venueName: "The Hearth Room",
  },
  accessibilityNotes: [
    "Red/green seasonal cues must include text labels.",
    "Dark mode should avoid low-contrast evergreen-on-black pairings.",
  ],
} satisfies ThemeDefinition;
