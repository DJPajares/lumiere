import type { ThemeDefinition } from "../../contracts";
import { seasonalRsvpCopyOverrides } from "../../rsvp-copy";
import { allEventTypes, allInviteSections, createRendererSlots } from "../../theme-shared";
import { noelV2Effects, noelV2Presentation } from "./visual";

export const noelV2Theme = {
  id: "noel-v2",
  label: "Noel V2",
  description: "Botanical Christmas-paper invitation for celebrations of every event type.",
  designRead:
    "A hand-painted Christmas invitation on warm cotton paper, enclosed by a lush evergreen, holly, berry, and pine-cone frame with formal red and forest typography.",
  supportedEventTypes: allEventTypes,
  supportedModes: ["light", "dark", "system", "toggleable"],
  defaultMode: "toggleable",
  presentation: noelV2Presentation,
  modeToggle: {
    defaultPreference: "light",
    labels: { control: "Invitation appearance", dark: "Candlelight", light: "Snowlight" },
    placement: "top-start",
    style: "seasonal",
  },
  rsvpCopy: seasonalRsvpCopyOverrides,
  supportedSections: allInviteSections,
  requiredSections: ["introduction", "date", "location", "rsvp"],
  recommendedSections: [
    "introduction",
    "date",
    "profile",
    "details",
    "dress_code",
    "entourage",
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
      background: "#e9dfcf",
      foreground: "#1e3227",
      surface: "#fbf5e9",
      surfaceMuted: "#e8dfcf",
      border: "#b8aa91",
      accent: "#235c40",
      accentStrong: "#153d2c",
      success: "#236449",
      warning: "#8b6127",
      error: "#a3393d",
      focus: "#1f6244",
    },
    dark: {
      background: "#091a13",
      foreground: "#f2eadc",
      surface: "#122b20",
      surfaceMuted: "#1b3a2c",
      border: "#516858",
      accent: "#9bc0a6",
      accentStrong: "#dce9df",
      success: "#8bc7a0",
      warning: "#ddb66b",
      error: "#e28b86",
      focus: "#b9d8c2",
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
      "Warm cotton paper on a softly vignetted surface in Snowlight, or a candlelit evergreen room around the same printed folio in Candlelight.",
    effects: noelV2Effects,
    visualSystem: {
      cardStackPolicy:
        "Use cotton-paper folios, fine ink rules, and cropped corner botanicals for practical details; gallery, story, and outro remain spacious printed chapters.",
      compositionMap: "wedding-editorial",
      imageStrategy:
        "Treat real table, venue, or gathering imagery as a companion print beside the invitation; without media, the botanical folio and event facts remain complete.",
      motionProfile: "seasonal",
      parallaxProfile: "story-depth",
    },
    hero: {
      composition: "seasonal-tableau",
      fullViewport: true,
      mediaTreatment:
        "A portrait companion print with an ivory mat, forest rule, and small botanical corner, placed beside the primary evergreen-framed invitation.",
    },
    map: { aspect: "landscape", frame: "seasonal", overlay: "accent-wash" },
    rsvpDesign: "seasonal",
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
      entourage: {
        composition: "editorial-split",
        density: "balanced",
        motion: "section-reveal",
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
      outro: {
        composition: "full-bleed",
        density: "spacious",
        motion: "section-reveal",
      },
      profile: {
        composition: "editorial-split",
        density: "balanced",
        layout: "seasonal-portrait",
        motion: "media-reveal",
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
  radius: { sm: "0.15rem", md: "0.3rem", lg: "0.5rem" },
  typography: {
    display: "old-style winter serif",
    body: "quiet humanist sans",
    css: {
      bodyFamily:
        '"Avenir Next", Avenir, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      displayFamily:
        '"Iowan Old Style", "Palatino Linotype", Palatino, Baskerville, Georgia, ui-serif, serif',
      eyebrowLetterSpacing: "0.24em",
    },
    scale: "editorial",
  },
  imageTreatment:
    "Natural portrait crops presented as lightly rotated companion prints with an ivory mat, forest hairline, and discreet caption.",
  rsvpTreatment:
    "A cotton-paper response folio with fine double rules, botanical corner details, clear attendance state, and evergreen primary action.",
  compatibility: {
    backdropStrategy:
      "A warm paper surface in Snowlight and deep evergreen candlelight in dark mode, both centered on a tactile botanical invitation folio.",
    fontPairing: {
      body: "humanist sans",
      display: "warm serif",
    },
    motionLevel: "seasonal",
    ornamentStrategy:
      "An original watercolor-like frame of evergreen needles, holly leaves, red berries, and pine cones, cropped into section corners without clip art, novelty icons, or glitter.",
    rendererSlots: createRendererSlots({ specialized: allInviteSections }),
  },
  dashboardPreview: {
    swatch: "#235c40",
    summary: "Warm Christmas-paper invitation with a hand-painted evergreen and berry frame.",
  },
  previewData: {
    eventTitle: "Christmas Wedding",
    eyebrow: "You are invited",
    heroImageAlt: "Christmas wedding portrait presented as a companion print",
    sections: [
      {
        summary: "Formal red and forest type centered inside a hand-painted botanical frame.",
        title: "The invitation",
        type: "introduction",
      },
      {
        summary: "Event details and dress notes use fine ink rules and cotton-paper folios.",
        title: "Printed details",
        type: "details",
      },
      {
        summary: "Holiday RSVP stays warm, brief, and accessible.",
        title: "Holiday reply",
        type: "rsvp",
      },
    ],
    subtitle: "Amelia & James · December 24",
    venueName: "The Evergreen Hall",
  },
  accessibilityNotes: [
    "Red/green seasonal cues must include text labels.",
    "The cream hero folio keeps dark forest body text in both modes while surrounding dark surfaces use ivory text.",
    "Botanical art stays outside the primary reading area and section reveals stop when reduced motion is requested.",
  ],
} satisfies ThemeDefinition;
