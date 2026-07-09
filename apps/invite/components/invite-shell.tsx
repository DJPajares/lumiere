import { getTheme, isThemeId, type ThemeDefinition } from "@lumiere/themes";
import type { ThemeMode } from "@lumiere/types";
import type { CSSProperties, ReactNode } from "react";

import { AmbientAudioControls, type AmbientAudioConfig } from "./ambient-audio-controls";

type InviteShellProps = {
  ambientAudio?: AmbientAudioConfig;
  children: ReactNode;
  context: "guest" | "public";
  mode?: ThemeMode;
  themeId?: string;
};

export function InviteShell({
  ambientAudio,
  children,
  context,
  mode = "light",
  themeId = "lumiere-default",
}: InviteShellProps) {
  const theme = getInviteTheme(themeId);
  const resolvedMode = resolveThemeMode(mode, theme);
  const style = themeToStyle(theme, resolvedMode);

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
      style={style}
    >
      {children}
      <AmbientAudioControls audio={ambientAudio} context={context} themeId={theme.id} />
    </main>
  );
}

function themeToStyle(theme: ThemeDefinition | undefined, mode: "dark" | "light"): CSSProperties {
  const tokens = mode === "dark" && theme?.tokens.dark ? theme.tokens.dark : theme?.tokens.light;

  return {
    "--accent": tokens?.accent,
    "--accent-contrast": getAccentContrast(tokens?.accent),
    "--accent-strong": tokens?.accentStrong,
    "--background": tokens?.background,
    "--border": tokens?.border,
    "--eyebrow-tracking": theme?.typography.css.eyebrowLetterSpacing,
    "--error": tokens?.error,
    "--font-body": theme?.typography.css.bodyFamily,
    "--font-display": theme?.typography.css.displayFamily,
    "--focus": tokens?.focus,
    "--foreground": tokens?.foreground,
    "--radius-lg": theme?.radius.lg,
    "--radius-md": theme?.radius.md,
    "--radius-sm": theme?.radius.sm,
    "--success": tokens?.success,
    "--surface": tokens?.surface,
    "--surface-muted": tokens?.surfaceMuted,
    "--warning": tokens?.warning,
    fontFamily: "var(--font-body)",
  } as CSSProperties;
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

function getInviteTheme(themeId: string) {
  return (isThemeId(themeId) ? getTheme(themeId) : undefined) ?? getTheme("lumiere-default")!;
}

function resolveThemeMode(mode: ThemeMode, theme: ThemeDefinition): "dark" | "light" {
  if (mode === "dark" && theme.tokens.dark) {
    return "dark";
  }

  if (mode === "system" && theme.defaultMode === "dark" && theme.tokens.dark) {
    return "dark";
  }

  return "light";
}
