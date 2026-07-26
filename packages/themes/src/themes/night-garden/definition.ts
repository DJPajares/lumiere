import type { ThemeDefinition } from "../../contracts";
import { allInviteSections, createRendererSlots } from "../../theme-shared";
import { nightGardenEffects, nightGardenPresentation } from "./visual";

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

export const nightGardenTheme = {
  id: "night-garden",
  label: "Night Garden",
  description:
    "A romantic evening invitation shaped by greenhouse geometry, moonlit portraits, and abstract leaf shadow.",
  designRead:
    "Forest-black atmosphere, moon-ivory reading fields, orchid highlights, lyrical serif titles, and a glasshouse chapter rhythm without vintage botanical illustration.",
  supportedEventTypes: ["wedding", "dinner", "birthday", "private_event", "other"],
  supportedModes: ["light", "dark", "system", "toggleable"],
  defaultMode: "dark",
  presentation: nightGardenPresentation,
  modeToggle: {
    defaultPreference: "dark",
    labels: { control: "Garden light", dark: "Moon garden", light: "Glasshouse day" },
    placement: "top-end",
    style: "organic",
  },
  rsvpCopy: {
    acceptLabel: "Meet you in the garden",
    attendancePrompt: "Will you join us after dark?",
    declineLabel: "Unable to join",
    eyebrow: "Conservatory reply",
    reservedSeatsIntro: "A place is reserved for",
    sectionDescription: "Reply from the quiet clearing before the evening begins.",
    sectionTitle: "Join us after dark",
    submitLabel: "Send garden reply",
    submittingLabel: "Sending…",
    successDescription: "Your reply has reached the hosts.",
    successTitle: "We will meet you there",
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
      background: "#f2f0e7",
      foreground: "#1a281f",
      surface: "#fbf8f0",
      surfaceMuted: "#dfe5db",
      border: "#8c9d8f",
      accent: "#64213f",
      accentStrong: "#47162d",
      success: "#3d6d50",
      warning: "#88611d",
      error: "#a3323d",
      focus: "#64213f",
    },
    dark: {
      background: "#0f1814",
      foreground: "#f2ece1",
      surface: "#18251f",
      surfaceMuted: "#20332a",
      border: "#547061",
      accent: "#f1b4c6",
      accentStrong: "#ffd0dc",
      success: "#86c99c",
      warning: "#eac36f",
      error: "#ff909d",
      focus: "#ffd0dc",
    },
  },
  composition: {
    ambientMedia: {
      audioSlot: "optional",
      controlStrategy: "external-controls",
      defaultAutoplay: false,
      mood: "A host-selected nocturne or ambient room recording may play only by guest choice.",
    },
    backgroundTreatment:
      "Forest-black or chalk fields hold abstract canopy shadows outside opaque reading clearings.",
    effects: nightGardenEffects,
    visualSystem: {
      cardStackPolicy:
        "Build a sequence of canopy, glasshouse, image garden, and illuminated clearing; do not stack botanical cards.",
      compositionMap: "night-garden",
      imageStrategy:
        "Use real nocturnal gardens, greenhouse glass, macro petals, shadowed foliage, and candlelit people.",
      motionProfile: "immersive",
      parallaxProfile: "hero-and-media",
    },
    hero: {
      composition: "botanical-canopy",
      fullViewport: true,
      mediaTreatment:
        "A tall protected portrait rises through an abstract canopy beside lyrical type on an opaque field.",
    },
    map: { aspect: "portrait", frame: "organic", overlay: "soft-vignette" },
    rsvpDesign: "conservatory",
    sectionDefaults: {
      date: {
        composition: "full-bleed",
        density: "spacious",
        layout: "moon-dial",
        motion: "section-reveal",
      },
      profile: {
        composition: "layered-media",
        density: "spacious",
        layout: "paired-understory",
        motion: "media-reveal",
      },
      story: {
        composition: "timeline",
        density: "spacious",
        layout: "vertical-bloom",
        motion: "timeline-reveal",
      },
      details: { composition: "editorial-split", density: "balanced", motion: "section-reveal" },
      gallery: {
        composition: "gallery-feature",
        density: "spacious",
        layout: "macro-garden",
        motion: "gallery-drift",
      },
      location: {
        composition: "editorial-split",
        density: "spacious",
        layout: "glasshouse-arrival",
        motion: "section-reveal",
      },
      rsvp: {
        composition: "full-bleed",
        density: "spacious",
        layout: "conservatory-reply",
        motion: "section-reveal",
      },
      outro: {
        composition: "layered-media",
        density: "spacious",
        layout: "closing-bloom",
        motion: "media-reveal",
      },
    },
  },
  radius: { sm: "0.375rem", md: "1rem", lg: "2.5rem" },
  typography: {
    display: "lyrical flared serif",
    body: "grounded humanist sans",
    css: {
      bodyFamily: '"Nunito Variable", Nunito, ui-sans-serif, system-ui, sans-serif',
      displayFamily:
        '"Cormorant Garamond", Garamond, "Iowan Old Style", Baskerville, ui-serif, serif',
      eyebrowLetterSpacing: "0.22em",
    },
    roles: {
      hero: {
        fontSize: "clamp(4.25rem, 10vw, 10.5rem)",
        fontWeight: "430",
        letterSpacing: "-0.045em",
        lineHeight: "0.84",
      },
      title: { fontWeight: "440", letterSpacing: "-0.035em" },
      caption: { fontStyle: "italic" },
    },
    scale: "editorial",
  },
  imageTreatment:
    "Nocturnal photography keeps faces and petal detail visible through controlled contrast and opaque caption backing.",
  rsvpTreatment:
    "A calm illuminated conservatory clearing with visible capacity, explicit response state, and a stable static confirmation.",
  compatibility: {
    backdropStrategy:
      "Abstract code-native leaf shadow stays at viewport edges while copy and controls remain on opaque fields.",
    fontPairing: {
      body: "grounded humanist sans",
      display: "lyrical flared serif",
    },
    motionLevel: "immersive",
    ornamentStrategy:
      "Large abstract leaf shadows and greenhouse lines at the edge; never vintage botanical plates, falling petals, or drifting leaves.",
    rendererSlots: createRendererSlots({
      fallback: [...fallbackSections],
      specialized: [...specializedSections],
    }),
  },
  dashboardPreview: {
    swatch: "#f1b4c6",
    summary: "Forest-black canopy, moonlit portraiture, and a calm conservatory reply.",
  },
  previewData: {
    eventTitle: "After the Garden Closes",
    eyebrow: "Under glass and moonlight",
    subtitle: "An evening celebration among the conservatory paths, candlelit tables, and night blooms.",
    venueName: "Orchid House",
    heroImageAlt: "Guests walking through a softly lit greenhouse at night",
    sections: [
      {
        type: "story",
        title: "Where the garden grew",
        summary: "A vertical story rail unfolds through shadow, glass, and one restrained bloom cue.",
      },
      {
        type: "gallery",
        title: "In the moon garden",
        summary: "Nocturnal portraits and macro details form one image-led chapter.",
      },
      {
        type: "rsvp",
        title: "Join us after dark",
        summary: "The reply settles into an illuminated clearing with every state visible.",
      },
    ],
  },
  accessibilityNotes: [
    "Abstract foliage stays outside text-safe opaque fields and never captures pointer events.",
    "Orchid is never the only state signal, and focus is a high-contrast solid outline.",
    "Reduced motion removes all mask and image movement while preserving the final reading order.",
  ],
} satisfies ThemeDefinition;
