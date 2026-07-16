import type { ThemeDefinition } from "../../contracts";
import { seasonalRsvpCopyOverrides } from "../../rsvp-copy";
import { allEventTypes, allInviteSections, createRendererSlots } from "../../theme-shared";
import { noelEffects, noelPresentation } from "./visual";

export const noelTheme = {
  id: "noel",
  label: "Noel",
  description: "Christmas-inspired invitation for celebrations of every event type.",
  designRead:
    "A peaceful winter conservatory with warm ivory paper, sculpted evergreen and mistletoe boughs, drifting snow, and candlelit invitation folios.",
  supportedEventTypes: allEventTypes,
  supportedModes: ["light", "dark", "system", "toggleable"],
  defaultMode: "toggleable",
  presentation: noelPresentation,
  modeToggle: {
    defaultPreference: "dark",
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
      background: "#f6f0e4",
      foreground: "#193027",
      surface: "#fffaf0",
      surfaceMuted: "#e9e1d2",
      border: "#c8bca6",
      accent: "#285f48",
      accentStrong: "#143d2d",
      success: "#267054",
      warning: "#94652e",
      error: "#a84242",
      focus: "#276b50",
    },
    dark: {
      background: "#071a14",
      foreground: "#f2f4ea",
      surface: "#0e281e",
      surfaceMuted: "#17372b",
      border: "#3f5b4c",
      accent: "#9ed0b4",
      accentStrong: "#d9e8dd",
      success: "#86c7a2",
      warning: "#e0b46a",
      error: "#e18783",
      focus: "#b9dec8",
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
      "Deep evergreen candlelight or warm ivory paper with slow falling snow, peripheral mistletoe and holly boughs, pine-cone warmth, and small candle-gold details.",
    effects: noelEffects,
    visualSystem: {
      cardStackPolicy:
        "Use invitation-folio borders and corner botanicals for practical details; hero, gallery, story, and outro remain spacious atmospheric chapters.",
      compositionMap: "wedding-editorial",
      imageStrategy:
        "Prefer real table, venue, or gathering imagery with warm captions; missing media becomes a candlelit fact rail, not festive clutter.",
      motionProfile: "seasonal",
      parallaxProfile: "story-depth",
    },
    hero: {
      composition: "seasonal-tableau",
      fullViewport: true,
      mediaTreatment:
        "An arched winter portrait or a frosted invitation folio framed by an asymmetrical evergreen bough and quiet snow.",
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
  radius: { sm: "0.25rem", md: "0.5rem", lg: "0.75rem" },
  typography: {
    display: "old-style winter serif",
    body: "quiet humanist sans",
    css: {
      bodyFamily: '"Manrope Variable", Manrope, ui-sans-serif, system-ui, sans-serif',
      displayFamily: '"Fraunces Variable", Fraunces, Georgia, ui-serif, serif',
      eyebrowLetterSpacing: "0.24em",
    },
    roles: {
      hero: {
        fontSize: "clamp(3.55rem, 9.2vw, 8.8rem)",
        letterSpacing: "-0.052em",
        lineHeight: "0.86",
      },
      heroSubtitle: {
        fontFamily: "display",
        fontSize: "clamp(1.25rem, 2.3vw, 1.85rem)",
        fontStyle: "italic",
        lineHeight: "1.5",
      },
      title: { fontSize: "clamp(2.65rem, 5.6vw, 5.5rem)", letterSpacing: "-0.04em" },
      control: { letterSpacing: "0.12em", textTransform: "uppercase" },
    },
    scale: "editorial",
  },
  imageTreatment:
    "Cool cinematic crops behind a pearl-frost inner line, evergreen shadow, and discreet winter caption rail.",
  rsvpTreatment:
    "A candlelit invitation folio with a fine double border, clear attendance state, and evergreen primary action.",
  compatibility: {
    backdropStrategy:
      "A deep evergreen winter conservatory with drifting snow, cold window light, and pearl-frost chapter shifts.",
    fontPairing: {
      body: "humanist sans",
      display: "warm serif",
    },
    motionLevel: "seasonal",
    ornamentStrategy:
      "Sculpted evergreen and mistletoe boughs, sparse holly berries, a single pine-cone accent, fine ribbon arcs, and layered snow; no clip art, novelty icons, or glitter fields.",
    rendererSlots: createRendererSlots({ specialized: allInviteSections }),
  },
  dashboardPreview: {
    swatch: "#285f48",
    summary: "Winter-conservatory Christmas theme with drifting snow and invitation-folio details.",
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
    "Snowfall and decorative glints stop when reduced motion is requested.",
  ],
} satisfies ThemeDefinition;
