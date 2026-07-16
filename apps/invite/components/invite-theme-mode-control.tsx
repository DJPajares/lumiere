"use client";

import type { ThemeModeTogglePresentation } from "@lumiere/themes";
import type { ThemeMode } from "@lumiere/types";
import { useEffect, useMemo, useRef, useState } from "react";

export type ResolvedThemeMode = "dark" | "light";
export type ThemeModeVariables = Record<string, string>;

type InviteThemeModeControlProps = {
  configuredMode: ThemeMode;
  eventKey: string;
  hasAmbientAudio: boolean;
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
  organic:
    "rounded-[var(--radius-lg)] border-[color-mix(in_srgb,var(--border)_78%,transparent)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] shadow-[0_12px_36px_color-mix(in_srgb,var(--accent)_14%,transparent)]",
  seasonal:
    "border-[color-mix(in_srgb,var(--accent)_42%,var(--border))] bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] shadow-[0_12px_36px_color-mix(in_srgb,var(--accent)_15%,transparent)]",
  "soft-pill":
    "border-[color-mix(in_srgb,var(--border)_78%,transparent)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] shadow-[0_12px_36px_color-mix(in_srgb,var(--accent)_14%,transparent)]",
};

export function InviteThemeModeControl({
  configuredMode,
  eventKey,
  hasAmbientAudio,
  initialMode,
  presentation,
  variables,
}: InviteThemeModeControlProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const [resolvedMode, setResolvedMode] = useState(initialMode);
  const storageKey = useMemo(() => createThemeModeStorageKey(eventKey), [eventKey]);
  const canToggle =
    configuredMode === "toggleable" && Boolean(presentation) && Boolean(variables.dark);
  const needsPrePaintResolution = configuredMode === "system" || canToggle;

  useEffect(() => {
    if (!needsPrePaintResolution) {
      return;
    }

    const root =
      (buttonRef.current ?? scriptRef.current)?.closest<HTMLElement>("main[data-theme-id]") ?? null;
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
      setResolvedMode(nextMode);
    };

    syncMode();

    if (!followsSystem || !mediaQuery) {
      return;
    }

    mediaQuery.addEventListener("change", syncMode);
    return () => mediaQuery.removeEventListener("change", syncMode);
  }, [canToggle, configuredMode, needsPrePaintResolution, presentation, storageKey, variables]);

  if (!needsPrePaintResolution) {
    return null;
  }

  const initializationScript = buildThemeInitializationScript({
    configuredMode,
    defaultPreference: presentation?.defaultPreference,
    storageKey,
    variables,
  });

  if (!canToggle || !presentation) {
    return (
      <script
        data-theme-mode-initializer="true"
        dangerouslySetInnerHTML={{ __html: initializationScript }}
        ref={scriptRef}
      />
    );
  }

  const nextMode = resolvedMode === "dark" ? "light" : "dark";
  const currentLabel =
    resolvedMode === "dark" ? presentation.labels.dark : presentation.labels.light;
  const nextLabel = nextMode === "dark" ? presentation.labels.dark : presentation.labels.light;
  const placementClass = presentation.placement === "top-end" ? "right-4" : "left-4";
  const verticalPlacementClass = hasAmbientAudio ? "top-20 sm:top-4" : "top-4";

  return (
    <>
      <script
        data-theme-mode-initializer="true"
        dangerouslySetInnerHTML={{ __html: initializationScript }}
        ref={scriptRef}
      />
      <div
        className={`fixed z-50 max-w-[calc(100vw-2rem)] ${placementClass} ${verticalPlacementClass}`}
        data-theme-mode-control={presentation.style}
      >
        <button
          aria-label={`${presentation.labels.control}: switch to ${nextLabel}`}
          aria-pressed={resolvedMode === "dark"}
          className={`lumiere-type-control grid min-h-11 grid-cols-[1.75rem_1fr] items-center gap-2 rounded-full border px-3 py-2 text-left text-[var(--foreground)] backdrop-blur transition-[background-color,border-color,transform] hover:bg-[var(--surface-muted)] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] motion-reduce:transition-none ${controlStyles[presentation.style]}`}
          onClick={() => {
            const root = buttonRef.current?.closest<HTMLElement>("main[data-theme-id]") ?? null;

            writeStoredMode(storageKey, nextMode);
            applyThemeMode(root, nextMode, variables);
            setResolvedMode(nextMode);
          }}
          ref={buttonRef}
          type="button"
        >
          <span
            aria-hidden="true"
            className="lumiere-type-label relative grid size-7 place-items-center rounded-full border border-[color-mix(in_srgb,var(--border)_72%,transparent)] bg-[var(--background)] text-[var(--accent-strong)]"
          >
            {resolvedMode === "dark" ? "☾" : "☼"}
          </span>
          <span aria-live="polite" className="truncate">
            {currentLabel}
          </span>
        </button>
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

function buildThemeInitializationScript({
  configuredMode,
  defaultPreference,
  storageKey,
  variables,
}: {
  configuredMode: ThemeMode;
  defaultPreference?: ThemeModeTogglePresentation["defaultPreference"];
  storageKey: string;
  variables: InviteThemeModeControlProps["variables"];
}) {
  const payload = JSON.stringify({
    configuredMode,
    defaultPreference,
    storageKey,
    variables,
  }).replace(/</g, "\\u003c");

  return `(function(){var c=${payload};var r=document.currentScript&&document.currentScript.parentElement;if(!r)return;var s=null;if(c.configuredMode==='toggleable'){try{s=localStorage.getItem(c.storageKey)}catch(e){}}var d=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;var m=!c.variables.dark||c.configuredMode==='light'?'light':c.configuredMode==='dark'?'dark':c.configuredMode==='system'?(d?'dark':'light'):s==='dark'||s==='light'?s:c.defaultPreference==='dark'?'dark':c.defaultPreference==='system'&&d?'dark':'light';var v=m==='dark'?c.variables.dark:c.variables.light;Object.keys(v).forEach(function(k){r.style.setProperty(k,v[k])});r.style.colorScheme=m;r.dataset.themeResolvedMode=m})()`;
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
