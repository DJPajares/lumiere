import type { ThemeDefinition } from "../../contracts";
import { allInviteSections, createRendererSlots } from "../../theme-shared";
import { evergreenFolioEffects, evergreenFolioPresentation } from "./visual";

export const evergreenFolioTheme = {
  id: "evergreen-folio",
  label: "Evergreen Folio",
  description: "A hand-painted Christmas wedding invitation on heirloom cotton paper.",
  designRead:
    "A portrait Christmas wedding folio with a dense watercolor evergreen border, carmine display type, forest-green names, pine cones, holly, berries, and quiet letterpress rules.",
  supportedEventTypes: ["wedding"],
  supportedModes: ["light", "dark", "system", "toggleable"],
  defaultMode: "toggleable",
  presentation: evergreenFolioPresentation,
  modeToggle: {
    defaultPreference: "light",
    labels: {
      control: "Paper setting",
      dark: "Candlelit desk",
      light: "Daylight paper",
    },
    placement: "top-end",
    style: "editorial",
  },
  rsvpCopy: {
    acceptLabel: "Joyfully accepts",
    attendancePrompt: "Will you celebrate with us?",
    countPrompt: "Who will attend?",
    declineLabel: "Regretfully declines",
    eyebrow: "Your reply",
    guestLinkRequired: "Open the private invitation sent to your household to reply.",
    messageLabel: "A note for the couple",
    reservedSeatsIntro: "Places reserved for your party:",
    sectionDescription: "Kindly send your response using the card below.",
    sectionTitle: "The pleasure of your reply",
    submitLabel: "Return reply card",
    submittingLabel: "Returning reply card...",
    successDescription: "Your response has been entered in the celebration book.",
    successTitle: "With thanks",
    updateLabel: "Revise reply card",
    updateReplyLabel: "Return revised reply",
    updateNotice: "A previous response is on file. You may revise it below.",
    updatingLabel: "Returning revised reply...",
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
    "entourage",
    "location",
    "gallery",
    "rsvp",
    "outro",
  ],
  sectionRhythm: [
    "introduction",
    "date",
    "profile",
    "story",
    "details",
    "dress_code",
    "entourage",
    "location",
    "gallery",
    "rsvp",
    "outro",
  ],
  tokens: {
    light: {
      background: "#d8c9b0",
      foreground: "#25261f",
      surface: "#f4e8d0",
      surfaceMuted: "#e4d4b8",
      border: "#9b8d73",
      accent: "#9f242b",
      accentStrong: "#76191f",
      success: "#315e43",
      warning: "#876021",
      error: "#9f242b",
      focus: "#8d1d24",
    },
    dark: {
      background: "#1c1510",
      foreground: "#f3e7d2",
      surface: "#30241b",
      surfaceMuted: "#433126",
      border: "#77624d",
      accent: "#e18484",
      accentStrong: "#f0b0a8",
      success: "#91bc9d",
      warning: "#e2b974",
      error: "#ef9191",
      focus: "#f0aaa3",
    },
  },
  composition: {
    ambientMedia: {
      audioSlot: "optional",
      controlStrategy: "external-controls",
      defaultAutoplay: false,
      mood: "Quiet chamber strings or acoustic carols with explicit guest controls.",
    },
    backgroundTreatment:
      "A physical cotton-paper invitation resting on a pale writing table by day or a walnut desk by candlelight, with no snowfall, glow field, or conservatory scenery.",
    effects: evergreenFolioEffects,
    visualSystem: {
      cardStackPolicy:
        "Treat the invitation as one continuous stationery suite: ruled folios, ledger rows, print mats, and a detachable response card instead of floating glass cards.",
      compositionMap: "wedding-editorial",
      imageStrategy:
        "Real couple and venue imagery appears as square-edged archival prints with deckled mats; the invitation remains complete when the cover image is absent.",
      motionProfile: "calm",
      parallaxProfile: "none",
    },
    hero: {
      composition: "centered-media",
      fullViewport: true,
      mediaTreatment:
        "A full portrait paper folio with a reserved botanical perimeter; optional cover media becomes a separate archival print behind the invitation rather than part of its frame.",
    },
    map: { aspect: "landscape", frame: "editorial", overlay: "none" },
    rsvpDesign: "editorial",
    sectionDefaults: {
      date: { composition: "full-bleed", density: "spacious", motion: "section-reveal" },
      details: { composition: "full-bleed", density: "balanced", motion: "section-reveal" },
      dress_code: { composition: "framed", density: "balanced", motion: "card-reveal" },
      entourage: {
        composition: "editorial-split",
        density: "balanced",
        motion: "section-reveal",
      },
      gallery: {
        composition: "gallery-feature",
        density: "balanced",
        layout: "archival-grid",
        motion: "media-reveal",
      },
      location: {
        composition: "full-bleed",
        density: "spacious",
        motion: "section-reveal",
      },
      outro: { composition: "full-bleed", density: "spacious", motion: "section-reveal" },
      profile: {
        composition: "layered-media",
        density: "spacious",
        layout: "archival-portrait",
        motion: "media-reveal",
      },
      rsvp: { composition: "framed", density: "balanced", motion: "section-reveal" },
      story: { composition: "timeline", density: "spacious", motion: "section-reveal" },
    },
  },
  radius: { sm: "0rem", md: "0.125rem", lg: "0.25rem" },
  typography: {
    display: "engraved high-contrast roman",
    body: "book serif",
    css: {
      bodyFamily: '"Cormorant Garamond", Garamond, Baskerville, "Times New Roman", ui-serif, serif',
      displayFamily:
        '"Cormorant Garamond", Garamond, "Bodoni 72", Didot, "Times New Roman", ui-serif, serif',
      eyebrowLetterSpacing: "0.2em",
    },
    scale: "editorial",
  },
  imageTreatment:
    "Square-edged archival prints with ivory deckled mats, thin forest rules, natural color, and handwritten-style captions.",
  rsvpTreatment:
    "A detachable reply card with a perforated rule, formal response copy, ledger-like fields, and a carmine return action.",
  compatibility: {
    backdropStrategy:
      "A pale writing surface in daylight and a dark walnut desk at night, always centered on one tactile cotton-paper stationery suite.",
    fontPairing: { body: "book serif", display: "engraved roman" },
    motionLevel: "calm",
    ornamentStrategy:
      "One original watercolor perimeter of long-needle pine, hand-shaped holly, red winter berries, and layered pine cones; supporting sections rely on print rules rather than repeated foliage.",
    rendererSlots: createRendererSlots({ specialized: allInviteSections }),
  },
  dashboardPreview: {
    swatch: "#9f242b",
    summary: "Christmas wedding stationery with carmine type and a watercolor evergreen border.",
  },
  previewData: {
    eventTitle: "Christmas Wedding",
    eyebrow: "You are invited to the wedding of",
    heroImageAlt: "Archival Christmas wedding portrait on an ivory paper mat",
    sections: [
      {
        summary: "Christmas Wedding in carmine above the couple's names in forest green.",
        title: "The invitation",
        type: "introduction",
      },
      {
        summary: "The date and venue are typeset as a quiet formal announcement.",
        title: "December twenty-fourth",
        type: "date",
      },
      {
        summary: "A detachable response card closes the stationery suite.",
        title: "The pleasure of your reply",
        type: "rsvp",
      },
    ],
    subtitle: "Amelia & James · December 24",
    venueName: "The Evergreen Hall",
  },
  accessibilityNotes: [
    "Carmine and forest colors are decorative; RSVP state is always stated in text.",
    "The painted perimeter reserves a fixed clear center and never sits behind invitation copy.",
    "The paper keeps dark ink in both modes while surrounding night surfaces use ivory copy.",
    "Calm reveals are removed entirely when reduced motion is requested.",
  ],
} satisfies ThemeDefinition;
