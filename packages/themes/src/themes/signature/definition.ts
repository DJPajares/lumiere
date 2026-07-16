import type { ThemeDefinition } from "../../contracts";
import { editorialRsvpCopyOverrides } from "../../rsvp-copy";
import { allEventTypes, allInviteSections, createRendererSlots } from "../../theme-shared";
import { signatureEffects, signaturePresentation } from "./visual";

export const signatureTheme = {
  id: "signature",
  label: "Signature",
  description:
    "A grand contemporary invitation suite for every occasion, finished in vellum, aubergine, and brushed bronze.",
  designRead:
    "A private-salon invitation composed as a complete stationery suite: architectural apertures, a continuous bronze signature thread, confident editorial type, and lacquered evening depth.",
  supportedEventTypes: allEventTypes,
  supportedModes: ["light", "dark", "system", "toggleable"],
  defaultMode: "toggleable",
  presentation: signaturePresentation,
  modeToggle: {
    defaultPreference: "system",
    labels: { control: "Invitation appearance", dark: "Midnight lacquer", light: "Warm vellum" },
    placement: "top-end",
    style: "editorial",
  },
  rsvpCopy: {
    ...editorialRsvpCopyOverrides,
    eyebrow: "The guest ledger",
    sectionTitle: "May we reserve your place?",
    sectionDescription:
      "Your reply completes the guest list. Kindly share who will be joining the occasion.",
    submitLabel: "Confirm your place",
    successTitle: "Your place is noted",
    successDescription: "Your reply is now with the host. We look forward to the occasion.",
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
    "custom",
    "outro",
  ],
  tokens: {
    light: {
      background: "#f2ece2",
      foreground: "#211d20",
      surface: "#fbf7ef",
      surfaceMuted: "#e6dbce",
      border: "#b6a38f",
      accent: "#6f2d3a",
      accentStrong: "#51202c",
      success: "#356a52",
      warning: "#8a611f",
      error: "#9c3945",
      focus: "#6f2d3a",
    },
    dark: {
      background: "#181619",
      foreground: "#f1e9dd",
      surface: "#242026",
      surfaceMuted: "#302a30",
      border: "#76666a",
      accent: "#d1a36f",
      accentStrong: "#f0c58d",
      success: "#7db398",
      warning: "#ddb36d",
      error: "#df858d",
      focus: "#e4b77e",
    },
  },
  composition: {
    ambientMedia: {
      audioSlot: "optional",
      controlStrategy: "external-controls",
      defaultAutoplay: false,
      mood: "Instrumental music, room tone, or a host-selected signature track with explicit guest playback controls.",
    },
    backgroundTreatment:
      "Warm vellum by day and aubergine-black lacquer by night, crossed by one restrained brushed-bronze thread and quiet paper grain.",
    effects: signatureEffects,
    visualSystem: {
      cardStackPolicy:
        "The invitation reads as one continuous suite; only guest facts, arrival details, and reply controls become inset folios.",
      compositionMap: "signature-suite",
      imageStrategy:
        "Use one decisive portrait or scene per chapter, with salon-like offsets, slim caption ledgers, and a fully composed typographic fallback.",
      motionProfile: "immersive",
      parallaxProfile: "hero-and-media",
    },
    hero: {
      composition: "editorial-split",
      fullViewport: true,
      mediaTreatment:
        "An architectural aperture frames the title while optional portrait media sits as a lacquered plate with a floating bronze edge.",
    },
    map: { aspect: "portrait", frame: "editorial", overlay: "soft-vignette" },
    rsvpDesign: "editorial",
    sectionDefaults: {
      date: { composition: "full-bleed", density: "spacious", motion: "section-reveal" },
      details: {
        composition: "editorial-split",
        density: "balanced",
        layout: "suite-ledger",
        motion: "section-reveal",
      },
      dress_code: {
        composition: "full-bleed",
        density: "spacious",
        layout: "material-library",
        motion: "card-reveal",
      },
      entourage: {
        composition: "editorial-split",
        density: "balanced",
        layout: "name-ledger",
        motion: "section-reveal",
      },
      gallery: {
        composition: "gallery-feature",
        density: "spacious",
        layout: "salon-hang",
        motion: "media-reveal",
      },
      location: {
        composition: "editorial-split",
        density: "spacious",
        layout: "arrival-dossier",
        motion: "media-reveal",
      },
      outro: {
        composition: "layered-media",
        density: "spacious",
        layout: "signed-close",
        motion: "media-reveal",
      },
      profile: {
        composition: "editorial-split",
        density: "spacious",
        layout: "portrait-leaves",
        motion: "media-reveal",
      },
      rsvp: {
        composition: "editorial-split",
        density: "spacious",
        layout: "concierge-ledger",
        motion: "section-reveal",
      },
      story: {
        composition: "timeline",
        density: "spacious",
        layout: "signature-thread",
        motion: "timeline-reveal",
      },
    },
  },
  radius: { sm: "0.25rem", md: "0.625rem", lg: "1.25rem" },
  typography: {
    display: "sculpted modern display serif",
    body: "tailored humanist sans",
    css: {
      bodyFamily:
        '"Avenir Next", Avenir, "Helvetica Neue", ui-sans-serif, system-ui, -apple-system, sans-serif',
      displayFamily: '"Bodoni 72", Didot, "Cormorant Garamond", Iowan Old Style, ui-serif, serif',
      eyebrowLetterSpacing: "0.3em",
    },
    roles: {
      hero: {
        fontSize: "clamp(3.7rem, 9vw, 9rem)",
        letterSpacing: "-0.06em",
        lineHeight: "0.84",
      },
      heroSubtitle: {
        fontFamily: "display",
        fontSize: "clamp(1.25rem, 2.2vw, 1.8rem)",
        fontStyle: "italic",
        lineHeight: "1.35",
      },
      title: { fontSize: "clamp(3rem, 6.2vw, 6.4rem)", letterSpacing: "-0.045em" },
    },
    scale: "editorial",
  },
  imageTreatment:
    "Natural low-gloss color with confident portrait crops, warm highlights, discreet bronze keylines, and generous subject-safe spacing.",
  rsvpTreatment:
    "A concierge guest ledger with reserved-party facts, tailored rule fields, explicit states, and one decisive aubergine or bronze action.",
  compatibility: {
    backdropStrategy:
      "Quiet vellum or lacquer with a single continuous bronze thread, faint grain, and protected reading fields.",
    fontPairing: {
      body: "tailored humanist sans",
      display: "sculpted modern display serif",
    },
    motionLevel: "immersive",
    ornamentStrategy:
      "One abstract signature thread, architectural corner apertures, chapter tabs, and sign-off seals; no literal crests, florals, confetti, or event-specific icons.",
    rendererSlots: createRendererSlots({ specialized: allInviteSections }),
  },
  dashboardPreview: {
    swatch: "#6f2d3a",
    summary:
      "Aubergine ink, warm vellum, bronze thread, and an architectural invitation-suite composition.",
  },
  previewData: {
    eventTitle: "The Signature Gathering",
    eyebrow: "An occasion in good company",
    subtitle: "An invitation composed around the people, place, and moment worth remembering.",
    venueName: "The Grand Salon",
    heroImageAlt: "Guests arriving through a warmly lit architectural entry",
    sections: [
      {
        type: "date",
        title: "The occasion",
        summary: "Time and place open as a full-width invitation leaf with a bronze chapter tab.",
      },
      {
        type: "story",
        title: "In fine company",
        summary: "A continuous signature thread connects the moments that shape the gathering.",
      },
      {
        type: "gallery",
        title: "The collection",
        summary:
          "A salon-hung statement image and supporting pair give the event a composed visual memory.",
      },
      {
        type: "rsvp",
        title: "The guest ledger",
        summary: "A concierge-style reply records each place with clarity and ceremony.",
      },
    ],
  },
  accessibilityNotes: [
    "The bronze thread and aperture corners are decorative and never convey event or response state.",
    "Aubergine-on-vellum and pearl-on-lacquer text pairings retain strong reading contrast.",
    "Portrait overlaps flatten before tablet widths so copy and controls never collide.",
    "All parallax, thread drift, and reveal motion becomes static when reduced motion is requested.",
  ],
} satisfies ThemeDefinition;
