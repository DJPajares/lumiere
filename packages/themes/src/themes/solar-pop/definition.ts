import type { ThemeDefinition } from "../../contracts";
import { allInviteSections, createRendererSlots } from "../../theme-shared";
import { solarPopEffects, solarPopPresentation } from "./visual";

const specializedSections = [
  "introduction",
  "date",
  "details",
  "profile",
  "story",
  "location",
  "gallery",
  "rsvp",
  "outro",
] as const;
const fallbackSections = ["dress_code", "entourage", "custom"] as const;

export const solarPopTheme = {
  id: "solar-pop",
  label: "Solar Pop",
  description:
    "A bright celebration identity built from saturated color planes, oversized numerals, and clean subject crops.",
  designRead:
    "A sunlit festival identity in coral, marigold, cobalt, and leaf green, paced through bold geometric fields rather than party motifs.",
  supportedEventTypes: ["birthday", "kids_party", "launch", "private_event", "other"],
  supportedModes: ["light", "dark", "system", "toggleable"],
  defaultMode: "light",
  presentation: solarPopPresentation,
  modeToggle: {
    defaultPreference: "light",
    labels: { control: "Festival appearance", dark: "Dusk", light: "Daylight" },
    placement: "top-start",
    style: "pop",
  },
  rsvpCopy: {
    acceptLabel: "Count us in",
    attendancePrompt: "Are you coming through the gate?",
    declineLabel: "We cannot make it",
    eyebrow: "Festival gate",
    sectionDescription: "Choose your party and send one clear reply.",
    sectionTitle: "Join the day",
    submitLabel: "Confirm entry",
    successDescription: "Your party is on the guest list.",
    successTitle: "Entry confirmed",
  },
  supportedSections: allInviteSections,
  requiredSections: ["introduction", "date", "location", "rsvp"],
  recommendedSections: [...specializedSections],
  sectionRhythm: [
    "introduction",
    "date",
    "details",
    "profile",
    "story",
    "dress_code",
    "gallery",
    "location",
    "rsvp",
    "outro",
  ],
  tokens: {
    light: {
      background: "#fff4df",
      foreground: "#0d1b31",
      surface: "#fffaf0",
      surfaceMuted: "#ffd269",
      border: "#172847",
      accent: "#e84d3d",
      accentStrong: "#a72f2d",
      success: "#23734d",
      warning: "#8d5810",
      error: "#a92f45",
      focus: "#164fb5",
    },
    dark: {
      background: "#17233f",
      foreground: "#fff4df",
      surface: "#223052",
      surfaceMuted: "#314269",
      border: "#f1c85d",
      accent: "#ff7968",
      accentStrong: "#ffb2a3",
      success: "#74cf9d",
      warning: "#ffd066",
      error: "#ff8da1",
      focus: "#85b3ff",
    },
  },
  composition: {
    ambientMedia: {
      audioSlot: "optional",
      controlStrategy: "external-controls",
      defaultAutoplay: false,
      mood: "Upbeat host-selected music may be available through explicit controls only.",
    },
    backgroundTreatment:
      "Large coral, marigold, cobalt, and leaf planes alternate by chapter without confetti, stickers, or paper collage.",
    effects: solarPopEffects,
    visualSystem: {
      cardStackPolicy:
        "Use chapter-scale color fields and crop windows; controls may be framed, but sections never become a rounded-card deck.",
      compositionMap: "solar-pop",
      imageStrategy:
        "Use clean subject-aware crops in geometric windows with hard color offsets and meaningful alt text.",
      motionProfile: "playful",
      parallaxProfile: "none",
    },
    hero: {
      composition: "color-plane",
      fullViewport: true,
      mediaTreatment:
        "A confident subject crop intersects two or three color planes and oversized date typography.",
    },
    map: { aspect: "wide", frame: "playful", overlay: "accent-wash" },
    rsvpDesign: "festival",
    sectionDefaults: {
      date: {
        composition: "full-bleed",
        density: "compact",
        layout: "oversized-numeral",
        motion: "color-wipe",
      },
      details: {
        composition: "timeline",
        density: "compact",
        layout: "directional-panels",
        motion: "color-wipe",
      },
      dress_code: { composition: "framed", density: "balanced", motion: "section-reveal" },
      entourage: { composition: "editorial-split", density: "balanced", motion: "color-wipe" },
      gallery: {
        composition: "gallery-feature",
        density: "balanced",
        layout: "crop-windows",
        motion: "media-reveal",
      },
      location: {
        composition: "editorial-split",
        density: "balanced",
        layout: "venue-turn",
        motion: "color-wipe",
      },
      outro: { composition: "full-bleed", density: "compact", motion: "color-wipe" },
      profile: { composition: "layered-media", density: "balanced", motion: "media-reveal" },
      rsvp: {
        composition: "full-bleed",
        density: "balanced",
        layout: "festival-gate",
        motion: "color-wipe",
      },
      story: { composition: "editorial-split", density: "balanced", motion: "color-wipe" },
    },
  },
  radius: { sm: "0.25rem", md: "0.75rem", lg: "1.35rem" },
  typography: {
    display: "expressive wide grotesk",
    body: "readable geometric sans with condensed labels",
    css: {
      bodyFamily: '"Nunito Variable", Nunito, ui-sans-serif, system-ui, sans-serif',
      displayFamily: '"Manrope Variable", Manrope, ui-sans-serif, system-ui, sans-serif',
      eyebrowLetterSpacing: "0.13em",
    },
    roles: {
      hero: {
        fontSize: "clamp(4.2rem, 13vw, 12rem)",
        fontWeight: "780",
        letterSpacing: "-0.085em",
        lineHeight: "0.76",
      },
      numeric: {
        fontSize: "clamp(4rem, 14vw, 13rem)",
        fontWeight: "800",
        lineHeight: "0.72",
      },
      title: {
        fontSize: "clamp(3rem, 7vw, 7rem)",
        fontWeight: "740",
        letterSpacing: "-0.065em",
        lineHeight: "0.84",
      },
    },
    scale: "playful",
  },
  imageTreatment:
    "Clean subject-aware crops in hard geometric windows with color offsets and no scrapbook simulation.",
  rsvpTreatment:
    "A bold festival gate with large attendance choices, visible capacity, local validation, a complete keyboard path, and a stable admitted state.",
  compatibility: {
    backdropStrategy:
      "Flat saturated color planes with controlled contrast; no paper fields, rainbow wash, or party wallpaper.",
    fontPairing: {
      body: "readable geometric sans with condensed labels",
      display: "expressive wide grotesk",
    },
    motionLevel: "playful",
    ornamentStrategy:
      "Code-native geometric planes and crop windows; no emoji, stickers, confetti, or stock celebration motifs.",
    rendererSlots: createRendererSlots({
      fallback: [...fallbackSections],
      specialized: [...specializedSections],
    }),
  },
  dashboardPreview: {
    swatch: "#e84d3d",
    summary: "Oversized numerals, decisive color planes, and a crisp festival-gate reply.",
  },
  previewData: {
    eventTitle: "Milo Turns Eight",
    eyebrow: "Saturday / 11 AM",
    subtitle: "A sunroom birthday with games, lunch, and plenty of room to move.",
    venueName: "The Sunroom",
    heroImageAlt: "A child laughing in a sunlit room with bold color panels",
    sections: [
      {
        type: "date",
        title: "08 / Saturday",
        summary: "Oversized numerals make the date the first practical landmark.",
      },
      {
        type: "gallery",
        title: "Bright moments",
        summary: "One real subject crop leads a controlled geometric image run.",
      },
      {
        type: "rsvp",
        title: "Join the day",
        summary: "Large clear choices move families through the festival gate.",
      },
    ],
  },
  accessibilityNotes: [
    "Each color plane has a tested foreground pairing and status never depends on color alone.",
    "Oversized numerals supplement rather than replace a readable date label.",
    "Reduced motion removes wipes and pulses while preserving document order.",
  ],
} satisfies ThemeDefinition;
