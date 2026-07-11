import type { ThemeDefinition } from "../../contracts";
import {
  allInviteSections,
  createRendererSlots,
  expansionEventTypes,
  publicCoreSections,
} from "../../theme-shared";
import { kidsEffects } from "./visual";

export const kidsTheme = {
  id: "kids",
  label: "Kids",
  description: "Bright but controlled party theme for birthdays and family events.",
  designRead: "Playful invite with rounded rhythm, clear details, and parent-friendly RSVP.",
  supportedEventTypes: ["birthday", "kids_party"],
  supportedModes: ["light"],
  defaultMode: "light",
  supportedSections: [...publicCoreSections, "profile", "details", "gallery", "custom"],
  requiredSections: ["introduction", "date", "location", "rsvp"],
  recommendedSections: [
    "introduction",
    "profile",
    "date",
    "details",
    "location",
    "gallery",
    "rsvp",
    "outro",
  ],
  sectionRhythm: [
    "introduction",
    "profile",
    "date",
    "details",
    "gallery",
    "location",
    "rsvp",
    "outro",
  ],
  tokens: {
    light: {
      background: "#fff8df",
      foreground: "#263238",
      surface: "#fffef8",
      surfaceMuted: "#fcecb7",
      border: "#efd88f",
      accent: "#ef7b45",
      accentStrong: "#b94d22",
      success: "#26825f",
      warning: "#b56b14",
      error: "#b43f48",
      focus: "#ef7b45",
    },
  },
  composition: {
    ambientMedia: {
      audioSlot: "optional",
      controlStrategy: "external-controls",
      defaultAutoplay: false,
      mood: "Light playful background music can be offered with explicit controls.",
    },
    backgroundTreatment:
      "Sunny layered paper fields, rounded image frames, and energetic but readable spacing.",
    effects: kidsEffects,
    visualSystem: {
      cardStackPolicy:
        "Parent-facing details can stay framed, while hero and gallery should feel image-led and celebratory rather than like repeated cards.",
      compositionMap: "birthday-feature",
      imageStrategy:
        "Use a clear celebrant or party image first, with bright fallback fact panels for schedule and guardian notes.",
      motionProfile: "playful",
      parallaxProfile: "hero-only",
    },
    hero: {
      composition: "centered-media",
      fullViewport: true,
      mediaTreatment: "Bright celebrant image with large rounded corners and simple caption space.",
    },
    rsvpDesign: "kids",
    sectionDefaults: {
      date: {
        composition: "framed",
        density: "balanced",
        motion: "card-reveal",
      },
      details: {
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
        composition: "framed",
        density: "balanced",
        motion: "section-reveal",
      },
      profile: {
        composition: "framed",
        density: "balanced",
        layout: "cards",
        motion: "card-reveal",
      },
      rsvp: {
        composition: "framed",
        density: "balanced",
        motion: "section-reveal",
      },
    },
  },
  radius: { sm: "0.75rem", md: "1rem", lg: "1.25rem" },
  typography: {
    display: "rounded sans display",
    body: "friendly sans",
    css: {
      bodyFamily:
        'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      displayFamily:
        'ui-rounded, "Arial Rounded MT Bold", ui-sans-serif, system-ui, -apple-system, sans-serif',
      eyebrowLetterSpacing: "0.12em",
    },
    scale: "playful",
  },
  imageTreatment: "Bright image slots with rounded corners and simple caption support.",
  rsvpTreatment: "Parent-friendly RSVP with clear attendee count and simple optional questions.",
  compatibility: {
    backdropStrategy: "Sunny paper fields with rounded media and practical parent-facing panels.",
    fontPairing: {
      body: "friendly sans",
      display: "rounded sans",
    },
    motionLevel: "playful",
    ornamentStrategy:
      "Rounded panels and bright image framing only; avoids emoji-heavy decorative clutter.",
    rendererSlots: createRendererSlots({
      fallback: ["introduction", "outro", "custom"],
      specialized: ["date", "details", "gallery", "location", "profile", "rsvp"],
    }),
  },
  dashboardPreview: {
    swatch: "#ef7b45",
    summary: "Warm playful birthday theme without emoji-heavy UI.",
  },
  previewData: {
    eventTitle: "Mika Turns Seven",
    eyebrow: "Birthday party",
    heroImageAlt: "Child smiling at a bright birthday table",
    sections: [
      {
        summary: "Playful hero for celebrant details and party energy.",
        title: "Party start",
        type: "introduction",
      },
      {
        summary: "Parent-friendly schedule, venue, and notes stay easy to scan.",
        title: "Party details",
        type: "details",
      },
      {
        summary: "RSVP copy is casual while max pax remains clear.",
        title: "Family reply",
        type: "rsvp",
      },
    ],
    subtitle: "A cheerful party design that stays clear for parents.",
    venueName: "Sunbeam Studio",
  },
  accessibilityNotes: [
    "Playful color is restrained enough for text contrast.",
    "Avoid using color alone for kids-party schedule or RSVP states.",
  ],
} satisfies ThemeDefinition;
