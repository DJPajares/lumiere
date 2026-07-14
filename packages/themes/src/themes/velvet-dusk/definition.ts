import type { ThemeDefinition } from "../../contracts";
import { editorialRsvpCopyOverrides } from "../../rsvp-copy";
import { allInviteSections, createRendererSlots, expansionEventTypes } from "../../theme-shared";
import { velvetDuskEffects, velvetDuskPresentation } from "./visual";

export const velvetDuskTheme = {
  id: "velvet-dusk",
  label: "Velvet Dusk",
  description:
    "Oxblood and champagne invitation with theatrical depth for elegant evening celebrations.",
  designRead:
    "A modern theatre program unfolding through velvet-dark chapters, champagne rules, and cinematic portrait light.",
  supportedEventTypes: [...expansionEventTypes, "dinner", "launch", "holiday"],
  supportedModes: ["light", "dark", "system", "toggleable"],
  defaultMode: "toggleable",
  presentation: velvetDuskPresentation,
  modeToggle: {
    defaultPreference: "dark",
    labels: { control: "Invitation appearance", dark: "Afterglow", light: "Matinee" },
    placement: "top-start",
    style: "soft-pill",
  },
  rsvpCopy: {
    ...editorialRsvpCopyOverrides,
    eyebrow: "Your place for the evening",
    sectionTitle: "Reserve your place",
  },
  supportedSections: allInviteSections,
  requiredSections: ["introduction", "date", "location", "rsvp"],
  recommendedSections: [
    "introduction",
    "date",
    "profile",
    "story",
    "details",
    "dress_code",
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
      background: "#f4ebe5",
      foreground: "#2c171b",
      surface: "#fff9f4",
      surfaceMuted: "#e7d4ce",
      border: "#bda69d",
      accent: "#7f2940",
      accentStrong: "#56172a",
      success: "#356b55",
      warning: "#8a5c1f",
      error: "#9d3840",
      focus: "#7f2940",
    },
    dark: {
      background: "#160c12",
      foreground: "#f5e8dc",
      surface: "#25121c",
      surfaceMuted: "#3a1b29",
      border: "#674454",
      accent: "#d7b06b",
      accentStrong: "#f0cf91",
      success: "#78b69a",
      warning: "#dbb06d",
      error: "#e2838c",
      focus: "#d7b06b",
    },
  },
  composition: {
    ambientMedia: {
      audioSlot: "optional",
      controlStrategy: "external-controls",
      defaultAutoplay: false,
      mood: "Low strings, piano, or room ambience offered only through explicit guest controls.",
    },
    backgroundTreatment:
      "Layered oxblood planes, velvet-soft vignette, and fine champagne rules that open like a proscenium.",
    effects: velvetDuskEffects,
    visualSystem: {
      cardStackPolicy:
        "Sections move between full-stage fields, program rails, and layered portraits; practical facts never become a grid of generic dark cards.",
      compositionMap: "velvet-afterglow",
      imageStrategy:
        "Use warmly lit portrait or evening-event photography with deep side crops and legible champagne captions.",
      motionProfile: "immersive",
      parallaxProfile: "story-depth",
    },
    hero: {
      composition: "layered-portrait",
      fullViewport: true,
      mediaTreatment:
        "A tall portrait sits behind a narrow champagne frame with a soft curtain-like edge shadow.",
    },
    map: { aspect: "portrait", frame: "celestial", overlay: "soft-vignette" },
    rsvpDesign: "editorial",
    sectionDefaults: {
      date: { composition: "full-bleed", density: "spacious", motion: "section-reveal" },
      details: {
        composition: "timeline",
        density: "balanced",
        layout: "evening-program",
        motion: "timeline-reveal",
      },
      dress_code: { composition: "framed", density: "compact", motion: "card-reveal" },
      entourage: {
        composition: "editorial-split",
        density: "balanced",
        motion: "media-reveal",
      },
      gallery: {
        composition: "gallery-feature",
        density: "spacious",
        layout: "afterglow-contact-sheet",
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
        layout: "stage-portrait",
        motion: "media-reveal",
      },
      rsvp: { composition: "full-bleed", density: "spacious", motion: "section-reveal" },
      story: {
        composition: "layered-media",
        density: "spacious",
        layout: "curtain-depth",
        motion: "media-parallax",
      },
    },
  },
  radius: { sm: "0.125rem", md: "0.375rem", lg: "0.625rem" },
  typography: {
    display: "dramatic transitional serif",
    body: "quiet humanist sans",
    css: {
      bodyFamily: 'Avenir, "Gill Sans", ui-sans-serif, system-ui, sans-serif',
      displayFamily: '"Bodoni 72", Didot, Baskerville, ui-serif, serif',
      eyebrowLetterSpacing: "0.3em",
    },
    scale: "editorial",
  },
  imageTreatment:
    "Warm low-key portraits with lifted skin tones, deep oxblood shadows, and narrow champagne frames.",
  rsvpTreatment:
    "A full-stage reply chapter with program-like labels, reserved-seat language, and a single luminous action.",
  compatibility: {
    backdropStrategy:
      "Velvet-dark gradient planes with a soft central glow and asymmetric curtain-edge shadows.",
    fontPairing: {
      body: "quiet humanist sans",
      display: "dramatic transitional serif",
    },
    motionLevel: "immersive",
    ornamentStrategy:
      "Sparse proscenium curves and champagne rules; no literal curtains, masks, marquees, or theatre clip art.",
    rendererSlots: createRendererSlots({ specialized: allInviteSections }),
  },
  dashboardPreview: {
    swatch: "#7f2940",
    summary: "Oxblood stage depth, champagne rules, and a cinematic evening program.",
  },
  previewData: {
    eventTitle: "An Evening in Velvet",
    eyebrow: "One night · one table",
    subtitle: "Dinner, music, and an afterglow shared with our closest people.",
    venueName: "The Crimson Room",
    heroImageAlt: "Guests in evening attire entering a warmly lit dining room",
    sections: [
      {
        type: "details",
        title: "The evening program",
        summary: "Arrival, dinner, and music follow one continuous champagne rail.",
      },
      {
        type: "gallery",
        title: "Afterglow",
        summary: "A lead portrait opens into a narrow sequence of candlelit moments.",
      },
      {
        type: "rsvp",
        title: "Reserve your place",
        summary: "The guest reply closes the invitation as its final formal scene.",
      },
    ],
  },
  accessibilityNotes: [
    "Champagne accents never carry status or interactive meaning without text.",
    "Dark fields retain warm near-white copy and strong focus outlines at every control.",
  ],
} satisfies ThemeDefinition;
