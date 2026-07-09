"use client";

import { ApiClientError } from "@lumiere/api-client";
import {
  canDisableBlueprintSection,
  getBlueprintSectionOrder,
  getBlueprintSectionRequirement,
  getSectionBlueprint,
  getSectionDefinition,
  getTheme,
  isThemeId,
  validateEventTypeSections,
  type SectionBlueprintRequirement,
  type ThemeDefinition,
} from "@lumiere/themes";
import {
  eventSectionsUpdateRequestSchema,
  jsonObjectSchema,
  type Event,
  type EventSection,
  type EventSectionsUpdateRequest,
  type JsonValue,
  type SectionType,
  type SectionVisibility,
  type Theme,
} from "@lumiere/types";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type Dispatch,
  type SetStateAction,
} from "react";

import { useDashboardAuth } from "../../../../auth/dashboard-auth-provider";
import { EventTabs } from "../../../placeholder-panels";

type JsonObject = Record<string, JsonValue>;

type SectionDraft = {
  contentText: string;
  enabled: boolean;
  id?: string;
  sectionKey: string;
  sectionType: SectionType;
  settingsText: string;
  sortOrder: number;
  visibility: SectionVisibility;
};

type SectionErrors = Partial<Record<"content" | "settings" | "visibility", string>>;
type SectionErrorMap = Record<string, SectionErrors>;
type PreviewContext = "guest" | "public";

type SectionPreviewModel = {
  canDisable: boolean;
  content?: JsonObject;
  disableLockReason?: string;
  errors: SectionErrors;
  requirement: SectionBlueprintRequirement;
  section: SectionDraft;
  settings?: JsonObject;
  status: "disabled" | "hidden" | "invalid" | "ready";
  statusLabel: string;
  visibleInGuest: boolean;
  visibleInPublic: boolean;
};

type BuilderReadyState = {
  event: Event;
  error: null;
  formMessage: string | null;
  isSaving: boolean;
  sectionErrors: SectionErrorMap;
  sections: SectionDraft[];
  status: "ready";
  theme: Theme;
};

type BuilderState =
  | BuilderReadyState
  | {
      error: string | null;
      status: "error" | "loading" | "theme-missing";
    };

const emptyJsonText = "{}";
const visibilityOptions: Array<{ label: string; value: SectionVisibility }> = [
  { label: "Public", value: "public" },
  { label: "Guest-only", value: "guest_only" },
  { label: "Hidden", value: "hidden" },
];

const sectionTypeValues: SectionType[] = [
  "introduction",
  "profile",
  "date",
  "story",
  "details",
  "entourage",
  "dress_code",
  "location",
  "gallery",
  "rsvp",
  "outro",
  "custom",
];

export function SectionBuilderWorkspace({ eventId }: { eventId: string }) {
  const { apiClient } = useDashboardAuth();
  const [state, setState] = useState<BuilderState>({
    error: null,
    status: "loading",
  });

  const loadSections = useCallback(async () => {
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
      const [eventResponse, themeResponse, sectionsResponse] = await Promise.all([
        apiClient.getEvent(eventId),
        apiClient.getEventTheme(eventId),
        apiClient.listEventSections(eventId),
      ]);

      if (!themeResponse.selectedThemeId || !themeResponse.theme) {
        setState({
          error: null,
          status: "theme-missing",
        });
        return;
      }

      setState({
        error: null,
        event: eventResponse.event,
        formMessage: null,
        isSaving: false,
        sectionErrors: {},
        sections: createSectionDrafts({
          event: eventResponse.event,
          existingSections: sectionsResponse.sections,
          theme: themeResponse.theme,
        }),
        status: "ready",
        theme: themeResponse.theme,
      });
    } catch (error) {
      setState({
        error: toFriendlyApiMessage(error),
        status: "error",
      });
    }
  }, [apiClient, eventId]);

  useEffect(() => {
    void loadSections();
  }, [loadSections]);

  if (state.status === "loading") {
    return (
      <div className="grid gap-5">
        <EventTabs active="content" eventId={eventId} />
        <SectionLoading />
      </div>
    );
  }

  if (state.status === "theme-missing") {
    return (
      <div className="grid gap-5">
        <EventTabs active="content" eventId={eventId} />
        <section className="grid gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-lg font-semibold">Choose a theme before editing sections</h2>
          <p className="max-w-2xl text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
            Section support comes from the selected theme registry entry. Choose a theme, then
            return here to configure content, visibility, and order.
          </p>
          <Link
            className="inline-flex min-h-10 w-fit items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-contrast)] transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--surface)]"
            href={`/events/${eventId}/theme`}
          >
            Choose theme
          </Link>
        </section>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="grid gap-5">
        <EventTabs active="content" eventId={eventId} />
        <section
          className="grid gap-3 rounded-[var(--radius-lg)] border border-[var(--error)] bg-[color-mix(in_srgb,var(--error)_10%,var(--surface))] p-5 text-[var(--error)]"
          role="alert"
        >
          <h2 className="text-lg font-semibold">Unable to load sections</h2>
          <p className="text-sm">{state.error}</p>
          <button
            className="inline-flex min-h-10 w-fit items-center justify-center rounded-[var(--radius-md)] border border-[var(--error)] px-4 text-sm font-semibold transition hover:bg-[color-mix(in_srgb,var(--error)_12%,transparent)] focus:outline-none focus:ring-2 focus:ring-[var(--error)]"
            onClick={() => void loadSections()}
            type="button"
          >
            Try again
          </button>
        </section>
      </div>
    );
  }

  if (state.status !== "ready") {
    return null;
  }

  return <SectionBuilderContent eventId={eventId} state={state} updateState={setState} />;
}

function SectionBuilderContent({
  eventId,
  state,
  updateState,
}: {
  eventId: string;
  state: BuilderReadyState;
  updateState: Dispatch<SetStateAction<BuilderState>>;
}) {
  const { apiClient } = useDashboardAuth();
  const enabledCount = useMemo(
    () => state.sections.filter((section) => section.enabled).length,
    [state.sections],
  );
  const [selectedSectionKey, setSelectedSectionKey] = useState(
    () => state.sections[0]?.sectionKey ?? "",
  );
  const [previewContext, setPreviewContext] = useState<PreviewContext>("guest");
  const previewModels = useMemo(
    () => createSectionPreviewModels(state.sections, state.theme, state.event),
    [state.event, state.sections, state.theme],
  );
  const selectedPreview =
    previewModels.find((model) => model.section.sectionKey === selectedSectionKey) ??
    previewModels[0];
  const nextSuggestedSection = getNextSuggestedSection(previewModels);
  const validEnabledCount = previewModels.filter(
    (model) => model.section.enabled && model.status !== "invalid",
  ).length;
  const invalidEnabledCount = previewModels.filter((model) => model.status === "invalid").length;
  const formDetail = state.sectionErrors._form?.content;

  useEffect(() => {
    if (!previewModels.some((model) => model.section.sectionKey === selectedSectionKey)) {
      setSelectedSectionKey(previewModels[0]?.section.sectionKey ?? "");
    }
  }, [previewModels, selectedSectionKey]);

  const updateSection = (sectionKey: string, updates: Partial<SectionDraft>) => {
    updateState((current) =>
      current.status === "ready"
        ? {
            ...current,
            formMessage: null,
            sectionErrors: withoutSectionErrors(current.sectionErrors, sectionKey),
            sections: current.sections.map((section) =>
              section.sectionKey === sectionKey
                ? {
                    ...section,
                    ...updates,
                  }
                : section,
            ),
          }
        : current,
    );
  };

  const moveSection = (sectionKey: string, direction: -1 | 1) => {
    updateState((current) => {
      if (current.status !== "ready") {
        return current;
      }

      const index = current.sections.findIndex((section) => section.sectionKey === sectionKey);
      const targetIndex = index + direction;

      if (index < 0 || targetIndex < 0 || targetIndex >= current.sections.length) {
        return current;
      }

      const sections = [...current.sections];
      const [section] = sections.splice(index, 1);

      if (!section) {
        return current;
      }

      sections.splice(targetIndex, 0, section);

      return {
        ...current,
        formMessage: null,
        sections: sections.map((item, nextIndex) => ({
          ...item,
          sortOrder: nextIndex,
        })),
      };
    });
  };

  const saveSections = async () => {
    if (!apiClient) {
      updateState((current) =>
        current.status === "ready"
          ? {
              ...current,
              formMessage: "Dashboard API is not configured.",
              sectionErrors: {},
            }
          : current,
      );
      return;
    }

    const parsed = parseSectionDrafts(state.sections, {
      event: state.event,
    });

    if (!parsed.ok) {
      updateState((current) =>
        current.status === "ready"
          ? {
              ...current,
              formMessage: parsed.formMessage,
              sectionErrors: parsed.sectionErrors,
            }
          : current,
      );
      return;
    }

    updateState((current) =>
      current.status === "ready"
        ? {
            ...current,
            formMessage: null,
            isSaving: true,
            sectionErrors: {},
          }
        : current,
    );

    try {
      const response = await apiClient.updateEventSections(eventId, parsed.input);

      updateState((current) =>
        current.status === "ready"
          ? {
              ...current,
              formMessage: "Sections saved.",
              isSaving: false,
              sectionErrors: {},
              sections: createSectionDrafts({
                event: current.event,
                existingSections: response.sections,
                theme: current.theme,
              }),
            }
          : current,
      );
    } catch (error) {
      const formError = toSectionFormError(error);

      updateState((current) =>
        current.status === "ready"
          ? {
              ...current,
              formMessage: formError.formMessage,
              isSaving: false,
              sectionErrors: formError.sectionErrors,
            }
          : current,
      );
    }
  };

  const enableSuggestedSection = () => {
    if (!nextSuggestedSection) {
      return;
    }

    setSelectedSectionKey(nextSuggestedSection.section.sectionKey);
    updateSection(nextSuggestedSection.section.sectionKey, {
      enabled: true,
    });
  };

  return (
    <div className="grid gap-5">
      <EventTabs active="content" eventId={eventId} />

      <section className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--accent-strong)]">Section builder</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Configure content for {state.event.title}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
              {state.theme.name} supports {state.sections.length} section types. Work from the live
              preview, then save once the visible sections validate against the invite renderer
              contract.
            </p>
          </div>
          <button
            className="inline-flex min-h-10 w-fit items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-contrast)] transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--surface)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={state.isSaving}
            onClick={() => void saveSections()}
            type="button"
          >
            {state.isSaving ? "Saving sections..." : "Save sections"}
          </button>
        </div>

        <dl className="grid gap-3 text-sm sm:grid-cols-4">
          <SummaryItem label="Enabled sections" value={`${enabledCount}`} />
          <SummaryItem label="Ready to publish" value={`${validEnabledCount}`} />
          <SummaryItem label="Needs fixes" value={`${invalidEnabledCount}`} />
          <SummaryItem label="Selected theme" value={state.theme.name} />
          <SummaryItem label="Theme mode" value={formatMode(state.event.themeMode)} />
        </dl>

        {nextSuggestedSection ? (
          <div className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-muted)] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">Recommended next section</p>
              <p className="mt-1 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_70%,transparent)]">
                Add {getSectionDefinition(nextSuggestedSection.section.sectionType).label} next. It
                is {nextSuggestedSection.requirement} for {formatEventType(state.event.eventType)}{" "}
                events in the selected theme.
              </p>
            </div>
            <button
              className={secondaryButtonClassName}
              onClick={enableSuggestedSection}
              type="button"
            >
              Enable and preview
            </button>
          </div>
        ) : null}

        {state.formMessage ? (
          <div
            className={`rounded-[var(--radius-md)] border px-3 py-2 text-sm ${
              Object.keys(state.sectionErrors).length > 0
                ? "border-[var(--error)] bg-[color-mix(in_srgb,var(--error)_10%,var(--surface))] text-[var(--error)]"
                : "border-[var(--success)] bg-[color-mix(in_srgb,var(--success)_10%,var(--surface))] text-[var(--success)]"
            }`}
            role="status"
          >
            <p>{state.formMessage}</p>
            {formDetail ? <p className="mt-1 leading-6">{formDetail}</p> : null}
          </div>
        ) : null}
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(21rem,0.78fr)] xl:items-start">
        <SectionOrderPanel
          models={previewModels}
          onSelect={setSelectedSectionKey}
          selectedSectionKey={selectedPreview?.section.sectionKey}
        />

        <SectionPreviewPanel
          event={state.event}
          model={selectedPreview}
          previewContext={previewContext}
          setPreviewContext={setPreviewContext}
          theme={state.theme}
        />

        <section className="grid gap-4 xl:col-start-1" aria-label="Supported sections">
          {previewModels.map((model, index) => (
            <SectionEditor
              errors={{
                ...model.errors,
                ...(state.sectionErrors[model.section.sectionKey] ?? {}),
              }}
              isFirst={index === 0}
              isLast={index === previewModels.length - 1}
              isSelected={model.section.sectionKey === selectedPreview?.section.sectionKey}
              key={model.section.sectionKey}
              moveSection={moveSection}
              onSelect={setSelectedSectionKey}
              requirement={model.requirement}
              section={model.section}
              canDisable={model.canDisable}
              disableLockReason={model.disableLockReason}
              statusLabel={model.statusLabel}
              updateSection={updateSection}
            />
          ))}
        </section>
      </div>
    </div>
  );
}

function SectionOrderPanel({
  models,
  onSelect,
  selectedSectionKey,
}: {
  models: SectionPreviewModel[];
  onSelect: (sectionKey: string) => void;
  selectedSectionKey?: string;
}) {
  return (
    <section
      aria-label="Section order and validation"
      className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 xl:col-start-1"
    >
      <div>
        <p className="text-sm font-semibold text-[var(--accent-strong)]">Preview order</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight">Sections in invite order</h2>
        <p className="mt-2 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
          Select a section to preview its current draft. Statuses update before save so invalid
          JSON, hidden content, and guest-only sections are visible early.
        </p>
      </div>

      <ol className="grid gap-2">
        {models.map((model, index) => {
          const definition = getSectionDefinition(model.section.sectionType);
          const isSelected = selectedSectionKey === model.section.sectionKey;

          return (
            <li key={model.section.sectionKey}>
              <button
                aria-current={isSelected ? "true" : undefined}
                className={`grid w-full gap-3 rounded-[var(--radius-md)] border p-3 text-left transition hover:bg-[var(--surface-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] ${
                  isSelected
                    ? "border-[var(--accent)] bg-[var(--surface-muted)]"
                    : "border-[var(--border)] bg-[var(--surface)]"
                }`}
                onClick={() => onSelect(model.section.sectionKey)}
                type="button"
              >
                <span className="flex items-start justify-between gap-3">
                  <span>
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[color-mix(in_srgb,var(--foreground)_58%,transparent)]">
                      {String(index + 1).padStart(2, "0")} · {formatRequirement(model.requirement)}
                    </span>
                    <span className="mt-1 block font-semibold">{definition.label}</span>
                  </span>
                  <span className={statusPillClassName(model.status)}>{model.statusLabel}</span>
                </span>
                <span className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-[var(--surface-muted)] px-2.5 py-1">
                    {formatVisibility(model)}
                  </span>
                  <span className="rounded-full bg-[var(--surface-muted)] px-2.5 py-1 font-mono">
                    {definition.rendererKey}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function SectionPreviewPanel({
  event,
  model,
  previewContext,
  setPreviewContext,
  theme,
}: {
  event: Event;
  model: SectionPreviewModel | undefined;
  previewContext: PreviewContext;
  setPreviewContext: (context: PreviewContext) => void;
  theme: Theme;
}) {
  const themeDefinition = resolveThemeDefinition(theme.id);
  const resolvedMode = resolvePreviewThemeMode(event.themeMode, themeDefinition);
  const previewStyle = themeToPreviewStyle(themeDefinition, resolvedMode);
  const appearsInContext =
    previewContext === "public" ? model?.visibleInPublic : model?.visibleInGuest;

  return (
    <aside className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 xl:sticky xl:top-4 xl:col-start-2 xl:row-span-2 xl:row-start-1">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between xl:flex-col">
        <div>
          <p className="text-sm font-semibold text-[var(--accent-strong)]">Live preview</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            {model ? getSectionDefinition(model.section.sectionType).label : "No section selected"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
            Theme: {theme.name}. Event mode: {formatMode(event.themeMode)}. Preview resolves to{" "}
            {resolvedMode}.
          </p>
        </div>
        <div className="inline-flex rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-muted)] p-1 text-sm">
          {(["guest", "public"] as const).map((context) => (
            <button
              aria-pressed={previewContext === context}
              className="rounded-[calc(var(--radius-md)-0.125rem)] px-3 py-2 font-semibold capitalize transition hover:bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] aria-pressed:bg-[var(--surface)] aria-pressed:text-[var(--accent-strong)]"
              key={context}
              onClick={() => setPreviewContext(context)}
              type="button"
            >
              {context}
            </button>
          ))}
        </div>
      </div>

      {model ? (
        <div className="grid gap-3">
          {!appearsInContext ? (
            <p className="rounded-[var(--radius-md)] border border-[var(--warning)] bg-[color-mix(in_srgb,var(--warning)_10%,var(--surface))] px-3 py-2 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_78%,transparent)]">
              This section will not appear in the {previewContext} invite context with its current
              enabled and visibility settings. The draft is still shown below for editing.
            </p>
          ) : null}

          {model.status === "invalid" ? (
            <PreviewValidationState model={model} />
          ) : (
            <DashboardInviteSectionPreview
              event={event}
              model={model}
              previewContext={previewContext}
              style={previewStyle}
              theme={themeDefinition}
            />
          )}

          <p className="rounded-[var(--radius-md)] bg-[var(--surface-muted)] px-3 py-2 text-xs leading-5 text-[color-mix(in_srgb,var(--foreground)_66%,transparent)]">
            Preview contract: content and settings are parsed with the same section schemas and
            renderer keys used by the public invite. This dashboard pane is a compact approximation
            of the full invite frame for safer editing on tablet and desktop.
          </p>
        </div>
      ) : (
        <p className="rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface-muted)] p-4 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_70%,transparent)]">
          Choose a supported section to inspect its content, settings, visibility, and preview.
        </p>
      )}
    </aside>
  );
}

function PreviewValidationState({ model }: { model: SectionPreviewModel }) {
  const definition = getSectionDefinition(model.section.sectionType);
  const entries = [
    ["Content JSON", model.errors.content],
    ["Settings JSON", model.errors.settings],
    ["Visibility", model.errors.visibility],
  ].filter((entry): entry is [string, string] => typeof entry[1] === "string");

  return (
    <div className="grid gap-3 rounded-[var(--radius-md)] border border-[var(--error)] bg-[color-mix(in_srgb,var(--error)_8%,var(--surface))] p-4 text-[var(--error)]">
      <p className="font-semibold">Preview paused until {definition.label} validates.</p>
      <ul className="grid gap-2 text-sm leading-6">
        {entries.map(([label, message]) => (
          <li key={label}>
            <span className="font-semibold">{label}:</span> {message}
          </li>
        ))}
      </ul>
      <p className="text-sm leading-6">
        These fields feed the {definition.rendererKey} renderer. Fix the highlighted editor fields
        to see where the content appears.
      </p>
    </div>
  );
}

function DashboardInviteSectionPreview({
  event,
  model,
  previewContext,
  style,
  theme,
}: {
  event: Event;
  model: SectionPreviewModel;
  previewContext: PreviewContext;
  style: CSSProperties;
  theme: ThemeDefinition;
}) {
  const definition = getSectionDefinition(model.section.sectionType);
  const composition = resolvePreviewComposition(model, theme);
  const density = resolvePreviewDensity(model, theme);
  const layout = resolvePreviewLayout(model, theme);
  const content = model.content ?? {};
  const settings = model.settings ?? {};
  const anchorId = readString(settings.anchorId) ?? model.section.sectionKey;

  return (
    <article
      className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] shadow-[0_20px_70px_color-mix(in_srgb,var(--accent)_14%,transparent)]"
      data-invite-context={previewContext}
      data-section-composition={composition}
      data-section-density={density}
      data-section-key={model.section.sectionKey}
      data-section-layout={layout}
      data-section-renderer={definition.rendererKey}
      data-section-type={model.section.sectionType}
      data-theme-id={theme.id}
      data-theme-mode={event.themeMode}
      id={`preview-${anchorId}`}
      style={style}
    >
      <div className={previewFrameClassName(composition, density)}>
        <p className="text-xs font-semibold uppercase [letter-spacing:var(--eyebrow-tracking)] text-[var(--accent-strong)]">
          {definition.label}
        </p>
        <PreviewSectionBody
          content={content}
          event={event}
          layout={layout}
          sectionType={model.section.sectionType}
          settings={settings}
        />
      </div>
    </article>
  );
}

function PreviewSectionBody({
  content,
  event,
  layout,
  sectionType,
  settings,
}: {
  content: JsonObject;
  event: Event;
  layout: string;
  sectionType: SectionType;
  settings: JsonObject;
}) {
  switch (sectionType) {
    case "introduction":
      return <PreviewIntroduction content={content} event={event} />;
    case "date":
      return <PreviewDate content={content} event={event} settings={settings} />;
    case "details":
      return <PreviewDetails content={content} settings={settings} />;
    case "dress_code":
      return <PreviewDressCode content={content} settings={settings} />;
    case "entourage":
      return <PreviewEntourage content={content} settings={settings} />;
    case "gallery":
      return <PreviewGallery content={content} />;
    case "location":
      return <PreviewLocation content={content} settings={settings} />;
    case "outro":
      return <PreviewOutro content={content} />;
    case "profile":
      return <PreviewProfile content={content} layout={layout} />;
    case "rsvp":
      return <PreviewRsvp content={content} settings={settings} />;
    case "story":
      return <PreviewStory content={content} />;
    case "custom":
      return <PreviewCustom content={content} />;
    default:
      return <PreviewCustom content={content} />;
  }
}

function SectionEditor({
  canDisable,
  disableLockReason,
  errors,
  isFirst,
  isLast,
  isSelected,
  moveSection,
  onSelect,
  requirement,
  section,
  statusLabel,
  updateSection,
}: {
  canDisable: boolean;
  disableLockReason?: string;
  errors: SectionErrors;
  isFirst: boolean;
  isLast: boolean;
  isSelected: boolean;
  moveSection: (sectionKey: string, direction: -1 | 1) => void;
  onSelect: (sectionKey: string) => void;
  requirement: SectionBlueprintRequirement;
  section: SectionDraft;
  statusLabel: string;
  updateSection: (sectionKey: string, updates: Partial<SectionDraft>) => void;
}) {
  const definition = getSectionDefinition(section.sectionType);
  const hasContentError = Boolean(errors.content);
  const hasSettingsError = Boolean(errors.settings);
  const hasVisibilityError = Boolean(errors.visibility);

  return (
    <article
      className={`grid gap-4 rounded-[var(--radius-lg)] border bg-[var(--surface)] p-5 ${
        isSelected
          ? "border-[var(--accent)] shadow-[0_16px_48px_color-mix(in_srgb,var(--accent)_12%,transparent)]"
          : "border-[var(--border)]"
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-semibold tracking-tight">{definition.label}</h3>
            {definition.requiresGuestContext ? <Badge label="Guest context" /> : null}
            <Badge label={formatRequirement(requirement)} />
            <Badge
              label={statusLabel}
              tone={
                hasContentError || hasSettingsError || hasVisibilityError
                  ? "error"
                  : section.enabled
                    ? "success"
                    : "neutral"
              }
            />
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
            {definition.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className={secondaryButtonClassName}
            onClick={() => onSelect(section.sectionKey)}
            type="button"
          >
            {isSelected ? "Previewing" : "Preview"}
          </button>
          <button
            aria-label={`${definition.label} move up`}
            className={secondaryButtonClassName}
            disabled={isFirst}
            onClick={() => moveSection(section.sectionKey, -1)}
            type="button"
          >
            Move up
          </button>
          <button
            aria-label={`${definition.label} move down`}
            className={secondaryButtonClassName}
            disabled={isLast}
            onClick={() => moveSection(section.sectionKey, 1)}
            type="button"
          >
            Move down
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(12rem,16rem)_1fr]">
        <div className="grid content-start gap-4">
          <label className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--border)] p-3 text-sm hover:bg-[var(--surface-muted)]">
            <input
              aria-label={`Enable ${definition.label}`}
              checked={section.enabled}
              className="mt-1 size-4 accent-[var(--accent)]"
              disabled={section.enabled && !canDisable}
              onChange={(event) => {
                onSelect(section.sectionKey);
                if (!event.target.checked && !canDisable) {
                  return;
                }
                updateSection(section.sectionKey, {
                  enabled: event.target.checked,
                });
              }}
              type="checkbox"
            />
            <span>
              <span className="block font-semibold">Enabled</span>
              <span className="mt-1 block text-[color-mix(in_srgb,var(--foreground)_66%,transparent)]">
                {disableLockReason ?? "Disabled sections are omitted from the saved invite config."}
              </span>
            </span>
          </label>

          <div className="grid gap-2">
            <label className="text-sm font-semibold" htmlFor={`${section.sectionKey}-visibility`}>
              Visibility
            </label>
            <select
              aria-label={`${definition.label} visibility`}
              aria-invalid={hasVisibilityError}
              className={inputClassName}
              disabled={!section.enabled}
              id={`${section.sectionKey}-visibility`}
              onChange={(event) =>
                updateSection(section.sectionKey, {
                  visibility: event.target.value as SectionVisibility,
                })
              }
              value={section.visibility}
            >
              {visibilityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.visibility ? (
              <p className="text-sm text-[var(--error)]" role="alert">
                Visibility for {definition.label}: {errors.visibility}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-semibold" htmlFor={`${section.sectionKey}-content`}>
              Content JSON
            </label>
            <textarea
              aria-describedby={hasContentError ? `${section.sectionKey}-content-error` : undefined}
              aria-label={`${definition.label} content JSON`}
              aria-invalid={hasContentError}
              className={`${inputClassName} min-h-44 resize-y font-mono`}
              disabled={!section.enabled}
              id={`${section.sectionKey}-content`}
              onChange={(event) =>
                updateSection(section.sectionKey, {
                  contentText: event.target.value,
                })
              }
              spellCheck={false}
              value={section.contentText}
            />
            {errors.content ? (
              <p
                className="text-sm text-[var(--error)]"
                id={`${section.sectionKey}-content-error`}
                role="alert"
              >
                Content JSON for {definition.label}: {errors.content}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold" htmlFor={`${section.sectionKey}-settings`}>
              Settings JSON
            </label>
            <textarea
              aria-describedby={
                hasSettingsError ? `${section.sectionKey}-settings-error` : undefined
              }
              aria-label={`${definition.label} settings JSON`}
              aria-invalid={hasSettingsError}
              className={`${inputClassName} min-h-24 resize-y font-mono`}
              disabled={!section.enabled}
              id={`${section.sectionKey}-settings`}
              onChange={(event) =>
                updateSection(section.sectionKey, {
                  settingsText: event.target.value,
                })
              }
              spellCheck={false}
              value={section.settingsText}
            />
            {errors.settings ? (
              <p
                className="text-sm text-[var(--error)]"
                id={`${section.sectionKey}-settings-error`}
                role="alert"
              >
                Settings JSON for {definition.label}: {errors.settings}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function PreviewIntroduction({ content, event }: { content: JsonObject; event: Event }) {
  const image = readAsset(content.coverImage);

  return (
    <div className={image ? "grid gap-4 sm:grid-cols-[1fr_0.82fr] sm:items-center" : "grid gap-4"}>
      <div className="grid gap-3">
        <p className="text-xs font-semibold uppercase [letter-spacing:var(--eyebrow-tracking)] text-[var(--accent-strong)]">
          {readString(content.eyebrow) ?? formatEventType(event.eventType)}
        </p>
        <h3 className="text-3xl font-semibold leading-tight [font-family:var(--font-display)]">
          {readString(content.title) ?? event.title}
        </h3>
        {readString(content.subtitle) ? (
          <p className="text-base leading-7 text-[color-mix(in_srgb,var(--foreground)_76%,transparent)]">
            {readString(content.subtitle)}
          </p>
        ) : null}
        {readString(content.body) ? (
          <p className="text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_70%,transparent)]">
            {readString(content.body)}
          </p>
        ) : null}
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <PreviewFact label="When" value={formatEventDate(event.startsAt, event.timezone)} />
          <PreviewFact label="Where" value={event.venueName ?? "Venue to be announced"} />
        </dl>
      </div>
      {image ? <PreviewImage asset={image} feature /> : null}
    </div>
  );
}

function PreviewDate({
  content,
  event,
  settings,
}: {
  content: JsonObject;
  event: Event;
  settings: JsonObject;
}) {
  const startsAt = readString(content.startsAt) ?? event.startsAt;
  const timezone = readString(content.timezone) ?? event.timezone;
  const displayText = readString(content.displayText);
  const countdownLabel = readString(content.countdownLabel);
  const showCountdown = readBoolean(settings.showCountdown, true);

  return (
    <div className="grid gap-4 sm:grid-cols-[0.75fr_1fr] sm:items-end">
      <div className="grid gap-3">
        <h3 className="text-3xl font-semibold [font-family:var(--font-display)]">
          {readString(content.title) ?? "Date and time"}
        </h3>
        {showCountdown && countdownLabel ? (
          <p className="w-fit rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-strong)]">
            {countdownLabel}
          </p>
        ) : null}
      </div>
      <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4">
        <p className="text-base leading-7">{displayText ?? formatEventDate(startsAt, timezone)}</p>
        <p className="mt-2 text-xs text-[color-mix(in_srgb,var(--foreground)_64%,transparent)]">
          Timezone: {timezone}
        </p>
      </div>
    </div>
  );
}

function PreviewDetails({ content, settings }: { content: JsonObject; settings: JsonObject }) {
  const items = readRecordArray(content.items);

  return (
    <div className="grid gap-4">
      <h3 className="text-2xl font-semibold [font-family:var(--font-display)]">
        {readString(content.title) ?? "Details"}
      </h3>
      {items.length > 0 ? (
        <div className={previewColumnClassName(readInteger(settings.columns, 2, 1, 3))}>
          {items.map((item, index) => (
            <div className="rounded-[var(--radius-md)] bg-[var(--surface-muted)] p-3" key={index}>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent-strong)]">
                {readString(item.label) ?? "Detail"}
              </p>
              <p className="mt-2 text-sm leading-6">{readString(item.value)}</p>
              {readString(item.hint) ? (
                <p className="mt-2 text-xs leading-5 text-[color-mix(in_srgb,var(--foreground)_66%,transparent)]">
                  {readString(item.hint)}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <PreviewEmpty message="Add detail items to show schedule, gifts, or guest notes." />
      )}
    </div>
  );
}

function PreviewDressCode({ content, settings }: { content: JsonObject; settings: JsonObject }) {
  const palette = readRecordArray(content.palette);
  const showSwatches = readBoolean(settings.showSwatches, true);

  return (
    <div className="grid gap-4">
      <h3 className="text-2xl font-semibold [font-family:var(--font-display)]">
        {readString(content.title) ?? "Dress code"}
      </h3>
      {readString(content.description) ? (
        <p className="text-sm leading-6">{readString(content.description)}</p>
      ) : null}
      {palette.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {palette.map((item, index) => (
            <span
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm"
              key={index}
            >
              {showSwatches && readString(item.color) ? (
                <span
                  aria-hidden="true"
                  className="size-4 rounded-full border border-[var(--border)]"
                  style={{ backgroundColor: readString(item.color) }}
                />
              ) : null}
              {readString(item.label) ?? "Color"}
            </span>
          ))}
        </div>
      ) : (
        <PreviewEmpty message="Add palette labels to show attire guidance." />
      )}
    </div>
  );
}

function PreviewEntourage({ content, settings }: { content: JsonObject; settings: JsonObject }) {
  const groups = readRecordArray(content.groups);

  return (
    <div className="grid gap-4">
      <h3 className="text-2xl font-semibold [font-family:var(--font-display)]">
        {readString(content.title) ?? "Entourage"}
      </h3>
      {groups.length > 0 ? (
        <div className={previewColumnClassName(readInteger(settings.columns, 2, 1, 3))}>
          {groups.map((group, index) => (
            <div className="rounded-[var(--radius-md)] bg-[var(--surface-muted)] p-3" key={index}>
              <p className="font-semibold text-[var(--accent-strong)]">
                {readString(group.label) ?? "Group"}
              </p>
              <p className="mt-2 text-sm leading-6">{readStringArray(group.names).join(", ")}</p>
            </div>
          ))}
        </div>
      ) : (
        <PreviewEmpty message="Add group names to preview this entourage section." />
      )}
    </div>
  );
}

function PreviewGallery({ content }: { content: JsonObject }) {
  const images = readRecordArray(content.images).flatMap((item) => {
    const image = readAsset(item);
    return image ? [image] : [];
  });
  const [firstImage, ...remainingImages] = images;

  return (
    <div className="grid gap-4">
      <h3 className="text-2xl font-semibold [font-family:var(--font-display)]">
        {readString(content.title) ?? "Gallery"}
      </h3>
      {images.length > 0 && firstImage ? (
        <div className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
          <PreviewImage asset={firstImage} feature />
          <div className="grid gap-3">
            {remainingImages.slice(0, 3).map((image) => (
              <PreviewImage asset={image} compact key={image.url} />
            ))}
          </div>
        </div>
      ) : (
        <PreviewEmpty message="Add image URLs and alt text to preview gallery rhythm." />
      )}
    </div>
  );
}

function PreviewLocation({ content, settings }: { content: JsonObject; settings: JsonObject }) {
  const venueName = readString(content.venueName) ?? "Venue";
  const address = readString(content.address);
  const mapUrl = readString(content.mapUrl);
  const showMapPreview = readBoolean(settings.showMapPreview, true);

  return (
    <div className="grid gap-4 sm:grid-cols-[0.9fr_1.1fr]">
      <div className="grid gap-3">
        <h3 className="text-2xl font-semibold [font-family:var(--font-display)]">{venueName}</h3>
        {address ? <p className="text-sm leading-6">{address}</p> : null}
        {readString(content.notes) ? (
          <p className="text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_70%,transparent)]">
            {readString(content.notes)}
          </p>
        ) : null}
        {mapUrl ? (
          <span className="inline-flex min-h-10 w-fit items-center rounded-[var(--radius-md)] bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-contrast)]">
            Open map
          </span>
        ) : null}
      </div>
      {showMapPreview ? (
        <div className="grid min-h-40 place-items-end rounded-[var(--radius-md)] border border-[var(--border)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--surface-muted)_88%,transparent),color-mix(in_srgb,var(--accent)_18%,var(--surface)))] p-3">
          <div className="w-full rounded-[var(--radius-sm)] bg-[var(--surface)] p-3 text-sm">
            <p className="font-semibold">{venueName}</p>
            <p className="mt-1 text-xs leading-5 text-[color-mix(in_srgb,var(--foreground)_66%,transparent)]">
              {address ?? "Address to be announced."}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PreviewOutro({ content }: { content: JsonObject }) {
  const image = readAsset(content.image);

  return (
    <div
      className={
        image ? "grid gap-4 sm:grid-cols-[0.9fr_1.1fr]" : "mx-auto grid max-w-md gap-3 text-center"
      }
    >
      <div className="grid gap-3">
        <h3 className="text-2xl font-semibold [font-family:var(--font-display)]">
          {readString(content.title) ?? "See you there"}
        </h3>
        {readString(content.message) ? (
          <p className="text-sm leading-6">{readString(content.message)}</p>
        ) : null}
      </div>
      {image ? <PreviewImage asset={image} feature /> : null}
    </div>
  );
}

function PreviewProfile({ content, layout }: { content: JsonObject; layout: string }) {
  const people = readRecordArray(content.people);
  const stacked = layout === "stacked";

  return (
    <div className={layout === "split" ? "grid gap-4 sm:grid-cols-[0.45fr_1fr]" : "grid gap-4"}>
      <h3 className="text-2xl font-semibold [font-family:var(--font-display)]">
        {readString(content.title) ?? "Hosts"}
      </h3>
      {people.length > 0 ? (
        <div className={stacked ? "grid gap-3" : "grid gap-3 sm:grid-cols-2"}>
          {people.map((person, index) => {
            const image = readAsset(person.image);

            return (
              <article
                className="rounded-[var(--radius-md)] bg-[var(--surface-muted)] p-3"
                key={index}
              >
                {image ? <PreviewImage asset={image} compact /> : null}
                <h4 className="mt-3 font-semibold">{readString(person.name)}</h4>
                {readString(person.role) ? (
                  <p className="mt-1 text-xs font-semibold text-[var(--accent-strong)]">
                    {readString(person.role)}
                  </p>
                ) : null}
                {readString(person.bio) ? (
                  <p className="mt-2 text-sm leading-6">{readString(person.bio)}</p>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : (
        <PreviewEmpty message="Add people to preview host, couple, or celebrant profiles." />
      )}
    </div>
  );
}

function PreviewRsvp({ content, settings }: { content: JsonObject; settings: JsonObject }) {
  const questions = readRecordArray(content.questions);
  const requiresGuestToken = readBoolean(settings.requireGuestToken, true);

  return (
    <div className="grid gap-4 sm:grid-cols-[1fr_0.82fr]">
      <div className="grid gap-3">
        <h3 className="text-2xl font-semibold [font-family:var(--font-display)]">
          {readString(content.title) ?? "RSVP"}
        </h3>
        <p className="text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
          {readString(content.description) ??
            "Guests will reply from their private invite link when RSVP is open."}
        </p>
        {questions.length > 0 ? (
          <ul className="grid gap-2 text-sm">
            {questions.map((question, index) => (
              <li
                className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2"
                key={readString(question.key) ?? index}
              >
                <span className="font-medium">{readString(question.label) ?? "Question"}</span>
                <span className="ml-2 text-xs text-[color-mix(in_srgb,var(--foreground)_62%,transparent)]">
                  {question.required === true ? "Required" : "Optional"}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <div className="grid gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-muted)] p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent-strong)]">
          Guest reply card
        </p>
        <PreviewFact label="Seats" value="Max 2 pax" />
        <PreviewFact
          label="Access"
          value={requiresGuestToken ? "Guest token required" : "Public RSVP allowed"}
        />
        <span className="inline-flex min-h-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-contrast)]">
          {readString(content.submitLabel) ?? "Send RSVP"}
        </span>
      </div>
    </div>
  );
}

function PreviewStory({ content }: { content: JsonObject }) {
  const paragraphs = readStringArray(content.paragraphs);
  const image = readAsset(content.image);

  return (
    <div className={image ? "grid gap-4 sm:grid-cols-[0.95fr_1.05fr]" : "grid gap-4"}>
      <div className="grid gap-3">
        <h3 className="text-2xl font-semibold [font-family:var(--font-display)]">
          {readString(content.title) ?? "Story"}
        </h3>
        {paragraphs.length > 0 ? (
          <div className="grid gap-3">
            {paragraphs.map((paragraph, index) => (
              <p
                className="text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_74%,transparent)]"
                key={index}
              >
                {paragraph}
              </p>
            ))}
          </div>
        ) : (
          <PreviewEmpty message="Add story paragraphs to preview the editorial rhythm." />
        )}
      </div>
      {image ? <PreviewImage asset={image} feature /> : null}
    </div>
  );
}

function PreviewCustom({ content }: { content: JsonObject }) {
  const blocks = readRecordArray(content.blocks);

  return (
    <div className="grid gap-4">
      <h3 className="text-2xl font-semibold [font-family:var(--font-display)]">
        {readString(content.title) ?? "Note"}
      </h3>
      {blocks.length > 0 ? (
        <div className="grid gap-3">
          {blocks.map((block, index) => (
            <div className="grid gap-1" key={index}>
              {readString(block.heading) ? (
                <h4 className="font-semibold">{readString(block.heading)}</h4>
              ) : null}
              <p className="text-sm leading-6">{readString(block.body)}</p>
            </div>
          ))}
        </div>
      ) : (
        <PreviewEmpty message="Add bounded text blocks to preview this custom note." />
      )}
    </div>
  );
}

function PreviewFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-sm)] bg-[var(--surface)] px-3 py-2">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent-strong)]">
        {label}
      </p>
      <p className="mt-1 text-sm leading-5">{value}</p>
    </div>
  );
}

function PreviewImage({
  asset,
  compact = false,
  feature = false,
}: {
  asset: { alt: string; caption?: string; url: string };
  compact?: boolean;
  feature?: boolean;
}) {
  const aspectClassName = feature
    ? "aspect-[4/5] sm:aspect-[16/11]"
    : compact
      ? "aspect-[4/3]"
      : "aspect-[3/2]";

  return (
    <figure className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)]">
      <img alt={asset.alt} className={`${aspectClassName} w-full object-cover`} src={asset.url} />
      {asset.caption ? (
        <figcaption className="bg-[var(--surface-muted)] px-3 py-2 text-xs">
          {asset.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

function PreviewEmpty({ message }: { message: string }) {
  return (
    <p className="rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_68%,transparent)]">
      {message}
    </p>
  );
}

function SectionLoading() {
  return (
    <div className="grid gap-5" aria-label="Loading sections" aria-live="polite">
      <div className="h-36 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-muted)]" />
      {[0, 1, 2].map((item) => (
        <div
          className="h-72 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-muted)]"
          key={item}
        />
      ))}
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--surface-muted)] p-3">
      <dt className="text-[color-mix(in_srgb,var(--foreground)_62%,transparent)]">{label}</dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  );
}

function Badge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "error" | "neutral" | "success";
}) {
  return (
    <span
      className={`inline-flex rounded-[var(--radius-sm)] px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
        tone === "error"
          ? "bg-[color-mix(in_srgb,var(--error)_10%,var(--surface))] text-[var(--error)]"
          : tone === "success"
            ? "bg-[color-mix(in_srgb,var(--success)_10%,var(--surface))] text-[var(--success)]"
            : "bg-[var(--surface-muted)] text-[color-mix(in_srgb,var(--foreground)_68%,transparent)]"
      }`}
    >
      {label}
    </span>
  );
}

function createSectionPreviewModels(
  sections: SectionDraft[],
  theme: Theme,
  event: Event,
): SectionPreviewModel[] {
  return sections.map((section) => {
    const definition = getSectionDefinition(section.sectionType);
    const requirement = getBlueprintSectionRequirement(event.eventType, section.sectionType);
    const canDisable = canDisableBlueprintSection({
      eventStatus: event.status,
      eventType: event.eventType,
      sectionType: section.sectionType,
    });
    const validation = validateSectionDraft(section, section.enabled);
    const visibleInPublic =
      section.enabled &&
      section.visibility === "public" &&
      section.sectionType !== "rsvp" &&
      !definition.requiresGuestContext;
    const visibleInGuest = section.enabled && section.visibility !== "hidden";
    const hasErrors = Object.keys(validation.errors).length > 0;
    const status = !section.enabled
      ? "disabled"
      : hasErrors
        ? "invalid"
        : section.visibility === "hidden"
          ? "hidden"
          : "ready";
    const statusLabel =
      status === "disabled"
        ? "Not enabled"
        : status === "invalid"
          ? "Needs fixes"
          : status === "hidden"
            ? "Hidden"
            : "Preview ready";

    return {
      content: validation.content,
      canDisable,
      disableLockReason:
        section.enabled && !canDisable
          ? "Required sections stay enabled once the event is no longer a draft."
          : undefined,
      errors: validation.errors,
      requirement,
      section,
      settings: validation.settings,
      status,
      statusLabel,
      visibleInGuest,
      visibleInPublic,
    };
  });
}

function validateSectionDraft(section: SectionDraft, collectErrors: boolean) {
  const definition = getSectionDefinition(section.sectionType);
  const content = parseJsonObject(section.contentText);
  const settings = parseJsonObject(section.settingsText);
  const errors: SectionErrors = {};
  let parsedContent: JsonObject | undefined;
  let parsedSettings: JsonObject | undefined;

  if (!content.ok) {
    if (collectErrors) {
      errors.content = content.message;
    }
  } else {
    const result = definition.contentSchema.safeParse(content.value);

    if (result.success) {
      parsedContent = result.data as JsonObject;
    } else if (collectErrors) {
      errors.content = formatIssues(result.error.issues);
    }
  }

  if (!settings.ok) {
    if (collectErrors) {
      errors.settings = settings.message;
    }
  } else {
    const result = definition.settingsSchema.safeParse(settings.value);

    if (result.success) {
      parsedSettings = result.data as JsonObject;
    } else if (collectErrors) {
      errors.settings = formatIssues(result.error.issues);
    }
  }

  if (collectErrors && definition.requiresGuestContext && section.visibility === "public") {
    errors.visibility = `${definition.label} sections cannot be public.`;
  }

  return {
    content: parsedContent,
    errors,
    settings: parsedSettings,
  };
}

function getNextSuggestedSection(models: SectionPreviewModel[]) {
  return (
    models.find((model) => !model.section.enabled && model.requirement === "required") ??
    models.find((model) => !model.section.enabled && model.requirement === "recommended") ??
    models.find((model) => !model.section.enabled)
  );
}

function formatRequirement(requirement: SectionBlueprintRequirement) {
  return requirement.charAt(0).toUpperCase() + requirement.slice(1);
}

function formatVisibility(model: SectionPreviewModel) {
  if (!model.section.enabled) {
    return "Disabled";
  }

  if (model.section.visibility === "guest_only") {
    return "Guest-only";
  }

  return model.section.visibility === "hidden" ? "Hidden" : "Public";
}

function statusPillClassName(status: SectionPreviewModel["status"]) {
  const base = "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold";

  if (status === "invalid") {
    return `${base} bg-[color-mix(in_srgb,var(--error)_10%,var(--surface))] text-[var(--error)]`;
  }

  if (status === "ready") {
    return `${base} bg-[color-mix(in_srgb,var(--success)_10%,var(--surface))] text-[var(--success)]`;
  }

  if (status === "hidden") {
    return `${base} bg-[color-mix(in_srgb,var(--warning)_10%,var(--surface))] text-[color-mix(in_srgb,var(--foreground)_74%,transparent)]`;
  }

  return `${base} bg-[var(--surface-muted)] text-[color-mix(in_srgb,var(--foreground)_66%,transparent)]`;
}

function resolveThemeDefinition(themeId: string) {
  return (isThemeId(themeId) ? getTheme(themeId) : undefined) ?? getTheme("lumiere-default")!;
}

function resolvePreviewThemeMode(
  mode: Event["themeMode"],
  theme: ThemeDefinition,
): "dark" | "light" {
  if (mode === "dark" && theme.tokens.dark) {
    return "dark";
  }

  if (mode === "system" && theme.defaultMode === "dark" && theme.tokens.dark) {
    return "dark";
  }

  return "light";
}

function themeToPreviewStyle(theme: ThemeDefinition, mode: "dark" | "light"): CSSProperties {
  const tokens = mode === "dark" && theme.tokens.dark ? theme.tokens.dark : theme.tokens.light;

  return {
    "--accent": tokens.accent,
    "--accent-strong": tokens.accentStrong,
    "--background": tokens.background,
    "--border": tokens.border,
    "--eyebrow-tracking": theme.typography.css.eyebrowLetterSpacing,
    "--error": tokens.error,
    "--font-body": theme.typography.css.bodyFamily,
    "--font-display": theme.typography.css.displayFamily,
    "--focus": tokens.focus,
    "--foreground": tokens.foreground,
    "--radius-lg": theme.radius.lg,
    "--radius-md": theme.radius.md,
    "--radius-sm": theme.radius.sm,
    "--success": tokens.success,
    "--surface": tokens.surface,
    "--surface-muted": tokens.surfaceMuted,
    "--warning": tokens.warning,
    fontFamily: "var(--font-body)",
  } as CSSProperties;
}

function resolvePreviewComposition(model: SectionPreviewModel, theme: ThemeDefinition) {
  const sectionType = model.section.sectionType;
  const settings = model.settings ?? {};
  const variant = readString(settings.variant);
  const layout = readString(settings.layout);

  if (
    variant === "editorial-split" ||
    variant === "framed" ||
    variant === "full-bleed" ||
    variant === "gallery-feature" ||
    variant === "layered-media" ||
    variant === "timeline"
  ) {
    return variant;
  }

  const themeDefault = theme.composition.sectionDefaults[sectionType]?.composition;

  if (themeDefault) {
    return themeDefault;
  }

  if (sectionType === "date" || sectionType === "rsvp") {
    return "full-bleed";
  }

  if (sectionType === "gallery") {
    return "gallery-feature";
  }

  if (sectionType === "location" || layout === "split") {
    return "editorial-split";
  }

  if (sectionType === "story" && layout === "timeline") {
    return "timeline";
  }

  return "framed";
}

function resolvePreviewDensity(model: SectionPreviewModel, theme: ThemeDefinition) {
  const density = readString(model.settings?.density);

  if (density === "compact" || density === "spacious") {
    return density;
  }

  return theme.composition.sectionDefaults[model.section.sectionType]?.density ?? "balanced";
}

function resolvePreviewLayout(model: SectionPreviewModel, theme: ThemeDefinition) {
  return (
    readString(model.settings?.layout) ??
    theme.composition.sectionDefaults[model.section.sectionType]?.layout ??
    readString(model.settings?.variant) ??
    "default"
  );
}

function previewFrameClassName(composition: string, density: string) {
  const padding =
    density === "compact" ? "p-4" : density === "spacious" ? "p-6 sm:p-7" : "p-5 sm:p-6";
  const base = `grid gap-4 ${padding}`;

  if (composition === "full-bleed") {
    return `${base} bg-[linear-gradient(135deg,color-mix(in_srgb,var(--surface-muted)_84%,var(--background)),var(--background))]`;
  }

  if (composition === "editorial-split" || composition === "gallery-feature") {
    return `${base} bg-[var(--background)]`;
  }

  if (composition === "layered-media") {
    return `${base} bg-[radial-gradient(circle_at_18%_12%,color-mix(in_srgb,var(--accent)_16%,transparent),transparent_32%),var(--background)]`;
  }

  return `${base} bg-[var(--surface)]`;
}

function previewColumnClassName(columns: number) {
  if (columns === 1) {
    return "grid gap-3";
  }

  if (columns === 3) {
    return "grid gap-3 sm:grid-cols-2 lg:grid-cols-3";
  }

  return "grid gap-3 sm:grid-cols-2";
}

function createSectionDrafts({
  event,
  existingSections,
  theme,
}: {
  event: Event;
  existingSections: EventSection[];
  theme: Theme;
}) {
  const supportedTypes = readSectionTypes(theme.metadata.supportedSections);
  const blueprintTypes = getBlueprintSectionOrder(event.eventType, supportedTypes);
  const existingByType = new Map(
    existingSections
      .filter((section) => supportedTypes.includes(section.sectionType))
      .sort((first, second) => first.sortOrder - second.sortOrder)
      .map((section) => [section.sectionType, section] as const),
  );
  const orderedTypes = uniqueSectionTypes([...existingByType.keys(), ...blueprintTypes]);

  return orderedTypes.map((sectionType, index) => {
    const existing = existingByType.get(sectionType);
    const definition = getSectionDefinition(sectionType);
    const blueprint = getSectionBlueprint(event.eventType, sectionType);

    return {
      contentText: formatJsonText(
        existing?.content ??
          blueprint?.createDefaultContent(event) ??
          defaultContentForSection(sectionType, event),
      ),
      enabled: existing?.enabled ?? blueprint?.defaultEnabled ?? false,
      id: existing?.id,
      sectionKey: existing?.sectionKey ?? blueprint?.sectionKey ?? toSectionKey(sectionType),
      sectionType,
      settingsText: formatJsonText(existing?.settings ?? blueprint?.createDefaultSettings() ?? {}),
      sortOrder: index,
      visibility:
        existing?.visibility ?? blueprint?.defaultVisibility ?? definition.defaultVisibility,
    };
  });
}

export function parseSectionDrafts(
  sections: SectionDraft[],
  {
    event,
  }: {
    event: Event;
  },
):
  | {
      input: EventSectionsUpdateRequest;
      ok: true;
    }
  | {
      formMessage: string;
      ok: false;
      sectionErrors: SectionErrorMap;
    } {
  const sectionErrors: SectionErrorMap = {};
  const enabledSections = sections.filter((section) => section.enabled);
  const mutations = enabledSections.flatMap((section, index) => {
    const definition = getSectionDefinition(section.sectionType);
    const content = parseJsonObject(section.contentText);
    const settings = parseJsonObject(section.settingsText);
    const errors: SectionErrors = {};

    if (!content.ok) {
      errors.content = content.message;
    } else {
      const result = definition.contentSchema.safeParse(content.value);

      if (!result.success) {
        errors.content = formatIssues(result.error.issues);
      }
    }

    if (!settings.ok) {
      errors.settings = settings.message;
    } else {
      const result = definition.settingsSchema.safeParse(settings.value);

      if (!result.success) {
        errors.settings = formatIssues(result.error.issues);
      }
    }

    if (definition.requiresGuestContext && section.visibility === "public") {
      errors.visibility = `${definition.label} sections cannot be public.`;
    }

    if (Object.keys(errors).length > 0) {
      sectionErrors[section.sectionKey] = errors;
      return [];
    }

    const contentResult = definition.contentSchema.safeParse(content.ok ? content.value : {});
    const settingsResult = definition.settingsSchema.safeParse(settings.ok ? settings.value : {});

    if (!contentResult.success || !settingsResult.success) {
      return [];
    }

    return [
      {
        ...(section.id ? { id: section.id } : {}),
        content: contentResult.data as JsonObject,
        enabled: true,
        sectionKey: section.sectionKey,
        sectionType: section.sectionType,
        settings: settingsResult.data as JsonObject,
        sortOrder: index,
        visibility: section.visibility,
      },
    ];
  });

  if (Object.keys(sectionErrors).length > 0) {
    return {
      formMessage: "Check the highlighted section fields before saving.",
      ok: false,
      sectionErrors,
    };
  }

  const eventTypeIssues = validateEventTypeSections({
    eventStatus: event.status,
    eventType: event.eventType,
    sections: mutations,
  });

  if (eventTypeIssues.length > 0) {
    return {
      formMessage: "Check the highlighted section fields before saving.",
      ok: false,
      sectionErrors: {
        _form: {
          content: eventTypeIssues.map((issue) => issue.message).join(" "),
        },
      },
    };
  }

  const parsed = eventSectionsUpdateRequestSchema.safeParse({
    sections: mutations,
  });

  if (parsed.success) {
    return {
      input: parsed.data,
      ok: true,
    };
  }

  return {
    formMessage: "Check the highlighted section fields before saving.",
    ok: false,
    sectionErrors: {
      _form: {
        content: formatIssues(parsed.error.issues),
      },
    },
  };
}

function parseJsonObject(value: string):
  | {
      ok: true;
      value: JsonObject;
    }
  | {
      message: string;
      ok: false;
    } {
  try {
    const parsed = JSON.parse(value || emptyJsonText) as unknown;
    const result = jsonObjectSchema.safeParse(parsed);

    if (!result.success) {
      return {
        message: "Value must be a JSON object.",
        ok: false,
      };
    }

    return {
      ok: true,
      value: result.data,
    };
  } catch {
    return {
      message: "Value must be valid JSON.",
      ok: false,
    };
  }
}

function readString(value: JsonValue | undefined) {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function readBoolean(value: JsonValue | undefined, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function readInteger(value: JsonValue | undefined, fallback: number, min: number, max: number) {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    return fallback;
  }

  return Math.min(Math.max(value, min), max);
}

function readStringArray(value: JsonValue | undefined) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function readRecordArray(value: JsonValue | undefined) {
  return Array.isArray(value) ? value.filter(isJsonObject) : [];
}

function readAsset(value: JsonValue | undefined) {
  if (!isJsonObject(value)) {
    return undefined;
  }

  const url = readString(value.url);
  const alt = readString(value.alt);

  if (!url || !alt) {
    return undefined;
  }

  return {
    alt,
    caption: readString(value.caption),
    url,
  };
}

function isJsonObject(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readSectionTypes(value: unknown) {
  if (!Array.isArray(value)) {
    return [] satisfies SectionType[];
  }

  return value.filter(isSectionType);
}

function uniqueSectionTypes(values: SectionType[]) {
  return Array.from(new Set(values));
}

function isSectionType(value: unknown): value is SectionType {
  return typeof value === "string" && sectionTypeValues.includes(value as SectionType);
}

function defaultContentForSection(sectionType: SectionType, event: Event): JsonObject {
  if (sectionType === "date") {
    return {
      startsAt: event.startsAt,
      timezone: event.timezone,
      title: "Date and time",
      ...(event.endsAt ? { endsAt: event.endsAt } : {}),
    };
  }

  if (sectionType === "introduction") {
    return {
      title: event.title,
    };
  }

  if (sectionType === "location") {
    return {
      address: event.venueAddress ?? "",
      venueName: event.venueName ?? "",
    };
  }

  if (sectionType === "rsvp") {
    return {
      title: "RSVP",
    };
  }

  return {};
}

function toSectionKey(sectionType: SectionType) {
  return sectionType.replaceAll("_", "-");
}

function formatJsonText(value: unknown) {
  return JSON.stringify(
    value && typeof value === "object" && !Array.isArray(value) ? value : {},
    null,
    2,
  );
}

function formatIssues(issues: Array<{ message: string; path: readonly PropertyKey[] }>) {
  return issues
    .slice(0, 3)
    .map((issue) => {
      const path = issue.path.length > 0 ? `${issue.path.map(String).join(".")}: ` : "";

      return `${path}${issue.message}`;
    })
    .join(" ");
}

function withoutSectionErrors(errors: SectionErrorMap, sectionKey: string) {
  const nextErrors = { ...errors };

  delete nextErrors[sectionKey];

  return nextErrors;
}

function toSectionFormError(error: unknown): {
  formMessage: string;
  sectionErrors: SectionErrorMap;
} {
  if (error instanceof ApiClientError) {
    const fieldSummary = error.apiError.error.fields?.map((field) => field.message).join(" ");
    const sectionErrors: SectionErrorMap = fieldSummary
      ? {
          _form: {
            content: fieldSummary,
          },
        }
      : {};

    return {
      formMessage: error.apiError.error.message,
      sectionErrors,
    };
  }

  return {
    formMessage: toFriendlyApiMessage(error),
    sectionErrors: {},
  };
}

function formatMode(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatEventDate(value: string, timezone: string) {
  try {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: timezone,
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatEventType(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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

const inputClassName =
  "min-h-11 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition hover:border-[var(--accent)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60";

const secondaryButtonClassName =
  "inline-flex min-h-9 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] px-3 text-sm font-semibold transition hover:bg-[var(--surface-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50";
