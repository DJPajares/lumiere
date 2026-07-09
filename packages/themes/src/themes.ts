import type { EventType, SectionType, ThemeMode } from "@lumiere/types";
import type {
  InviteCompositionMapId,
  ThemeMotionKind,
  ThemeMotionProfile,
  ThemeParallaxProfile,
  ThemeSectionComposition,
  ThemeSectionDensity,
} from "./composition";

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

export type ThemeSectionDefault = {
  composition: ThemeSectionComposition;
  density: ThemeSectionDensity;
  layout?: string;
  motion: ThemeMotionKind;
};

export type ThemeComposition = {
  backgroundTreatment: string;
  visualSystem: {
    cardStackPolicy: string;
    compositionMap: InviteCompositionMapId;
    imageStrategy: string;
    motionProfile: ThemeMotionProfile;
    parallaxProfile: ThemeParallaxProfile;
  };
  hero: {
    composition: "centered-media" | "editorial-split" | "layered-portrait" | "seasonal-tableau";
    fullViewport: boolean;
    mediaTreatment: string;
  };
  sectionDefaults: Partial<Record<SectionType, ThemeSectionDefault>>;
  rsvpDesign: "default" | "kids" | "noel" | "premium";
  ambientMedia: {
    audioSlot: "none" | "optional";
    controlStrategy: "external-controls" | "not-supported";
    defaultAutoplay: boolean;
    mood: string;
  };
};

export type ThemePreviewData = {
  eventTitle: string;
  eyebrow: string;
  subtitle: string;
  venueName: string;
  heroImageAlt: string;
  sections: Array<{
    summary: string;
    title: string;
    type: SectionType;
  }>;
};

export type ThemeRendererSlotDeclaration = {
  coverage: "fallback" | "specialized";
  notes: string;
};

export type ThemeCompatibilityProfile = {
  backdropStrategy: string;
  fontPairing: {
    body: string;
    display: string;
  };
  motionLevel: ThemeMotionProfile;
  ornamentStrategy: string;
  rendererSlots: Partial<Record<SectionType, ThemeRendererSlotDeclaration>>;
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
  composition: ThemeComposition;
  radius: {
    sm: string;
    md: string;
    lg: string;
  };
  typography: {
    display: string;
    body: string;
    css: {
      bodyFamily: string;
      displayFamily: string;
      eyebrowLetterSpacing: string;
    };
    scale: "restrained" | "editorial" | "playful";
  };
  imageTreatment: string;
  rsvpTreatment: string;
  compatibility: ThemeCompatibilityProfile;
  dashboardPreview: {
    swatch: string;
    summary: string;
  };
  previewData: ThemePreviewData;
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

const createRendererSlots = ({
  fallback = [],
  specialized = [],
}: {
  fallback?: SectionType[];
  specialized?: SectionType[];
}) => ({
  ...Object.fromEntries(
    specialized.map((sectionType) => [
      sectionType,
      {
        coverage: "specialized" as const,
        notes: "Theme declares a section-level composition, motion, or layout treatment.",
      },
    ]),
  ),
  ...Object.fromEntries(
    fallback.map((sectionType) => [
      sectionType,
      {
        coverage: "fallback" as const,
        notes:
          "Uses the shared public invite renderer with theme tokens and generic section layout.",
      },
    ]),
  ),
});

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
    composition: {
      ambientMedia: {
        audioSlot: "none",
        controlStrategy: "not-supported",
        defaultAutoplay: false,
        mood: "Quiet room tone only; no theme-owned audio by default.",
      },
      backgroundTreatment: "Warm parchment surface with restrained section framing.",
      visualSystem: {
        cardStackPolicy:
          "Framed sections may be the dominant rhythm for this neutral/basic theme, but image-led sections should still use intentional spacing and stable media slots.",
        compositionMap: "neutral-basic",
        imageStrategy:
          "Use real event imagery when available; otherwise reserve calm fact panels instead of fake decorative screenshots.",
        motionProfile: "calm",
        parallaxProfile: "none",
      },
      hero: {
        composition: "editorial-split",
        fullViewport: false,
        mediaTreatment: "Soft rectangular cover image beside practical event facts.",
      },
      rsvpDesign: "default",
      sectionDefaults: {
        date: {
          composition: "framed",
          density: "balanced",
          motion: "card-reveal",
        },
        gallery: {
          composition: "framed",
          density: "balanced",
          layout: "grid",
          motion: "media-reveal",
        },
        location: {
          composition: "editorial-split",
          density: "balanced",
          motion: "section-reveal",
        },
        rsvp: {
          composition: "framed",
          density: "balanced",
          motion: "section-reveal",
        },
      },
    },
    radius: { sm: "0.5rem", md: "0.75rem", lg: "1rem" },
    typography: {
      display: "system sans with refined tracking",
      body: "system sans",
      css: {
        bodyFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        displayFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        eyebrowLetterSpacing: "0.16em",
      },
      scale: "restrained",
    },
    imageTreatment: "Soft rectangular image slots with reserved aspect ratios.",
    rsvpTreatment: "Integrated guest-only panel using the event accent and clear max-pax copy.",
    compatibility: {
      backdropStrategy: "Warm parchment surfaces with restrained full-width bands.",
      fontPairing: {
        body: "system sans",
        display: "system sans",
      },
      motionLevel: "calm",
      ornamentStrategy: "No decorative ornaments beyond warm surface shifts and image/fact panels.",
      rendererSlots: createRendererSlots({
        fallback: ["introduction", "details", "outro", "story", "custom"],
        specialized: ["date", "gallery", "location", "rsvp"],
      }),
    },
    dashboardPreview: {
      swatch: "#b97732",
      summary: "Balanced neutral base for most private events.",
    },
    previewData: {
      eventTitle: "Dinner at Dusk",
      eyebrow: "Private invitation",
      heroImageAlt: "Long dinner table in warm evening light",
      sections: [
        {
          summary: "A clear event opening with date, venue, and host context.",
          title: "Welcome",
          type: "introduction",
        },
        {
          summary: "Practical timing and location sections with gentle framing.",
          title: "The evening",
          type: "details",
        },
        {
          summary: "Guest-only RSVP stays simple and readable.",
          title: "Reply",
          type: "rsvp",
        },
      ],
      subtitle: "A warm, flexible design for private gatherings.",
      venueName: "The Lantern Room",
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
    composition: {
      ambientMedia: {
        audioSlot: "optional",
        controlStrategy: "external-controls",
        defaultAutoplay: false,
        mood: "Soft instrumental or venue ambience, controlled outside visual sections.",
      },
      backgroundTreatment:
        "Layered ivory field with candlelit radial light, editorial whitespace, and media-led section breaks.",
      visualSystem: {
        cardStackPolicy:
          "Use framed panels only for compact utility details; the page rhythm must mix full-bleed, editorial, timeline, gallery, and layered-media moments.",
        compositionMap: "wedding-editorial",
        imageStrategy:
          "Prioritize real editorial portrait, venue, and gallery imagery with large inspectable slots and graceful fact-panel fallbacks.",
        motionProfile: "immersive",
        parallaxProfile: "hero-and-media",
      },
      hero: {
        composition: "layered-portrait",
        fullViewport: true,
        mediaTreatment:
          "Tall portrait media with offset frame, depth shadow, and subtle parallax hooks.",
      },
      rsvpDesign: "premium",
      sectionDefaults: {
        date: {
          composition: "full-bleed",
          density: "spacious",
          motion: "section-reveal",
        },
        details: {
          composition: "editorial-split",
          density: "balanced",
          motion: "section-reveal",
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
          density: "spacious",
          layout: "masonry",
          motion: "media-reveal",
        },
        location: {
          composition: "editorial-split",
          density: "spacious",
          motion: "media-reveal",
        },
        outro: {
          composition: "layered-media",
          density: "spacious",
          layout: "editorial",
          motion: "media-reveal",
        },
        profile: {
          composition: "editorial-split",
          density: "balanced",
          layout: "split",
          motion: "media-reveal",
        },
        rsvp: {
          composition: "full-bleed",
          density: "spacious",
          motion: "section-reveal",
        },
        story: {
          composition: "timeline",
          density: "spacious",
          layout: "timeline",
          motion: "timeline-reveal",
        },
      },
    },
    radius: { sm: "0.375rem", md: "0.625rem", lg: "0.875rem" },
    typography: {
      display: "editorial display serif when selected by theme renderer",
      body: "legible sans",
      css: {
        bodyFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        displayFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
        eyebrowLetterSpacing: "0.22em",
      },
      scale: "editorial",
    },
    imageTreatment: "Large editorial imagery with strong crops and generous whitespace.",
    rsvpTreatment: "Formal guest card with ceremony copy, attendee count, and field-level errors.",
    compatibility: {
      backdropStrategy:
        "Layered ivory and candlelit radial fields with full-viewport hero and media chapters.",
      fontPairing: {
        body: "legible sans",
        display: "editorial serif",
      },
      motionLevel: "immersive",
      ornamentStrategy:
        "Editorial frames, portrait depth, and light fields; no logo-as-ornament treatment.",
      rendererSlots: createRendererSlots({
        fallback: ["introduction", "custom"],
        specialized: [
          "date",
          "details",
          "dress_code",
          "entourage",
          "gallery",
          "location",
          "outro",
          "profile",
          "rsvp",
          "story",
        ],
      }),
    },
    dashboardPreview: {
      swatch: "#a36a2f",
      summary: "Refined editorial theme for formal celebrations.",
    },
    previewData: {
      eventTitle: "Amara & Jules",
      eyebrow: "You are invited",
      heroImageAlt: "Formal garden portrait framed by warm archways",
      sections: [
        {
          summary: "Full-viewport opening with portrait media and ceremony pacing.",
          title: "Opening portrait",
          type: "introduction",
        },
        {
          summary: "Story, date, and venue alternate between timeline and editorial compositions.",
          title: "The celebration",
          type: "story",
        },
        {
          summary: "Gallery and RSVP become feature moments instead of utility cards.",
          title: "Gallery and reply",
          type: "gallery",
        },
      ],
      subtitle: "An intimate garden celebration with candlelit rhythm.",
      venueName: "Emerald Gardens",
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
    composition: {
      ambientMedia: {
        audioSlot: "optional",
        controlStrategy: "external-controls",
        defaultAutoplay: false,
        mood: "Light playful background music can be offered with explicit controls.",
      },
      backgroundTreatment:
        "Sunny layered paper fields, rounded image frames, and energetic but readable spacing.",
      visualSystem: {
        cardStackPolicy:
          "Parent-facing details can stay framed, while hero and gallery should feel image-led and celebratory rather than like repeated cards.",
        compositionMap: "birthday-feature",
        imageStrategy:
          "Use a clear celebrant or party image first, with bright fallback fact panels for schedule and guardian notes.",
        motionProfile: "playful",
        parallaxProfile: "hero-only",
      },
      hero: {
        composition: "centered-media",
        fullViewport: true,
        mediaTreatment:
          "Bright celebrant image with large rounded corners and simple caption space.",
      },
      rsvpDesign: "kids",
      sectionDefaults: {
        date: {
          composition: "framed",
          density: "balanced",
          motion: "card-reveal",
        },
        details: {
          composition: "framed",
          density: "balanced",
          motion: "card-reveal",
        },
        gallery: {
          composition: "gallery-feature",
          density: "balanced",
          layout: "grid",
          motion: "media-reveal",
        },
        location: {
          composition: "framed",
          density: "balanced",
          motion: "section-reveal",
        },
        profile: {
          composition: "framed",
          density: "balanced",
          layout: "cards",
          motion: "card-reveal",
        },
        rsvp: {
          composition: "framed",
          density: "balanced",
          motion: "section-reveal",
        },
      },
    },
    radius: { sm: "0.75rem", md: "1rem", lg: "1.25rem" },
    typography: {
      display: "rounded sans display",
      body: "friendly sans",
      css: {
        bodyFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        displayFamily:
          'ui-rounded, "Arial Rounded MT Bold", ui-sans-serif, system-ui, -apple-system, sans-serif',
        eyebrowLetterSpacing: "0.12em",
      },
      scale: "playful",
    },
    imageTreatment: "Bright image slots with rounded corners and simple caption support.",
    rsvpTreatment: "Parent-friendly RSVP with clear attendee count and simple optional questions.",
    compatibility: {
      backdropStrategy: "Sunny paper fields with rounded media and practical parent-facing panels.",
      fontPairing: {
        body: "friendly sans",
        display: "rounded sans",
      },
      motionLevel: "playful",
      ornamentStrategy:
        "Rounded panels and bright image framing only; avoids emoji-heavy decorative clutter.",
      rendererSlots: createRendererSlots({
        fallback: ["introduction", "outro", "custom"],
        specialized: ["date", "details", "gallery", "location", "profile", "rsvp"],
      }),
    },
    dashboardPreview: {
      swatch: "#ef7b45",
      summary: "Warm playful birthday theme without emoji-heavy UI.",
    },
    previewData: {
      eventTitle: "Mika Turns Seven",
      eyebrow: "Birthday party",
      heroImageAlt: "Child smiling at a bright birthday table",
      sections: [
        {
          summary: "Playful hero for celebrant details and party energy.",
          title: "Party start",
          type: "introduction",
        },
        {
          summary: "Parent-friendly schedule, venue, and notes stay easy to scan.",
          title: "Party details",
          type: "details",
        },
        {
          summary: "RSVP copy is casual while max pax remains clear.",
          title: "Family reply",
          type: "rsvp",
        },
      ],
      subtitle: "A cheerful party design that stays clear for parents.",
      venueName: "Sunbeam Studio",
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
    composition: {
      ambientMedia: {
        audioSlot: "optional",
        controlStrategy: "external-controls",
        defaultAutoplay: false,
        mood: "Warm acoustic holiday music with guest-controlled playback.",
      },
      backgroundTreatment:
        "Evergreen and candlelight layers with cozy framed details, never emoji-heavy clutter.",
      visualSystem: {
        cardStackPolicy:
          "Use cozy framed details selectively; seasonal hero, gallery, and story moments should carry depth and atmosphere.",
        compositionMap: "wedding-editorial",
        imageStrategy:
          "Prefer real table, venue, or gathering imagery with warm captions; missing media becomes a candlelit fact rail, not festive clutter.",
        motionProfile: "seasonal",
        parallaxProfile: "story-depth",
      },
      hero: {
        composition: "seasonal-tableau",
        fullViewport: true,
        mediaTreatment: "Warm table or gathering image with evergreen framing and soft light.",
      },
      rsvpDesign: "noel",
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
    radius: { sm: "0.5rem", md: "0.75rem", lg: "1rem" },
    typography: {
      display: "warm serif or humanist sans depending on renderer",
      body: "humanist sans",
      css: {
        bodyFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        displayFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
        eyebrowLetterSpacing: "0.18em",
      },
      scale: "editorial",
    },
    imageTreatment: "Warm gallery frames with seasonal captions and preserved aspect ratios.",
    rsvpTreatment: "Cozy RSVP panel with clear attendance state and host message support.",
    compatibility: {
      backdropStrategy: "Evergreen and candlelit surfaces with cozy full-width seasonal chapters.",
      fontPairing: {
        body: "humanist sans",
        display: "warm serif",
      },
      motionLevel: "seasonal",
      ornamentStrategy:
        "Seasonal light, evergreen framing, and warm tablescape cues without festive clutter.",
      rendererSlots: createRendererSlots({
        fallback: ["introduction", "outro", "custom"],
        specialized: ["date", "details", "dress_code", "gallery", "location", "rsvp", "story"],
      }),
    },
    dashboardPreview: {
      swatch: "#2f6d52",
      summary: "Seasonal holiday theme with light and candlelit dark variants.",
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
    ],
  },
} satisfies Record<ThemeId, ThemeDefinition>;

export const availableThemeIds = themeIds;
export const availableThemes: ThemeDefinition[] = Object.values(themeRegistry);
