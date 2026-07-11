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

export type ThemeAssetManifest = {
  publicBasePath: `/themes/${ThemeId}`;
  slots: readonly ("backdrop" | "cover" | "gallery" | "ornament")[];
};

export type ThemeSectionDefault = {
  composition: ThemeSectionComposition;
  density: ThemeSectionDensity;
  layout?: string;
  motion: ThemeMotionKind;
};

export type ThemeBackdropType = "editorial-whitespace" | "gradient" | "image" | "solid" | "texture";

export type ThemeTexturePolicy = "fine-noise" | "frost" | "none" | "paper-grain" | "soft-speckle";

export type ThemeOrnamentSet =
  | "botanical"
  | "candlelight"
  | "confetti"
  | "constellation"
  | "editorial-rules"
  | "none"
  | "snowfall";

export type ThemeDividerStyle = "dotted" | "hairline" | "luminous" | "none" | "short-rule";

export type ThemeFrameStyle =
  "double-line" | "frameless" | "frosted" | "gilded" | "offset" | "organic" | "playful" | "soft";

export type ThemeImageTreatmentKind =
  | "cinematic"
  | "crisp"
  | "desaturated"
  | "frosted"
  | "natural"
  | "nocturne"
  | "sun-washed"
  | "vibrant";

export type ThemeVisualEffects = {
  backdrop: {
    imageSource: "cover" | "none";
    overlay: "none" | "soft" | "strong";
    type: ThemeBackdropType;
  };
  dividerStyle: ThemeDividerStyle;
  frameStyle: ThemeFrameStyle;
  imageTreatment: ThemeImageTreatmentKind;
  ornaments: {
    density: "balanced" | "none" | "sparse";
    enabled: boolean;
    set: ThemeOrnamentSet;
  };
  texture: {
    policy: ThemeTexturePolicy;
    strength: "none" | "subtle" | "visible";
  };
};

export type ThemeComposition = {
  backgroundTreatment: string;
  effects: ThemeVisualEffects;
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

export type ThemeModule = {
  assets: ThemeAssetManifest;
  definition: ThemeDefinition;
  effects: ThemeVisualEffects;
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
