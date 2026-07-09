"use client";

import { ApiClientError } from "@lumiere/api-client";
import {
  eventThemeUpdateRequestSchema,
  type EventThemeUpdateRequest,
  type Theme,
  type ThemeMode,
} from "@lumiere/types";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import { useDashboardAuth } from "../../../../auth/dashboard-auth-provider";
import { EventTabs } from "../../../placeholder-panels";

type ThemeState = {
  selectedThemeId: string | null;
  settingsText: string;
  themeMode: ThemeMode;
};

type FieldErrors = Partial<Record<"selectedThemeId" | "themeConfig" | "themeMode", string>>;

type ThemeWorkspaceState =
  | {
      currentThemeId?: string;
      error: null;
      fieldErrors: FieldErrors;
      formMessage: string | null;
      isSaving: boolean;
      status: "ready";
      themes: Theme[];
      values: ThemeState;
    }
  | {
      error: string | null;
      status: "error" | "loading";
    };

const defaultSettingsText = "{}";

export function ThemeSelectorWorkspace({ eventId }: { eventId: string }) {
  const { apiClient } = useDashboardAuth();
  const [state, setState] = useState<ThemeWorkspaceState>({
    error: null,
    status: "loading",
  });

  const loadThemes = useCallback(async () => {
    if (!apiClient) {
      setState({
        error: "Dashboard API is not configured.",
        status: "error",
      });
      return;
    }

    setState({
      error: null,
      status: "loading",
    });

    try {
      const [themesResponse, eventThemeResponse] = await Promise.all([
        apiClient.listThemes(),
        apiClient.getEventTheme(eventId),
      ]);
      const selectedTheme =
        eventThemeResponse.theme ??
        themesResponse.themes.find((theme) => theme.id === eventThemeResponse.selectedThemeId) ??
        themesResponse.themes[0];
      const selectedThemeId = selectedTheme?.id ?? null;
      const themeMode =
        eventThemeResponse.themeMode &&
        selectedTheme?.supportedModes.includes(eventThemeResponse.themeMode)
          ? eventThemeResponse.themeMode
          : (selectedTheme?.defaultMode ?? "system");

      setState({
        currentThemeId: eventThemeResponse.selectedThemeId,
        error: null,
        fieldErrors: {},
        formMessage: null,
        isSaving: false,
        status: "ready",
        themes: themesResponse.themes,
        values: {
          selectedThemeId,
          settingsText: formatSettingsText(eventThemeResponse.themeConfig),
          themeMode,
        },
      });
    } catch (error) {
      setState({
        error: toFriendlyApiMessage(error),
        status: "error",
      });
    }
  }, [apiClient, eventId]);

  useEffect(() => {
    void loadThemes();
  }, [loadThemes]);

  if (state.status === "loading") {
    return (
      <div className="grid gap-5">
        <EventTabs active="theme" eventId={eventId} />
        <ThemeLoading />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="grid gap-5">
        <EventTabs active="theme" eventId={eventId} />
        <section
          className="grid gap-3 rounded-[var(--radius-lg)] border border-[var(--error)] bg-[color-mix(in_srgb,var(--error)_10%,var(--surface))] p-5 text-[var(--error)]"
          role="alert"
        >
          <h2 className="text-lg font-semibold">Unable to load theme settings</h2>
          <p className="text-sm">{state.error}</p>
          <button
            className="inline-flex min-h-10 w-fit items-center justify-center rounded-[var(--radius-md)] border border-[var(--error)] px-4 text-sm font-semibold transition hover:bg-[color-mix(in_srgb,var(--error)_12%,transparent)] focus:outline-none focus:ring-2 focus:ring-[var(--error)]"
            onClick={() => void loadThemes()}
            type="button"
          >
            Try again
          </button>
        </section>
      </div>
    );
  }

  const readyState = state.status === "ready" ? state : null;

  if (!readyState) {
    return null;
  }

  return <ThemeSelectorContent eventId={eventId} state={readyState} updateState={setState} />;
}

function ThemeSelectorContent({
  eventId,
  state,
  updateState,
}: {
  eventId: string;
  state: Extract<ThemeWorkspaceState, { status: "ready" }>;
  updateState: Dispatch<SetStateAction<ThemeWorkspaceState>>;
}) {
  const { apiClient } = useDashboardAuth();
  const selectedTheme = useMemo(
    () => state.themes.find((theme) => theme.id === state.values.selectedThemeId),
    [state.themes, state.values.selectedThemeId],
  );
  const supportedModes = selectedTheme?.supportedModes ?? [];

  const updateValues = (values: Partial<ThemeState>) => {
    updateState((current) =>
      current.status === "ready"
        ? {
            ...current,
            fieldErrors: {},
            formMessage: null,
            values: {
              ...current.values,
              ...values,
            },
          }
        : current,
    );
  };

  const selectTheme = (theme: Theme) => {
    updateValues({
      selectedThemeId: theme.id,
      themeMode: theme.supportedModes.includes(state.values.themeMode)
        ? state.values.themeMode
        : theme.defaultMode,
    });
  };

  const saveTheme = async () => {
    if (!apiClient) {
      updateState((current) =>
        current.status === "ready"
          ? {
              ...current,
              fieldErrors: {},
              formMessage: "Dashboard API is not configured.",
            }
          : current,
      );
      return;
    }

    const parsed = parseThemeForm(state.values, selectedTheme);

    if (!parsed.ok) {
      updateState((current) =>
        current.status === "ready"
          ? {
              ...current,
              fieldErrors: parsed.fieldErrors,
              formMessage: parsed.formMessage,
            }
          : current,
      );
      return;
    }

    updateState((current) =>
      current.status === "ready"
        ? {
            ...current,
            fieldErrors: {},
            formMessage: null,
            isSaving: true,
          }
        : current,
    );

    try {
      const response = await apiClient.updateEventTheme(eventId, parsed.input);

      updateState((current) =>
        current.status === "ready"
          ? {
              ...current,
              currentThemeId: response.selectedThemeId,
              fieldErrors: {},
              formMessage: "Theme settings saved.",
              isSaving: false,
              values: {
                selectedThemeId: response.selectedThemeId ?? parsed.input.selectedThemeId,
                settingsText: formatSettingsText(response.themeConfig),
                themeMode: response.themeMode,
              },
            }
          : current,
      );
    } catch (error) {
      const formError = toThemeFormError(error);

      updateState((current) =>
        current.status === "ready"
          ? {
              ...current,
              fieldErrors: formError.fieldErrors,
              formMessage: formError.formMessage,
              isSaving: false,
            }
          : current,
      );
    }
  };

  return (
    <div className="grid gap-5">
      <EventTabs active="theme" eventId={eventId} />

      <section className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--accent-strong)]">Theme selector</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Choose the invitation design system
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
              Themes come from the Lumiere registry. Pick a supported mode, adjust settings as JSON,
              then save the selection for this event.
            </p>
          </div>
          <button
            className="inline-flex min-h-10 w-fit items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--surface)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={state.isSaving}
            onClick={() => void saveTheme()}
            type="button"
          >
            {state.isSaving ? "Saving theme..." : "Save theme"}
          </button>
        </div>

        {state.formMessage ? (
          <p
            className={`rounded-[var(--radius-md)] border px-3 py-2 text-sm ${
              Object.keys(state.fieldErrors).length > 0
                ? "border-[var(--error)] bg-[color-mix(in_srgb,var(--error)_10%,var(--surface))] text-[var(--error)]"
                : "border-[var(--success)] bg-[color-mix(in_srgb,var(--success)_10%,var(--surface))] text-[var(--success)]"
            }`}
            role="status"
          >
            {state.formMessage}
          </p>
        ) : null}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,28rem)]">
        <div className="grid gap-3">
          {state.themes.length === 0 ? (
            <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--surface)] p-5">
              <h3 className="text-lg font-semibold">No themes available</h3>
              <p className="mt-2 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
                The theme registry returned no selectable themes.
              </p>
            </div>
          ) : (
            state.themes.map((theme) => (
              <ThemeOption
                isCurrent={state.currentThemeId === theme.id}
                isSelected={state.values.selectedThemeId === theme.id}
                key={theme.id}
                onSelect={() => selectTheme(theme)}
                theme={theme}
              />
            ))
          )}
        </div>

        <aside className="grid content-start gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 xl:sticky xl:top-4">
          <div>
            <h3 className="text-xl font-semibold tracking-tight">Preview and settings</h3>
            <p className="mt-1 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_70%,transparent)]">
              Preview uses the selected theme metadata and registry tokens.
            </p>
          </div>

          <ThemePreview theme={selectedTheme} />

          <div className="grid gap-2">
            <label className="text-sm font-semibold" htmlFor="theme-mode">
              Theme mode
            </label>
            <select
              className={inputClassName}
              disabled={!selectedTheme}
              id="theme-mode"
              onChange={(event) => updateValues({ themeMode: event.target.value as ThemeMode })}
              value={state.values.themeMode}
            >
              {supportedModes.map((mode) => (
                <option key={mode} value={mode}>
                  {formatMode(mode)}
                </option>
              ))}
            </select>
            {state.fieldErrors.themeMode ? (
              <p className="text-sm text-[var(--error)]" role="alert">
                {state.fieldErrors.themeMode}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold" htmlFor="theme-config">
              Theme settings JSON
            </label>
            <textarea
              className={`${inputClassName} min-h-44 resize-y font-mono`}
              id="theme-config"
              onChange={(event) => updateValues({ settingsText: event.target.value })}
              spellCheck={false}
              value={state.values.settingsText}
            />
            <p className="text-xs leading-5 text-[color-mix(in_srgb,var(--foreground)_64%,transparent)]">
              Keep settings as a JSON object. The registry currently accepts theme metadata here,
              with stricter setting fields planned for section-builder work.
            </p>
            {state.fieldErrors.themeConfig ? (
              <p className="text-sm text-[var(--error)]" role="alert">
                {state.fieldErrors.themeConfig}
              </p>
            ) : null}
          </div>

          {state.fieldErrors.selectedThemeId ? (
            <p className="text-sm text-[var(--error)]" role="alert">
              {state.fieldErrors.selectedThemeId}
            </p>
          ) : null}
        </aside>
      </section>
    </div>
  );
}

function ThemeOption({
  isCurrent,
  isSelected,
  onSelect,
  theme,
}: {
  isCurrent: boolean;
  isSelected: boolean;
  onSelect: () => void;
  theme: Theme;
}) {
  const preview = readThemePreview(theme);

  return (
    <button
      aria-pressed={isSelected}
      className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 text-left transition hover:bg-[color-mix(in_srgb,var(--surface-muted)_42%,var(--surface))] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] aria-pressed:border-[var(--accent)] aria-pressed:bg-[color-mix(in_srgb,var(--accent)_8%,var(--surface))]"
      onClick={onSelect}
      type="button"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-lg font-semibold">{theme.name}</p>
          <p className="mt-1 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
            {preview.summary}
          </p>
        </div>
        <span
          className="size-10 rounded-[var(--radius-md)] border border-[var(--border)]"
          style={{ backgroundColor: preview.swatch }}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {isCurrent ? <Badge label="Current" tone="success" /> : null}
        {theme.supportedModes.map((mode) => (
          <Badge key={mode} label={formatMode(mode)} tone="neutral" />
        ))}
      </div>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <MetadataItem label="Event fit" value={theme.eventTypes.map(formatEventType).join(", ")} />
        <MetadataItem label="Design read" value={readMetadataString(theme, "designRead")} />
      </dl>
    </button>
  );
}

function ThemePreview({ theme }: { theme?: Theme }) {
  if (!theme) {
    return (
      <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--border)] p-4 text-sm">
        Select a theme to preview its registry details.
      </div>
    );
  }

  const preview = readThemePreview(theme);
  const tokens = readThemeTokens(theme);

  return (
    <div
      className="grid gap-4 rounded-[var(--radius-lg)] border p-4"
      style={{
        backgroundColor: tokens.background,
        borderColor: tokens.border,
        color: tokens.foreground,
      }}
    >
      <div
        className="rounded-[var(--radius-md)] border p-4"
        style={{
          backgroundColor: tokens.surface,
          borderColor: tokens.border,
        }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-[0.16em]"
          style={{ color: tokens.accentStrong }}
        >
          {theme.name}
        </p>
        <h4 className="mt-2 text-xl font-semibold">{preview.summary}</h4>
        <p className="mt-2 text-sm leading-6">{readMetadataString(theme, "description")}</p>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[tokens.accent, tokens.surfaceMuted, tokens.success, tokens.warning].map((color) => (
          <span
            className="h-10 rounded-[var(--radius-sm)] border"
            key={color}
            style={{ backgroundColor: color, borderColor: tokens.border }}
          />
        ))}
      </div>
      <p className="text-sm leading-6">{readMetadataString(theme, "imageTreatment")}</p>
    </div>
  );
}

function ThemeLoading() {
  return (
    <div className="grid gap-5" aria-label="Loading theme settings" aria-live="polite">
      <div className="h-32 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-muted)]" />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,28rem)]">
        <div className="grid gap-3">
          {[0, 1, 2].map((item) => (
            <div
              className="h-40 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-muted)]"
              key={item}
            />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-muted)]" />
      </div>
    </div>
  );
}

export function parseThemeForm(
  values: ThemeState,
  selectedTheme?: Theme,
):
  | {
      input: EventThemeUpdateRequest;
      ok: true;
    }
  | {
      fieldErrors: FieldErrors;
      formMessage: string;
      ok: false;
    } {
  if (!selectedTheme || !values.selectedThemeId) {
    return {
      fieldErrors: {
        selectedThemeId: "Select a theme before saving.",
      },
      formMessage: "Check the highlighted theme fields before saving.",
      ok: false,
    };
  }

  const parsedSettings = parseJsonObject(values.settingsText);

  if (!parsedSettings.ok) {
    return {
      fieldErrors: {
        themeConfig: parsedSettings.message,
      },
      formMessage: "Check the highlighted theme fields before saving.",
      ok: false,
    };
  }

  if (!selectedTheme.supportedModes.includes(values.themeMode)) {
    return {
      fieldErrors: {
        themeMode: `${selectedTheme.name} does not support ${formatMode(values.themeMode)} mode.`,
      },
      formMessage: "Check the highlighted theme fields before saving.",
      ok: false,
    };
  }

  const parsedRequest = eventThemeUpdateRequestSchema.safeParse({
    selectedThemeId: values.selectedThemeId,
    themeConfig: parsedSettings.value,
    themeMode: values.themeMode,
  });

  if (parsedRequest.success) {
    return {
      input: parsedRequest.data,
      ok: true,
    };
  }

  return {
    fieldErrors: issuesToFieldErrors(parsedRequest.error.issues),
    formMessage: "Check the highlighted theme fields before saving.",
    ok: false,
  };
}

function parseJsonObject(value: string):
  | {
      ok: true;
      value: Record<string, unknown>;
    }
  | {
      message: string;
      ok: false;
    } {
  try {
    const parsed = JSON.parse(value || defaultSettingsText) as unknown;

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {
        message: "Theme settings must be a JSON object.",
        ok: false,
      };
    }

    return {
      ok: true,
      value: parsed as Record<string, unknown>,
    };
  } catch {
    return {
      message: "Theme settings must be valid JSON.",
      ok: false,
    };
  }
}

function toThemeFormError(error: unknown) {
  if (error instanceof ApiClientError) {
    return {
      fieldErrors: issuesToFieldErrors(error.apiError.error.fields ?? []),
      formMessage: error.apiError.error.message,
    };
  }

  return {
    fieldErrors: {},
    formMessage: toFriendlyApiMessage(error),
  };
}

function issuesToFieldErrors(issues: Array<{ message: string; path: readonly unknown[] }>) {
  const fieldErrors: FieldErrors = {};

  for (const issue of issues) {
    const field = issue.path[0];

    if (
      (field === "selectedThemeId" || field === "themeConfig" || field === "themeMode") &&
      !fieldErrors[field]
    ) {
      fieldErrors[field] = issue.message;
    }
  }

  return fieldErrors;
}

function MetadataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--surface-muted)] p-3">
      <dt className="text-[color-mix(in_srgb,var(--foreground)_62%,transparent)]">{label}</dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  );
}

function Badge({ label, tone }: { label: string; tone: "neutral" | "success" }) {
  return (
    <span
      className={`inline-flex rounded-[var(--radius-sm)] px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
        tone === "success"
          ? "bg-[color-mix(in_srgb,var(--success)_14%,var(--surface))] text-[var(--success)]"
          : "bg-[var(--surface-muted)] text-[color-mix(in_srgb,var(--foreground)_68%,transparent)]"
      }`}
    >
      {label}
    </span>
  );
}

function formatSettingsText(value: unknown) {
  return JSON.stringify(
    value && typeof value === "object" && !Array.isArray(value) ? value : {},
    null,
    2,
  );
}

function readThemePreview(theme: Theme) {
  const dashboardPreview = theme.metadata.dashboardPreview;

  if (isRecord(dashboardPreview)) {
    return {
      summary: typeof dashboardPreview.summary === "string" ? dashboardPreview.summary : theme.name,
      swatch: typeof dashboardPreview.swatch === "string" ? dashboardPreview.swatch : "#6f5a38",
    };
  }

  return {
    summary: theme.name,
    swatch: "#6f5a38",
  };
}

function readThemeTokens(theme: Theme) {
  const tokens = theme.metadata.tokens;

  if (!isRecord(tokens)) {
    return defaultPreviewTokens;
  }

  const light = tokens.light;

  if (!isRecord(light)) {
    return defaultPreviewTokens;
  }

  return {
    accent: readColor(light.accent, defaultPreviewTokens.accent),
    accentStrong: readColor(light.accentStrong, defaultPreviewTokens.accentStrong),
    background: readColor(light.background, defaultPreviewTokens.background),
    border: readColor(light.border, defaultPreviewTokens.border),
    foreground: readColor(light.foreground, defaultPreviewTokens.foreground),
    success: readColor(light.success, defaultPreviewTokens.success),
    surface: readColor(light.surface, defaultPreviewTokens.surface),
    surfaceMuted: readColor(light.surfaceMuted, defaultPreviewTokens.surfaceMuted),
    warning: readColor(light.warning, defaultPreviewTokens.warning),
  };
}

function readMetadataString(theme: Theme, key: string) {
  const value = theme.metadata[key];

  return typeof value === "string" && value.trim() ? value.trim() : "Not specified";
}

function readColor(value: unknown, fallback: string) {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function formatEventType(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatMode(value: ThemeMode) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function toFriendlyApiMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.apiError.error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to complete the dashboard request.";
}

const defaultPreviewTokens = {
  accent: "#6f5a38",
  accentStrong: "#3f3422",
  background: "#f7f5f0",
  border: "#d8d1c5",
  foreground: "#1f2528",
  success: "#28724f",
  surface: "#fffefd",
  surfaceMuted: "#ebe7df",
  warning: "#9b651c",
};

const inputClassName =
  "min-h-11 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition hover:border-[var(--accent)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60";
