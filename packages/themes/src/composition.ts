import type { EventType, SectionType } from "@lumiere/types";

export type ThemeSectionComposition =
  "editorial-split" | "framed" | "full-bleed" | "gallery-feature" | "layered-media" | "timeline";

export type ThemeSectionDensity = "balanced" | "compact" | "spacious";

export type ThemeMotionKind =
  | "card-reveal"
  | "gallery-drift"
  | "hero-reveal"
  | "media-parallax"
  | "media-reveal"
  | "section-reveal"
  | "sticky-pin"
  | "timeline-reveal";

export type ThemeMotionProfile = "calm" | "immersive" | "playful" | "seasonal";

export type ThemeParallaxProfile = "none" | "hero-only" | "hero-and-media" | "story-depth";

export type InviteCompositionMapId = "birthday-feature" | "neutral-basic" | "wedding-editorial";

export type ViewportBehavior = {
  desktop: string;
  mobile: string;
  tablet: string;
};

export type CompositionFamilyRule = {
  id: ThemeSectionComposition;
  avoidCardStackRule: string;
  emptyState: string;
  imageStrategy: string;
  label: string;
  motion: ThemeMotionKind[];
  purpose: string;
  reducedMotion: string;
  sections: SectionType[];
  viewport: ViewportBehavior;
};

export type MotionRule = {
  id: ThemeMotionKind;
  implementation: "css" | "intersection-observer" | "request-animation-frame";
  intent: string;
  reducedMotion: string;
  rule: string;
};

export type InviteCompositionMap = {
  eventTypes: EventType[];
  id: InviteCompositionMapId;
  name: string;
  rhythm: Array<{
    composition: ThemeSectionComposition;
    motion: ThemeMotionKind;
    note: string;
    section: SectionType;
  }>;
};

export const inviteCompositionSectionCoverage: SectionType[] = [
  "introduction",
  "details",
  "story",
  "profile",
  "gallery",
  "location",
  "rsvp",
  "outro",
];

export const inviteCompositionFamilies: CompositionFamilyRule[] = [
  {
    id: "full-bleed",
    avoidCardStackRule:
      "Use as a viewport-scale chapter break with edge-to-edge color/media fields; content may sit in constrained columns but the section itself should not look like a floating card.",
    emptyState: "Show a calm editorial placeholder with event facts, not an empty card grid.",
    imageStrategy:
      "Reserve large aspect-ratio media slots and allow cover imagery, ambience, or date/location feature panels to carry the section.",
    label: "Full-Bleed Atmosphere",
    motion: ["hero-reveal", "section-reveal", "media-parallax"],
    purpose:
      "Creates immersive opening, date, RSVP, and closing moments that feel like chapters rather than stacked blocks.",
    reducedMotion:
      "Remove scroll parallax and keep the content statically layered with normal opacity.",
    sections: ["introduction", "date", "rsvp", "outro"],
    viewport: {
      desktop:
        "Use min-h-[100dvh] for hero or major chapters, with constrained text and media inside a full-width band.",
      mobile:
        "Keep full-width background treatment, collapse to a single column, and avoid hiding the next section entirely below decorative media.",
      tablet:
        "Use one strong column plus one supporting media/fact rail; avoid narrow side-by-side text.",
    },
  },
  {
    id: "editorial-split",
    avoidCardStackRule:
      "Split content into text and useful media/facts with asymmetry; do not wrap both sides in separate nested cards.",
    emptyState: "Use a single clear note or fact rail when media is missing.",
    imageStrategy:
      "Pair image/fact content with text; image slots use stable aspect ratios and meaningful alt text.",
    label: "Editorial Split",
    motion: ["section-reveal", "media-reveal"],
    purpose:
      "Adds premium magazine pacing for details, people/profile, story, and location sections.",
    reducedMotion: "Render both columns statically and preserve the same reading order.",
    sections: ["details", "profile", "story", "location"],
    viewport: {
      desktop: "Use CSS grid with 40/60 or 45/55 tracks, alternating emphasis by section rhythm.",
      mobile: "Collapse to text first, then supporting media or facts.",
      tablet: "Use balanced two-column tracks only when both columns have enough width.",
    },
  },
  {
    id: "layered-media",
    avoidCardStackRule:
      "Layer text, captions, and media depth inside one composed scene; avoid multiple independent image cards.",
    emptyState:
      "Fall back to a tonal background and a single message block with enough whitespace.",
    imageStrategy:
      "Prioritize one inspectable feature image with optional caption and secondary texture/fact layer.",
    label: "Layered Media",
    motion: ["media-reveal", "media-parallax"],
    purpose: "Gives story and outro sections a premium closing or cinematic visual moment.",
    reducedMotion:
      "Disable depth transforms and keep layers visually ordered with spacing and shadows.",
    sections: ["story", "outro", "profile"],
    viewport: {
      desktop: "Use overlapping or offset media/text layers inside a constrained full-width band.",
      mobile: "Stack layers with visible separation and no overlap that can clip text.",
      tablet: "Allow light overlap only when media remains inspectable.",
    },
  },
  {
    id: "timeline",
    avoidCardStackRule:
      "Use connected rhythm and markers instead of repeated cards; each story item should feel part of one sequence.",
    emptyState:
      "Show a single short story placeholder and keep the timeline rail hidden until content exists.",
    imageStrategy:
      "Optional image becomes a feature beside the timeline, not one image per paragraph by default.",
    label: "Timeline Sequence",
    motion: ["timeline-reveal", "sticky-pin"],
    purpose: "Turns story or schedule copy into a guided scroll moment with ceremony and pace.",
    reducedMotion: "Remove pinning and reveal offsets; keep the rail and markers visible.",
    sections: ["story", "details", "date"],
    viewport: {
      desktop: "Use a left rail or sticky heading beside the sequence when content is long enough.",
      mobile: "Use a simple vertical rail with generous spacing.",
      tablet: "Use a rail plus one sticky heading only when it does not trap focus.",
    },
  },
  {
    id: "gallery-feature",
    avoidCardStackRule:
      "Lead with one hero image and a supporting rhythm; avoid equal-size tiled grids for premium themes.",
    emptyState: "Reserve a large upload/asset slot that explains what image belongs there.",
    imageStrategy:
      "Use one feature image plus supporting images with stable aspect ratios; keep all subjects inspectable.",
    label: "Feature Gallery",
    motion: ["media-reveal", "gallery-drift"],
    purpose: "Makes gallery content feel like a visual chapter instead of a simple image grid.",
    reducedMotion: "Disable drift and reveal the gallery as a static composed grid.",
    sections: ["gallery"],
    viewport: {
      desktop: "Use a large feature image with one supporting column or masonry rhythm.",
      mobile: "Show feature image first, then supporting images in one column.",
      tablet: "Use feature image plus two supporting images when space allows.",
    },
  },
  {
    id: "framed",
    avoidCardStackRule:
      "Allowed for neutral/basic and operational detail clusters, but avoid using it for every section in premium themes.",
    emptyState: "Use dashed or muted framed states with direct copy and no decorative filler.",
    imageStrategy:
      "Use restrained image slots only when the section needs the subject; otherwise use structured copy.",
    label: "Framed Detail",
    motion: ["card-reveal", "section-reveal"],
    purpose: "Keeps practical details, dress code, and compact family-party content readable.",
    reducedMotion: "Render without scale transforms; keep hover/focus states intact.",
    sections: ["details", "dress_code", "location", "rsvp"],
    viewport: {
      desktop: "Use one framed panel or a small set of repeated items within one section.",
      mobile: "Use compact padding and avoid nested cards.",
      tablet: "Use two-column grids only for repeated structured items.",
    },
  },
];

export const inviteMotionRules: MotionRule[] = [
  {
    id: "hero-reveal",
    implementation: "css",
    intent: "Ceremonial first impression.",
    reducedMotion: "Render hero content immediately without transform.",
    rule: "Use opacity and translate on load or CSS view timeline; never require scroll JavaScript.",
  },
  {
    id: "section-reveal",
    implementation: "css",
    intent: "Hierarchy and pacing between invitation chapters.",
    reducedMotion: "Keep sections static and visible.",
    rule: "Use CSS view timelines where supported or IntersectionObserver class toggles later.",
  },
  {
    id: "card-reveal",
    implementation: "css",
    intent: "Small feedback for compact detail clusters.",
    reducedMotion: "Remove scale and translate transforms.",
    rule: "Keep transforms subtle so framed sections do not feel bouncy or dashboard-like.",
  },
  {
    id: "media-reveal",
    implementation: "css",
    intent: "Draw attention to meaningful event imagery.",
    reducedMotion: "Reveal media without scale.",
    rule: "Animate opacity and transform only; reserve layout space before media loads.",
  },
  {
    id: "media-parallax",
    implementation: "css",
    intent: "Scroll depth inspired by Reverie-style immersive media.",
    reducedMotion: "Disable parallax transforms entirely.",
    rule: "Prefer CSS scroll timelines; if JavaScript is needed later, use requestAnimationFrame and CSS variables instead of React state updates on every scroll frame.",
  },
  {
    id: "sticky-pin",
    implementation: "intersection-observer",
    intent: "Pinned story or schedule moments for long editorial sections.",
    reducedMotion: "Disable pinning and keep natural document flow.",
    rule: "Use CSS sticky first; do not trap keyboard focus or hide content behind fixed layers.",
  },
  {
    id: "timeline-reveal",
    implementation: "css",
    intent: "Guided story progression.",
    reducedMotion: "Show markers and copy statically.",
    rule: "Reveal timeline items with opacity and small translate; keep the rail visible.",
  },
  {
    id: "gallery-drift",
    implementation: "css",
    intent: "Subtle depth across feature-gallery images.",
    reducedMotion: "Disable drift and preserve the composed grid.",
    rule: "Use tiny opposing translate values on image layers; never crop inspectable subjects beyond recognition.",
  },
];

export const sampleInviteCompositionMaps: Record<"birthday" | "wedding", InviteCompositionMap> = {
  birthday: {
    eventTypes: ["birthday", "kids_party"],
    id: "birthday-feature",
    name: "Birthday Feature Rhythm",
    rhythm: [
      {
        composition: "full-bleed",
        motion: "hero-reveal",
        note: "Open with celebrant imagery and party facts, then quickly hint at the next detail.",
        section: "introduction",
      },
      {
        composition: "editorial-split",
        motion: "section-reveal",
        note: "Keep schedule and parent notes scannable, with one friendly feature panel.",
        section: "details",
      },
      {
        composition: "gallery-feature",
        motion: "gallery-drift",
        note: "Use a feature image before supporting party images; avoid equal card tiles.",
        section: "gallery",
      },
      {
        composition: "framed",
        motion: "section-reveal",
        note: "Keep the family RSVP clear and thumb-friendly.",
        section: "rsvp",
      },
    ],
  },
  wedding: {
    eventTypes: ["wedding", "dinner", "private_event"],
    id: "wedding-editorial",
    name: "Wedding Editorial Rhythm",
    rhythm: [
      {
        composition: "full-bleed",
        motion: "media-parallax",
        note: "Open with a full-viewport media-led hero and layered ceremony copy.",
        section: "introduction",
      },
      {
        composition: "editorial-split",
        motion: "media-reveal",
        note: "Introduce hosts or couple with asymmetry and real portrait slots.",
        section: "profile",
      },
      {
        composition: "timeline",
        motion: "timeline-reveal",
        note: "Use timeline pacing for story or schedule instead of repeated cards.",
        section: "story",
      },
      {
        composition: "gallery-feature",
        motion: "gallery-drift",
        note: "Make gallery a visual chapter with one lead image and supporting rhythm.",
        section: "gallery",
      },
      {
        composition: "full-bleed",
        motion: "section-reveal",
        note: "Treat RSVP as part of the invitation ceremony, not a transaction form.",
        section: "rsvp",
      },
      {
        composition: "layered-media",
        motion: "media-parallax",
        note: "Close with a layered image or message that feels like an ending.",
        section: "outro",
      },
    ],
  },
};

export const inviteVisualCompositionSystem = {
  antiCardStackPrinciple:
    "Only the neutral/basic theme may rely on framed cards as the dominant rhythm; premium themes must mix full-bleed, editorial, timeline, gallery, and layered-media moments.",
  benchmark:
    "Reverie-level quality means full-bleed atmosphere, layered imagery, scroll depth, tasteful parallax, and modern editorial pacing without cloning a specific visual design.",
  coveredSections: inviteCompositionSectionCoverage,
  families: inviteCompositionFamilies,
  imageFallbackPrinciple:
    "Real event imagery is preferred; missing media should reserve intentional upload/asset slots or useful event facts, not fake screenshots or abstract decoration.",
  motionRules: inviteMotionRules,
  sampleMaps: sampleInviteCompositionMaps,
} as const;
