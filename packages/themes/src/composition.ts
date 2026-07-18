import type { EventType, SectionType } from "@lumiere/types";

export type ThemeSectionComposition =
  "editorial-split" | "framed" | "full-bleed" | "gallery-feature" | "layered-media" | "timeline";

export type ThemeSectionDensity = "balanced" | "compact" | "spacious";

export type ThemeMotionKind =
  | "card-reveal"
  | "color-wipe"
  | "fluid-drift"
  | "gallery-drift"
  | "hero-reveal"
  | "media-parallax"
  | "media-reveal"
  | "route-progress"
  | "section-reveal"
  | "signal-sweep"
  | "sticky-pin"
  | "timeline-reveal";

export type ThemeMotionProfile = "calm" | "immersive" | "playful" | "seasonal";

export type ThemeParallaxProfile = "none" | "hero-only" | "hero-and-media" | "story-depth";

export type InviteCompositionMapId =
  | "birthday-feature"
  | "celestial-evening"
  | "garden-celebration"
  | "ivory-editorial"
  | "minimal-modern"
  | "neon-signal"
  | "neutral-basic"
  | "porcelain-gallery"
  | "signature-suite"
  | "solar-pop"
  | "terrain-line"
  | "tidal-glass"
  | "velvet-afterglow"
  | "wedding-editorial";

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
    rule: "Use CSS view timelines where supported and IntersectionObserver state toggles as the fallback.",
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
    rule: "Premium depth consistently uses requestAnimationFrame and CSS variables instead of React state updates on scroll; calm reveals may still use native CSS timelines.",
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
  {
    id: "signal-sweep",
    implementation: "css",
    intent: "Mark arrival at a signal-route chapter with one short directional sweep.",
    reducedMotion: "Remove the sweep and show the signal rail at full contrast.",
    rule: "Run once on reveal using opacity and transform; never flicker or loop.",
  },
  {
    id: "fluid-drift",
    implementation: "css",
    intent: "Reveal the relationship between translucent spatial layers.",
    reducedMotion: "Freeze layers in their final readable positions.",
    rule: "Use a small one-time translate on decorative layers; never move text-bearing surfaces continuously.",
  },
  {
    id: "color-wipe",
    implementation: "css",
    intent: "Introduce a new color-plane chapter without delaying its content.",
    reducedMotion: "Render the final color planes immediately.",
    rule: "Use a short clipped transform behind content and never pulse or loop.",
  },
  {
    id: "route-progress",
    implementation: "css",
    intent: "Clarify sequence between terrain waypoints.",
    reducedMotion: "Keep the complete route and numbered waypoints visible.",
    rule: "Reveal the route once in document order; do not pin or scroll-jack the page.",
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

export const expansionInviteCompositionMaps: Record<
  | "celestialGold"
  | "editorialIvory"
  | "gardenLight"
  | "modernMinimal"
  | "porcelainBlue"
  | "signature"
  | "velvetDusk",
  InviteCompositionMap
> = {
  editorialIvory: {
    eventTypes: ["wedding", "birthday", "private_event", "other"],
    id: "ivory-editorial",
    name: "Editorial Ivory Rhythm",
    rhythm: [
      {
        composition: "full-bleed",
        motion: "hero-reveal",
        note: "Open with quiet negative space, a tall portrait, and a newspaper-scale title.",
        section: "introduction",
      },
      {
        composition: "editorial-split",
        motion: "media-reveal",
        note: "Pair people or hosts with generous copy measure and an offset image column.",
        section: "profile",
      },
      {
        composition: "timeline",
        motion: "timeline-reveal",
        note: "Use one continuous editorial rail for story and schedule copy.",
        section: "story",
      },
      {
        composition: "gallery-feature",
        motion: "media-reveal",
        note: "Treat imagery like a magazine feature with one lead crop and restrained captions.",
        section: "gallery",
      },
      {
        composition: "full-bleed",
        motion: "section-reveal",
        note: "Close the public story with a spacious reply chapter.",
        section: "rsvp",
      },
    ],
  },
  gardenLight: {
    eventTypes: ["wedding", "birthday", "private_event", "other"],
    id: "garden-celebration",
    name: "Garden Light Rhythm",
    rhythm: [
      {
        composition: "full-bleed",
        motion: "hero-reveal",
        note: "Open with sunlit landscape or celebrant imagery and soft organic spacing.",
        section: "introduction",
      },
      {
        composition: "editorial-split",
        motion: "section-reveal",
        note: "Let practical details sit beside a calm garden fact or image rail.",
        section: "details",
      },
      {
        composition: "layered-media",
        motion: "media-reveal",
        note: "Use lightly overlapping story media without obscuring text on smaller screens.",
        section: "story",
      },
      {
        composition: "gallery-feature",
        motion: "gallery-drift",
        note: "Lead with one outdoor image and follow with airy supporting moments.",
        section: "gallery",
      },
      {
        composition: "framed",
        motion: "section-reveal",
        note: "Keep the family reply friendly, clear, and grounded after the image-led chapters.",
        section: "rsvp",
      },
    ],
  },
  modernMinimal: {
    eventTypes: ["wedding", "birthday", "private_event", "other"],
    id: "minimal-modern",
    name: "Modern Minimal Rhythm",
    rhythm: [
      {
        composition: "full-bleed",
        motion: "hero-reveal",
        note: "Open with strict grid typography and one unembellished media plane.",
        section: "introduction",
      },
      {
        composition: "timeline",
        motion: "section-reveal",
        note: "Organize facts and schedule items on a numbered typographic rail.",
        section: "details",
      },
      {
        composition: "editorial-split",
        motion: "section-reveal",
        note: "Use people and story sections as sharp text/image grids with no ornamental layer.",
        section: "profile",
      },
      {
        composition: "gallery-feature",
        motion: "media-reveal",
        note: "Use hard-edged crops and disciplined alignment rather than masonry decoration.",
        section: "gallery",
      },
      {
        composition: "editorial-split",
        motion: "section-reveal",
        note: "Keep RSVP within the same clear grid rather than a floating luxury card.",
        section: "rsvp",
      },
    ],
  },
  celestialGold: {
    eventTypes: ["wedding", "birthday", "private_event", "other"],
    id: "celestial-evening",
    name: "Celestial Gold Rhythm",
    rhythm: [
      {
        composition: "full-bleed",
        motion: "media-parallax",
        note: "Open with a deep evening field, luminous type, and one cinematic image.",
        section: "introduction",
      },
      {
        composition: "full-bleed",
        motion: "section-reveal",
        note: "Make the date a nocturnal chapter with a bright typographic focal point.",
        section: "date",
      },
      {
        composition: "layered-media",
        motion: "media-parallax",
        note: "Use story imagery as controlled depth against a dark field.",
        section: "story",
      },
      {
        composition: "gallery-feature",
        motion: "gallery-drift",
        note: "Build an evening photo sequence with a large lead image and narrow supporting rail.",
        section: "gallery",
      },
      {
        composition: "layered-media",
        motion: "section-reveal",
        note: "Finish with a luminous reply or farewell rather than repeated framed panels.",
        section: "rsvp",
      },
    ],
  },
  velvetDusk: {
    eventTypes: ["wedding", "birthday", "dinner", "launch", "holiday", "private_event", "other"],
    id: "velvet-afterglow",
    name: "Velvet Dusk Rhythm",
    rhythm: [
      {
        composition: "full-bleed",
        motion: "hero-reveal",
        note: "Open like a theatre proscenium with one portrait, a low champagne rule, and restrained oxblood depth.",
        section: "introduction",
      },
      {
        composition: "timeline",
        motion: "timeline-reveal",
        note: "Arrange the evening program as one continuous sequence instead of separate schedule cards.",
        section: "details",
      },
      {
        composition: "layered-media",
        motion: "media-parallax",
        note: "Let story and host imagery overlap lightly like velvet curtains opening around the narrative.",
        section: "story",
      },
      {
        composition: "gallery-feature",
        motion: "gallery-drift",
        note: "Lead with a cinematic portrait and support it with a narrow afterglow contact sheet.",
        section: "gallery",
      },
      {
        composition: "full-bleed",
        motion: "section-reveal",
        note: "Close with a formal reply scene framed by one champagne line and generous dark space.",
        section: "rsvp",
      },
    ],
  },
  porcelainBlue: {
    eventTypes: ["wedding", "birthday", "dinner", "launch", "holiday", "private_event", "other"],
    id: "porcelain-gallery",
    name: "Porcelain Blue Rhythm",
    rhythm: [
      {
        composition: "full-bleed",
        motion: "hero-reveal",
        note: "Open with a pale porcelain field, a wide gallery image, and an ink-blue title held low in the frame.",
        section: "introduction",
      },
      {
        composition: "editorial-split",
        motion: "section-reveal",
        note: "Pair date and venue facts with quiet cobalt rules and a broad breathing margin.",
        section: "details",
      },
      {
        composition: "full-bleed",
        motion: "media-reveal",
        note: "Treat the story as a calm uninterrupted essay chapter with one floating image plane.",
        section: "story",
      },
      {
        composition: "gallery-feature",
        motion: "media-reveal",
        note: "Compose photography like a ceramic gallery wall: one landscape anchor and two measured studies.",
        section: "gallery",
      },
      {
        composition: "editorial-split",
        motion: "section-reveal",
        note: "Use a ledger-like reply beside the closing invitation copy, never a detached utility card.",
        section: "rsvp",
      },
    ],
  },
  signature: {
    eventTypes: [
      "wedding",
      "birthday",
      "kids_party",
      "dinner",
      "launch",
      "holiday",
      "private_event",
      "other",
    ],
    id: "signature-suite",
    name: "Signature Suite Rhythm",
    rhythm: [
      {
        composition: "full-bleed",
        motion: "hero-reveal",
        note: "Open through an architectural aperture with one confident title and an optional portrait plate.",
        section: "introduction",
      },
      {
        composition: "timeline",
        motion: "timeline-reveal",
        note: "Turn the event sequence into a continuous bronze-thread itinerary rather than a row of cards.",
        section: "story",
      },
      {
        composition: "editorial-split",
        motion: "section-reveal",
        note: "Present people, attire, and practical details as paired leaves from one invitation suite.",
        section: "profile",
      },
      {
        composition: "gallery-feature",
        motion: "media-reveal",
        note: "Hang one statement image beside a collected supporting pair with discreet caption rails.",
        section: "gallery",
      },
      {
        composition: "editorial-split",
        motion: "section-reveal",
        note: "Close with a concierge reply ledger and a composed sign-off rather than a detached form card.",
        section: "rsvp",
      },
    ],
  },
};

export const nonPaperInviteCompositionMaps: Record<
  "neonSignal" | "solarPop" | "terrainLine" | "tidalGlass",
  InviteCompositionMap
> = {
  neonSignal: {
    eventTypes: ["launch", "dinner", "birthday", "private_event", "other"],
    id: "neon-signal",
    name: "Signal Route",
    rhythm: [
      {
        composition: "full-bleed",
        motion: "signal-sweep",
        note: "Open with a full-height signal entrance and an edge-lit media field.",
        section: "introduction",
      },
      {
        composition: "timeline",
        motion: "route-progress",
        note: "Join time, place, and program facts to one directional route.",
        section: "details",
      },
      {
        composition: "gallery-feature",
        motion: "media-reveal",
        note: "Run imagery as an edge-lit contact strip rather than printed tiles.",
        section: "gallery",
      },
      {
        composition: "editorial-split",
        motion: "signal-sweep",
        note: "Treat arrival information as coordinates beside a practical map.",
        section: "location",
      },
      {
        composition: "full-bleed",
        motion: "route-progress",
        note: "Resolve the route in a check-in console with explicit response states.",
        section: "rsvp",
      },
    ],
  },
  tidalGlass: {
    eventTypes: ["wedding", "dinner", "holiday", "private_event", "other"],
    id: "tidal-glass",
    name: "Tidal Flow",
    rhythm: [
      {
        composition: "full-bleed",
        motion: "fluid-drift",
        note: "Open on a wide refracted horizon with a protected title field.",
        section: "introduction",
      },
      {
        composition: "layered-media",
        motion: "fluid-drift",
        note: "Let story and profile content overlap through broad translucent bands.",
        section: "story",
      },
      {
        composition: "gallery-feature",
        motion: "media-reveal",
        note: "Use one wide crisp image field with restrained refracted edges.",
        section: "gallery",
      },
      {
        composition: "editorial-split",
        motion: "section-reveal",
        note: "Anchor venue facts to a stable shoreline rail.",
        section: "location",
      },
      {
        composition: "full-bleed",
        motion: "fluid-drift",
        note: "Close with one spacious shoreline reply flow.",
        section: "rsvp",
      },
    ],
  },
  solarPop: {
    eventTypes: ["birthday", "kids_party", "launch", "private_event", "other"],
    id: "solar-pop",
    name: "Solar Field",
    rhythm: [
      {
        composition: "full-bleed",
        motion: "color-wipe",
        note: "Open with interlocking color planes, one subject crop, and oversized date type.",
        section: "introduction",
      },
      {
        composition: "timeline",
        motion: "color-wipe",
        note: "Move practical details through directional panels without card repetition.",
        section: "details",
      },
      {
        composition: "gallery-feature",
        motion: "media-reveal",
        note: "Use geometric crop windows and subject-aware image fields.",
        section: "gallery",
      },
      {
        composition: "editorial-split",
        motion: "section-reveal",
        note: "Give venue and arrival facts their own strong color-plane turn.",
        section: "location",
      },
      {
        composition: "full-bleed",
        motion: "color-wipe",
        note: "Finish at a clear, keyboard-friendly festival gate.",
        section: "rsvp",
      },
    ],
  },
  terrainLine: {
    eventTypes: ["wedding", "birthday", "dinner", "launch", "private_event", "other"],
    id: "terrain-line",
    name: "Terrain Route",
    rhythm: [
      {
        composition: "full-bleed",
        motion: "route-progress",
        note: "Open with a landscape field, title, and one clear origin marker.",
        section: "introduction",
      },
      {
        composition: "timeline",
        motion: "route-progress",
        note: "Arrange the itinerary as a single numbered route spine.",
        section: "details",
      },
      {
        composition: "layered-media",
        motion: "media-reveal",
        note: "Use documentary story imagery as a waypoint, not a postcard.",
        section: "story",
      },
      {
        composition: "editorial-split",
        motion: "route-progress",
        note: "Pair destination facts with an inspectable practical map.",
        section: "location",
      },
      {
        composition: "full-bleed",
        motion: "route-progress",
        note: "Conclude at a basecamp reply with a stable confirmed marker.",
        section: "rsvp",
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
  expansionMaps: expansionInviteCompositionMaps,
  nonPaperMaps: nonPaperInviteCompositionMaps,
  sampleMaps: sampleInviteCompositionMaps,
} as const;
