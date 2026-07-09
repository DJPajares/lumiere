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
