import type { ThemeDefinition } from "../../contracts";
import {
  allInviteSections,
  createRendererSlots,
  expansionEventTypes,
  publicCoreSections,
} from "../../theme-shared";
import { modernMinimalEffects, modernMinimalPresentation } from "./visual";

export const modernMinimalTheme = {
  id: "modern-minimal",
  label: "Modern Minimal",
  description:
    "Strict typographic grid for contemporary weddings, birthdays, and private gatherings.",
  designRead:
    "Hard-edged modernist system with numbered facts, disciplined whitespace, and one cobalt signal.",
  supportedEventTypes: [...expansionEventTypes, "launch"],
  supportedModes: ["light", "dark", "system", "toggleable"],
  defaultMode: "system",
  presentation: modernMinimalPresentation,
  modeToggle: {
    defaultPreference: "system",
    labels: { control: "Invitation appearance", dark: "Graphite", light: "Paper" },
    placement: "top-start",
    style: "editorial",
  },
  rsvpCopy: {
    eyebrow: "Response",
    submitLabel: "Send response",
  },
  supportedSections: allInviteSections,
  requiredSections: ["introduction", "date", "location", "rsvp"],
  recommendedSections: [
    "introduction",
    "date",
    "details",
    "profile",
    "location",
    "gallery",
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
    "location",
    "gallery",
    "rsvp",
    "outro",
  ],
  tokens: {
    light: {
      background: "#f3f3ef",
      foreground: "#171816",
      surface: "#fafaf7",
      surfaceMuted: "#e2e3de",
      border: "#a7aaa3",
      accent: "#2457d6",
      accentStrong: "#153786",
      success: "#277053",
      warning: "#8c641d",
      error: "#a33d3d",
      focus: "#2457d6",
    },
    dark: {
      background: "#141514",
      foreground: "#eeefea",
      surface: "#1d1f1d",
      surfaceMuted: "#292c29",
      border: "#50544f",
      accent: "#7e9ff6",
      accentStrong: "#b3c6ff",
      success: "#75b597",
      warning: "#d4ae68",
      error: "#dc8585",
      focus: "#7e9ff6",
    },
  },
  composition: {
    ambientMedia: {
      audioSlot: "none",
      controlStrategy: "not-supported",
      defaultAutoplay: false,
      mood: "Silent by design so type, spacing, and event facts carry the experience.",
    },
    backgroundTreatment:
      "Flat off-white or graphite plane with strict rules and no decorative texture.",
    effects: modernMinimalEffects,
    visualSystem: {
      cardStackPolicy:
        "Use one continuous twelve-column system; borders organize information without creating a deck of cards.",
      compositionMap: "minimal-modern",
      imageStrategy:
        "Use one hard-edged image plane at a time with objective captions and no decorative overlays.",
      motionProfile: "calm",
      parallaxProfile: "none",
    },
    hero: {
      composition: "editorial-split",
      fullViewport: true,
      mediaTreatment: "One flush rectangular crop aligned to a strict typographic grid.",
    },
    map: { aspect: "wide", frame: "minimal", overlay: "none" },
    rsvpDesign: "default",
    sectionDefaults: {
      date: { composition: "full-bleed", density: "compact", motion: "section-reveal" },
      details: {
        composition: "timeline",
        density: "compact",
        layout: "numbered-grid",
        motion: "section-reveal",
      },
      dress_code: { composition: "framed", density: "compact", motion: "section-reveal" },
      entourage: {
        composition: "editorial-split",
        density: "compact",
        motion: "section-reveal",
      },
      gallery: {
        composition: "gallery-feature",
        density: "balanced",
        layout: "hard-grid",
        motion: "media-reveal",
      },
      location: {
        composition: "editorial-split",
        density: "compact",
        motion: "section-reveal",
      },
      outro: { composition: "full-bleed", density: "compact", motion: "section-reveal" },
      profile: {
        composition: "editorial-split",
        density: "compact",
        layout: "hard-grid",
        motion: "section-reveal",
      },
      rsvp: {
        composition: "full-bleed",
        density: "compact",
        motion: "section-reveal",
      },
      story: {
        composition: "timeline",
        density: "balanced",
        layout: "numbered-rail",
        motion: "timeline-reveal",
      },
    },
  },
  radius: { sm: "0", md: "0.125rem", lg: "0.25rem" },
  typography: {
    display: "architectural variable grotesk",
    body: "neutral variable sans",
    css: {
      bodyFamily: '"Manrope Variable", Manrope, ui-sans-serif, system-ui, sans-serif',
      displayFamily: '"Manrope Variable", Manrope, "Helvetica Neue", ui-sans-serif, sans-serif',
      eyebrowLetterSpacing: "0.2em",
    },
    roles: {
      hero: {
        fontSize: "clamp(3rem, 8vw, 8rem)",
        fontWeight: "650",
        letterSpacing: "-0.065em",
        lineHeight: "0.86",
      },
      title: {
        fontSize: "clamp(2.7rem, 6vw, 6.5rem)",
        letterSpacing: "-0.055em",
        lineHeight: "0.88",
      },
    },
    scale: "restrained",
  },
  imageTreatment:
    "Unrounded documentary crops locked to the grid with compact, objective captions.",
  rsvpTreatment: "A direct two-column reply area using rules, labels, and one cobalt action.",
  compatibility: {
    backdropStrategy: "Flat off-white or graphite plane with visible grid alignment.",
    fontPairing: { body: "neutral system sans", display: "modern grotesk sans" },
    motionLevel: "calm",
    ornamentStrategy:
      "Numbered labels and structural rules only; no flourishes, texture, glow, or illustration.",
    rendererSlots: createRendererSlots({ specialized: allInviteSections }),
  },
  dashboardPreview: {
    swatch: "#2457d6",
    summary: "Hard-edged typographic grid with numbered facts and a cobalt signal.",
  },
  previewData: {
    eventTitle: "Studio 08",
    eyebrow: "Private event · 19:30",
    subtitle: "Dinner, conversation, and a concise sequence of details.",
    venueName: "North Assembly",
    heroImageAlt: "Concrete event space with a long table and clean architectural lines",
    sections: [
      {
        type: "date",
        title: "01 / Time",
        summary: "The date becomes a full-width typographic marker in the shared grid.",
      },
      {
        type: "details",
        title: "02 / Sequence",
        summary: "Facts read as numbered rows instead of separate utility cards.",
      },
      {
        type: "rsvp",
        title: "03 / Reply",
        summary: "The final action stays direct, aligned, and free of decorative framing.",
      },
    ],
  },
  accessibilityNotes: [
    "Thin rules supplement spacing and headings rather than carrying structure alone.",
    "The cobalt action retains a visible text label and high-contrast focus outline.",
  ],
} satisfies ThemeDefinition;
