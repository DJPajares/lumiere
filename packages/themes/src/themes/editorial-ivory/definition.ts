import type { ThemeDefinition } from "../../contracts";
import {
  allInviteSections,
  createRendererSlots,
  expansionEventTypes,
  publicCoreSections,
} from "../../theme-shared";
import { editorialIvoryEffects } from "./visual";

export const editorialIvoryTheme = {
  id: "editorial-ivory",
  label: "Editorial Ivory",
  description:
    "Print-inspired invitation with quiet asymmetry for weddings, birthdays, and private celebrations.",
  designRead:
    "Ivory editorial spread with tall portrait crops, sharp rules, and generous negative space.",
  supportedEventTypes: [...expansionEventTypes, "dinner"],
  supportedModes: ["light", "dark", "toggleable"],
  defaultMode: "toggleable",
  supportedSections: allInviteSections,
  requiredSections: ["introduction", "date", "location", "rsvp"],
  recommendedSections: [
    "introduction",
    "profile",
    "date",
    "story",
    "details",
    "gallery",
    "location",
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
    "gallery",
    "location",
    "rsvp",
    "outro",
  ],
  tokens: {
    light: {
      background: "#f5f0e7",
      foreground: "#221f1a",
      surface: "#fbf8f1",
      surfaceMuted: "#e7dfd2",
      border: "#bdb3a4",
      accent: "#8a4f38",
      accentStrong: "#623322",
      success: "#356b52",
      warning: "#8c5b20",
      error: "#9b403c",
      focus: "#8a4f38",
    },
    dark: {
      background: "#191713",
      foreground: "#eee8dd",
      surface: "#24211c",
      surfaceMuted: "#312d26",
      border: "#514a40",
      accent: "#d2977c",
      accentStrong: "#efbda3",
      success: "#79b397",
      warning: "#d4a25f",
      error: "#db8580",
      focus: "#d2977c",
    },
  },
  composition: {
    ambientMedia: {
      audioSlot: "optional",
      controlStrategy: "external-controls",
      defaultAutoplay: false,
      mood: "Quiet chamber music or room ambience with explicit guest controls.",
    },
    backgroundTreatment:
      "Uncoated ivory paper, hairline folio rules, and offset editorial columns.",
    effects: editorialIvoryEffects,
    visualSystem: {
      cardStackPolicy:
        "Sections read as one print sequence; practical content uses rules and columns rather than floating cards.",
      compositionMap: "ivory-editorial",
      imageStrategy:
        "Use tall portrait and documentary crops with restrained captions and useful text fallbacks.",
      motionProfile: "immersive",
      parallaxProfile: "hero-and-media",
    },
    hero: {
      composition: "editorial-split",
      fullViewport: true,
      mediaTreatment: "Tall offset portrait with a fine border and page-number caption.",
    },
    rsvpDesign: "premium",
    sectionDefaults: {
      date: { composition: "full-bleed", density: "spacious", motion: "section-reveal" },
      details: {
        composition: "editorial-split",
        density: "balanced",
        motion: "section-reveal",
      },
      dress_code: { composition: "framed", density: "compact", motion: "card-reveal" },
      entourage: {
        composition: "editorial-split",
        density: "balanced",
        motion: "section-reveal",
      },
      gallery: {
        composition: "gallery-feature",
        density: "spacious",
        layout: "feature",
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
        motion: "media-reveal",
      },
      profile: {
        composition: "editorial-split",
        density: "spacious",
        layout: "offset",
        motion: "media-reveal",
      },
      rsvp: { composition: "full-bleed", density: "spacious", motion: "section-reveal" },
      story: {
        composition: "timeline",
        density: "spacious",
        layout: "folio-rail",
        motion: "timeline-reveal",
      },
    },
  },
  radius: { sm: "0.125rem", md: "0.25rem", lg: "0.375rem" },
  typography: {
    display: "high-contrast editorial serif",
    body: "neutral sans",
    css: {
      bodyFamily:
        'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      displayFamily: 'Iowan Old Style, Baskerville, "Times New Roman", ui-serif, serif',
      eyebrowLetterSpacing: "0.24em",
    },
    scale: "editorial",
  },
  imageTreatment:
    "Tall magazine crops, fine rules, visible captions, and reserved aspect-ratio fallbacks.",
  rsvpTreatment: "A ruled reply chapter with formal copy and no detached transaction card.",
  compatibility: {
    backdropStrategy: "Uncoated ivory field with page rules and asymmetric whitespace.",
    fontPairing: { body: "neutral sans", display: "high-contrast editorial serif" },
    motionLevel: "immersive",
    ornamentStrategy:
      "Folio numbers, crop-line spacing, and typographic rules only; no ornamental flourishes.",
    rendererSlots: createRendererSlots({ specialized: allInviteSections }),
  },
  dashboardPreview: {
    swatch: "#8a4f38",
    summary: "Ivory print editorial with offset portrait and ruled section rhythm.",
  },
  previewData: {
    eventTitle: "Mara & Leon",
    eyebrow: "Issue No. 06 · Celebration",
    subtitle: "A late-summer gathering told as an intimate editorial.",
    venueName: "The Reading Room",
    heroImageAlt: "Couple standing beside tall windows in soft afternoon light",
    sections: [
      {
        type: "profile",
        title: "The hosts",
        summary: "An offset portrait and short introduction establish the people at the center.",
      },
      {
        type: "story",
        title: "In sequence",
        summary: "Story and schedule share one continuous ruled timeline.",
      },
      {
        type: "rsvp",
        title: "Your reply",
        summary: "The response closes the editorial as a spacious final chapter.",
      },
    ],
  },
  accessibilityNotes: [
    "Hairlines are decorative and never the only boundary for controls.",
    "Serif display sizes collapse carefully to preserve readable mobile line lengths.",
  ],
} satisfies ThemeDefinition;
