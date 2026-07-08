import { getTheme, type ThemeDefinition, type ThemeId } from "@lumiere/themes";
import type { CSSProperties, ReactNode } from "react";

type InviteShellProps = {
  children: ReactNode;
  context: "guest" | "public";
  mode?: "dark" | "light";
  themeId?: ThemeId;
};

export function InviteShell({
  children,
  context,
  mode = "light",
  themeId = "lumiere-default",
}: InviteShellProps) {
  const theme = getTheme(themeId) ?? getTheme("lumiere-default");
  const style = themeToStyle(theme, mode);

  return (
    <main
      className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)]"
      data-invite-context={context}
      data-theme-id={theme?.id}
      data-theme-mode={mode}
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
