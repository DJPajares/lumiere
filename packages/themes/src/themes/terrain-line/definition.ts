import type { ThemeDefinition } from "../../contracts";
import { allInviteSections, createRendererSlots } from "../../theme-shared";
import { terrainLineEffects, terrainLinePresentation } from "./visual";

const specializedSections = [
  "introduction",
  "date",
  "details",
  "story",
  "location",
  "gallery",
  "rsvp",
  "outro",
] as const;
const fallbackSections = ["profile", "entourage", "dress_code", "custom"] as const;

export const terrainLineTheme = {
  id: "terrain-line",
  label: "Terrain Line",
  description:
    "A place-led invitation shaped by contour geometry, documentary photography, and a vertically unfolding itinerary.",
  designRead:
    "A route through landscape in pine, slate, sand, and ember with numbered waypoints, practical location intelligence, and rugged humanist type.",
  supportedEventTypes: ["wedding", "birthday", "dinner", "launch", "private_event", "other"],
  supportedModes: ["light", "dark", "system", "toggleable"],
  defaultMode: "system",
  presentation: terrainLinePresentation,
  modeToggle: {
    defaultPreference: "system",
    labels: { control: "Terrain appearance", dark: "Night trail", light: "Day trail" },
    placement: "top-start",
    style: "terrain",
  },
  rsvpCopy: {
    acceptLabel: "Meet at basecamp",
    attendancePrompt: "Will your party make the route?",
    declineLabel: "Cannot join",
    eyebrow: "Basecamp reply",
    sectionDescription: "Confirm who is taking this route with us.",
    sectionTitle: "Final waypoint",
    submitLabel: "Set response",
    successDescription: "Your party is marked on the route.",
    successTitle: "Waypoint confirmed",
  },
  supportedSections: allInviteSections,
  requiredSections: ["introduction", "date", "location", "rsvp"],
  recommendedSections: [...specializedSections],
  sectionRhythm: [
    "introduction",
    "date",
    "details",
    "profile",
    "story",
    "dress_code",
    "gallery",
    "location",
    "rsvp",
    "outro",
  ],
  tokens: {
    light: {
      background: "#ebe4d4",
      foreground: "#253833",
      surface: "#f5f0e5",
      surfaceMuted: "#d4cfbd",
      border: "#7d897a",
      accent: "#356348",
      accentStrong: "#244a36",
      success: "#32674a",
      warning: "#925827",
      error: "#9b3e3c",
      focus: "#b14c2f",
    },
    dark: {
      background: "#172722",
      foreground: "#eee6d4",
      surface: "#213630",
      surfaceMuted: "#2e4941",
      border: "#667a6d",
      accent: "#9cc29d",
      accentStrong: "#c7ddba",
      success: "#8cc49f",
      warning: "#e7b271",
      error: "#e78d88",
      focus: "#f09a69",
    },
  },
  composition: {
    ambientMedia: {
      audioSlot: "optional",
      controlStrategy: "external-controls",
      defaultAutoplay: false,
      mood: "Natural room tone or restrained instrumental audio may use explicit guest controls.",
    },
    backgroundTreatment:
      "Pine and sand fields with sparse contour geometry, one ember route signal, and no archival paper treatment.",
    effects: terrainLineEffects,
    visualSystem: {
      cardStackPolicy:
        "Use one continuous itinerary spine with open waypoint fields; avoid a grid of map and utility cards.",
      compositionMap: "terrain-line",
      imageStrategy:
        "Use natural documentary color, broad landscape crops, and inset human moments with useful captions.",
      motionProfile: "calm",
      parallaxProfile: "story-depth",
    },
    hero: {
      composition: "route-led",
      fullViewport: true,
      mediaTreatment:
        "A landscape or venue crop sits beside title, date, and one explicit origin marker.",
    },
    map: { aspect: "wide", frame: "organic", overlay: "soft-vignette" },
    rsvpDesign: "basecamp",
    sectionDefaults: {
      date: {
        composition: "full-bleed",
        density: "compact",
        layout: "origin-bearing",
        motion: "route-progress",
      },
      details: {
        composition: "timeline",
        density: "balanced",
        layout: "itinerary-spine",
        motion: "route-progress",
      },
      dress_code: { composition: "framed", density: "compact", motion: "section-reveal" },
      entourage: { composition: "timeline", density: "balanced", motion: "route-progress" },
      gallery: {
        composition: "gallery-feature",
        density: "spacious",
        layout: "documentary-field",
        motion: "media-reveal",
      },
      location: {
        composition: "editorial-split",
        density: "balanced",
        layout: "destination-chapter",
        motion: "route-progress",
      },
      outro: { composition: "full-bleed", density: "spacious", motion: "route-progress" },
      profile: { composition: "editorial-split", density: "balanced", motion: "media-reveal" },
      rsvp: {
        composition: "full-bleed",
        density: "balanced",
        layout: "basecamp-reply",
        motion: "route-progress",
      },
      story: { composition: "layered-media", density: "spacious", motion: "media-reveal" },
    },
  },
  radius: { sm: "0.2rem", md: "0.45rem", lg: "0.8rem" },
  typography: {
    display: "sturdy humanist sans",
    body: "humanist sans with utility mono labels",
    css: {
      bodyFamily: '"Manrope Variable", Manrope, ui-sans-serif, system-ui, sans-serif',
      displayFamily: '"Nunito Variable", Nunito, ui-sans-serif, system-ui, sans-serif',
      eyebrowLetterSpacing: "0.18em",
    },
    roles: {
      hero: {
        fontSize: "clamp(3.7rem, 9vw, 8.8rem)",
        fontWeight: "650",
        letterSpacing: "-0.06em",
        lineHeight: "0.84",
      },
      label: {
        fontFamily: "body",
        fontSize: "0.7rem",
        letterSpacing: "0.16em",
        textTransform: "uppercase",
      },
      title: {
        fontSize: "clamp(2.8rem, 6vw, 6.2rem)",
        letterSpacing: "-0.045em",
        lineHeight: "0.9",
      },
    },
    scale: "restrained",
  },
  imageTreatment:
    "Natural documentary color, broad landscape crops, inset human moments, and descriptive captions without vintage filters.",
  rsvpTreatment:
    "A basecamp reply at the route end with visible capacity, strong focus, local errors, preserved recovery, and a stable confirmed marker.",
  compatibility: {
    backdropStrategy:
      "Code-native contour geometry over pine, slate, or sand fields; no faux paper, archival poster, or literal consumer map UI.",
    fontPairing: {
      body: "humanist sans with utility mono labels",
      display: "sturdy humanist sans",
    },
    motionLevel: "calm",
    ornamentStrategy:
      "Sparse contour lines and numbered waypoints kept outside text and map controls.",
    rendererSlots: createRendererSlots({
      fallback: [...fallbackSections],
      specialized: [...specializedSections],
    }),
  },
  dashboardPreview: {
    swatch: "#356348",
    summary: "A contour field, itinerary spine, documentary crop, and final basecamp marker.",
  },
  previewData: {
    eventTitle: "North Ridge Supper",
    eyebrow: "Origin / 18:30",
    subtitle: "Dinner follows the ridge from first light at the quarry to the long table.",
    venueName: "Quarry Overlook",
    heroImageAlt: "A long outdoor table overlooking a wooded ridge",
    sections: [
      {
        type: "details",
        title: "The route",
        summary: "Arrival, drinks, and dinner unfold along one numbered itinerary spine.",
      },
      {
        type: "location",
        title: "Quarry Overlook",
        summary: "Destination facts and directions share one stable place-led chapter.",
      },
      {
        type: "rsvp",
        title: "Final waypoint",
        summary: "Party capacity and response status settle at the basecamp close.",
      },
    ],
  },
  accessibilityNotes: [
    "Contour lines remain decorative and never cross essential copy, faces, or map controls.",
    "Waypoints include numbers and text; ember never carries state alone.",
    "Reduced motion leaves the complete route spine visible in natural document order.",
  ],
} satisfies ThemeDefinition;
