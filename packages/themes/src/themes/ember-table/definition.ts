import type { ThemeDefinition } from "../../contracts";
import { allInviteSections, createRendererSlots } from "../../theme-shared";
import { emberTableEffects, emberTablePresentation } from "./visual";

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

export const emberTableTheme = {
  id: "ember-table",
  label: "Ember Table",
  description:
    "An intimate, documentary invitation paced along one table from first welcome to final reply.",
  designRead:
    "Coal-brown atmosphere, live-ember accents, wide room photography, confident grotesk titles, and one continuous table axis built for dinners and close celebrations.",
  supportedEventTypes: [
    "dinner",
    "wedding",
    "holiday",
    "birthday",
    "private_event",
    "other",
  ],
  supportedModes: ["light", "dark", "system", "toggleable"],
  defaultMode: "dark",
  presentation: emberTablePresentation,
  modeToggle: {
    defaultPreference: "dark",
    labels: { control: "Table light", dark: "After dinner", light: "Before sunset" },
    placement: "top-end",
    style: "soft-pill",
  },
  rsvpCopy: {
    acceptLabel: "Save our places",
    attendancePrompt: "Will you take your place?",
    countPrompt: "How many places should we set?",
    declineLabel: "Release our places",
    eyebrow: "Your place at the table",
    guestLabelPlural: "places",
    guestLabelSingular: "place",
    reservedSeatsIntro: "Places held for",
    sectionDescription: "Confirm who will gather around the table.",
    sectionTitle: "Pull up a chair",
    submitLabel: "Confirm places",
    submittingLabel: "Setting places…",
    successDescription: "Your places are set and your reply is with the hosts.",
    successTitle: "Places confirmed",
  },
  supportedSections: allInviteSections,
  requiredSections: ["introduction", "date", "details", "location", "rsvp"],
  recommendedSections: [...specializedSections],
  sectionRhythm: [
    "introduction",
    "date",
    "details",
    "profile",
    "story",
    "gallery",
    "location",
    "rsvp",
    "outro",
  ],
  tokens: {
    light: {
      background: "#f2e6d8",
      foreground: "#211814",
      surface: "#fbf3e9",
      surfaceMuted: "#e5d4c5",
      border: "#9f7f69",
      accent: "#7b2d1d",
      accentStrong: "#5d2116",
      success: "#3e6b4a",
      warning: "#8b5b16",
      error: "#a52f35",
      focus: "#7b2d1d",
    },
    dark: {
      background: "#171310",
      foreground: "#f4e9db",
      surface: "#251d18",
      surfaceMuted: "#332720",
      border: "#74594a",
      accent: "#f1885f",
      accentStrong: "#ffb08f",
      success: "#82c49a",
      warning: "#edbd68",
      error: "#ff8d91",
      focus: "#ffb08f",
    },
  },
  composition: {
    ambientMedia: {
      audioSlot: "optional",
      controlStrategy: "external-controls",
      defaultAutoplay: false,
      mood: "A host-selected room recording or dinner playlist may begin only after explicit action.",
    },
    backgroundTreatment:
      "Warm coal and oat fields hold restrained pools of light around one continuous table line.",
    effects: emberTableEffects,
    visualSystem: {
      cardStackPolicy:
        "Keep hosts, sequence, imagery, and reply connected to one table axis; never render menu-card stacks.",
      compositionMap: "ember-table",
      imageStrategy:
        "Favor overhead tables, hands, hosts, food details, candlelit faces, and room atmosphere.",
      motionProfile: "calm",
      parallaxProfile: "hero-and-media",
    },
    hero: {
      composition: "banquet-axis",
      fullViewport: true,
      mediaTreatment:
        "A wide documentary table scene carries the room while title and key facts anchor one end.",
    },
    map: { aspect: "wide", frame: "minimal", overlay: "soft-vignette" },
    rsvpDesign: "place-setting",
    sectionDefaults: {
      date: {
        composition: "editorial-split",
        density: "compact",
        layout: "place-and-time",
        motion: "section-reveal",
      },
      details: {
        composition: "timeline",
        density: "balanced",
        layout: "evening-sequence",
        motion: "timeline-reveal",
      },
      profile: {
        composition: "layered-media",
        density: "balanced",
        layout: "host-band",
        motion: "media-reveal",
      },
      story: {
        composition: "editorial-split",
        density: "balanced",
        layout: "gathering-story",
        motion: "section-reveal",
      },
      gallery: {
        composition: "gallery-feature",
        density: "spacious",
        layout: "banquet-chapter",
        motion: "gallery-drift",
      },
      location: {
        composition: "editorial-split",
        density: "balanced",
        layout: "arrival-service",
        motion: "section-reveal",
      },
      rsvp: {
        composition: "full-bleed",
        density: "spacious",
        layout: "place-setting-reply",
        motion: "section-reveal",
      },
      outro: { composition: "full-bleed", density: "spacious", motion: "media-reveal" },
    },
  },
  radius: { sm: "0.125rem", md: "0.375rem", lg: "0.75rem" },
  typography: {
    display: "warm confident grotesk",
    body: "readable humanist sans",
    css: {
      bodyFamily: '"Nunito Variable", Nunito, ui-sans-serif, system-ui, sans-serif',
      displayFamily: '"Manrope Variable", Manrope, "Arial Narrow", ui-sans-serif, sans-serif',
      eyebrowLetterSpacing: "0.17em",
    },
    roles: {
      hero: {
        fontSize: "clamp(4rem, 10vw, 10rem)",
        fontWeight: "680",
        letterSpacing: "-0.075em",
        lineHeight: "0.82",
      },
      title: { fontWeight: "660", letterSpacing: "-0.055em" },
      label: {
        fontSize: "0.72rem",
        fontWeight: "720",
        letterSpacing: "0.15em",
        textTransform: "uppercase",
      },
    },
    scale: "restrained",
  },
  imageTreatment:
    "Warm documentary photography with retained shadow detail, natural food color, and generous room context.",
  rsvpTreatment:
    "A full-width place setting that makes capacity visible first, then keeps attendance, names, dietary answers, and notes explicit.",
  compatibility: {
    backdropStrategy:
      "Code-native coal or oat fields use a restrained central light pool with no looping flame effect.",
    fontPairing: {
      body: "readable humanist sans",
      display: "warm confident grotesk",
    },
    motionLevel: "calm",
    ornamentStrategy:
      "One long table axis, quiet place markers, and pools of light; never menus, cutlery icons, flames, or culinary clip art.",
    rendererSlots: createRendererSlots({
      fallback: [...fallbackSections],
      specialized: [...specializedSections],
    }),
  },
  dashboardPreview: {
    swatch: "#f1885f",
    summary: "Coal-brown atmosphere, documentary dining, and one continuous table axis.",
  },
  previewData: {
    eventTitle: "A Table for Twelve",
    eyebrow: "Dinner begins at eight",
    subtitle: "An intimate evening of shared plates, old stories, and a table set for the people we love.",
    venueName: "The Long Room",
    heroImageAlt: "Friends gathered around a long candlelit dinner table",
    sections: [
      {
        type: "details",
        title: "The evening",
        summary: "Welcome, supper, and a final toast move along one clear sequence.",
      },
      {
        type: "gallery",
        title: "Around the table",
        summary: "A wide room photograph leads smaller moments of hands, hosts, and shared plates.",
      },
      {
        type: "rsvp",
        title: "Pull up a chair",
        summary: "Places held and dietary details remain clear in the final reply.",
      },
    ],
  },
  accessibilityNotes: [
    "Culinary language supplements standard field labels and never replaces their meaning.",
    "Ember is not reused as an error color; every status includes explicit readable copy.",
    "Motion never simulates flames, steam, flicker, or pulsing candlelight.",
  ],
} satisfies ThemeDefinition;
