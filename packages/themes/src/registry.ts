import {
  eventSectionMutationSchema,
  sectionVisibilitySchema,
  type EventSectionMutationInput,
  type EventType,
  type SectionType,
} from "@lumiere/types";

import { sectionDefinitions } from "./sections";
import {
  availableThemeIds,
  availableThemes,
  themeRegistry,
  type ThemeDefinition,
  type ThemeId,
} from "./themes";

export type ThemeSectionValidationResult =
  | {
      ok: true;
      section: ReturnType<typeof eventSectionMutationSchema.parse>;
      theme: ThemeDefinition;
    }
  | {
      ok: false;
      issues: string[];
    };

const unsafeMarkupPattern =
  /<\s*\/?\s*(?:script|iframe|object|embed|link|meta|style|svg|math)\b|\son[a-z]+\s*=|javascript\s*:/i;

export function isThemeId(themeId: string): themeId is ThemeId {
  return availableThemeIds.includes(themeId as ThemeId);
}

export function getTheme(themeId: string): ThemeDefinition | undefined {
  return isThemeId(themeId) ? themeRegistry[themeId] : undefined;
}

export function resolveTheme(themeId: string | null | undefined): ThemeDefinition {
  return (themeId ? getTheme(themeId) : undefined) ?? themeRegistry["lumiere-default"];
}

export function getThemeOrThrow(themeId: string): ThemeDefinition {
  const theme = getTheme(themeId);

  if (!theme) {
    throw new Error(`Unknown theme: ${themeId}`);
  }

  return theme;
}

export function getThemesForEventType(eventType: EventType): ThemeDefinition[] {
  return availableThemes.filter((theme) => theme.supportedEventTypes.includes(eventType));
}

export function getSectionDefinition(sectionType: SectionType) {
  return sectionDefinitions[sectionType];
}

export function getSupportedSections(themeId: ThemeId): SectionType[] {
  return themeRegistry[themeId].supportedSections;
}

export function validateThemeSection(
  themeId: ThemeId,
  input: EventSectionMutationInput,
): ThemeSectionValidationResult {
  const theme = themeRegistry[themeId];
  const parsedSection = eventSectionMutationSchema.safeParse(input);

  if (!parsedSection.success) {
    return {
      ok: false,
      issues: parsedSection.error.issues.map((issue) => issue.message),
    };
  }

  const section = parsedSection.data;
  const definition = sectionDefinitions[section.sectionType];
  const issues: string[] = [];

  if (!theme.supportedSections.includes(section.sectionType)) {
    issues.push(`${theme.label} does not support ${section.sectionType} sections`);
  }

  if (definition.requiresGuestContext && section.visibility === "public") {
    issues.push(`${definition.label} sections cannot be public`);
  }

  const contentResult = definition.contentSchema.safeParse(section.content);
  if (!contentResult.success) {
    issues.push(
      ...contentResult.error.issues.map((issue) => `${section.sectionKey}: ${issue.message}`),
    );
  }

  const settingsResult = definition.settingsSchema.safeParse(section.settings);
  if (!settingsResult.success) {
    issues.push(
      ...settingsResult.error.issues.map((issue) => `${section.sectionKey}: ${issue.message}`),
    );
  }

  if (!sectionVisibilitySchema.safeParse(section.visibility).success) {
    issues.push(`${section.sectionKey}: invalid visibility`);
  }

  const unsafeContentPaths = [
    ...findUnsafeStringPaths(section.content, ["content"]),
    ...findUnsafeStringPaths(section.settings, ["settings"]),
  ];

  issues.push(
    ...unsafeContentPaths.map(
      (path) => `${section.sectionKey}: ${path} contains unsafe markup or script`,
    ),
  );

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    section:
      section.sectionType === "story"
        ? {
            ...section,
            content: contentResult.data as typeof section.content,
          }
        : section,
    theme,
  };
}

export function validateThemeSections(themeId: ThemeId, sections: EventSectionMutationInput[]) {
  return sections.map((section) => validateThemeSection(themeId, section));
}

const findUnsafeStringPaths = (value: unknown, path: (number | string)[]): string[] => {
  if (typeof value === "string") {
    return unsafeMarkupPattern.test(value) ? [formatPath(path)] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item, index) => findUnsafeStringPaths(item, [...path, index]));
  }

  if (typeof value === "object" && value !== null) {
    return Object.entries(value).flatMap(([key, item]) =>
      findUnsafeStringPaths(item, [...path, key]),
    );
  }

  return [];
};

const formatPath = (path: (number | string)[]) => path.join(".");
