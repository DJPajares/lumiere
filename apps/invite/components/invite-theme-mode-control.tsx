"use client";

import type { ThemeModeTogglePresentation } from "@lumiere/themes";
import type { ThemeMode } from "@lumiere/types";
import type { CSSProperties } from "react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

export type ResolvedThemeMode = "dark" | "light";
export type ThemeModeVariables = Record<string, string>;

type InviteThemeModeControlProps = {
  configuredMode: ThemeMode;
  eventKey: string;
  initialMode: ResolvedThemeMode;
  presentation?: ThemeModeTogglePresentation;
  variables: {
    dark?: ThemeModeVariables;
    light: ThemeModeVariables;
  };
};

const controlStyles: Record<ThemeModeTogglePresentation["style"], string> = {
  celestial:
    "border-[color-mix(in_srgb,var(--accent)_48%,transparent)] bg-[color-mix(in_srgb,var(--background)_82%,transparent)] shadow-[0_12px_40px_color-mix(in_srgb,var(--accent)_16%,transparent)]",
  editorial:
    "rounded-none border-[var(--foreground)] bg-[color-mix(in_srgb,var(--background)_92%,transparent)] shadow-none",
  fluid:
    "rounded-[var(--radius-lg)] border-[color-mix(in_srgb,var(--accent)_46%,var(--border))] bg-[color-mix(in_srgb,var(--surface)_82%,transparent)] shadow-[0_14px_42px_color-mix(in_srgb,var(--accent)_14%,transparent)]",
  organic:
    "rounded-[var(--radius-lg)] border-[color-mix(in_srgb,var(--border)_78%,transparent)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] shadow-[0_12px_36px_color-mix(in_srgb,var(--accent)_14%,transparent)]",
  pop: "rounded-[var(--radius-md)] border-2 border-[var(--foreground)] bg-[var(--surface)] shadow-[0.25rem_0.25rem_0_var(--foreground)]",
  seasonal:
    "border-[color-mix(in_srgb,var(--accent)_42%,var(--border))] bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] shadow-[0_12px_36px_color-mix(in_srgb,var(--accent)_15%,transparent)]",
  signal:
    "rounded-[var(--radius-sm)] border-[var(--accent)] bg-[color-mix(in_srgb,var(--background)_92%,transparent)] shadow-[0_0_28px_color-mix(in_srgb,var(--accent)_20%,transparent)]",
  "soft-pill":
    "border-[color-mix(in_srgb,var(--border)_78%,transparent)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] shadow-[0_12px_36px_color-mix(in_srgb,var(--accent)_14%,transparent)]",
  terrain:
    "rounded-[var(--radius-md)] border-[var(--foreground)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] shadow-[0.25rem_0.25rem_0_color-mix(in_srgb,var(--accent)_22%,transparent)]",
};

export function InviteThemeModeControl({
  configuredMode,
  eventKey,
  initialMode,
  presentation,
  variables,
}: InviteThemeModeControlProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const labelMeasureRef = useRef<HTMLSpanElement | null>(null);
  const rootAnchorRef = useRef<HTMLSpanElement | null>(null);
  const [resolvedMode, setResolvedMode] = useState(initialMode);
  const [measuredLabelWidth, setMeasuredLabelWidth] = useState<number | null>(null);
  const storageKey = useMemo(() => createThemeModeStorageKey(eventKey), [eventKey]);
  const canToggle =
    configuredMode === "toggleable" && Boolean(presentation) && Boolean(variables.dark);
  const needsPrePaintResolution = configuredMode === "system" || canToggle;

  useLayoutEffect(() => {
    if (!needsPrePaintResolution) {
      return;
    }

    const root = rootAnchorRef.current?.closest<HTMLElement>("main[data-theme-id]") ?? null;
    const mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)");
    const savedMode = canToggle ? readStoredMode(storageKey) : null;
    const followsSystem =
      configuredMode === "system" ||
      (canToggle && !savedMode && presentation?.defaultPreference === "system");

    const syncMode = () => {
      const nextMode = resolveBrowserMode({
        configuredMode,
        defaultPreference: presentation?.defaultPreference,
        hasDarkTokens: Boolean(variables.dark),
        prefersDark: Boolean(mediaQuery?.matches),
        savedMode: canToggle ? readStoredMode(storageKey) : null,
      });

      applyThemeMode(root, nextMode, variables);
      if (canToggle) {
        setResolvedMode(nextMode);
      }
    };

    syncMode();

    if (!followsSystem || !mediaQuery) {
      return;
    }

    mediaQuery.addEventListener("change", syncMode);
    return () => mediaQuery.removeEventListener("change", syncMode);
  }, [canToggle, configuredMode, needsPrePaintResolution, presentation, storageKey, variables]);

  useEffect(() => {
    const measureRoot = labelMeasureRef.current;

    if (!measureRoot || typeof ResizeObserver === "undefined") {
      return;
    }

    const measureLabels = () => {
      const width = Math.max(
        ...Array.from(measureRoot.children, (label) =>
          Math.ceil(label.getBoundingClientRect().width),
        ),
        0,
      );

      if (width > 0) {
        setMeasuredLabelWidth(width);
      }
    };

    measureLabels();
    const observer = new ResizeObserver(measureLabels);
    Array.from(measureRoot.children).forEach((label) => observer.observe(label));

    return () => observer.disconnect();
  }, [presentation?.labels.dark, presentation?.labels.light]);

  if (!needsPrePaintResolution) {
    return null;
  }

  if (!canToggle || !presentation) {
    return (
      <span aria-hidden="true" data-theme-mode-anchor="true" hidden ref={rootAnchorRef} />
    );
  }

  const nextMode = resolvedMode === "dark" ? "light" : "dark";
  const currentLabel =
    resolvedMode === "dark" ? presentation.labels.dark : presentation.labels.light;
  const nextLabel = nextMode === "dark" ? presentation.labels.dark : presentation.labels.light;
  const longestLabelLength = Math.max(
    presentation.labels.dark.length,
    presentation.labels.light.length,
  );
  const modeToggleStyle = {
    "--mode-toggle-label-width": measuredLabelWidth
      ? `${measuredLabelWidth}px`
      : `${longestLabelLength + 1}ch`,
  } as CSSProperties;
  const placementClass = presentation.placement === "top-end" ? "right-4" : "left-4";

  return (
    <>
      <span aria-hidden="true" data-theme-mode-anchor="true" hidden ref={rootAnchorRef} />
      <div
        className={`lumiere-theme-mode-control fixed top-4 z-50 max-w-[calc(100vw-2rem)] ${placementClass}`}
        data-theme-mode-control={presentation.style}
      >
        <button
          aria-label={`${presentation.labels.control}: switch to ${nextLabel}`}
          aria-pressed={resolvedMode === "dark"}
          className={`lumiere-type-control grid min-h-11 grid-cols-[1.75rem_1fr] items-center gap-2 rounded-full border px-3 py-2 text-left text-[var(--foreground)] backdrop-blur transition-[background-color,border-color,transform] hover:bg-[var(--surface-muted)] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] motion-reduce:transition-none ${controlStyles[presentation.style]}`}
          onClick={(event) => {
            const root = buttonRef.current?.closest<HTMLElement>("main[data-theme-id]") ?? null;

            writeStoredMode(storageKey, nextMode);
            applyThemeMode(root, nextMode, variables);
            setResolvedMode(nextMode);
            event.currentTarget.blur();
          }}
          ref={buttonRef}
          style={modeToggleStyle}
          type="button"
        >
          <span
            aria-hidden="true"
            className="lumiere-type-control-icon relative grid size-7 place-items-center rounded-full bg-[color-mix(in_srgb,var(--background)_72%,transparent)] text-[var(--accent-strong)]"
          >
            {resolvedMode === "dark" ? "☾" : "☼"}
          </span>
          <span aria-live="polite" className="lumiere-theme-mode-control__label truncate">
            {currentLabel}
          </span>
        </button>
        <span
          aria-hidden="true"
          className="lumiere-theme-mode-control__measure"
          ref={labelMeasureRef}
        >
          <span className="lumiere-type-control">{presentation.labels.dark}</span>
          <span className="lumiere-type-control">{presentation.labels.light}</span>
        </span>
      </div>
    </>
  );
}

export function resolveBrowserMode({
  configuredMode,
  defaultPreference,
  hasDarkTokens,
  prefersDark,
  savedMode,
}: {
  configuredMode: ThemeMode;
  defaultPreference?: ThemeModeTogglePresentation["defaultPreference"];
  hasDarkTokens: boolean;
  prefersDark: boolean;
  savedMode: ResolvedThemeMode | null;
}): ResolvedThemeMode {
  if (!hasDarkTokens || configuredMode === "light") {
    return "light";
  }

  if (configuredMode === "dark") {
    return "dark";
  }

  if (configuredMode === "system") {
    return prefersDark ? "dark" : "light";
  }

  if (savedMode) {
    return savedMode;
  }

  if (defaultPreference === "dark") {
    return "dark";
  }

  if (defaultPreference === "system") {
    return prefersDark ? "dark" : "light";
  }

  return "light";
}

function applyThemeMode(
  root: HTMLElement | null,
  mode: ResolvedThemeMode,
  variables: InviteThemeModeControlProps["variables"],
) {
  if (!root) {
    return;
  }

  const nextVariables = mode === "dark" ? variables.dark : variables.light;

  Object.entries(nextVariables ?? variables.light).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
  root.style.colorScheme = mode;
  root.dataset.themeResolvedMode = mode;
}

function createThemeModeStorageKey(eventKey: string) {
  return `lumiere:theme-mode:${eventKey}`;
}

function readStoredMode(storageKey: string): ResolvedThemeMode | null {
  try {
    const value = window.localStorage.getItem(storageKey);
    return value === "dark" || value === "light" ? value : null;
  } catch {
    return null;
  }
}

function writeStoredMode(storageKey: string, mode: ResolvedThemeMode) {
  try {
    window.localStorage.setItem(storageKey, mode);
  } catch {
    // The choice still applies for this page when storage is unavailable.
  }
}
