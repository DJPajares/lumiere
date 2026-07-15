import type { ThemeDefinition } from "../../contracts";
import { seasonalRsvpCopyOverrides } from "../../rsvp-copy";
import { allInviteSections, createRendererSlots } from "../../theme-shared";
import { noelV2Effects, noelV2Presentation } from "./visual";

export const noelV2Theme = {
  id: "noel-v2",
  label: "Noel v2",
  description: "A premium watercolor Christmas wedding invitation with editorial restraint.",
  designRead:
    "An heirloom holiday wedding invitation on warm linen paper, pairing Cormorant Garamond with burgundy titles, fine gold rules, airy story chapters, and original watercolor botanicals.",
  supportedEventTypes: ["wedding", "holiday", "private_event"],
  supportedModes: ["light", "dark", "system", "toggleable"],
  defaultMode: "toggleable",
  presentation: noelV2Presentation,
  modeToggle: {
    defaultPreference: "light",
    labels: { control: "Invitation appearance", dark: "Evergreen evening", light: "Linen morning" },
    placement: "top-end",
    style: "seasonal",
  },
  rsvpCopy: {
    ...seasonalRsvpCopyOverrides,
    eyebrow: "The pleasure of your reply",
    sectionTitle: "Will you celebrate with us?",
    sectionDescription: "Your presence would make this winter celebration all the more meaningful.",
    submitLabel: "Send your reply",
    successTitle: "With grateful hearts",
    successDescription: "Your reply has been received. We look forward to celebrating together.",
  },
  supportedSections: allInviteSections,
  requiredSections: ["introduction", "date", "location", "rsvp"],
  recommendedSections: [
    "introduction",
    "date",
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
    "story",
    "details",
    "dress_code",
    "gallery",
    "location",
    "rsvp",
    "outro",
  ],
  tokens: {
    light: {
      background: "#faf0e6",
      foreground: "#1f3b2f",
      surface: "#fff9f1",
      surfaceMuted: "#eee2d2",
      border: "#c9ae7d",
      accent: "#59000f",
      accentStrong: "#59000f",
      success: "#315f48",
      warning: "#916824",
      error: "#9b2739",
      focus: "#7b2433",
    },
    dark: {
      background: "#10251c",
      foreground: "#faf0e6",
      surface: "#173328",
      surfaceMuted: "#214235",
      border: "#59000f",
      accent: "#d39a77",
      accentStrong: "#faf0e6",
      success: "#9ac8ab",
      warning: "#e2bc75",
      error: "#e38b98",
      focus: "#faf0e6",
    },
  },
  composition: {
    ambientMedia: {
      audioSlot: "optional",
      controlStrategy: "external-controls",
      defaultAutoplay: false,
      mood: "Quiet chamber strings or acoustic carols, always started and stopped by the guest.",
    },
    backgroundTreatment:
      "Warm #faf0e6 linen by day and deep evergreen paper by night, framed by a persistent straight-edge pine, holly, berry, and pine-cone watercolor perimeter.",
    effects: noelV2Effects,
    visualSystem: {
      cardStackPolicy:
        "Keep the story and closing frameless; use thin burgundy or antique-gold folio borders only for practical details and RSVP controls.",
      compositionMap: "wedding-editorial",
      imageStrategy:
        "Treat real couple and venue photographs as quiet editorial plates with generous margins; the invitation remains complete without imagery.",
      motionProfile: "calm",
      parallaxProfile: "story-depth",
    },
    hero: {
      composition: "seasonal-tableau",
      fullViewport: true,
      mediaTreatment:
        "A centered watercolor canopy introduces a restrained typographic invitation; optional cover media appears as one borderless editorial portrait.",
    },
    map: { aspect: "landscape", frame: "editorial", overlay: "soft-vignette" },
    rsvpDesign: "seasonal",
    sectionDefaults: {
      date: { composition: "full-bleed", density: "spacious", motion: "section-reveal" },
      details: { composition: "editorial-split", density: "balanced", motion: "section-reveal" },
      dress_code: { composition: "full-bleed", density: "spacious", motion: "section-reveal" },
      entourage: {
        composition: "editorial-split",
        density: "balanced",
        motion: "section-reveal",
      },
      gallery: {
        composition: "gallery-feature",
        density: "balanced",
        layout: "editorial-grid",
        motion: "media-reveal",
      },
      location: {
        composition: "editorial-split",
        density: "spacious",
        motion: "section-reveal",
      },
      outro: { composition: "full-bleed", density: "spacious", motion: "section-reveal" },
      profile: {
        composition: "layered-media",
        density: "spacious",
        layout: "split",
        motion: "media-reveal",
      },
      rsvp: { composition: "framed", density: "balanced", motion: "section-reveal" },
      story: { composition: "timeline", density: "spacious", motion: "section-reveal" },
    },
  },
  radius: { sm: "0rem", md: "0.125rem", lg: "0.25rem" },
  typography: {
    display: "Cormorant Garamond editorial serif",
    body: "Cormorant Garamond book serif",
    css: {
      bodyFamily: '"Cormorant Garamond", Garamond, "Times New Roman", ui-serif, serif',
      displayFamily: '"Cormorant Garamond", Garamond, "Times New Roman", ui-serif, serif',
      eyebrowLetterSpacing: "0.32em",
    },
    scale: "editorial",
  },
  imageTreatment:
    "Natural, lightly desaturated editorial crops with fine burgundy rules and no frosted glass or heavy shadow.",
  rsvpTreatment:
    "A formal reply folio with book-serif fields, precise hairlines, burgundy borders at night, and a strong accessible action.",
  compatibility: {
    backdropStrategy:
      "A quiet linen-paper field whose sparse fixed botanicals frame, rather than overlap, the invitation content.",
    fontPairing: { body: "Cormorant Garamond book", display: "Cormorant Garamond display" },
    motionLevel: "calm",
    ornamentStrategy:
      "One original watercolor canopy plus a fixed Evergreen Folio watercolor postcard perimeter; no glitter, snowfall, or repeated section boughs.",
    rendererSlots: createRendererSlots({ specialized: allInviteSections }),
  },
  dashboardPreview: {
    swatch: "#59000f",
    summary:
      "Premium linen-paper Christmas wedding theme with watercolor botanicals and burgundy type.",
  },
  previewData: {
    eventTitle: "Kimberly & Darwin",
    eyebrow: "Together with their families",
    heroImageAlt: "Winter wedding portrait framed by soft greenery",
    sections: [
      {
        summary: "A centered heirloom opening beneath an original watercolor canopy.",
        title: "Together with their families",
        type: "introduction",
      },
      {
        summary: "An airy alternating timeline turns short memories into editorial chapters.",
        title: "A love story in seasons",
        type: "story",
      },
      {
        summary: "Formal attire and a jewel-toned palette are presented as a restrained folio.",
        title: "Christmas Formal",
        type: "dress_code",
      },
      {
        summary: "A warm typographic closing ends with gratitude rather than decoration.",
        title: "See you in December, with all our love.",
        type: "outro",
      },
    ],
    subtitle: "A winter wedding written in evergreen and burgundy.",
    venueName: "The Evergreen Hall",
  },
  accessibilityNotes: [
    "Burgundy and evergreen accents never carry RSVP state without text.",
    "Watercolor ornaments remain outside the main reading column at every viewport size.",
    "Light and dark title colors retain strong contrast against their paper fields.",
    "All reveal and parallax treatments become static when reduced motion is requested.",
  ],
} satisfies ThemeDefinition;
