import { getTheme, isThemeId, type ThemeDefinition } from "@lumiere/themes";
import type { ThemeMode } from "@lumiere/types";
import type { CSSProperties, ReactNode } from "react";

type InviteShellProps = {
  children: ReactNode;
  context: "guest" | "public";
  mode?: ThemeMode;
  themeId?: string;
};

export function InviteShell({
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
      data-invite-context={context}
      data-theme-id={theme.id}
      data-theme-mode={mode}
      data-theme-resolved-mode={resolvedMode}
      style={style}
    >
      {children}
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
    "--error": tokens?.error,
    "--focus": tokens?.focus,
    "--foreground": tokens?.foreground,
    "--radius-lg": theme?.radius.lg,
    "--radius-md": theme?.radius.md,
    "--radius-sm": theme?.radius.sm,
    "--success": tokens?.success,
    "--surface": tokens?.surface,
    "--surface-muted": tokens?.surfaceMuted,
    "--warning": tokens?.warning,
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
