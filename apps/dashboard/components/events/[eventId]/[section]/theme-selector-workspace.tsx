"use client";

import { ApiClientError } from "@lumiere/api-client";
import {
  evaluateThemeCompatibility,
  getTheme,
  isThemeId,
  type ThemeCompatibilityResult,
} from "@lumiere/themes";
import {
  eventThemeUpdateRequestSchema,
  type EventType,
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
import { DashboardSelect } from "../../../ui/dashboard-fields";

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
      eventType: EventType;
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
      const [eventResponse, themesResponse, eventThemeResponse] = await Promise.all([
        apiClient.getEvent(eventId),
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
        eventType: eventResponse.event.eventType,
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
  const selectedCompatibility = useMemo(
    () =>
      selectedTheme
        ? getThemeCompatibility(selectedTheme, state.eventType, state.values.themeMode)
        : undefined,
    [selectedTheme, state.eventType, state.values.themeMode],
  );

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
    const themeMode = theme.supportedModes.includes(state.values.themeMode)
      ? state.values.themeMode
      : theme.defaultMode;
    const compatibility = getThemeCompatibility(theme, state.eventType, themeMode);

    if (compatibility && !compatibility.canApply) {
      return;
    }

    updateValues({
      selectedThemeId: theme.id,
      themeMode,
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

    const parsed = parseThemeForm(state.values, selectedTheme, state.eventType);

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
            className="inline-flex min-h-10 w-fit items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-contrast)] transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--surface)] disabled:cursor-not-allowed disabled:opacity-60"
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
                compatibility={getThemeCompatibility(theme, state.eventType, theme.defaultMode)}
                eventType={state.eventType}
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

          <ThemePreview compatibility={selectedCompatibility} theme={selectedTheme} />

          <DashboardSelect
            disabled={!selectedTheme}
            error={state.fieldErrors.themeMode}
            id="theme-mode"
            label="Theme mode"
            onValueChange={(value) => updateValues({ themeMode: value as ThemeMode })}
            options={supportedModes.map((mode) => ({
              label: formatMode(mode),
              value: mode,
            }))}
            value={state.values.themeMode}
          />

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
  compatibility,
  eventType,
  isCurrent,
  isSelected,
  onSelect,
  theme,
}: {
  compatibility?: ThemeCompatibilityResult;
  eventType: EventType;
  isCurrent: boolean;
  isSelected: boolean;
  onSelect: () => void;
  theme: Theme;
}) {
  const preview = readThemePreview(theme);
  const isBlocked = compatibility ? !compatibility.canApply : false;
  const statusTone = isBlocked
    ? "error"
    : compatibility?.status === "warning"
      ? "warning"
      : "success";
  const statusLabel = isBlocked
    ? `Not for ${formatEventType(eventType)}`
    : compatibility?.status === "warning"
      ? "Fallbacks"
      : "Compatible";

  return (
    <button
      aria-pressed={isSelected}
      className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 text-left transition hover:bg-[color-mix(in_srgb,var(--surface-muted)_42%,var(--surface))] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] aria-pressed:border-[var(--accent)] aria-pressed:bg-[color-mix(in_srgb,var(--accent)_8%,var(--surface))] disabled:cursor-not-allowed disabled:opacity-65"
      disabled={isBlocked}
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
          aria-hidden="true"
          className="size-10 rounded-[var(--radius-md)] border border-[var(--border)]"
          style={{ backgroundColor: preview.swatch }}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {isCurrent ? <Badge label="Current" tone="success" /> : null}
        <Badge label={statusLabel} tone={statusTone} />
        {theme.supportedModes.map((mode) => (
          <Badge key={mode} label={formatMode(mode)} tone="neutral" />
        ))}
      </div>
      {compatibility ? (
        <p
          className={`rounded-[var(--radius-md)] px-3 py-2 text-sm leading-6 ${
            isBlocked
              ? "bg-[color-mix(in_srgb,var(--error)_10%,var(--surface))] text-[var(--error)]"
              : compatibility.status === "warning"
                ? "bg-[color-mix(in_srgb,var(--warning)_10%,var(--surface))] text-[color-mix(in_srgb,var(--foreground)_78%,transparent)]"
                : "bg-[color-mix(in_srgb,var(--success)_10%,var(--surface))] text-[var(--success)]"
          }`}
        >
          {isBlocked ? compatibility.issues[0]?.message : compatibility.summary}
        </p>
      ) : null}
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <MetadataItem label="Event fit" value={theme.eventTypes.map(formatEventType).join(", ")} />
        <MetadataItem label="Design read" value={readMetadataString(theme, "designRead")} />
      </dl>
    </button>
  );
}

function ThemePreview({
  compatibility,
  theme,
}: {
  compatibility?: ThemeCompatibilityResult;
  theme?: Theme;
}) {
  if (!theme) {
    return (
      <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--border)] p-4 text-sm">
        Select a theme to preview its registry details.
      </div>
    );
  }

  const preview = readThemePreview(theme);
  const sample = readThemePreviewSample(theme);
  const presentation = readThemePreviewPresentation(theme);
  const tokens = readThemeTokens(theme);

  return (
    <div
      className="grid gap-4 border p-4"
      data-composition-map={presentation.compositionMap}
      data-theme-preview-sample={theme.id}
      style={{
        backgroundColor: tokens.background,
        borderColor: tokens.border,
        borderRadius: presentation.radius,
        color: tokens.foreground,
        fontFamily: presentation.bodyFamily,
      }}
    >
      <header className={presentation.headerClassName}>
        <div>
          <p
            className="text-[0.68rem] font-semibold uppercase tracking-[0.2em]"
            style={{ color: tokens.accentStrong }}
          >
            {sample.eyebrow}
          </p>
          <h4
            className="mt-3 text-[clamp(1.7rem,5vw,3.4rem)] leading-[0.95] font-semibold"
            style={{ fontFamily: presentation.displayFamily }}
          >
            {sample.eventTitle}
          </h4>
        </div>
        <div className="grid content-end gap-3">
          <p className="max-w-prose text-sm leading-6">{sample.subtitle}</p>
          <p
            className="border-t pt-3 text-xs font-semibold uppercase tracking-[0.14em]"
            style={{ borderColor: tokens.border, color: tokens.accentStrong }}
          >
            {sample.venueName}
          </p>
        </div>
      </header>
      <div className={presentation.sectionsClassName}>
        {sample.sections.map((section, index) => (
          <article
            className={presentation.sectionClassName(index)}
            data-section-type={section.type}
            key={`${section.type}-${section.title}`}
            style={{ borderColor: tokens.border }}
          >
            <p
              className="text-[0.64rem] font-semibold uppercase tracking-[0.16em]"
              style={{ color: tokens.accentStrong }}
            >
              {String(index + 1).padStart(2, "0")} · {formatEventType(section.type)}
            </p>
            <h5
              className="mt-2 text-lg leading-tight font-semibold"
              style={{ fontFamily: presentation.displayFamily }}
            >
              {section.title}
            </h5>
            <p className="mt-2 text-xs leading-5">{section.summary}</p>
          </article>
        ))}
      </div>
      <div
        className="flex items-start justify-between gap-4 border-t pt-3 text-xs leading-5"
        style={{ borderColor: tokens.border }}
      >
        <p>{readMetadataString(theme, "imageTreatment")}</p>
        <span
          aria-hidden="true"
          className="mt-1 size-3 shrink-0 rounded-full"
          style={{ backgroundColor: preview.swatch }}
        />
      </div>
      {compatibility ? (
        <div
          className="grid gap-2 rounded-[var(--radius-md)] border p-3 text-sm"
          style={{ borderColor: tokens.border }}
        >
          <p className="font-semibold">Compatibility</p>
          <p className="leading-6">{compatibility.summary}</p>
          <dl className="grid gap-2 sm:grid-cols-2">
            <MetadataItem
              label="Renderer slots"
              value={`${compatibility.rendererSlots.length} checked`}
            />
            <MetadataItem
              label="Fallback slots"
              value={`${compatibility.warnings.filter((issue) => issue.code === "fallback_renderer_slot").length}`}
            />
          </dl>
        </div>
      ) : null}
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
  eventType?: EventType,
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

  const compatibility = eventType
    ? getThemeCompatibility(selectedTheme, eventType, values.themeMode)
    : undefined;

  if (compatibility && !compatibility.canApply) {
    return {
      fieldErrors: issuesToFieldErrors(compatibility.issues),
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

function Badge({
  label,
  tone,
}: {
  label: string;
  tone: "error" | "neutral" | "success" | "warning";
}) {
  return (
    <span
      className={`inline-flex rounded-[var(--radius-sm)] px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
        tone === "error"
          ? "bg-[color-mix(in_srgb,var(--error)_10%,var(--surface))] text-[var(--error)]"
          : tone === "success"
            ? "bg-[color-mix(in_srgb,var(--success)_14%,var(--surface))] text-[var(--success)]"
            : tone === "warning"
              ? "bg-[color-mix(in_srgb,var(--warning)_12%,var(--surface))] text-[color-mix(in_srgb,var(--foreground)_76%,transparent)]"
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

function readThemePreviewSample(theme: Theme) {
  const previewData = theme.metadata.previewData;
  const fallbackSummary = readMetadataString(theme, "description");

  if (!isRecord(previewData)) {
    return {
      eventTitle: theme.name,
      eyebrow: "Invitation preview",
      sections: [
        {
          summary: fallbackSummary,
          title: "Event introduction",
          type: "introduction",
        },
      ],
      subtitle: fallbackSummary,
      venueName: "Venue sample",
    };
  }

  const sections = Array.isArray(previewData.sections)
    ? previewData.sections
        .flatMap((section) =>
          isRecord(section)
            ? [
                {
                  summary: readRecordString(section, "summary", "Section treatment sample."),
                  title: readRecordString(section, "title", "Invitation section"),
                  type: readRecordString(section, "type", "custom"),
                },
              ]
            : [],
        )
        .slice(0, 3)
    : [];

  return {
    eventTitle: readRecordString(previewData, "eventTitle", theme.name),
    eyebrow: readRecordString(previewData, "eyebrow", "Invitation preview"),
    sections:
      sections.length > 0
        ? sections
        : [
            {
              summary: fallbackSummary,
              title: "Event introduction",
              type: "introduction",
            },
          ],
    subtitle: readRecordString(previewData, "subtitle", fallbackSummary),
    venueName: readRecordString(previewData, "venueName", "Venue sample"),
  };
}

function readThemePreviewPresentation(theme: Theme) {
  const composition = theme.metadata.composition;
  const visualSystem = isRecord(composition) ? composition.visualSystem : undefined;
  const compositionMap = isRecord(visualSystem)
    ? readRecordString(visualSystem, "compositionMap", "registry-default")
    : "registry-default";
  const radius = theme.metadata.radius;
  const typography = theme.metadata.typography;
  const css = isRecord(typography) ? typography.css : undefined;
  const bodyFamily = isRecord(css) ? readRecordString(css, "bodyFamily", "inherit") : "inherit";
  const displayFamily = isRecord(css)
    ? readRecordString(css, "displayFamily", "inherit")
    : "inherit";
  const radiusValue = isRecord(radius) ? radius.lg : undefined;
  const previewRadius =
    typeof radiusValue === "string" && /^(?:0|\d+(?:\.\d+)?(?:px|rem))$/.test(radiusValue)
      ? radiusValue
      : "var(--radius-lg)";

  switch (compositionMap) {
    case "ivory-editorial":
      return {
        bodyFamily,
        compositionMap,
        displayFamily,
        headerClassName:
          "grid gap-8 border-b pb-8 sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]",
        radius: previewRadius,
        sectionClassName: (index: number) =>
          `border-t pt-4 ${index === 0 ? "sm:col-span-2 sm:pr-8" : ""}`,
        sectionsClassName: "grid gap-5 sm:grid-cols-2",
      };
    case "garden-celebration":
      return {
        bodyFamily,
        compositionMap,
        displayFamily,
        headerClassName: "mx-auto grid max-w-xl gap-5 py-5 text-center",
        radius: previewRadius,
        sectionClassName: (index: number) =>
          `border-t pt-4 ${index === 0 ? "sm:col-span-2 sm:text-center" : ""}`,
        sectionsClassName: "grid gap-5 sm:grid-cols-2",
      };
    case "minimal-modern":
      return {
        bodyFamily,
        compositionMap,
        displayFamily,
        headerClassName:
          "grid gap-6 border-b pb-6 sm:grid-cols-[minmax(0,1.35fr)_minmax(10rem,0.65fr)]",
        radius: previewRadius,
        sectionClassName: () => "grid gap-1 border-t py-4 sm:grid-cols-[8rem_1fr]",
        sectionsClassName: "grid",
      };
    case "celestial-evening":
      return {
        bodyFamily,
        compositionMap,
        displayFamily,
        headerClassName: "mx-auto grid max-w-xl gap-5 py-8 text-center",
        radius: previewRadius,
        sectionClassName: () => "border-t pt-5 text-center",
        sectionsClassName: "grid gap-5 sm:grid-cols-3",
      };
    default:
      return {
        bodyFamily,
        compositionMap,
        displayFamily,
        headerClassName: "grid gap-5 border-b pb-6",
        radius: previewRadius,
        sectionClassName: () => "border-t pt-4",
        sectionsClassName: "grid gap-5 sm:grid-cols-3",
      };
  }
}

function readRecordString(record: Record<string, unknown>, key: string, fallback: string) {
  const value = record[key];

  return typeof value === "string" && value.trim() ? value.trim() : fallback;
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

function getThemeCompatibility(theme: Theme, eventType: EventType, mode: ThemeMode) {
  const themeDefinition = isThemeId(theme.id) ? getTheme(theme.id) : undefined;

  return themeDefinition
    ? evaluateThemeCompatibility({
        eventType,
        mode,
        theme: themeDefinition,
      })
    : undefined;
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
