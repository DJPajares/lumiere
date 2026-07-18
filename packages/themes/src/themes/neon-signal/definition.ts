import type { ThemeDefinition } from "../../contracts";
import { allInviteSections, createRendererSlots } from "../../theme-shared";
import { neonSignalEffects, neonSignalPresentation } from "./visual";

const specializedSections = [
  "introduction",
  "date",
  "details",
  "location",
  "gallery",
  "rsvp",
  "outro",
] as const;
const fallbackSections = ["profile", "story", "entourage", "dress_code", "custom"] as const;

export const neonSignalTheme = {
  id: "neon-signal",
  label: "Neon Signal",
  description:
    "An urban night invitation shaped by luminous routes, edge-lit media, and a decisive check-in close.",
  designRead:
    "A live signal moving through charcoal city space with electric cyan, controlled coral interrupts, oversized grotesk type, and compact mono facts.",
  supportedEventTypes: ["launch", "dinner", "birthday", "private_event", "other"],
  supportedModes: ["light", "dark", "system", "toggleable"],
  defaultMode: "dark",
  presentation: neonSignalPresentation,
  modeToggle: {
    defaultPreference: "dark",
    labels: { control: "Signal appearance", dark: "Night signal", light: "Day signal" },
    placement: "top-end",
    style: "signal",
  },
  rsvpCopy: {
    acceptLabel: "Check us in",
    attendancePrompt: "Attendance signal",
    declineLabel: "Cannot attend",
    eyebrow: "Final checkpoint",
    reservedSeatsIntro: "Access reserved for",
    sectionDescription: "Confirm your party at the final station.",
    sectionTitle: "Check in",
    submitLabel: "Transmit response",
    submittingLabel: "Transmitting…",
    successDescription: "Your attendance signal reached the host.",
    successTitle: "Check-in confirmed",
  },
  supportedSections: allInviteSections,
  requiredSections: ["introduction", "date", "details", "location", "rsvp"],
  recommendedSections: [...specializedSections],
  sectionRhythm: [
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
  tokens: {
    light: {
      background: "#e9eeee",
      foreground: "#142125",
      surface: "#f7f9f8",
      surfaceMuted: "#d6e2e2",
      border: "#668187",
      accent: "#007f8f",
      accentStrong: "#005866",
      success: "#197052",
      warning: "#8a5a12",
      error: "#aa343d",
      focus: "#006f86",
    },
    dark: {
      background: "#0d1214",
      foreground: "#e9f6f4",
      surface: "#141d20",
      surfaceMuted: "#1c292d",
      border: "#3d5b61",
      accent: "#49e7ef",
      accentStrong: "#8af8fa",
      success: "#6dd8a8",
      warning: "#ffc66b",
      error: "#ff7b84",
      focus: "#8af8fa",
    },
  },
  composition: {
    ambientMedia: {
      audioSlot: "optional",
      controlStrategy: "external-controls",
      defaultAutoplay: false,
      mood: "A host-selected electronic pulse or room mix may play only through explicit controls.",
    },
    backgroundTreatment:
      "Charcoal signal space with a directional cyan grid, one coral interrupt, and no continuous animated backdrop.",
    effects: neonSignalEffects,
    visualSystem: {
      cardStackPolicy:
        "Use one connected signal route; practical facts sit on rails rather than independent glowing cards.",
      compositionMap: "neon-signal",
      imageStrategy:
        "Use hard documentary crops with a restrained luminous edge and compact mono captions.",
      motionProfile: "immersive",
      parallaxProfile: "hero-only",
    },
    hero: {
      composition: "signal-route",
      fullViewport: true,
      mediaTreatment:
        "One tall edge-lit image plane intersects a full-height title and directional time/place readout.",
    },
    map: { aspect: "wide", frame: "minimal", overlay: "soft-vignette" },
    rsvpDesign: "check-in",
    sectionDefaults: {
      date: {
        composition: "full-bleed",
        density: "compact",
        layout: "signal-readout",
        motion: "signal-sweep",
      },
      details: {
        composition: "timeline",
        density: "compact",
        layout: "program-route",
        motion: "route-progress",
      },
      dress_code: { composition: "framed", density: "compact", motion: "section-reveal" },
      entourage: { composition: "timeline", density: "compact", motion: "route-progress" },
      gallery: {
        composition: "gallery-feature",
        density: "compact",
        layout: "contact-strip",
        motion: "media-reveal",
      },
      location: {
        composition: "editorial-split",
        density: "compact",
        layout: "arrival-coordinates",
        motion: "signal-sweep",
      },
      outro: { composition: "full-bleed", density: "compact", motion: "signal-sweep" },
      profile: { composition: "editorial-split", density: "compact", motion: "media-reveal" },
      rsvp: {
        composition: "full-bleed",
        density: "compact",
        layout: "check-in-console",
        motion: "route-progress",
      },
      story: { composition: "timeline", density: "balanced", motion: "route-progress" },
    },
  },
  radius: { sm: "0.125rem", md: "0.25rem", lg: "0.375rem" },
  typography: {
    display: "oversized variable grotesk",
    body: "neutral grotesk with utility mono labels",
    css: {
      bodyFamily: '"Manrope Variable", Manrope, ui-sans-serif, system-ui, sans-serif',
      displayFamily: '"Manrope Variable", Manrope, "Arial Narrow", ui-sans-serif, sans-serif',
      eyebrowLetterSpacing: "0.24em",
    },
    roles: {
      hero: {
        fontSize: "clamp(4rem, 12vw, 11rem)",
        fontWeight: "720",
        letterSpacing: "-0.075em",
        lineHeight: "0.78",
      },
      label: {
        fontFamily: "body",
        fontSize: "0.7rem",
        letterSpacing: "0.18em",
        textTransform: "uppercase",
      },
      title: {
        fontSize: "clamp(3rem, 7vw, 7rem)",
        letterSpacing: "-0.06em",
        lineHeight: "0.86",
      },
    },
    scale: "restrained",
  },
  imageTreatment:
    "Hard documentary crops with dark edge exposure, restrained cyan/coral rim light, and compact captions.",
  rsvpTreatment:
    "A route-ending check-in console with visible party capacity, explicit status, local errors, preserved recovery data, and a stable confirmation readout.",
  compatibility: {
    backdropStrategy:
      "Off-black or warm gray signal field with a sparse code-native grid and no faux print texture.",
    fontPairing: {
      body: "neutral grotesk with utility mono labels",
      display: "oversized variable grotesk",
    },
    motionLevel: "immersive",
    ornamentStrategy:
      "Directional signal bands and sparse scan-grid cues that never flicker or cross body copy.",
    rendererSlots: createRendererSlots({
      fallback: [...fallbackSections],
      specialized: [...specializedSections],
    }),
  },
  dashboardPreview: {
    swatch: "#49e7ef",
    summary: "Charcoal signal route, cyan readouts, and an edge-lit check-in station.",
  },
  previewData: {
    eventTitle: "After Hours",
    eyebrow: "Live / 21:00",
    subtitle: "A private studio night moving from first signal to final set.",
    venueName: "Studio 18",
    heroImageAlt: "Guests arriving at an edge-lit city studio",
    sections: [
      {
        type: "details",
        title: "Program route",
        summary: "Doors, dinner, and the final set connect along one illuminated sequence.",
      },
      {
        type: "gallery",
        title: "Contact channel",
        summary: "One hard-edged image run captures the night without printed frames.",
      },
      {
        type: "rsvp",
        title: "Final checkpoint",
        summary: "Party capacity and attendance resolve in a decisive check-in console.",
      },
    ],
  },
  accessibilityNotes: [
    "Cyan and coral never carry status alone; every state includes text and structure.",
    "Grid and scan cues remain decorative, static in reduced motion, and clear of body copy.",
    "Focus uses an opaque high-contrast outline instead of glow alone.",
  ],
} satisfies ThemeDefinition;
