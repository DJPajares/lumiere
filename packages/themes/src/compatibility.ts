import {
  eventTypeSchema,
  sectionTypeSchema,
  themeModeSchema,
  type EventType,
  type SectionType,
  type ThemeMode,
} from "@lumiere/types";

import {
  getBlueprintSectionsForEventType,
  type EventSectionBlueprintDefinition,
} from "./blueprints";
import { sectionDefinitions } from "./sections";
import {
  availableThemes,
  type ThemeDefinition,
  type ThemeId,
  type ThemeRendererSlotDeclaration,
  type ThemeSectionDefault,
} from "./themes";
import type { ThemeMotionKind, ThemeSectionComposition } from "./composition";

export type ThemeCompatibilitySeverity = "error" | "warning";

export type ThemeCompatibilityIssueCode =
  | "fallback_renderer_slot"
  | "missing_recommended_section"
  | "missing_required_section"
  | "unsupported_event_type"
  | "unsupported_mode";

export type ThemeCompatibilityIssue = {
  code: ThemeCompatibilityIssueCode;
  message: string;
  path: (number | string)[];
  sectionType?: SectionType;
  severity: ThemeCompatibilitySeverity;
};

export type ThemeRendererSlotCoverage = {
  composition: ThemeSectionComposition;
  coverage: ThemeRendererSlotDeclaration["coverage"];
  motion: ThemeMotionKind;
  notes: string;
  rendererKey: string;
  sectionType: SectionType;
  supportsManagerConfiguration: boolean;
};

export type ThemeCompatibilityResult = {
  canApply: boolean;
  canRenderRequiredSections: boolean;
  eventType: EventType;
  issues: ThemeCompatibilityIssue[];
  missingRecommendedSections: EventSectionBlueprintDefinition[];
  missingRequiredSections: EventSectionBlueprintDefinition[];
  mode?: ThemeMode;
  rendererSlots: ThemeRendererSlotCoverage[];
  status: "blocked" | "compatible" | "warning";
  summary: string;
  themeId: ThemeId;
  themeLabel: string;
  warnings: ThemeCompatibilityIssue[];
};

export type ThemeCompatibilityMatrixEntry = ThemeCompatibilityResult & {
  mode: ThemeMode;
};

export const compatibilityEventTypes = eventTypeSchema.options;
export const compatibilityThemeModes = themeModeSchema.options;

export function evaluateThemeCompatibility({
  eventType,
  mode,
  theme,
}: {
  eventType: EventType;
  mode?: ThemeMode;
  theme: ThemeDefinition;
}): ThemeCompatibilityResult {
  const blueprintSections = getBlueprintSectionsForEventType(eventType);
  const supportedSectionTypes = new Set(theme.supportedSections);
  const rendererSlots = blueprintSections.map((section) =>
    resolveThemeRendererSlot(theme, section.sectionType),
  );
  const missingRequiredSections = blueprintSections.filter(
    (section) =>
      section.requirement === "required" && !supportedSectionTypes.has(section.sectionType),
  );
  const missingRecommendedSections = blueprintSections.filter(
    (section) =>
      section.requirement === "recommended" && !supportedSectionTypes.has(section.sectionType),
  );
  const issues: ThemeCompatibilityIssue[] = [];
  const warnings: ThemeCompatibilityIssue[] = [];

  if (!theme.supportedEventTypes.includes(eventType)) {
    issues.push({
      code: "unsupported_event_type",
      message: `${theme.label} does not support ${eventType} events`,
      path: ["selectedThemeId"],
      severity: "error",
    });
  }

  if (mode && !theme.supportedModes.includes(mode)) {
    issues.push({
      code: "unsupported_mode",
      message: `${theme.label} does not support ${mode} mode`,
      path: ["themeMode"],
      severity: "error",
    });
  }

  issues.push(
    ...missingRequiredSections.map((section): ThemeCompatibilityIssue => ({
      code: "missing_required_section",
      message: `${theme.label} cannot configure required ${section.defaultLabel} sections for ${eventType} events`,
      path: ["selectedThemeId"],
      sectionType: section.sectionType,
      severity: "error",
    })),
  );

  warnings.push(
    ...missingRecommendedSections.map((section): ThemeCompatibilityIssue => ({
      code: "missing_recommended_section",
      message: `${theme.label} falls back without recommended ${section.defaultLabel} configuration for ${eventType} events`,
      path: ["selectedThemeId"],
      sectionType: section.sectionType,
      severity: "warning",
    })),
  );

  warnings.push(
    ...rendererSlots
      .filter((slot) => slot.coverage === "fallback")
      .map((slot): ThemeCompatibilityIssue => ({
        code: "fallback_renderer_slot",
        message: `${theme.label} uses the shared ${sectionDefinitions[slot.sectionType].label} renderer for ${eventType} events`,
        path: ["themeConfig", "rendererSlots", slot.sectionType],
        sectionType: slot.sectionType,
        severity: "warning",
      })),
  );

  const status = issues.length > 0 ? "blocked" : warnings.length > 0 ? "warning" : "compatible";
  const canRenderRequiredSections = missingRequiredSections.every((section) =>
    sectionTypeSchema.options.includes(section.sectionType),
  );

  return {
    canApply: issues.length === 0,
    canRenderRequiredSections,
    eventType,
    issues,
    missingRecommendedSections,
    missingRequiredSections,
    mode,
    rendererSlots,
    status,
    summary: formatCompatibilitySummary({
      eventType,
      issueCount: issues.length,
      theme,
      warningCount: warnings.length,
    }),
    themeId: theme.id,
    themeLabel: theme.label,
    warnings,
  };
}

export function resolveThemeRendererSlot(
  theme: ThemeDefinition,
  sectionType: SectionType,
): ThemeRendererSlotCoverage {
  const definition = sectionDefinitions[sectionType];
  const sectionDefault = theme.composition.sectionDefaults[sectionType];
  const declaration = theme.compatibility.rendererSlots[sectionType];
  const fallback = getFallbackSectionDefault(sectionType);

  return {
    composition: sectionDefault?.composition ?? fallback.composition,
    coverage: declaration?.coverage ?? (sectionDefault ? "specialized" : "fallback"),
    motion: sectionDefault?.motion ?? fallback.motion,
    notes:
      declaration?.notes ??
      (sectionDefault
        ? "Theme section default supplies the specialized composition."
        : "Shared public invite renderer supplies the fallback composition."),
    rendererKey: definition.rendererKey,
    sectionType,
    supportsManagerConfiguration: theme.supportedSections.includes(sectionType),
  };
}

export function buildThemeCompatibilityMatrix({
  eventTypes = compatibilityEventTypes,
  modes = compatibilityThemeModes,
  themes = availableThemes,
}: {
  eventTypes?: EventType[];
  modes?: ThemeMode[];
  themes?: ThemeDefinition[];
} = {}): ThemeCompatibilityMatrixEntry[] {
  return themes.flatMap((theme) =>
    eventTypes.flatMap((eventType) =>
      modes.map((mode) => ({
        ...evaluateThemeCompatibility({
          eventType,
          mode,
          theme,
        }),
        mode,
      })),
    ),
  );
}

function getFallbackSectionDefault(
  sectionType: SectionType,
): Pick<ThemeSectionDefault, "composition" | "motion"> {
  switch (sectionType) {
    case "date":
    case "rsvp":
      return {
        composition: "full-bleed",
        motion: "section-reveal",
      };
    case "gallery":
      return {
        composition: "gallery-feature",
        motion: "media-reveal",
      };
    case "location":
      return {
        composition: "editorial-split",
        motion: "section-reveal",
      };
    case "outro":
      return {
        composition: "full-bleed",
        motion: "section-reveal",
      };
    case "profile":
      return {
        composition: "framed",
        motion: "card-reveal",
      };
    case "story":
      return {
        composition: "editorial-split",
        motion: "section-reveal",
      };
    default:
      return {
        composition: "framed",
        motion: "card-reveal",
      };
  }
}

function formatCompatibilitySummary({
  eventType,
  issueCount,
  theme,
  warningCount,
}: {
  eventType: EventType;
  issueCount: number;
  theme: ThemeDefinition;
  warningCount: number;
}) {
  if (issueCount > 0) {
    return `${theme.label} has ${issueCount} compatibility issue${issueCount === 1 ? "" : "s"} for ${eventType} events.`;
  }

  if (warningCount > 0) {
    return `${theme.label} can render ${eventType} events with ${warningCount} fallback warning${warningCount === 1 ? "" : "s"}.`;
  }

  return `${theme.label} fully supports ${eventType} events.`;
}
