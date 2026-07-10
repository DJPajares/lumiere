import type { EventType, SectionType, ThemeMode } from "@lumiere/types";

import type {
  InviteCompositionMapId,
  ThemeMotionProfile,
  ThemeParallaxProfile,
} from "./composition";
import type { ThemeId } from "./themes";

export type ThemeSectionTreatmentKind =
  "card-based" | "cinematic" | "editorial" | "framed" | "full-bleed" | "split-layout";

export type ThemeTemplateSpec = {
  id: ThemeId;
  designRead: string;
  eventTypeFit: EventType[];
  moodBoardNotes: string[];
  antiSlopConstraints: string[];
  modeSupport: {
    defaultMode: ThemeMode;
    guidance: string;
    supported: ThemeMode[];
  };
  tokenGuidance: {
    accent: string;
    dark: string | null;
    light: string;
    status: string;
  };
  radiusGuidance: string;
  typographyGuidance: string;
  imageTreatment: string;
  motion: {
    compositionMap: InviteCompositionMapId;
    level: "calm" | "immersive" | "playful" | "seasonal";
    motionProfile: ThemeMotionProfile;
    parallaxProfile: ThemeParallaxProfile;
    reducedMotion: string;
  };
  sectionTreatments: Array<{
    guidance: string;
    section: "hero" | SectionType;
    treatment: ThemeSectionTreatmentKind;
  }>;
  ambientMedia: {
    controls: string;
    missingMedia: string;
    musicSupported: boolean;
    policy: string;
  };
  rsvp: {
    closedState: string;
    disabledState: string;
    errorState: string;
    styling: string;
    successState: string;
  };
  dashboardPreview: {
    requirements: string[];
    samplePreviewData: {
      eventTitle: string;
      sections: string[];
      venueName: string;
    };
    thumbnail: string;
  };
  namingGuidance: string;
  referenceNotes?: string[];
};

export const reverieReferenceLinks = [
  "https://github.com/DJPajares/reverie",
  "https://reverie.wndrhive.com/",
] as const;

export const themeTemplateSpecs = {
  "lumiere-default": {
    id: "lumiere-default",
    designRead: "Warm modern invite with flexible spacing and practical structure.",
    eventTypeFit: ["dinner", "launch", "private_event", "other"],
    moodBoardNotes: [
      "Warm parchment, soft amber accents, and quiet dinner-table light.",
      "Readable event facts, modest media, and low-drama section spacing.",
      "A complete neutral base for hosts who need clarity more than ceremony.",
    ],
    antiSlopConstraints: [
      "Allowed to be simpler, but still avoid nested cards and placeholder-heavy sections.",
      "Do not turn neutral into generic SaaS cards; keep the language invitational.",
      "Use practical media/fact slots rather than fake preview screenshots.",
    ],
    modeSupport: {
      defaultMode: "system",
      guidance: "System mode follows the visitor preference with restrained light and dark tokens.",
      supported: ["light", "dark", "system"],
    },
    tokenGuidance: {
      accent: "Warm amber accents mark primary actions, date facts, focus, and links.",
      dark: "Dark mode uses warm charcoal surfaces and soft amber accents without pure black.",
      light: "Light mode uses off-white parchment surfaces and warm brown text.",
      status: "Success, warning, and error colors stay semantic and always include text labels.",
    },
    radiusGuidance:
      "Use the medium 0.75rem radius as the default; reserve the large radius for one framed panel per section.",
    typographyGuidance:
      "Use system sans with restrained tracking; copy should feel practical and human, not luxury-generic.",
    imageTreatment:
      "Soft rectangular image slots with reserved ratios; missing images become useful event facts.",
    motion: {
      compositionMap: "neutral-basic",
      level: "calm",
      motionProfile: "calm",
      parallaxProfile: "none",
      reducedMotion:
        "Calm reveals may disappear entirely; hierarchy must remain clear through spacing.",
    },
    sectionTreatments: [
      {
        guidance:
          "Use an editorial split when a cover image exists; otherwise use a clear fact rail.",
        section: "hero",
        treatment: "split-layout",
      },
      {
        guidance:
          "Keep details compact and scannable, using one framed group rather than loose cards.",
        section: "details",
        treatment: "framed",
      },
      {
        guidance:
          "Stories should read as short editorial copy, not a decorative timeline by default.",
        section: "story",
        treatment: "editorial",
      },
      {
        guidance: "Profiles are optional; when present, keep them card-based and modest.",
        section: "profile",
        treatment: "card-based",
      },
      {
        guidance: "A simple gallery grid is acceptable, but image slots must remain inspectable.",
        section: "gallery",
        treatment: "framed",
      },
      {
        guidance: "Location should split venue copy from the map/fact preview.",
        section: "location",
        treatment: "split-layout",
      },
      {
        guidance:
          "RSVP can be framed, but the copy should still feel like a reply to an invitation.",
        section: "rsvp",
        treatment: "card-based",
      },
      {
        guidance: "Outro may use a full-width warm surface with one closing message.",
        section: "outro",
        treatment: "full-bleed",
      },
    ],
    ambientMedia: {
      controls: "No theme-owned audio control is rendered for neutral by default.",
      missingMedia: "Missing music is silent and does not create an empty control.",
      musicSupported: false,
      policy: "Keep the neutral theme quiet unless a later event-specific override opts in.",
    },
    rsvp: {
      closedState:
        "Show a compact note that replies are closed and preserve guest context if known.",
      disabledState: "Explain that RSVP unlocks from the guest invite link.",
      errorState: "Use inline error text near the failed field or action.",
      styling:
        "Integrated guest-only panel with neutral surface, visible max pax, and clear action.",
      successState: "Confirm attendance with a concise message and the final attendee count.",
    },
    dashboardPreview: {
      requirements: [
        "Show one warm swatch and a compact section rhythm summary.",
        "Preview must not imply a premium full-bleed wedding template.",
      ],
      samplePreviewData: {
        eventTitle: "Dinner at Dusk",
        sections: ["Welcome", "The evening", "Reply"],
        venueName: "The Lantern Room",
      },
      thumbnail: "Warm parchment canvas with a practical split hero and small detail panel.",
    },
    namingGuidance: "Use generic neutral/event naming; avoid protected venue or brand cues.",
  },
  premium: {
    id: "premium",
    designRead:
      "Cinematic wedding editorial with portrait-led hierarchy, spacious ceremony, and an invitation-native reply.",
    eventTypeFit: ["wedding", "dinner", "private_event"],
    moodBoardNotes: [
      "Editorial wedding magazine pacing, ivory fields, warm portrait light, and precise hairlines.",
      "Reverie-level immersion: full-viewport opening, layered imagery, scroll depth, and ceremony.",
      "Formal without being stiff; RSVP should feel like part of the invitation, not a transaction.",
    ],
    antiSlopConstraints: [
      "Do not reduce Premium to centered hero plus stacked cards.",
      "Do not use decorative gold flourishes as a substitute for real image-led composition.",
      "Avoid copying Reverie visuals directly; use it as a quality and motion benchmark only.",
    ],
    modeSupport: {
      defaultMode: "toggleable",
      guidance: "Light and dark modes are both first-class; toggleable mode lets guests choose.",
      supported: ["light", "dark", "toggleable"],
    },
    tokenGuidance: {
      accent: "Burnished gold anchors actions, hairlines, focus, and small ceremonial labels.",
      dark: "Dark mode becomes candlelit charcoal with cream type and readable gold accents.",
      light:
        "Light mode uses layered ivory surfaces, warm foreground, and muted champagne borders.",
      status: "Semantic colors are restrained and never rely on gold alone for status.",
    },
    radiusGuidance:
      "Use smaller, refined radii to avoid rounded dashboard cards; media frames may use the large radius sparingly.",
    typographyGuidance:
      "Use editorial serif display for titles and clean sans for body; preserve generous line height on mobile.",
    imageTreatment:
      "Large portrait, venue, and gallery imagery with strong crops, layered depth, and graceful fact-panel fallback.",
    motion: {
      compositionMap: "wedding-editorial",
      level: "immersive",
      motionProfile: "immersive",
      parallaxProfile: "hero-and-media",
      reducedMotion:
        "Disable parallax and drift; keep full-viewport hierarchy, layered media order, and static editorial pacing.",
    },
    sectionTreatments: [
      {
        guidance: "Full-viewport, image-led, with layered copy and subtle scroll-depth hooks.",
        section: "hero",
        treatment: "cinematic",
      },
      {
        guidance: "Use editorial splits for ceremony/reception facts; avoid equal-card grids.",
        section: "details",
        treatment: "split-layout",
      },
      {
        guidance: "Use timeline or pinned editorial pacing for story chapters.",
        section: "story",
        treatment: "editorial",
      },
      {
        guidance: "Use split portrait or host/couple feature layouts with real image slots.",
        section: "profile",
        treatment: "split-layout",
      },
      {
        guidance: "Feature one lead image with supporting rhythm and subtle gallery drift.",
        section: "gallery",
        treatment: "full-bleed",
      },
      {
        guidance: "Venue copy and map/fact preview should feel editorial, not utility-card only.",
        section: "location",
        treatment: "split-layout",
      },
      {
        guidance: "Treat RSVP as a full-bleed ceremonial reply moment with an elegant guest card.",
        section: "rsvp",
        treatment: "full-bleed",
      },
      {
        guidance:
          "Close with layered media or a quiet full-width message that feels like an ending.",
        section: "outro",
        treatment: "cinematic",
      },
    ],
    ambientMedia: {
      controls: "Use an external floating control that never obscures RSVP or primary actions.",
      missingMedia: "If no track is present, do not render an empty audio affordance.",
      musicSupported: true,
      policy:
        "Background music is optional and guest-controlled; do not force audible autoplay on arrival.",
    },
    rsvp: {
      closedState: "Use formal copy that thanks guests and states the reply window is closed.",
      disabledState: "Show that private RSVP requires a valid guest invitation.",
      errorState: "Inline error copy should be calm, specific, and preserve entered guest details.",
      styling:
        "Elegant reply card with segmented attendance, visible reserved seats, attendee count, and generous spacing.",
      successState:
        "Use celebratory but quiet confirmation with attendance state and next-step copy.",
    },
    dashboardPreview: {
      requirements: [
        "Thumbnail must show full-viewport editorial intent, not just the accent color.",
        "Include one portrait/media slot and one section rhythm cue.",
        "Use the Premium swatch only as support, not the whole preview.",
      ],
      samplePreviewData: {
        eventTitle: "Amara & Jules",
        sections: ["Opening portrait", "The celebration", "Gallery and reply"],
        venueName: "Emerald Gardens",
      },
      thumbnail: "Ivory editorial hero with portrait frame, gold hairline, and gallery depth cue.",
    },
    namingGuidance:
      "Premium is generic and safe; avoid naming subthemes after protected fashion, venue, or wedding brands.",
    referenceNotes: [
      "Reverie reference repo uses theme-owned section variants, motion profiles, parallax, and ambient audio as quality cues.",
      "Use the Reverie hosted app as a benchmark for immersion and pacing, not as a direct visual clone.",
    ],
  },
  kids: {
    id: "kids",
    designRead: "Playful invite with rounded rhythm, clear details, and parent-friendly RSVP.",
    eventTypeFit: ["birthday", "kids_party"],
    moodBoardNotes: [
      "Sunny party paper, bright celebrant imagery, and friendly rounded surfaces.",
      "Parent-friendly clarity first: schedule, venue, and max pax must be quick to scan.",
      "Playful motion should feel light and delightful, never distracting.",
    ],
    antiSlopConstraints: [
      "Do not make the page emoji-heavy or childish in a way that hurts readability.",
      "Do not bury parent logistics under decorative elements.",
      "Avoid making every section a rounded card; hero and gallery need feature moments.",
    ],
    modeSupport: {
      defaultMode: "light",
      guidance: "Light-only theme with high contrast and cheerful surfaces.",
      supported: ["light"],
    },
    tokenGuidance: {
      accent: "Orange accent marks primary actions and playful highlights.",
      dark: null,
      light: "Light mode uses sunny cream, warm yellow surfaces, and dark slate text.",
      status: "Status colors remain semantic and should be paired with copy for parents.",
    },
    radiusGuidance:
      "Use larger rounded corners consistently; keep controls thumb-friendly and not pill-only.",
    typographyGuidance:
      "Rounded sans display is appropriate; body text stays simple and highly legible.",
    imageTreatment:
      "Use clear celebrant and party imagery with rounded frames; missing images become friendly fact panels.",
    motion: {
      compositionMap: "birthday-feature",
      level: "playful",
      motionProfile: "playful",
      parallaxProfile: "hero-only",
      reducedMotion: "Disable hero drift and keep cheerful hierarchy through color and scale.",
    },
    sectionTreatments: [
      {
        guidance:
          "Centered celebrant image, short invitation copy, and fast access to date/venue facts.",
        section: "hero",
        treatment: "full-bleed",
      },
      {
        guidance:
          "Use framed detail clusters for schedule, guardian notes, and practical reminders.",
        section: "details",
        treatment: "framed",
      },
      {
        guidance:
          "Stories are optional and should stay brief, friendly, and not sentimental-heavy.",
        section: "story",
        treatment: "editorial",
      },
      {
        guidance: "Profile can feature the celebrant with one image and a short note.",
        section: "profile",
        treatment: "card-based",
      },
      {
        guidance:
          "Feature gallery should lead with one strong party image before supporting photos.",
        section: "gallery",
        treatment: "full-bleed",
      },
      {
        guidance: "Location can be framed for parent scanning, with clear map action.",
        section: "location",
        treatment: "framed",
      },
      {
        guidance: "RSVP should be compact, warm, and obvious about attendee count/max pax.",
        section: "rsvp",
        treatment: "card-based",
      },
      {
        guidance: "Outro should be brief and upbeat with a simple closing note.",
        section: "outro",
        treatment: "framed",
      },
    ],
    ambientMedia: {
      controls: "Use explicit external controls only; keep them away from parent RSVP actions.",
      missingMedia: "No music means no control; do not show a decorative player shell.",
      musicSupported: true,
      policy: "Music may be offered, but never autoplay audibly and keep files lightweight.",
    },
    rsvp: {
      closedState: "Friendly copy explains the party headcount is finalized.",
      disabledState: "Tell parents to open their private invite link to reply.",
      errorState: "Errors should be plain, reassuring, and preserve attendee count.",
      styling: "Parent-friendly controls, visible max pax, and short optional questions.",
      successState: "Confirm the family response and attendee count with warm copy.",
    },
    dashboardPreview: {
      requirements: [
        "Show a bright hero image slot and parent-scannable details.",
        "Avoid confetti clutter in the thumbnail.",
      ],
      samplePreviewData: {
        eventTitle: "Mika Turns Seven",
        sections: ["Party start", "Party details", "Family reply"],
        venueName: "Sunbeam Studio",
      },
      thumbnail: "Sunny celebrant card, rounded gallery preview, and orange action accent.",
    },
    namingGuidance:
      "Use generic birthday/party naming; do not reference protected characters, films, or franchises.",
  },
  noel: {
    id: "noel",
    designRead: "Cozy seasonal layout with evergreen accents and warm candlelit surfaces.",
    eventTypeFit: ["holiday", "dinner", "private_event"],
    moodBoardNotes: [
      "Evergreen, candlelight, winter table settings, and warm humanist typography.",
      "Seasonal without novelty clutter; atmosphere comes from light and materials.",
      "Works for Christmas and year-end gatherings without requiring religious imagery.",
    ],
    antiSlopConstraints: [
      "Avoid emoji-heavy holiday styling and obvious clip-art seasonal motifs.",
      "Do not rely on red/green alone for meaning or status.",
      "Keep cozy details selective so the page still has premium rhythm.",
    ],
    modeSupport: {
      defaultMode: "toggleable",
      guidance:
        "Light and dark modes both work; dark mode should feel candlelit, not low contrast.",
      supported: ["light", "dark", "toggleable"],
    },
    tokenGuidance: {
      accent: "Evergreen is the primary accent; gold supports warmth, not status alone.",
      dark: "Dark mode uses deep evergreen surfaces with cream text and restrained gold.",
      light: "Light mode uses warm cream, evergreen type accents, and muted seasonal borders.",
      status: "Red/green seasonal cues always include labels and semantic status colors.",
    },
    radiusGuidance: "Use moderate radii that feel crafted and warm; avoid playful bubble shapes.",
    typographyGuidance:
      "Warm serif display is acceptable for headings; body remains humanist and readable.",
    imageTreatment:
      "Use table, venue, or gathering imagery with warm captions; missing media becomes a candlelit fact rail.",
    motion: {
      compositionMap: "wedding-editorial",
      level: "seasonal",
      motionProfile: "seasonal",
      parallaxProfile: "story-depth",
      reducedMotion: "Disable story depth and keep warmth through layered color and spacing.",
    },
    sectionTreatments: [
      {
        guidance: "Seasonal full-viewport tableau with warm table or gathering imagery.",
        section: "hero",
        treatment: "cinematic",
      },
      {
        guidance: "Dinner details may be framed but should sit inside a warm full-width rhythm.",
        section: "details",
        treatment: "framed",
      },
      {
        guidance: "Story can use editorial split or story-depth treatment for seasonal pacing.",
        section: "story",
        treatment: "editorial",
      },
      {
        guidance: "Profiles are optional; keep host copy restrained and warmly framed.",
        section: "profile",
        treatment: "framed",
      },
      {
        guidance: "Gallery should show one feature image and supporting table/venue details.",
        section: "gallery",
        treatment: "full-bleed",
      },
      {
        guidance: "Location should pair venue copy with a cozy map or arrival note.",
        section: "location",
        treatment: "split-layout",
      },
      {
        guidance: "RSVP should be cozy and brief, with direct attendance state.",
        section: "rsvp",
        treatment: "framed",
      },
      {
        guidance: "Outro can close with a warm message or seasonal image, not a decorative pileup.",
        section: "outro",
        treatment: "full-bleed",
      },
    ],
    ambientMedia: {
      controls: "Use an external floating control with a calm seasonal label.",
      missingMedia: "If absent, the invitation remains visually complete and silent.",
      musicSupported: true,
      policy: "Warm acoustic holiday music may be offered with guest-controlled playback.",
    },
    rsvp: {
      closedState: "Warmly state that the table is finalized and how to contact the host.",
      disabledState: "Explain that private RSVP opens from the guest invite link.",
      errorState: "Use calm inline copy with enough contrast in both light and dark modes.",
      styling: "Cozy panel with clear attendance state, max pax, and host message support.",
      successState: "Confirm the reply with a warm table/host note and attendee count.",
    },
    dashboardPreview: {
      requirements: [
        "Show evergreen, candlelight, and one image/fact cue without holiday clutter.",
        "Preview both light and dark swatch behavior if space allows.",
      ],
      samplePreviewData: {
        eventTitle: "Noel Supper",
        sections: ["Gathering", "Candlelit details", "Holiday reply"],
        venueName: "The Hearth Room",
      },
      thumbnail: "Evergreen table scene, cream surface, and restrained seasonal accent.",
    },
    namingGuidance:
      "Noel is a generic seasonal name; avoid protected holiday characters, songs, or brand marks.",
  },
} satisfies Record<ThemeId, ThemeTemplateSpec>;

export const themeTemplateSpecIds = Object.keys(themeTemplateSpecs) as ThemeId[];
