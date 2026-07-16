import {
  resolveTheme,
  resolveThemeTypographyRoles,
  themeTypographyRoleNames,
  type ThemeDefinition,
  type ThemeTypographyStyle,
} from "@lumiere/themes";
import type { ThemeMode } from "@lumiere/types";
import type { CSSProperties, ReactNode } from "react";

import { AmbientAudioControls, type AmbientAudioConfig } from "./ambient-audio-controls";
import {
  InviteThemeModeControl,
  type ResolvedThemeMode,
  type ThemeModeVariables,
} from "./invite-theme-mode-control";

type InviteShellProps = {
  ambientAudio?: AmbientAudioConfig;
  children: ReactNode;
  context: "guest" | "public";
  eventKey?: string;
  mode?: ThemeMode;
  themeId?: string;
};

export function InviteShell({
  ambientAudio,
  children,
  context,
  eventKey = "invite-preview",
  mode = "light",
  themeId,
}: InviteShellProps) {
  const theme = resolveTheme(themeId);
  const resolvedMode = resolveThemeMode(mode, theme);
  const style = themeToStyle(theme, resolvedMode);
  const modeVariables = {
    dark: theme.tokens.dark ? themeTokensToVariables(theme.tokens.dark) : undefined,
    light: themeTokensToVariables(theme.tokens.light),
  };

  return (
    <main
      className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)]"
      data-ambient-audio={theme.composition.ambientMedia.audioSlot}
      data-ambient-audio-controls={theme.composition.ambientMedia.controlStrategy}
      data-invite-context={context}
      data-theme-hero={theme.composition.hero.composition}
      data-theme-id={theme.id}
      data-theme-mode={mode}
      data-theme-resolved-mode={resolvedMode}
      suppressHydrationWarning
      style={style}
    >
      <InviteThemeModeControl
        configuredMode={mode}
        eventKey={eventKey}
        hasAmbientAudio={Boolean(ambientAudio)}
        initialMode={resolvedMode}
        presentation={theme.supportedModes.includes("toggleable") ? theme.modeToggle : undefined}
        variables={modeVariables}
      />
      {children}
      <AmbientAudioControls audio={ambientAudio} context={context} themeId={theme.id} />
    </main>
  );
}

function themeToStyle(theme: ThemeDefinition, mode: ResolvedThemeMode): CSSProperties {
  const tokens = mode === "dark" && theme?.tokens.dark ? theme.tokens.dark : theme?.tokens.light;

  return {
    ...themeTokensToVariables(tokens),
    ...themeTypographyToVariables(theme.typography),
    "--eyebrow-tracking": theme?.typography.css.eyebrowLetterSpacing,
    "--font-body": theme?.typography.css.bodyFamily,
    "--font-display": theme?.typography.css.displayFamily,
    "--radius-lg": theme?.radius.lg,
    "--radius-md": theme?.radius.md,
    "--radius-sm": theme?.radius.sm,
    colorScheme: mode,
    fontFamily: "var(--font-body)",
  } as CSSProperties;
}

const typographyStyleProperties = {
  fontFamily: "font-family",
  fontSize: "font-size",
  fontStyle: "font-style",
  fontWeight: "font-weight",
  letterSpacing: "letter-spacing",
  lineHeight: "line-height",
  textTransform: "text-transform",
} as const satisfies Record<keyof ThemeTypographyStyle, string>;

function themeTypographyToVariables(typography: ThemeDefinition["typography"]): CSSProperties {
  const roles = resolveThemeTypographyRoles(typography.scale, typography.roles);
  const variables: Record<string, string> = {};

  for (const role of themeTypographyRoleNames) {
    const roleName = role.replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`);

    for (const property of Object.keys(
      typographyStyleProperties,
    ) as (keyof ThemeTypographyStyle)[]) {
      const value = roles[role][property];
      variables[`--type-${roleName}-${typographyStyleProperties[property]}`] =
        property === "fontFamily" ? `var(--font-${value})` : value;
    }
  }

  return variables as CSSProperties;
}

function themeTokensToVariables(tokens: ThemeDefinition["tokens"]["light"]): ThemeModeVariables {
  return {
    "--accent": tokens.accent,
    "--accent-contrast": getAccentContrast(tokens.accent),
    "--accent-strong": tokens.accentStrong,
    "--background": tokens.background,
    "--border": tokens.border,
    "--error": tokens.error,
    "--focus": tokens.focus,
    "--foreground": tokens.foreground,
    "--success": tokens.success,
    "--surface": tokens.surface,
    "--surface-muted": tokens.surfaceMuted,
    "--warning": tokens.warning,
  };
}

function getAccentContrast(accent: string | undefined) {
  if (!accent) {
    return "#111111";
  }

  return contrastRatio("#ffffff", accent) >= 4.5 ? "#ffffff" : "#111111";
}

function contrastRatio(left: string, right: string) {
  const leftLuminance = relativeLuminance(left);
  const rightLuminance = relativeLuminance(right);
  const lighter = Math.max(leftLuminance, rightLuminance);
  const darker = Math.min(leftLuminance, rightLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

function relativeLuminance(hex: string) {
  const [red = 0, green = 0, blue = 0] = normalizeHex(hex).map((value) => {
    const channel = value / 255;

    return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
  });

  return red * 0.2126 + green * 0.7152 + blue * 0.0722;
}

function normalizeHex(hex: string) {
  const value = hex.replace("#", "");
  const normalized =
    value.length === 3
      ? value
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : value;

  return [0, 2, 4].map((index) => Number.parseInt(normalized.slice(index, index + 2), 16));
}

function resolveThemeMode(mode: ThemeMode, theme: ThemeDefinition): ResolvedThemeMode {
  if (mode === "dark" && theme.tokens.dark) {
    return "dark";
  }

  if (mode === "system" && theme.defaultMode === "dark" && theme.tokens.dark) {
    return "dark";
  }

  if (
    mode === "toggleable" &&
    theme.modeToggle?.defaultPreference === "dark" &&
    theme.tokens.dark
  ) {
    return "dark";
  }

  return "light";
}
