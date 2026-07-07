import type { EventType, SectionType, ThemeMode } from "@lumiere/types";

export type ThemeTokenSet = {
  background: string;
  foreground: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  accent: string;
  accentStrong: string;
  success: string;
  warning: string;
  error: string;
  focus: string;
};

export type ThemeDefinition = {
  id: ThemeId;
  label: string;
  description: string;
  designRead: string;
  supportedEventTypes: EventType[];
  supportedModes: ThemeMode[];
  defaultMode: ThemeMode;
  supportedSections: SectionType[];
  requiredSections: SectionType[];
  recommendedSections: SectionType[];
  sectionRhythm: SectionType[];
  tokens: {
    light: ThemeTokenSet;
    dark?: ThemeTokenSet;
  };
  radius: {
    sm: string;
    md: string;
    lg: string;
  };
  typography: {
    display: string;
    body: string;
    scale: "restrained" | "editorial" | "playful";
  };
  imageTreatment: string;
  rsvpTreatment: string;
  dashboardPreview: {
    swatch: string;
    summary: string;
  };
  accessibilityNotes: string[];
};

export const themeIds = ["lumiere-default", "premium", "kids", "noel"] as const;
export type ThemeId = (typeof themeIds)[number];

const publicCoreSections: SectionType[] = [
  "introduction",
  "date",
  "details",
  "location",
  "rsvp",
  "outro",
];

export const themeRegistry = {
  "lumiere-default": {
    id: "lumiere-default",
    label: "Lumiere Default",
    description: "Neutral event design that works for dinners, launches, and private gatherings.",
    designRead: "Warm modern invite with flexible spacing and practical structure.",
    supportedEventTypes: ["dinner", "launch", "private_event", "other"],
    supportedModes: ["light", "dark", "system"],
    defaultMode: "system",
    supportedSections: [...publicCoreSections, "story", "gallery", "custom"],
    requiredSections: ["introduction", "date", "location"],
    recommendedSections: [...publicCoreSections],
    sectionRhythm: [
      "introduction",
      "date",
      "details",
      "story",
      "gallery",
      "location",
      "rsvp",
      "outro",
    ],
    tokens: {
      light: {
        background: "#fffaf1",
        foreground: "#2d2118",
        surface: "#fffefd",
        surfaceMuted: "#f8ead8",
        border: "#ead8bd",
        accent: "#b97732",
        accentStrong: "#7d451f",
        success: "#247a55",
        warning: "#a56316",
        error: "#b23b3b",
        focus: "#b97732",
      },
      dark: {
        background: "#18130f",
        foreground: "#f8ead8",
        surface: "#241b15",
        surfaceMuted: "#33251b",
        border: "#4a3729",
        accent: "#dfad73",
        accentStrong: "#f3c994",
        success: "#6fc59b",
        warning: "#e2a85d",
        error: "#e78282",
        focus: "#dfad73",
      },
    },
    radius: { sm: "0.5rem", md: "0.75rem", lg: "1rem" },
    typography: {
      display: "system sans with refined tracking",
      body: "system sans",
      scale: "restrained",
    },
    imageTreatment: "Soft rectangular image slots with reserved aspect ratios.",
    rsvpTreatment: "Integrated guest-only panel using the event accent and clear max-pax copy.",
    dashboardPreview: {
      swatch: "#b97732",
      summary: "Balanced neutral base for most private events.",
    },
    accessibilityNotes: [
      "Uses off-white and off-black surfaces instead of pure extremes.",
      "Accent is paired with text labels for RSVP and status states.",
    ],
  },
  premium: {
    id: "premium",
    label: "Premium",
    description: "Editorial, intimate design for weddings, dinners, and elevated private events.",
    designRead: "Luminous editorial layout with formal pacing and restrained ceremony.",
    supportedEventTypes: ["wedding", "dinner", "private_event"],
    supportedModes: ["light", "dark", "toggleable"],
    defaultMode: "toggleable",
    supportedSections: [
      ...publicCoreSections,
      "profile",
      "story",
      "entourage",
      "dress_code",
      "gallery",
      "custom",
    ],
    requiredSections: ["introduction", "date", "location", "rsvp"],
    recommendedSections: [
      "introduction",
      "profile",
      "date",
      "story",
      "details",
      "dress_code",
      "location",
      "gallery",
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
      "location",
      "gallery",
      "rsvp",
      "outro",
    ],
    tokens: {
      light: {
        background: "#fbf6ed",
        foreground: "#241c17",
        surface: "#fffdf8",
        surfaceMuted: "#efe2cf",
        border: "#d9c7ab",
        accent: "#a36a2f",
        accentStrong: "#653b1d",
        success: "#246c50",
        warning: "#9b601b",
        error: "#a83b38",
        focus: "#a36a2f",
      },
      dark: {
        background: "#15100d",
        foreground: "#f5eadc",
        surface: "#211814",
        surfaceMuted: "#30231b",
        border: "#4a382a",
        accent: "#d8a567",
        accentStrong: "#f1c98d",
        success: "#70bf99",
        warning: "#e0a35a",
        error: "#dd7b78",
        focus: "#d8a567",
      },
    },
    radius: { sm: "0.375rem", md: "0.625rem", lg: "0.875rem" },
    typography: {
      display: "editorial display serif when selected by theme renderer",
      body: "legible sans",
      scale: "editorial",
    },
    imageTreatment: "Large editorial imagery with strong crops and generous whitespace.",
    rsvpTreatment: "Formal guest card with ceremony copy, attendee count, and field-level errors.",
    dashboardPreview: {
      swatch: "#a36a2f",
      summary: "Refined editorial theme for formal celebrations.",
    },
    accessibilityNotes: [
      "Display typography must preserve readable line height on mobile.",
      "Gold accents must not be the only status indicator.",
    ],
  },
  kids: {
    id: "kids",
    label: "Kids",
    description: "Bright but controlled party theme for birthdays and family events.",
    designRead: "Playful invite with rounded rhythm, clear details, and parent-friendly RSVP.",
    supportedEventTypes: ["birthday", "kids_party"],
    supportedModes: ["light"],
    defaultMode: "light",
    supportedSections: [...publicCoreSections, "profile", "details", "gallery", "custom"],
    requiredSections: ["introduction", "date", "location", "rsvp"],
    recommendedSections: [
      "introduction",
      "profile",
      "date",
      "details",
      "location",
      "gallery",
      "rsvp",
      "outro",
    ],
    sectionRhythm: [
      "introduction",
      "profile",
      "date",
      "details",
      "gallery",
      "location",
      "rsvp",
      "outro",
    ],
    tokens: {
      light: {
        background: "#fff8df",
        foreground: "#263238",
        surface: "#fffef8",
        surfaceMuted: "#fcecb7",
        border: "#efd88f",
        accent: "#ef7b45",
        accentStrong: "#b94d22",
        success: "#26825f",
        warning: "#b56b14",
        error: "#b43f48",
        focus: "#ef7b45",
      },
    },
    radius: { sm: "0.75rem", md: "1rem", lg: "1.25rem" },
    typography: {
      display: "rounded sans display",
      body: "friendly sans",
      scale: "playful",
    },
    imageTreatment: "Bright image slots with rounded corners and simple caption support.",
    rsvpTreatment: "Parent-friendly RSVP with clear attendee count and simple optional questions.",
    dashboardPreview: {
      swatch: "#ef7b45",
      summary: "Warm playful birthday theme without emoji-heavy UI.",
    },
    accessibilityNotes: [
      "Playful color is restrained enough for text contrast.",
      "Avoid using color alone for kids-party schedule or RSVP states.",
    ],
  },
  noel: {
    id: "noel",
    label: "Noel",
    description: "Seasonal holiday invitation for Christmas and year-end gatherings.",
    designRead: "Cozy seasonal layout with evergreen accents and warm candlelit surfaces.",
    supportedEventTypes: ["holiday", "dinner", "private_event"],
    supportedModes: ["light", "dark", "toggleable"],
    defaultMode: "toggleable",
    supportedSections: [
      ...publicCoreSections,
      "story",
      "details",
      "dress_code",
      "gallery",
      "custom",
    ],
    requiredSections: ["introduction", "date", "location"],
    recommendedSections: [
      "introduction",
      "date",
      "details",
      "dress_code",
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
        background: "#fbf4e8",
        foreground: "#1f2f28",
        surface: "#fffdf8",
        surfaceMuted: "#e9ddc5",
        border: "#cdbd9f",
        accent: "#2f6d52",
        accentStrong: "#1f4a39",
        success: "#2f6d52",
        warning: "#a36b24",
        error: "#a83b38",
        focus: "#2f6d52",
      },
      dark: {
        background: "#101a16",
        foreground: "#f4eadb",
        surface: "#182620",
        surfaceMuted: "#22352d",
        border: "#375043",
        accent: "#8bc6a6",
        accentStrong: "#bde0ca",
        success: "#8bc6a6",
        warning: "#e0a35a",
        error: "#e18480",
        focus: "#8bc6a6",
      },
    },
    radius: { sm: "0.5rem", md: "0.75rem", lg: "1rem" },
    typography: {
      display: "warm serif or humanist sans depending on renderer",
      body: "humanist sans",
      scale: "editorial",
    },
    imageTreatment: "Warm gallery frames with seasonal captions and preserved aspect ratios.",
    rsvpTreatment: "Cozy RSVP panel with clear attendance state and host message support.",
    dashboardPreview: {
      swatch: "#2f6d52",
      summary: "Seasonal holiday theme with light and candlelit dark variants.",
    },
    accessibilityNotes: [
      "Red/green seasonal cues must include text labels.",
      "Dark mode should avoid low-contrast evergreen-on-black pairings.",
    ],
  },
} satisfies Record<ThemeId, ThemeDefinition>;

export const availableThemeIds = themeIds;
export const availableThemes: ThemeDefinition[] = Object.values(themeRegistry);
