import type { ThemeDefinition } from "../../contracts";
import { allInviteSections, createRendererSlots } from "../../theme-shared";
import { siennaCourtyardEffects, siennaCourtyardPresentation } from "./visual";

const specializedSections = [
  "introduction",
  "date",
  "details",
  "profile",
  "story",
  "gallery",
  "location",
  "rsvp",
  "outro",
] as const;
const fallbackSections = ["entourage", "dress_code", "custom"] as const;

export const siennaCourtyardTheme = {
  id: "sienna-courtyard",
  label: "Sienna Courtyard",
  description:
    "A destination-led invitation built from warm stone, long shadows, and architectural thresholds.",
  designRead:
    "A limestone courtyard in directional sun: sculptural Roman type, terracotta structure, portal-framed photography, and an unhurried room-to-room rhythm.",
  supportedEventTypes: ["wedding", "dinner", "birthday", "private_event", "other"],
  supportedModes: ["light", "dark", "system", "toggleable"],
  defaultMode: "light",
  presentation: siennaCourtyardPresentation,
  modeToggle: {
    defaultPreference: "light",
    labels: { control: "Courtyard light", dark: "After sunset", light: "Afternoon sun" },
    placement: "top-end",
    style: "organic",
  },
  rsvpCopy: {
    acceptLabel: "Join the gathering",
    attendancePrompt: "Will you join us?",
    declineLabel: "Unable to join",
    eyebrow: "Courtyard reply",
    reservedSeatsIntro: "A place has been held for",
    sectionDescription: "Let us know who will meet us through the courtyard.",
    sectionTitle: "Meet us there",
    submitLabel: "Confirm the gathering",
    submittingLabel: "Confirming…",
    successDescription: "Your reply is with the hosts.",
    successTitle: "Your place is held",
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
    "gallery",
    "location",
    "rsvp",
    "outro",
  ],
  tokens: {
    light: {
      background: "#f3ebdd",
      foreground: "#2b211c",
      surface: "#fbf6ed",
      surfaceMuted: "#e7dac8",
      border: "#b79a7d",
      accent: "#73301f",
      accentStrong: "#542216",
      success: "#3f6d4b",
      warning: "#8b5c19",
      error: "#a32e2e",
      focus: "#73301f",
    },
    dark: {
      background: "#191512",
      foreground: "#f4eadb",
      surface: "#27201b",
      surfaceMuted: "#342821",
      border: "#8c6d59",
      accent: "#f0a27b",
      accentStrong: "#ffc0a0",
      success: "#8dc79a",
      warning: "#efc26c",
      error: "#ff8e8e",
      focus: "#ffc0a0",
    },
  },
  composition: {
    ambientMedia: {
      audioSlot: "optional",
      controlStrategy: "external-controls",
      defaultAutoplay: false,
      mood: "A host-selected acoustic or room recording may play only after explicit guest action.",
    },
    backgroundTreatment:
      "Warm plaster fields, long code-native shadow planes, and protected copy surfaces with no literal travel motifs.",
    effects: siennaCourtyardEffects,
    visualSystem: {
      cardStackPolicy:
        "Use thresholds, arcades, and continuous limestone fields; practical content should not become a row of destination cards.",
      compositionMap: "sienna-courtyard",
      imageStrategy:
        "Favor human-scale architecture, portraits inside real openings, long tables, and directional light.",
      motionProfile: "calm",
      parallaxProfile: "hero-only",
    },
    hero: {
      composition: "architectural-courtyard",
      fullViewport: true,
      mediaTreatment:
        "One portal-framed photograph sits beside a protected title field and a long sunline.",
    },
    map: { aspect: "wide", frame: "minimal", overlay: "accent-wash" },
    rsvpDesign: "courtyard",
    sectionDefaults: {
      date: {
        composition: "full-bleed",
        density: "spacious",
        layout: "sundial-date",
        motion: "section-reveal",
      },
      profile: {
        composition: "editorial-split",
        density: "spacious",
        layout: "portrait-arcade",
        motion: "media-reveal",
      },
      story: {
        composition: "timeline",
        density: "spacious",
        layout: "room-sequence",
        motion: "timeline-reveal",
      },
      details: { composition: "editorial-split", density: "balanced", motion: "section-reveal" },
      gallery: {
        composition: "gallery-feature",
        density: "spacious",
        layout: "courtyard-study",
        motion: "media-reveal",
      },
      location: {
        composition: "layered-media",
        density: "spacious",
        layout: "arrival-threshold",
        motion: "section-reveal",
      },
      rsvp: {
        composition: "full-bleed",
        density: "spacious",
        layout: "courtyard-reply",
        motion: "section-reveal",
      },
      outro: { composition: "full-bleed", density: "spacious", motion: "media-reveal" },
    },
  },
  radius: { sm: "0.125rem", md: "0.5rem", lg: "1.25rem" },
  typography: {
    display: "sculptural Roman serif",
    body: "restrained humanist sans",
    css: {
      bodyFamily: '"Manrope Variable", Manrope, ui-sans-serif, system-ui, sans-serif',
      displayFamily: '"Fraunces Variable", Fraunces, Charter, Georgia, ui-serif, serif',
      eyebrowLetterSpacing: "0.2em",
    },
    roles: {
      hero: {
        fontSize: "clamp(4rem, 9.5vw, 9.5rem)",
        fontWeight: "430",
        letterSpacing: "-0.055em",
        lineHeight: "0.86",
      },
      title: { fontWeight: "440", letterSpacing: "-0.045em" },
      numeric: { fontWeight: "460", letterSpacing: "-0.04em" },
    },
    scale: "editorial",
  },
  imageTreatment:
    "Sun-washed but controlled architectural photography with warm highlights, intact faces, and captions held outside the crop.",
  rsvpTreatment:
    "A long horizontal courtyard table that introduces party capacity before attendance, then collapses into a clear vertical flow on mobile.",
  compatibility: {
    backdropStrategy:
      "Code-native limestone and shadow planes stay outside the reading field and require no decorative asset.",
    fontPairing: {
      body: "restrained humanist sans",
      display: "sculptural Roman serif",
    },
    motionLevel: "calm",
    ornamentStrategy:
      "Abstract portal shadows and one sunline frame hierarchy; no tiles, olive branches, or travel-poster motifs.",
    rendererSlots: createRendererSlots({
      fallback: [...fallbackSections],
      specialized: [...specializedSections],
    }),
  },
  dashboardPreview: {
    swatch: "#c66e4a",
    summary: "Warm limestone thresholds, portal portraits, and a long courtyard reply.",
  },
  previewData: {
    eventTitle: "Supper in the Courtyard",
    eyebrow: "At golden hour",
    subtitle: "Dinner moves from the shaded arcade to one long table under the evening sky.",
    venueName: "Casa Loma Courtyard",
    heroImageAlt: "Guests gathering beneath warm stone arches at sunset",
    sections: [
      {
        type: "profile",
        title: "Our hosts",
        summary: "Portraits and welcome copy sit inside a measured architectural arcade.",
      },
      {
        type: "location",
        title: "Through the gate",
        summary: "Arrival details and the practical map meet at one clear threshold.",
      },
      {
        type: "rsvp",
        title: "Meet us there",
        summary: "Party capacity leads into one calm courtyard reply.",
      },
    ],
  },
  accessibilityNotes: [
    "Copy always sits on an opaque plaster field rather than uncontrolled sunlit photography.",
    "Portal masks never clip headings, image alt text remains meaningful, and mobile order stays linear.",
    "Terracotta is decorative as well as actionable; status always includes semantic color and text.",
  ],
} satisfies ThemeDefinition;
