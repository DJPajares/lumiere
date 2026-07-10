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

export const themeIds = [
  "lumiere-default",
  "premium",
  "kids",
  "noel",
  "editorial-ivory",
  "garden-light",
  "modern-minimal",
  "celestial-gold",
] as const;
export type ThemeId = (typeof themeIds)[number];

const publicCoreSections: SectionType[] = [
  "introduction",
  "date",
  "details",
  "location",
  "rsvp",
  "outro",
];

const allInviteSections: SectionType[] = [
  ...publicCoreSections,
  "profile",
  "story",
  "entourage",
  "dress_code",
  "gallery",
  "custom",
];

const expansionEventTypes: EventType[] = ["wedding", "birthday", "private_event", "other"];

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
    designRead:
      "Cinematic wedding editorial with portrait-led hierarchy, spacious ceremony, and an invitation-native reply.",
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
  "editorial-ivory": {
    id: "editorial-ivory",
    label: "Editorial Ivory",
    description:
      "Print-inspired invitation with quiet asymmetry for weddings, birthdays, and private celebrations.",
    designRead:
      "Ivory editorial spread with tall portrait crops, sharp rules, and generous negative space.",
    supportedEventTypes: [...expansionEventTypes, "dinner"],
    supportedModes: ["light", "dark", "toggleable"],
    defaultMode: "toggleable",
    supportedSections: allInviteSections,
    requiredSections: ["introduction", "date", "location", "rsvp"],
    recommendedSections: [
      "introduction",
      "profile",
      "date",
      "story",
      "details",
      "gallery",
      "location",
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
      "gallery",
      "location",
      "rsvp",
      "outro",
    ],
    tokens: {
      light: {
        background: "#f5f0e7",
        foreground: "#221f1a",
        surface: "#fbf8f1",
        surfaceMuted: "#e7dfd2",
        border: "#bdb3a4",
        accent: "#8a4f38",
        accentStrong: "#623322",
        success: "#356b52",
        warning: "#8c5b20",
        error: "#9b403c",
        focus: "#8a4f38",
      },
      dark: {
        background: "#191713",
        foreground: "#eee8dd",
        surface: "#24211c",
        surfaceMuted: "#312d26",
        border: "#514a40",
        accent: "#d2977c",
        accentStrong: "#efbda3",
        success: "#79b397",
        warning: "#d4a25f",
        error: "#db8580",
        focus: "#d2977c",
      },
    },
    composition: {
      ambientMedia: {
        audioSlot: "optional",
        controlStrategy: "external-controls",
        defaultAutoplay: false,
        mood: "Quiet chamber music or room ambience with explicit guest controls.",
      },
      backgroundTreatment:
        "Uncoated ivory paper, hairline folio rules, and offset editorial columns.",
      visualSystem: {
        cardStackPolicy:
          "Sections read as one print sequence; practical content uses rules and columns rather than floating cards.",
        compositionMap: "ivory-editorial",
        imageStrategy:
          "Use tall portrait and documentary crops with restrained captions and useful text fallbacks.",
        motionProfile: "immersive",
        parallaxProfile: "hero-and-media",
      },
      hero: {
        composition: "editorial-split",
        fullViewport: true,
        mediaTreatment: "Tall offset portrait with a fine border and page-number caption.",
      },
      rsvpDesign: "premium",
      sectionDefaults: {
        date: { composition: "full-bleed", density: "spacious", motion: "section-reveal" },
        details: {
          composition: "editorial-split",
          density: "balanced",
          motion: "section-reveal",
        },
        dress_code: { composition: "framed", density: "compact", motion: "card-reveal" },
        entourage: {
          composition: "editorial-split",
          density: "balanced",
          motion: "section-reveal",
        },
        gallery: {
          composition: "gallery-feature",
          density: "spacious",
          layout: "feature",
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
          motion: "media-reveal",
        },
        profile: {
          composition: "editorial-split",
          density: "spacious",
          layout: "offset",
          motion: "media-reveal",
        },
        rsvp: { composition: "full-bleed", density: "spacious", motion: "section-reveal" },
        story: {
          composition: "timeline",
          density: "spacious",
          layout: "folio-rail",
          motion: "timeline-reveal",
        },
      },
    },
    radius: { sm: "0.125rem", md: "0.25rem", lg: "0.375rem" },
    typography: {
      display: "high-contrast editorial serif",
      body: "neutral sans",
      css: {
        bodyFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        displayFamily: 'Iowan Old Style, Baskerville, "Times New Roman", ui-serif, serif',
        eyebrowLetterSpacing: "0.24em",
      },
      scale: "editorial",
    },
    imageTreatment:
      "Tall magazine crops, fine rules, visible captions, and reserved aspect-ratio fallbacks.",
    rsvpTreatment: "A ruled reply chapter with formal copy and no detached transaction card.",
    compatibility: {
      backdropStrategy: "Uncoated ivory field with page rules and asymmetric whitespace.",
      fontPairing: { body: "neutral sans", display: "high-contrast editorial serif" },
      motionLevel: "immersive",
      ornamentStrategy:
        "Folio numbers, crop-line spacing, and typographic rules only; no ornamental flourishes.",
      rendererSlots: createRendererSlots({ specialized: allInviteSections }),
    },
    dashboardPreview: {
      swatch: "#8a4f38",
      summary: "Ivory print editorial with offset portrait and ruled section rhythm.",
    },
    previewData: {
      eventTitle: "Mara & Leon",
      eyebrow: "Issue No. 06 · Celebration",
      subtitle: "A late-summer gathering told as an intimate editorial.",
      venueName: "The Reading Room",
      heroImageAlt: "Couple standing beside tall windows in soft afternoon light",
      sections: [
        {
          type: "profile",
          title: "The hosts",
          summary: "An offset portrait and short introduction establish the people at the center.",
        },
        {
          type: "story",
          title: "In sequence",
          summary: "Story and schedule share one continuous ruled timeline.",
        },
        {
          type: "rsvp",
          title: "Your reply",
          summary: "The response closes the editorial as a spacious final chapter.",
        },
      ],
    },
    accessibilityNotes: [
      "Hairlines are decorative and never the only boundary for controls.",
      "Serif display sizes collapse carefully to preserve readable mobile line lengths.",
    ],
  },
  "garden-light": {
    id: "garden-light",
    label: "Garden Light",
    description:
      "Sunlit organic invitation for garden weddings, birthdays, and relaxed private events.",
    designRead:
      "Airy garden composition with dappled light, sage fields, and gently layered photography.",
    supportedEventTypes: [...expansionEventTypes, "dinner"],
    supportedModes: ["light", "dark", "toggleable"],
    defaultMode: "toggleable",
    supportedSections: allInviteSections,
    requiredSections: ["introduction", "date", "location", "rsvp"],
    recommendedSections: [
      "introduction",
      "date",
      "profile",
      "details",
      "story",
      "location",
      "gallery",
      "rsvp",
      "outro",
    ],
    sectionRhythm: [
      "introduction",
      "date",
      "profile",
      "details",
      "story",
      "dress_code",
      "entourage",
      "location",
      "gallery",
      "rsvp",
      "outro",
    ],
    tokens: {
      light: {
        background: "#f4f2e8",
        foreground: "#253128",
        surface: "#fbfaf3",
        surfaceMuted: "#dfe7d8",
        border: "#b7c5ae",
        accent: "#b35f43",
        accentStrong: "#7f3f2c",
        success: "#3f7557",
        warning: "#976922",
        error: "#a5443f",
        focus: "#b35f43",
      },
      dark: {
        background: "#142019",
        foreground: "#edf0e6",
        surface: "#1e2c23",
        surfaceMuted: "#2a3b2f",
        border: "#46604d",
        accent: "#e59a7d",
        accentStrong: "#ffc3a9",
        success: "#86c39c",
        warning: "#dfb46c",
        error: "#e28b85",
        focus: "#e59a7d",
      },
    },
    composition: {
      ambientMedia: {
        audioSlot: "optional",
        controlStrategy: "external-controls",
        defaultAutoplay: false,
        mood: "Light acoustic or garden ambience, always started by the guest.",
      },
      backgroundTreatment:
        "Warm daylight canvas with soft sage fields and restrained dappled radial light.",
      visualSystem: {
        cardStackPolicy:
          "Use broad organic bands and layered image moments; reserve framed panels for reply and compact facts.",
        compositionMap: "garden-celebration",
        imageStrategy:
          "Lead with real outdoor or celebrant imagery, using airy crops and botanical-color fact fields when absent.",
        motionProfile: "playful",
        parallaxProfile: "hero-only",
      },
      hero: {
        composition: "centered-media",
        fullViewport: true,
        mediaTreatment: "Wide sunlit image with an organic arch radius and soft edge highlight.",
      },
      rsvpDesign: "default",
      sectionDefaults: {
        date: { composition: "full-bleed", density: "balanced", motion: "section-reveal" },
        details: {
          composition: "editorial-split",
          density: "balanced",
          motion: "section-reveal",
        },
        dress_code: { composition: "framed", density: "balanced", motion: "card-reveal" },
        entourage: {
          composition: "editorial-split",
          density: "balanced",
          motion: "section-reveal",
        },
        gallery: {
          composition: "gallery-feature",
          density: "spacious",
          layout: "airy-feature",
          motion: "gallery-drift",
        },
        location: {
          composition: "editorial-split",
          density: "balanced",
          motion: "media-reveal",
        },
        outro: {
          composition: "layered-media",
          density: "spacious",
          motion: "media-reveal",
        },
        profile: {
          composition: "editorial-split",
          density: "balanced",
          layout: "organic-split",
          motion: "media-reveal",
        },
        rsvp: { composition: "framed", density: "balanced", motion: "section-reveal" },
        story: {
          composition: "layered-media",
          density: "spacious",
          layout: "garden-path",
          motion: "media-reveal",
        },
      },
    },
    radius: { sm: "0.75rem", md: "1.25rem", lg: "2rem" },
    typography: {
      display: "soft humanist serif",
      body: "open humanist sans",
      css: {
        bodyFamily: 'Optima, Candara, "Noto Sans", ui-sans-serif, system-ui, sans-serif',
        displayFamily: 'Charter, "Bitstream Charter", Georgia, ui-serif, serif',
        eyebrowLetterSpacing: "0.14em",
      },
      scale: "playful",
    },
    imageTreatment:
      "Sunlit landscape and portrait crops with organic arches, preserved subjects, and airy captions.",
    rsvpTreatment: "Friendly garden reply panel grounded after the image-led invitation chapters.",
    compatibility: {
      backdropStrategy: "Dappled daylight fields, soft sage bands, and generous open space.",
      fontPairing: { body: "open humanist sans", display: "soft humanist serif" },
      motionLevel: "playful",
      ornamentStrategy:
        "Organic border arcs and leaf-like negative space only; avoids literal botanical clip art.",
      rendererSlots: createRendererSlots({ specialized: allInviteSections }),
    },
    dashboardPreview: {
      swatch: "#b35f43",
      summary: "Sunlit garden rhythm with sage fields and softly arched photography.",
    },
    previewData: {
      eventTitle: "Sunday in Bloom",
      eyebrow: "A garden celebration",
      subtitle: "Lunch, music, and warm light beneath the old trees.",
      venueName: "Willow Courtyard",
      heroImageAlt: "Long garden table beneath leafy trees in afternoon light",
      sections: [
        {
          type: "details",
          title: "The afternoon",
          summary: "Arrival, lunch, and music sit beside a light garden image rail.",
        },
        {
          type: "story",
          title: "Along the path",
          summary: "Softly layered photography gives the invitation an unhurried rhythm.",
        },
        {
          type: "location",
          title: "Willow Courtyard",
          summary: "Venue and arrival guidance remain practical within the organic layout.",
        },
      ],
    },
    accessibilityNotes: [
      "Dappled backgrounds stay behind decoration and never reduce text contrast.",
      "Organic shapes collapse to simple rounded frames on narrow viewports.",
    ],
  },
  "modern-minimal": {
    id: "modern-minimal",
    label: "Modern Minimal",
    description:
      "Strict typographic grid for contemporary weddings, birthdays, and private gatherings.",
    designRead:
      "Hard-edged modernist system with numbered facts, disciplined whitespace, and one cobalt signal.",
    supportedEventTypes: [...expansionEventTypes, "launch"],
    supportedModes: ["light", "dark", "system"],
    defaultMode: "system",
    supportedSections: allInviteSections,
    requiredSections: ["introduction", "date", "location", "rsvp"],
    recommendedSections: [
      "introduction",
      "date",
      "details",
      "profile",
      "location",
      "gallery",
      "rsvp",
      "outro",
    ],
    sectionRhythm: [
      "introduction",
      "date",
      "details",
      "profile",
      "story",
      "entourage",
      "dress_code",
      "location",
      "gallery",
      "rsvp",
      "outro",
    ],
    tokens: {
      light: {
        background: "#f3f3ef",
        foreground: "#171816",
        surface: "#fafaf7",
        surfaceMuted: "#e2e3de",
        border: "#a7aaa3",
        accent: "#2457d6",
        accentStrong: "#153786",
        success: "#277053",
        warning: "#8c641d",
        error: "#a33d3d",
        focus: "#2457d6",
      },
      dark: {
        background: "#141514",
        foreground: "#eeefea",
        surface: "#1d1f1d",
        surfaceMuted: "#292c29",
        border: "#50544f",
        accent: "#7e9ff6",
        accentStrong: "#b3c6ff",
        success: "#75b597",
        warning: "#d4ae68",
        error: "#dc8585",
        focus: "#7e9ff6",
      },
    },
    composition: {
      ambientMedia: {
        audioSlot: "none",
        controlStrategy: "not-supported",
        defaultAutoplay: false,
        mood: "Silent by design so type, spacing, and event facts carry the experience.",
      },
      backgroundTreatment:
        "Flat off-white or graphite plane with strict rules and no decorative texture.",
      visualSystem: {
        cardStackPolicy:
          "Use one continuous twelve-column system; borders organize information without creating a deck of cards.",
        compositionMap: "minimal-modern",
        imageStrategy:
          "Use one hard-edged image plane at a time with objective captions and no decorative overlays.",
        motionProfile: "calm",
        parallaxProfile: "none",
      },
      hero: {
        composition: "editorial-split",
        fullViewport: true,
        mediaTreatment: "One flush rectangular crop aligned to a strict typographic grid.",
      },
      rsvpDesign: "default",
      sectionDefaults: {
        date: { composition: "full-bleed", density: "compact", motion: "section-reveal" },
        details: {
          composition: "timeline",
          density: "compact",
          layout: "numbered-grid",
          motion: "section-reveal",
        },
        dress_code: { composition: "framed", density: "compact", motion: "section-reveal" },
        entourage: {
          composition: "editorial-split",
          density: "compact",
          motion: "section-reveal",
        },
        gallery: {
          composition: "gallery-feature",
          density: "balanced",
          layout: "hard-grid",
          motion: "media-reveal",
        },
        location: {
          composition: "editorial-split",
          density: "compact",
          motion: "section-reveal",
        },
        outro: { composition: "full-bleed", density: "compact", motion: "section-reveal" },
        profile: {
          composition: "editorial-split",
          density: "compact",
          layout: "hard-grid",
          motion: "section-reveal",
        },
        rsvp: {
          composition: "editorial-split",
          density: "compact",
          motion: "section-reveal",
        },
        story: {
          composition: "timeline",
          density: "balanced",
          layout: "numbered-rail",
          motion: "timeline-reveal",
        },
      },
    },
    radius: { sm: "0", md: "0.125rem", lg: "0.25rem" },
    typography: {
      display: "modern grotesk sans",
      body: "neutral system sans",
      css: {
        bodyFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        displayFamily: '"Helvetica Neue", Helvetica, Arial, ui-sans-serif, sans-serif',
        eyebrowLetterSpacing: "0.2em",
      },
      scale: "restrained",
    },
    imageTreatment:
      "Unrounded documentary crops locked to the grid with compact, objective captions.",
    rsvpTreatment: "A direct two-column reply area using rules, labels, and one cobalt action.",
    compatibility: {
      backdropStrategy: "Flat off-white or graphite plane with visible grid alignment.",
      fontPairing: { body: "neutral system sans", display: "modern grotesk sans" },
      motionLevel: "calm",
      ornamentStrategy:
        "Numbered labels and structural rules only; no flourishes, texture, glow, or illustration.",
      rendererSlots: createRendererSlots({ specialized: allInviteSections }),
    },
    dashboardPreview: {
      swatch: "#2457d6",
      summary: "Hard-edged typographic grid with numbered facts and a cobalt signal.",
    },
    previewData: {
      eventTitle: "Studio 08",
      eyebrow: "Private event · 19:30",
      subtitle: "Dinner, conversation, and a concise sequence of details.",
      venueName: "North Assembly",
      heroImageAlt: "Concrete event space with a long table and clean architectural lines",
      sections: [
        {
          type: "date",
          title: "01 / Time",
          summary: "The date becomes a full-width typographic marker in the shared grid.",
        },
        {
          type: "details",
          title: "02 / Sequence",
          summary: "Facts read as numbered rows instead of separate utility cards.",
        },
        {
          type: "rsvp",
          title: "03 / Reply",
          summary: "The final action stays direct, aligned, and free of decorative framing.",
        },
      ],
    },
    accessibilityNotes: [
      "Thin rules supplement spacing and headings rather than carrying structure alone.",
      "The cobalt action retains a visible text label and high-contrast focus outline.",
    ],
  },
  "celestial-gold": {
    id: "celestial-gold",
    label: "Celestial Gold",
    description:
      "Luminous evening invitation for formal celebrations, birthdays, and private events.",
    designRead:
      "Midnight cinematic composition with warm gold type, orbital hairlines, and measured depth.",
    supportedEventTypes: [...expansionEventTypes, "dinner", "holiday"],
    supportedModes: ["light", "dark", "toggleable"],
    defaultMode: "dark",
    supportedSections: allInviteSections,
    requiredSections: ["introduction", "date", "location", "rsvp"],
    recommendedSections: [
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
      "outro",
    ],
    tokens: {
      light: {
        background: "#f2eee4",
        foreground: "#19192a",
        surface: "#faf7ef",
        surfaceMuted: "#e1dacb",
        border: "#b8ab91",
        accent: "#9a6d24",
        accentStrong: "#684614",
        success: "#306d55",
        warning: "#8e5e18",
        error: "#9f3f42",
        focus: "#9a6d24",
      },
      dark: {
        background: "#0d1022",
        foreground: "#f4ecd9",
        surface: "#161a31",
        surfaceMuted: "#232741",
        border: "#4a4760",
        accent: "#d6ad62",
        accentStrong: "#f1d18e",
        success: "#78b89c",
        warning: "#e2b76e",
        error: "#df858a",
        focus: "#d6ad62",
      },
    },
    composition: {
      ambientMedia: {
        audioSlot: "optional",
        controlStrategy: "external-controls",
        defaultAutoplay: false,
        mood: "Slow atmospheric instrumental or evening ambience with explicit controls.",
      },
      backgroundTreatment:
        "Deep indigo field with quiet radial light and sparse orbital hairline geometry.",
      visualSystem: {
        cardStackPolicy:
          "Use cinematic dark chapters and layered media; practical fields sit within the scene rather than a stack of light cards.",
        compositionMap: "celestial-evening",
        imageStrategy:
          "Use cinematic evening portraits and venue images with dark overlays that preserve faces and captions.",
        motionProfile: "immersive",
        parallaxProfile: "hero-and-media",
      },
      hero: {
        composition: "layered-portrait",
        fullViewport: true,
        mediaTreatment: "Cinematic portrait within a luminous oval field and fine orbital rules.",
      },
      rsvpDesign: "premium",
      sectionDefaults: {
        date: { composition: "full-bleed", density: "spacious", motion: "section-reveal" },
        details: {
          composition: "editorial-split",
          density: "balanced",
          motion: "section-reveal",
        },
        dress_code: { composition: "framed", density: "balanced", motion: "card-reveal" },
        entourage: {
          composition: "editorial-split",
          density: "balanced",
          motion: "media-reveal",
        },
        gallery: {
          composition: "gallery-feature",
          density: "spacious",
          layout: "evening-feature",
          motion: "gallery-drift",
        },
        location: {
          composition: "editorial-split",
          density: "spacious",
          motion: "media-reveal",
        },
        outro: {
          composition: "layered-media",
          density: "spacious",
          motion: "media-parallax",
        },
        profile: {
          composition: "layered-media",
          density: "spacious",
          layout: "luminous-portrait",
          motion: "media-reveal",
        },
        rsvp: {
          composition: "layered-media",
          density: "spacious",
          motion: "section-reveal",
        },
        story: {
          composition: "layered-media",
          density: "spacious",
          layout: "night-depth",
          motion: "media-parallax",
        },
      },
    },
    radius: { sm: "0.25rem", md: "0.5rem", lg: "1rem" },
    typography: {
      display: "luminous high-contrast serif",
      body: "clean geometric sans",
      css: {
        bodyFamily: "Avenir, Montserrat, ui-sans-serif, system-ui, sans-serif",
        displayFamily: 'Didot, "Bodoni 72", Baskerville, ui-serif, serif',
        eyebrowLetterSpacing: "0.28em",
      },
      scale: "editorial",
    },
    imageTreatment:
      "Cinematic evening crops with indigo overlays, luminous edge light, and preserved faces.",
    rsvpTreatment: "A luminous final chapter with formal reply copy and restrained gold focus.",
    compatibility: {
      backdropStrategy: "Deep indigo atmosphere with sparse radial light and night-sky depth.",
      fontPairing: { body: "clean geometric sans", display: "luminous high-contrast serif" },
      motionLevel: "immersive",
      ornamentStrategy:
        "Sparse orbital hairlines and luminous arcs; never dense star fields or novelty constellations.",
      rendererSlots: createRendererSlots({ specialized: allInviteSections }),
    },
    dashboardPreview: {
      swatch: "#d6ad62",
      summary: "Midnight atmosphere with luminous gold type and cinematic depth.",
    },
    previewData: {
      eventTitle: "Under the Evening Sky",
      eyebrow: "An evening celebration",
      subtitle: "A luminous gathering shaped by music, dinner, and midnight blue.",
      venueName: "The Observatory Hall",
      heroImageAlt: "Guests arriving at an illuminated hall beneath a deep blue evening sky",
      sections: [
        {
          type: "date",
          title: "When night falls",
          summary: "The date opens as a luminous full-width chapter against indigo.",
        },
        {
          type: "gallery",
          title: "After dark",
          summary: "One cinematic image leads a narrow sequence of evening moments.",
        },
        {
          type: "rsvp",
          title: "Join the gathering",
          summary: "The reply becomes a measured final scene rather than a utility card.",
        },
      ],
    },
    accessibilityNotes: [
      "Gold is reserved for accents and never used as the sole status indicator.",
      "Dark overlays preserve subject visibility while maintaining readable foreground contrast.",
    ],
  },
} satisfies Record<ThemeId, ThemeDefinition>;

export const availableThemeIds = themeIds;
export const availableThemes: ThemeDefinition[] = Object.values(themeRegistry);
