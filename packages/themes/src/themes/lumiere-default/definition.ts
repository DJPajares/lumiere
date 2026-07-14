import type { ThemeDefinition } from "../../contracts";
import {
  allInviteSections,
  createRendererSlots,
  expansionEventTypes,
  publicCoreSections,
} from "../../theme-shared";
import { lumiereDefaultEffects, lumiereDefaultPresentation } from "./visual";

export const lumiereDefaultTheme = {
  id: "lumiere-default",
  label: "Lumiere Default",
  description: "Neutral event design that works for dinners, launches, and private gatherings.",
  designRead: "Warm modern invite with flexible spacing and practical structure.",
  supportedEventTypes: ["dinner", "launch", "private_event", "other"],
  supportedModes: ["light", "dark", "system", "toggleable"],
  defaultMode: "system",
  presentation: lumiereDefaultPresentation,
  modeToggle: {
    defaultPreference: "system",
    labels: { control: "Invitation appearance", dark: "Evening", light: "Daylight" },
    placement: "top-start",
    style: "soft-pill",
  },
  supportedSections: [...publicCoreSections, "story", "gallery", "custom"],
  requiredSections: ["introduction", "date", "location"],
  recommendedSections: [...publicCoreSections],
  sectionRhythm: [
    "introduction",
    "date",
    "details",
    "story",
    "gallery",
    "location",
    "rsvp",
    "outro",
  ],
  tokens: {
    light: {
      background: "#fffaf1",
      foreground: "#2d2118",
      surface: "#fffefd",
      surfaceMuted: "#f8ead8",
      border: "#ead8bd",
      accent: "#b97732",
      accentStrong: "#7d451f",
      success: "#247a55",
      warning: "#a56316",
      error: "#b23b3b",
      focus: "#b97732",
    },
    dark: {
      background: "#18130f",
      foreground: "#f8ead8",
      surface: "#241b15",
      surfaceMuted: "#33251b",
      border: "#4a3729",
      accent: "#dfad73",
      accentStrong: "#f3c994",
      success: "#6fc59b",
      warning: "#e2a85d",
      error: "#e78282",
      focus: "#dfad73",
    },
  },
  composition: {
    ambientMedia: {
      audioSlot: "none",
      controlStrategy: "not-supported",
      defaultAutoplay: false,
      mood: "Quiet room tone only; no theme-owned audio by default.",
    },
    backgroundTreatment: "Warm parchment surface with restrained section framing.",
    effects: lumiereDefaultEffects,
    visualSystem: {
      cardStackPolicy:
        "Framed sections may be the dominant rhythm for this neutral/basic theme, but image-led sections should still use intentional spacing and stable media slots.",
      compositionMap: "neutral-basic",
      imageStrategy:
        "Use real event imagery when available; otherwise reserve calm fact panels instead of fake decorative screenshots.",
      motionProfile: "calm",
      parallaxProfile: "none",
    },
    hero: {
      composition: "editorial-split",
      fullViewport: false,
      mediaTreatment: "Soft rectangular cover image beside practical event facts.",
    },
    map: { aspect: "landscape", frame: "soft", overlay: "accent-wash" },
    rsvpDesign: "default",
    sectionDefaults: {
      date: {
        composition: "framed",
        density: "balanced",
        motion: "card-reveal",
      },
      gallery: {
        composition: "framed",
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
    },
  },
  radius: { sm: "0.5rem", md: "0.75rem", lg: "1rem" },
  typography: {
    display: "system sans with refined tracking",
    body: "system sans",
    css: {
      bodyFamily:
        'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      displayFamily:
        'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      eyebrowLetterSpacing: "0.16em",
    },
    scale: "restrained",
  },
  imageTreatment: "Soft rectangular image slots with reserved aspect ratios.",
  rsvpTreatment: "Integrated guest-only panel using the event accent and clear max-pax copy.",
  compatibility: {
    backdropStrategy: "Warm parchment surfaces with restrained full-width bands.",
    fontPairing: {
      body: "system sans",
      display: "system sans",
    },
    motionLevel: "calm",
    ornamentStrategy: "No decorative ornaments beyond warm surface shifts and image/fact panels.",
    rendererSlots: createRendererSlots({
      fallback: ["introduction", "details", "outro", "story", "custom"],
      specialized: ["date", "gallery", "location", "rsvp"],
    }),
  },
  dashboardPreview: {
    swatch: "#b97732",
    summary: "Balanced neutral base for most private events.",
  },
  previewData: {
    eventTitle: "Dinner at Dusk",
    eyebrow: "Private invitation",
    heroImageAlt: "Long dinner table in warm evening light",
    sections: [
      {
        summary: "A clear event opening with date, venue, and host context.",
        title: "Welcome",
        type: "introduction",
      },
      {
        summary: "Practical timing and location sections with gentle framing.",
        title: "The evening",
        type: "details",
      },
      {
        summary: "Guest-only RSVP stays simple and readable.",
        title: "Reply",
        type: "rsvp",
      },
    ],
    subtitle: "A warm, flexible design for private gatherings.",
    venueName: "The Lantern Room",
  },
  accessibilityNotes: [
    "Uses off-white and off-black surfaces instead of pure extremes.",
    "Accent is paired with text labels for RSVP and status states.",
  ],
} satisfies ThemeDefinition;
