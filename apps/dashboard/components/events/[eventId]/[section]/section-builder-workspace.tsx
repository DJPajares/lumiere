"use client";

import { ApiClientError } from "@lumiere/api-client";
import { Button } from "@lumiere/dashboard-ui/components/button";
import { toast } from "@lumiere/dashboard-ui/components/sonner";
import {
  canDisableBlueprintSection,
  getBlueprintSectionOrder,
  getBlueprintSectionRequirement,
  getSectionBlueprint,
  getSectionDefinition,
  normalizeLocationContent,
  normalizeStoryParagraphs,
  resolveTheme,
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
  type ManagerRole,
  type SectionType,
  type SectionVisibility,
  type Theme,
} from "@lumiere/types";
import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

import { useDashboardAuth } from "../../../../auth/dashboard-auth-provider";
import { EventTabs } from "../../../placeholder-panels";
import {
  DashboardCheckbox,
  DashboardSelect,
  DashboardSwitch,
  DashboardTextArea,
  DashboardTextInput,
  dashboardButtonClassName,
} from "../../../ui/dashboard-fields";
import {
  EventDateTimeField,
  eventIsoToLocalDateTime,
  eventLocalDateTimeToIso,
  isCompleteEventLocalDateTime,
} from "../../../ui/event-date-time-picker";
import { ResponsiveModal } from "../../../ui/responsive-modal";

type JsonObject = Record<string, JsonValue>;

type RsvpFieldSettings = {
  collectGuestMessage: boolean;
  collectGuestNames: boolean;
};

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
  accessRole: ManagerRole;
  event: Event;
  error: null;
  formMessage: string | null;
  isSaving: boolean;
  savedSections: SectionDraft[];
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

      const sectionDrafts = createSectionDrafts({
        event: eventResponse.event,
        existingSections: sectionsResponse.sections,
        theme: themeResponse.theme,
      });

      setState({
        accessRole: eventResponse.access.role,
        error: null,
        event: eventResponse.event,
        formMessage: null,
        isSaving: false,
        savedSections: sectionDrafts,
        sectionErrors: {},
        sections: sectionDrafts,
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
  const canEdit = state.accessRole !== "viewer";
  const enabledCount = useMemo(
    () => state.sections.filter((section) => section.enabled).length,
    [state.sections],
  );
  const [selectedSectionKey, setSelectedSectionKey] = useState(
    () => state.sections[0]?.sectionKey ?? "",
  );
  const [editingSectionKey, setEditingSectionKey] = useState<string | null>(null);
  const [previewContext, setPreviewContext] = useState<PreviewContext>("guest");
  const [rsvpSettings, setRsvpSettings] = useState<RsvpFieldSettings>(() => ({
    collectGuestMessage: state.event.rsvpSettings.collectGuestMessage,
    collectGuestNames: state.event.rsvpSettings.collectGuestNames,
  }));
  const previewModels = useMemo(
    () => createSectionPreviewModels(state.sections, state.theme, state.event),
    [state.event, state.sections, state.theme],
  );
  const selectedPreview =
    previewModels.find((model) => model.section.sectionKey === selectedSectionKey) ??
    previewModels[0];
  const editingPreview = editingSectionKey
    ? previewModels.find((model) => model.section.sectionKey === editingSectionKey)
    : undefined;
  const nextSuggestedSection = getNextSuggestedSection(previewModels);
  const changedSectionKeys = useMemo(
    () => getDirtySectionKeys(state.sections, state.savedSections),
    [state.savedSections, state.sections],
  );
  const rsvpSettingsDirty =
    rsvpSettings.collectGuestMessage !== state.event.rsvpSettings.collectGuestMessage ||
    rsvpSettings.collectGuestNames !== state.event.rsvpSettings.collectGuestNames;
  const rsvpSectionKey = state.sections.find(
    (section) => section.sectionType === "rsvp",
  )?.sectionKey;
  const dirtySectionKeys = useMemo(() => {
    const keys = new Set(changedSectionKeys);

    if (rsvpSettingsDirty && rsvpSectionKey) {
      keys.add(rsvpSectionKey);
    }

    return keys;
  }, [changedSectionKeys, rsvpSectionKey, rsvpSettingsDirty]);
  const hasUnsavedChanges = changedSectionKeys.size > 0 || rsvpSettingsDirty;
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

  useEffect(() => {
    if (
      editingSectionKey &&
      !previewModels.some((model) => model.section.sectionKey === editingSectionKey)
    ) {
      setEditingSectionKey(null);
    }
  }, [editingSectionKey, previewModels]);

  const openSectionEditor = (sectionKey: string) => {
    setSelectedSectionKey(sectionKey);
    setEditingSectionKey(sectionKey);
  };

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

  const discardChanges = () => {
    updateState((current) =>
      current.status === "ready"
        ? {
            ...current,
            formMessage: null,
            sectionErrors: {},
            sections: cloneSectionDrafts(current.savedSections),
          }
        : current,
    );
    setRsvpSettings({
      collectGuestMessage: state.event.rsvpSettings.collectGuestMessage,
      collectGuestNames: state.event.rsvpSettings.collectGuestNames,
    });
  };

  const discardSectionChanges = (sectionKey: string) => {
    updateState((current) => {
      if (current.status !== "ready") {
        return current;
      }

      const savedSection = current.savedSections.find(
        (section) => section.sectionKey === sectionKey,
      );

      if (!savedSection) {
        return current;
      }

      return {
        ...current,
        formMessage: null,
        sectionErrors: withoutSectionErrors(current.sectionErrors, sectionKey),
        sections: current.sections.map((section) =>
          section.sectionKey === sectionKey ? { ...savedSection } : section,
        ),
      };
    });

    if (sectionKey === rsvpSectionKey) {
      setRsvpSettings({
        collectGuestMessage: state.event.rsvpSettings.collectGuestMessage,
        collectGuestNames: state.event.rsvpSettings.collectGuestNames,
      });
    }
  };

  const cancelChanges = () => {
    if (
      !hasUnsavedChanges ||
      window.confirm("Discard all unsaved section changes and return to the last saved draft?")
    ) {
      discardChanges();
    }
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

  const saveSections = async (): Promise<boolean> => {
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
      return false;
    }

    try {
      const parsed = parseSectionDrafts(state.sections, {
        event: state.event,
      });

      if (!parsed.ok) {
        revealFirstSectionError(parsed.sectionErrors);
        updateState((current) =>
          current.status === "ready"
            ? {
                ...current,
                formMessage: parsed.formMessage,
                sectionErrors: parsed.sectionErrors,
              }
            : current,
        );
        toast.error(parsed.formMessage);
        return false;
      }

      if (!hasUnsavedChanges) {
        updateState((current) =>
          current.status === "ready"
            ? {
                ...current,
                formMessage: "There are no unsaved section changes.",
                sectionErrors: {},
              }
            : current,
        );
        toast.info("There are no unsaved section changes.");
        return true;
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

      let savedEvent = state.event;
      let sectionDrafts = state.savedSections;

      if (changedSectionKeys.size > 0) {
        const response = await apiClient.updateEventSections(eventId, parsed.input);
        sectionDrafts = createSectionDrafts({
          event: state.event,
          existingSections: response.sections,
          theme: state.theme,
        });
      }

      if (rsvpSettingsDirty) {
        const response = await apiClient.updateEvent(eventId, { rsvpSettings });
        savedEvent = response.event;
      }

      setRsvpSettings({
        collectGuestMessage: savedEvent.rsvpSettings.collectGuestMessage,
        collectGuestNames: savedEvent.rsvpSettings.collectGuestNames,
      });

      updateState((current) =>
        current.status === "ready"
          ? {
              ...current,
              event: savedEvent,
              formMessage: "Sections saved.",
              isSaving: false,
              savedSections: sectionDrafts,
              sectionErrors: {},
              sections: sectionDrafts,
            }
          : current,
      );
      toast.success("Sections saved.");
      return true;
    } catch (error) {
      const formError = toSectionFormError(error, state.sections);

      revealFirstSectionError(formError.sectionErrors);

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
      toast.error(formError.formMessage);
      return false;
    }
  };

  const revealFirstSectionError = (sectionErrors: SectionErrorMap) => {
    const sectionKey = Object.keys(sectionErrors).find((key) => key !== "_form");

    if (sectionKey) {
      setSelectedSectionKey(sectionKey);
      setEditingSectionKey(sectionKey);
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
          <div className="flex flex-wrap gap-2">
            {canEdit ? (
              <>
                <button
                  className={secondaryButtonClassName}
                  disabled={!hasUnsavedChanges || state.isSaving}
                  onClick={cancelChanges}
                  type="button"
                >
                  Cancel changes
                </button>
                <button
                  className="inline-flex min-h-10 w-fit items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-contrast)] transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--surface)] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={state.isSaving}
                  onClick={() => void saveSections()}
                  type="button"
                >
                  {state.isSaving ? "Saving sections..." : "Save sections"}
                </button>
              </>
            ) : (
              <span className="rounded-full border border-[var(--border)] px-3 py-1 text-sm font-medium">
                View-only access
              </span>
            )}
          </div>
        </div>

        <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-6">
          <SummaryItem label="Enabled sections" value={`${enabledCount}`} />
          <SummaryItem label="Ready to publish" value={`${validEnabledCount}`} />
          <SummaryItem label="Needs fixes" value={`${invalidEnabledCount}`} />
          <SummaryItem label="Unsaved changes" value={`${dirtySectionKeys.size}`} />
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
              disabled={!canEdit}
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

      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(19rem,24rem)] xl:items-start">
        <SectionOrderPanel
          canEdit={canEdit}
          dirtySectionKeys={dirtySectionKeys}
          isSaving={state.isSaving}
          models={previewModels}
          moveSection={moveSection}
          onEdit={openSectionEditor}
          onSelect={setSelectedSectionKey}
          sectionErrors={state.sectionErrors}
          selectedSectionKey={selectedPreview?.section.sectionKey}
          updateSection={updateSection}
        />

        <SectionPreviewPanel
          event={state.event}
          model={selectedPreview}
          previewContext={previewContext}
          setPreviewContext={setPreviewContext}
          theme={state.theme}
        />
      </div>

      {editingPreview ? (
        <ResponsiveModal
          contentClassName="sm:max-w-4xl"
          description="Update this section’s invite content. Changes appear in the dedicated preview as you edit."
          dirty={dirtySectionKeys.has(editingPreview.section.sectionKey)}
          footer={({ requestClose }) => (
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                disabled={
                  !dirtySectionKeys.has(editingPreview.section.sectionKey) || state.isSaving
                }
                onClick={requestClose}
                type="button"
                variant="outline"
              >
                Cancel changes
              </Button>
              <Button
                disabled={!canEdit || state.isSaving}
                onClick={() => {
                  void saveSections().then((saved) => {
                    if (saved) {
                      setEditingSectionKey(null);
                    }
                  });
                }}
                type="button"
              >
                {state.isSaving ? "Saving..." : "Save sections"}
              </Button>
            </div>
          )}
          onDiscard={() => discardSectionChanges(editingPreview.section.sectionKey)}
          onOpenChange={(open) => {
            if (!open) {
              setEditingSectionKey(null);
            }
          }}
          open
          title={`Edit ${getSectionDefinition(editingPreview.section.sectionType).label}`}
        >
          {({ requestClose }) => (
            <fieldset disabled={!canEdit || state.isSaving}>
              <legend className="sr-only">
                {canEdit
                  ? `${getSectionDefinition(editingPreview.section.sectionType).label} editor`
                  : `${getSectionDefinition(editingPreview.section.sectionType).label} editor is view only`}
              </legend>
              <SectionEditor
                errors={{
                  ...editingPreview.errors,
                  ...(state.sectionErrors[editingPreview.section.sectionKey] ?? {}),
                }}
                isDirty={dirtySectionKeys.has(editingPreview.section.sectionKey)}
                requirement={editingPreview.requirement}
                rsvpSettings={rsvpSettings}
                section={editingPreview.section}
                statusLabel={editingPreview.statusLabel}
                updateSection={updateSection}
                updateRsvpSetting={(key, value) =>
                  setRsvpSettings((current) => ({ ...current, [key]: value }))
                }
              />
            </fieldset>
          )}
        </ResponsiveModal>
      ) : null}
    </div>
  );
}

function SectionOrderPanel({
  canEdit,
  dirtySectionKeys,
  isSaving,
  models,
  moveSection,
  onEdit,
  onSelect,
  sectionErrors,
  selectedSectionKey,
  updateSection,
}: {
  canEdit: boolean;
  dirtySectionKeys: Set<string>;
  isSaving: boolean;
  models: SectionPreviewModel[];
  moveSection: (sectionKey: string, direction: -1 | 1) => void;
  onEdit: (sectionKey: string) => void;
  onSelect: (sectionKey: string) => void;
  sectionErrors: SectionErrorMap;
  selectedSectionKey?: string;
  updateSection: (sectionKey: string, updates: Partial<SectionDraft>) => void;
}) {
  return (
    <section
      aria-label="Section order and validation"
      className="grid min-w-0 gap-4 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 xl:col-start-1"
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[var(--accent-strong)]">Preview order</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight">Sections in invite order</h2>
        <p className="mt-2 max-w-prose text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
          Select a section to inspect its live preview, or use Edit to open its content fields.
          Statuses update before save so invalid fields, hidden content, and guest-only sections are
          visible early.
        </p>
      </div>

      <ol className="grid gap-2">
        {models.map((model, index) => {
          const definition = getSectionDefinition(model.section.sectionType);
          const isSelected = selectedSectionKey === model.section.sectionKey;
          const isDirty = dirtySectionKeys.has(model.section.sectionKey);
          const errors = {
            ...model.errors,
            ...(sectionErrors[model.section.sectionKey] ?? {}),
          };

          return (
            <li className="min-w-0" key={model.section.sectionKey}>
              <article
                className={`min-w-0 overflow-hidden rounded-[var(--radius-md)] border transition ${
                  isSelected
                    ? "border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_8%,var(--surface))] shadow-[0_12px_32px_color-mix(in_srgb,var(--accent)_10%,transparent)]"
                    : "border-[var(--border)] bg-[var(--surface)]"
                }`}
              >
                <button
                  aria-current={isSelected ? "true" : undefined}
                  aria-label={`Preview ${definition.label}`}
                  className="grid min-w-0 w-full gap-3 p-3 text-left transition hover:bg-[var(--surface-muted)] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--accent)]"
                  data-section-card-key={model.section.sectionKey}
                  onClick={() => onSelect(model.section.sectionKey)}
                  type="button"
                >
                  <span className="flex min-w-0 items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[color-mix(in_srgb,var(--foreground)_58%,transparent)]">
                        {String(index + 1).padStart(2, "0")} ·{" "}
                        {formatRequirement(model.requirement)}
                      </span>
                      <span className="mt-1 block truncate font-semibold">{definition.label}</span>
                    </span>
                    <span className={`${statusPillClassName(model.status)} shrink-0`}>
                      {model.statusLabel}
                    </span>
                  </span>
                  <span className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-[var(--surface-muted)] px-2.5 py-1">
                      {formatVisibility(model)}
                    </span>
                    {isDirty ? (
                      <span className="rounded-full bg-[color-mix(in_srgb,var(--warning)_14%,var(--surface))] px-2.5 py-1 font-semibold">
                        Unsaved
                      </span>
                    ) : null}
                    <span className="max-w-full break-all rounded-full bg-[var(--surface-muted)] px-2.5 py-1 font-mono">
                      {definition.rendererKey}
                    </span>
                  </span>
                </button>

                <div className="grid gap-3 border-t border-[var(--border)] bg-[var(--surface)] p-3 sm:grid-cols-2 sm:p-4">
                  <DashboardCheckbox
                    aria-label={`Enable ${definition.label}`}
                    checked={model.section.enabled}
                    description={
                      model.disableLockReason ??
                      "Disabled sections are omitted from the saved invite config."
                    }
                    disabled={!canEdit || isSaving || (model.section.enabled && !model.canDisable)}
                    id={`${model.section.sectionKey}-enabled`}
                    label="Enabled"
                    onChange={(event) => {
                      if (!event.target.checked && !model.canDisable) {
                        return;
                      }
                      updateSection(model.section.sectionKey, {
                        enabled: event.target.checked,
                      });
                    }}
                  />

                  <DashboardSelect
                    aria-label={`${definition.label} visibility`}
                    disabled={!canEdit || isSaving || !model.section.enabled}
                    error={
                      errors.visibility
                        ? `Visibility for ${definition.label}: ${errors.visibility}`
                        : undefined
                    }
                    id={`${model.section.sectionKey}-visibility`}
                    label="Visibility"
                    onValueChange={(value) =>
                      updateSection(model.section.sectionKey, {
                        visibility: value as SectionVisibility,
                      })
                    }
                    options={visibilityOptions}
                    value={model.section.visibility}
                  />

                  <div className="flex flex-wrap gap-2 sm:col-span-2">
                    <button
                      aria-label={`${definition.label} move up`}
                      className={secondaryButtonClassName}
                      disabled={!canEdit || isSaving || index === 0}
                      onClick={() => moveSection(model.section.sectionKey, -1)}
                      type="button"
                    >
                      Move up
                    </button>
                    <button
                      aria-label={`${definition.label} move down`}
                      className={secondaryButtonClassName}
                      disabled={!canEdit || isSaving || index === models.length - 1}
                      onClick={() => moveSection(model.section.sectionKey, 1)}
                      type="button"
                    >
                      Move down
                    </button>
                    <button
                      className="inline-flex min-h-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-contrast)] transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60 sm:ml-auto"
                      disabled={isSaving}
                      onClick={() => onEdit(model.section.sectionKey)}
                      type="button"
                    >
                      Edit {definition.label}
                    </button>
                  </div>
                </div>
              </article>
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
  const themeDefinition = resolveTheme(theme.id);
  const resolvedMode = resolvePreviewThemeMode(event.themeMode, themeDefinition);
  const previewStyle = themeToPreviewStyle(themeDefinition, resolvedMode);
  const appearsInContext =
    previewContext === "public" ? model?.visibleInPublic : model?.visibleInGuest;

  return (
    <aside className="grid min-w-0 gap-4 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 xl:sticky xl:top-4 xl:col-start-2 xl:row-start-1">
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
          {readString(content.eyebrow) ?? definition.label}
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
  errors,
  isDirty,
  requirement,
  rsvpSettings,
  section,
  statusLabel,
  updateSection,
  updateRsvpSetting,
}: {
  errors: SectionErrors;
  isDirty: boolean;
  requirement: SectionBlueprintRequirement;
  rsvpSettings: RsvpFieldSettings;
  section: SectionDraft;
  statusLabel: string;
  updateSection: (sectionKey: string, updates: Partial<SectionDraft>) => void;
  updateRsvpSetting: (key: keyof RsvpFieldSettings, value: boolean) => void;
}) {
  const definition = getSectionDefinition(section.sectionType);
  const hasContentError = Boolean(errors.content);
  const hasSettingsError = Boolean(errors.settings);
  const hasVisibilityError = Boolean(errors.visibility);
  const titleId = `${section.sectionKey}-editor-title`;

  return (
    <div aria-labelledby={titleId} className="grid gap-6" role="region">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-semibold tracking-tight" id={titleId}>
              {definition.label}
            </h3>
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
            {isDirty ? <Badge label="Unsaved" tone="neutral" /> : null}
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
            {definition.description}
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <SectionFieldForm
          disabled={!section.enabled}
          errors={errors}
          rsvpSettings={rsvpSettings}
          section={section}
          updateSection={updateSection}
          updateRsvpSetting={updateRsvpSetting}
        />

        <DeveloperJsonEditor
          disabled={!section.enabled}
          errors={errors}
          section={section}
          updateSection={updateSection}
        />
      </div>
    </div>
  );
}

type FieldScope = "content" | "settings";
type JsonPath = Array<number | string>;

type SectionFieldController = {
  content: JsonObject;
  disabled: boolean;
  errors: SectionErrors;
  fieldError: (scope: FieldScope, path: JsonPath) => string | undefined;
  rsvpSettings: RsvpFieldSettings;
  section: SectionDraft;
  settings: JsonObject;
  updateContentObject: (updater: (draft: JsonObject) => void) => void;
  updateContentValue: (path: JsonPath, value: JsonValue | undefined) => void;
  updateSection: (sectionKey: string, updates: Partial<SectionDraft>) => void;
  updateRsvpSetting: (key: keyof RsvpFieldSettings, value: boolean) => void;
  updateSettingsObject: (updater: (draft: JsonObject) => void) => void;
  updateSettingsValue: (path: JsonPath, value: JsonValue | undefined) => void;
};

function SectionFieldForm({
  disabled,
  errors,
  rsvpSettings,
  section,
  updateSection,
  updateRsvpSetting,
}: {
  disabled: boolean;
  errors: SectionErrors;
  rsvpSettings: RsvpFieldSettings;
  section: SectionDraft;
  updateSection: (sectionKey: string, updates: Partial<SectionDraft>) => void;
  updateRsvpSetting: (key: keyof RsvpFieldSettings, value: boolean) => void;
}) {
  const content = readDraftObject(section.contentText);
  const settings = readDraftObject(section.settingsText);
  const controller: SectionFieldController = {
    content,
    disabled,
    errors,
    fieldError: (scope, path) => getFieldError(errors[scope], path),
    rsvpSettings,
    section,
    settings,
    updateContentObject: (updater) =>
      updateSection(section.sectionKey, {
        contentText: updateJsonObjectText(section.contentText, updater),
      }),
    updateContentValue: (path, value) =>
      updateSection(section.sectionKey, {
        contentText: updateJsonObjectText(section.contentText, (draft) =>
          setJsonPathValue(draft, path, value),
        ),
      }),
    updateSection,
    updateRsvpSetting,
    updateSettingsObject: (updater) =>
      updateSection(section.sectionKey, {
        settingsText: updateJsonObjectText(section.settingsText, updater),
      }),
    updateSettingsValue: (path, value) =>
      updateSection(section.sectionKey, {
        settingsText: updateJsonObjectText(section.settingsText, (draft) =>
          setJsonPathValue(draft, path, value),
        ),
      }),
  };

  return (
    <fieldset className="grid gap-6" disabled={disabled}>
      <legend className="sr-only">Edit {getSectionDefinition(section.sectionType).label}</legend>
      <div className="grid gap-2">
        <p className="text-sm font-semibold">Content fields</p>
        <p className="text-xs leading-5 text-[color-mix(in_srgb,var(--foreground)_64%,transparent)]">
          These controls write the same validated section data used by the invite renderers.
        </p>
      </div>
      <TextField controller={controller} label="Eyebrow" path={["eyebrow"]} scope="content" />
      <SectionContentFields controller={controller} />
      <SectionSettingsFields controller={controller} />
    </fieldset>
  );
}

function SectionContentFields({ controller }: { controller: SectionFieldController }) {
  switch (controller.section.sectionType) {
    case "introduction":
      return <IntroductionFields controller={controller} />;
    case "date":
      return <DateFields controller={controller} />;
    case "details":
      return <DetailsFields controller={controller} />;
    case "dress_code":
      return <DressCodeFields controller={controller} />;
    case "entourage":
      return <EntourageFields controller={controller} />;
    case "gallery":
      return <GalleryFields controller={controller} />;
    case "location":
      return <LocationFields controller={controller} />;
    case "outro":
      return <OutroFields controller={controller} />;
    case "profile":
      return <ProfileFields controller={controller} />;
    case "rsvp":
      return <RsvpFields controller={controller} />;
    case "story":
      return <StoryFields controller={controller} />;
    case "custom":
      return <CustomFields controller={controller} />;
    default:
      return <CustomFields controller={controller} />;
  }
}

function IntroductionFields({ controller }: { controller: SectionFieldController }) {
  return (
    <div className="grid gap-5">
      <TextField
        controller={controller}
        description="The title shown in the invitation hero."
        label="Title"
        path={["title"]}
        required
        scope="content"
      />
      <TextField
        controller={controller}
        description="The supporting subtitle shown in the invitation hero."
        label="Subtitle"
        path={["subtitle"]}
        scope="content"
      />
      <TextField
        controller={controller}
        description="Longer supporting copy for the invitation hero."
        label="Body"
        multiline
        path={["body"]}
        scope="content"
      />
      <AssetField controller={controller} label="Cover image" path={["coverImage"]} />
      <IntroAnimationFields controller={controller} />
    </div>
  );
}

function IntroAnimationFields({ controller }: { controller: SectionFieldController }) {
  return (
    <fieldset className="grid gap-4 rounded-[var(--radius-md)] border border-[var(--accent)]/35 bg-[color-mix(in_srgb,var(--accent)_6%,var(--surface))] p-4">
      <legend className="px-1 text-sm font-semibold">Opening animation</legend>
      <p className="text-xs leading-5 text-[color-mix(in_srgb,var(--foreground)_68%,transparent)]">
        This copy is independent from the hero content above. The selected theme controls the
        animation design.
      </p>
      <CheckboxField
        controller={controller}
        defaultValue
        label="Enable opening animation"
        path={["introAnimation", "enabled"]}
        scope="settings"
      />
      <TextField
        controller={controller}
        description="Optional short label above the animation title."
        label="Animation eyebrow"
        path={["introAnimation", "eyebrow"]}
        scope="settings"
      />
      <TextField
        controller={controller}
        description="Optional override; defaults to the event title."
        label="Animation title"
        path={["introAnimation", "title"]}
        scope="settings"
      />
      <TextField
        controller={controller}
        description="Optional supporting line shown below the animation title."
        label="Animation subtitle"
        path={["introAnimation", "subtitle"]}
        scope="settings"
      />
      <TextField
        controller={controller}
        description="Optional longer copy for the opening animation."
        label="Animation description"
        multiline
        path={["introAnimation", "description"]}
        scope="settings"
      />
    </fieldset>
  );
}

function DateFields({ controller }: { controller: SectionFieldController }) {
  return (
    <div className="grid gap-5">
      <TextField controller={controller} label="Title" path={["title"]} scope="content" />
      <DateTimeField controller={controller} label="Starts at" path={["startsAt"]} required />
      <DateTimeField controller={controller} label="Ends at" path={["endsAt"]} />
      <TextField
        controller={controller}
        label="Timezone"
        path={["timezone"]}
        required
        scope="content"
      />
      <TextField
        controller={controller}
        label="Display text"
        path={["displayText"]}
        scope="content"
      />
      <TextField
        controller={controller}
        label="Countdown heading"
        path={["countdownLabel"]}
        scope="content"
      />
    </div>
  );
}

function DetailsFields({ controller }: { controller: SectionFieldController }) {
  const items = readRecordArray(controller.content.items);

  return (
    <div className="grid gap-5">
      <TextField controller={controller} label="Title" path={["title"]} required scope="content" />
      <RepeaterField
        addLabel="Add schedule item"
        controller={controller}
        description="Use this for schedule, gifts, parking, or guest notes."
        emptyLabel="No details yet."
        items={items}
        label="Detail items"
        onAdd={() =>
          controller.updateContentValue(
            ["items"],
            [...items, { label: "New detail", value: "Add detail copy." }],
          )
        }
        onMove={(from, to) =>
          controller.updateContentValue(["items"], moveArrayItem(items, from, to))
        }
        onRemove={(index) =>
          controller.updateContentValue(
            ["items"],
            items.filter((_, itemIndex) => itemIndex !== index),
          )
        }
        renderItem={(item, index) => (
          <div className="grid gap-3">
            <TextField
              controller={controller}
              label="Label"
              path={["items", index, "label"]}
              required
              scope="content"
            />
            <TextField
              controller={controller}
              label="Value"
              multiline
              path={["items", index, "value"]}
              required
              scope="content"
            />
            <TextField
              controller={controller}
              label="Hint"
              path={["items", index, "hint"]}
              scope="content"
            />
          </div>
        )}
      />
    </div>
  );
}

function DressCodeFields({ controller }: { controller: SectionFieldController }) {
  const cards = readRecordArray(controller.content.cards);
  const palette = readRecordArray(controller.content.palette);

  return (
    <div className="grid gap-5">
      <TextField controller={controller} label="Title" path={["title"]} required scope="content" />
      <TextField
        controller={controller}
        label="Description"
        multiline
        path={["description"]}
        scope="content"
      />
      <RepeaterField
        addLabel="Add attire card"
        controller={controller}
        emptyLabel="No attire cards yet."
        items={cards}
        label="Attire guidance cards"
        onAdd={() =>
          controller.updateContentValue(
            ["cards"],
            [
              ...cards,
              {
                label: "For guests",
                title: "Attire note",
                description: "Add practical attire guidance for your guests.",
              },
            ],
          )
        }
        onMove={(from, to) =>
          controller.updateContentValue(["cards"], moveArrayItem(cards, from, to))
        }
        onRemove={(index) =>
          controller.updateContentValue(
            ["cards"],
            cards.filter((_, itemIndex) => itemIndex !== index),
          )
        }
        renderItem={(_, index) => (
          <div className="grid gap-3">
            <TextField
              controller={controller}
              label="Card label"
              path={["cards", index, "label"]}
              scope="content"
            />
            <TextField
              controller={controller}
              label="Card title"
              path={["cards", index, "title"]}
              required
              scope="content"
            />
            <TextField
              controller={controller}
              label="Card description"
              multiline
              path={["cards", index, "description"]}
              required
              scope="content"
            />
          </div>
        )}
      />
      <TextField
        controller={controller}
        label="Palette title"
        path={["paletteTitle"]}
        scope="content"
      />
      <TextField
        controller={controller}
        label="Palette description"
        multiline
        path={["paletteDescription"]}
        scope="content"
      />
      <RepeaterField
        addLabel="Add color"
        controller={controller}
        emptyLabel="No palette colors yet."
        items={palette}
        label="Color palette"
        onAdd={() =>
          controller.updateContentValue(["palette"], [...palette, { label: "Color", color: "" }])
        }
        onMove={(from, to) =>
          controller.updateContentValue(["palette"], moveArrayItem(palette, from, to))
        }
        onRemove={(index) =>
          controller.updateContentValue(
            ["palette"],
            palette.filter((_, itemIndex) => itemIndex !== index),
          )
        }
        renderItem={(_, index) => (
          <div className="grid gap-3 sm:grid-cols-[1fr_8rem]">
            <TextField
              controller={controller}
              label="Label"
              path={["palette", index, "label"]}
              required
              scope="content"
            />
            <TextField
              controller={controller}
              label="Color"
              path={["palette", index, "color"]}
              scope="content"
              type="color"
            />
          </div>
        )}
      />
    </div>
  );
}

function EntourageFields({ controller }: { controller: SectionFieldController }) {
  const groups = readRecordArray(controller.content.groups);

  return (
    <div className="grid gap-5">
      <TextField controller={controller} label="Title" path={["title"]} required scope="content" />
      <RepeaterField
        addLabel="Add group"
        controller={controller}
        emptyLabel="No groups yet."
        items={groups}
        label="Entourage groups"
        onAdd={() =>
          controller.updateContentValue(
            ["groups"],
            [...groups, { label: "Wedding party", names: ["Name"] }],
          )
        }
        onMove={(from, to) =>
          controller.updateContentValue(["groups"], moveArrayItem(groups, from, to))
        }
        onRemove={(index) =>
          controller.updateContentValue(
            ["groups"],
            groups.filter((_, itemIndex) => itemIndex !== index),
          )
        }
        renderItem={(item, index) => (
          <div className="grid gap-3">
            <TextField
              controller={controller}
              label="Group label"
              path={["groups", index, "label"]}
              required
              scope="content"
            />
            <CommaListField
              controller={controller}
              label="Names"
              path={["groups", index, "names"]}
              required
            />
          </div>
        )}
      />
    </div>
  );
}

function GalleryFields({ controller }: { controller: SectionFieldController }) {
  const images = readRecordArray(controller.content.images);

  return (
    <div className="grid gap-5">
      <TextField controller={controller} label="Title" path={["title"]} scope="content" />
      <RepeaterField
        addLabel="Add image"
        controller={controller}
        description="Use real event, venue, celebrant, or product imagery."
        emptyLabel="No images yet."
        items={images}
        label="Gallery images"
        onAdd={() =>
          controller.updateContentValue(
            ["images"],
            [...images, { alt: "Describe the image", url: "" }],
          )
        }
        onMove={(from, to) =>
          controller.updateContentValue(["images"], moveArrayItem(images, from, to))
        }
        onRemove={(index) =>
          controller.updateContentValue(
            ["images"],
            images.filter((_, itemIndex) => itemIndex !== index),
          )
        }
        renderItem={(_, index) => (
          <div className="grid gap-3">
            <TextField
              controller={controller}
              label="Image URL"
              path={["images", index, "url"]}
              required
              scope="content"
              type="url"
            />
            <TextField
              controller={controller}
              label="Alt text"
              path={["images", index, "alt"]}
              required
              scope="content"
            />
            <TextField
              controller={controller}
              label="Caption"
              path={["images", index, "caption"]}
              scope="content"
            />
          </div>
        )}
      />
    </div>
  );
}

function LocationFields({ controller }: { controller: SectionFieldController }) {
  return (
    <div className="grid gap-5">
      <TextField
        controller={controller}
        label="Venue name"
        path={["venueName"]}
        required
        scope="content"
      />
      <TextField
        controller={controller}
        label="Address"
        multiline
        path={["address"]}
        required
        scope="content"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField
          controller={controller}
          label="Latitude"
          max={90}
          min={-90}
          path={["latitude"]}
          scope="content"
        />
        <NumberField
          controller={controller}
          label="Longitude"
          max={180}
          min={-180}
          path={["longitude"]}
          scope="content"
        />
      </div>
      <TextField
        controller={controller}
        label="Google place ID"
        path={["placeId"]}
        scope="content"
      />
      <TextField
        controller={controller}
        label="Approved map embed URL"
        path={["embedUrl"]}
        scope="content"
        type="url"
      />
      <TextField
        controller={controller}
        label="Approved directions URL"
        path={["directionsUrl"]}
        scope="content"
        type="url"
      />
      <TextField controller={controller} label="Notes" multiline path={["notes"]} scope="content" />
    </div>
  );
}

function OutroFields({ controller }: { controller: SectionFieldController }) {
  return (
    <div className="grid gap-5">
      <TextField controller={controller} label="Title" path={["title"]} required scope="content" />
      <TextField
        controller={controller}
        label="Message"
        multiline
        path={["message"]}
        scope="content"
      />
      <AssetField controller={controller} label="Closing image" path={["image"]} />
    </div>
  );
}

function ProfileFields({ controller }: { controller: SectionFieldController }) {
  const people = readRecordArray(controller.content.people);

  return (
    <div className="grid gap-5">
      <TextField controller={controller} label="Title" path={["title"]} required scope="content" />
      <RepeaterField
        addLabel="Add person"
        controller={controller}
        emptyLabel="No people yet."
        items={people}
        label="People"
        onAdd={() =>
          controller.updateContentValue(["people"], [...people, { name: "Name", role: "Host" }])
        }
        onMove={(from, to) =>
          controller.updateContentValue(["people"], moveArrayItem(people, from, to))
        }
        onRemove={(index) =>
          controller.updateContentValue(
            ["people"],
            people.filter((_, itemIndex) => itemIndex !== index),
          )
        }
        renderItem={(_, index) => (
          <div className="grid gap-3">
            <TextField
              controller={controller}
              label="Name"
              path={["people", index, "name"]}
              required
              scope="content"
            />
            <TextField
              controller={controller}
              label="Role"
              path={["people", index, "role"]}
              scope="content"
            />
            <TextField
              controller={controller}
              label="Bio"
              multiline
              path={["people", index, "bio"]}
              scope="content"
            />
            <NestedAssetField
              controller={controller}
              label="Portrait image"
              path={["people", index, "image"]}
            />
          </div>
        )}
      />
    </div>
  );
}

function RsvpFields({ controller }: { controller: SectionFieldController }) {
  const questions = readRecordArray(controller.content.questions);
  const dietaryQuestionEnabled = questions.some(
    (question) => question.key === rsvpQuestionPresets.dietary.key,
  );
  const songQuestionEnabled = questions.some(
    (question) => question.key === rsvpQuestionPresets.song.key,
  );
  const updatePresetQuestion = (
    preset: (typeof rsvpQuestionPresets)[keyof typeof rsvpQuestionPresets],
    enabled: boolean,
  ) => {
    const nextQuestions = enabled
      ? questions.some((question) => question.key === preset.key)
        ? questions
        : [...questions, { ...preset }]
      : questions.filter((question) => question.key !== preset.key);

    controller.updateContentValue(["questions"], nextQuestions);
  };

  return (
    <div className="grid gap-5">
      <TextField controller={controller} label="Title" path={["title"]} required scope="content" />
      <TextField
        controller={controller}
        label="Description"
        multiline
        path={["description"]}
        scope="content"
      />
      <TextField
        controller={controller}
        label="Submit label"
        path={["submitLabel"]}
        scope="content"
      />
      <section
        className="grid gap-3"
        aria-labelledby={`${controller.section.sectionKey}-quick-questions`}
      >
        <div>
          <h3
            className="text-sm font-semibold"
            id={`${controller.section.sectionKey}-quick-questions`}
          >
            Guest detail sections
          </h3>
          <p className="mt-1 text-xs leading-5 text-[color-mix(in_srgb,var(--foreground)_64%,transparent)]">
            Choose the details guests can provide inside the RSVP panel.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <DashboardSwitch
            checked={controller.rsvpSettings.collectGuestNames}
            description="Require one name for each attending guest."
            disabled={controller.disabled}
            id={`${controller.section.sectionKey}-collect-guest-names`}
            label="Guest names"
            onCheckedChange={(checked) =>
              controller.updateRsvpSetting("collectGuestNames", checked)
            }
          />
          <DashboardSwitch
            checked={controller.rsvpSettings.collectGuestMessage}
            description="Let guests add an optional note for the host."
            disabled={controller.disabled}
            id={`${controller.section.sectionKey}-collect-guest-message`}
            label="Guest message"
            onCheckedChange={(checked) =>
              controller.updateRsvpSetting("collectGuestMessage", checked)
            }
          />
          <DashboardSwitch
            checked={dietaryQuestionEnabled}
            description="Let attending guests share allergies, dietary requirements, or meal notes."
            disabled={controller.disabled}
            id={`${controller.section.sectionKey}-rsvp-dietary-question`}
            label="Dietary requirements"
            onCheckedChange={(checked) =>
              updatePresetQuestion(rsvpQuestionPresets.dietary, checked)
            }
          />
          <DashboardSwitch
            checked={songQuestionEnabled}
            description="Invite attending guests to suggest one song for the celebration."
            disabled={controller.disabled}
            id={`${controller.section.sectionKey}-rsvp-song-question`}
            label="Song request"
            onCheckedChange={(checked) => updatePresetQuestion(rsvpQuestionPresets.song, checked)}
          />
        </div>
        <p className="text-xs leading-5 text-[color-mix(in_srgb,var(--foreground)_64%,transparent)]">
          Turning off names or messages affects future replies only. Existing response data stays
          available to managers.
        </p>
      </section>
      <RepeaterField
        addLabel="Add RSVP question"
        controller={controller}
        emptyLabel="No custom RSVP questions."
        items={questions}
        label="RSVP questions"
        onAdd={() =>
          controller.updateContentValue(
            ["questions"],
            [
              ...questions,
              {
                key: `question-${questions.length + 1}`,
                label: "Question",
                type: "text",
              },
            ],
          )
        }
        onMove={(from, to) =>
          controller.updateContentValue(["questions"], moveArrayItem(questions, from, to))
        }
        onRemove={(index) =>
          controller.updateContentValue(
            ["questions"],
            questions.filter((_, itemIndex) => itemIndex !== index),
          )
        }
        renderItem={(_, index) => (
          <div className="grid gap-3">
            <TextField
              controller={controller}
              label="Question key"
              path={["questions", index, "key"]}
              required
              scope="content"
            />
            <TextField
              controller={controller}
              label="Question label"
              path={["questions", index, "label"]}
              required
              scope="content"
            />
            <SelectField
              controller={controller}
              label="Answer type"
              options={[
                { label: "Text", value: "text" },
                { label: "Long text", value: "textarea" },
                { label: "Single choice", value: "single_choice" },
                { label: "Multiple choice", value: "multi_choice" },
              ]}
              path={["questions", index, "type"]}
              scope="content"
            />
            <CheckboxField
              controller={controller}
              label="Required"
              path={["questions", index, "required"]}
              scope="content"
            />
            <CommaListField
              controller={controller}
              label="Options"
              path={["questions", index, "options"]}
            />
          </div>
        )}
      />
    </div>
  );
}

const rsvpQuestionPresets = {
  dietary: {
    key: "dietary-notes",
    label: "Any dietary requirements we should know?",
    required: false,
    type: "textarea",
  },
  song: {
    key: "song-request",
    label: "What song gets you on the dance floor?",
    required: false,
    type: "text",
  },
} as const;

function StoryFields({ controller }: { controller: SectionFieldController }) {
  const paragraphs = normalizeStoryParagraphs(controller.content.paragraphs);

  return (
    <div className="grid gap-5">
      <TextField controller={controller} label="Title" path={["title"]} required scope="content" />
      <RepeaterField
        addLabel="Add story paragraph"
        controller={controller}
        emptyLabel="No story paragraphs yet."
        items={paragraphs}
        label="Story paragraphs"
        onAdd={() =>
          controller.updateContentValue(
            ["paragraphs"],
            [...paragraphs, { body: "Add a short story paragraph." }],
          )
        }
        onMove={(from, to) =>
          controller.updateContentValue(["paragraphs"], moveArrayItem(paragraphs, from, to))
        }
        onRemove={(index) =>
          controller.updateContentValue(
            ["paragraphs"],
            paragraphs.filter((_, itemIndex) => itemIndex !== index),
          )
        }
        renderItem={(_, index) => (
          <div className="grid gap-4">
            <TextField
              controller={controller}
              label="Paragraph title (optional)"
              path={["paragraphs", index, "title"]}
              scope="content"
            />
            <TextField
              controller={controller}
              label="Paragraph body"
              multiline
              path={["paragraphs", index, "body"]}
              required
              scope="content"
            />
          </div>
        )}
      />
      <AssetField controller={controller} label="Story image" path={["image"]} />
    </div>
  );
}

function CustomFields({ controller }: { controller: SectionFieldController }) {
  const blocks = readRecordArray(controller.content.blocks);

  return (
    <div className="grid gap-5">
      <TextField controller={controller} label="Title" path={["title"]} required scope="content" />
      <RepeaterField
        addLabel="Add block"
        controller={controller}
        emptyLabel="No blocks yet."
        items={blocks}
        label="Content blocks"
        onAdd={() =>
          controller.updateContentValue(
            ["blocks"],
            [...blocks, { body: "Add a custom note for guests." }],
          )
        }
        onMove={(from, to) =>
          controller.updateContentValue(["blocks"], moveArrayItem(blocks, from, to))
        }
        onRemove={(index) =>
          controller.updateContentValue(
            ["blocks"],
            blocks.filter((_, itemIndex) => itemIndex !== index),
          )
        }
        renderItem={(_, index) => (
          <div className="grid gap-3">
            <TextField
              controller={controller}
              label="Heading"
              path={["blocks", index, "heading"]}
              scope="content"
            />
            <TextField
              controller={controller}
              label="Body"
              multiline
              path={["blocks", index, "body"]}
              required
              scope="content"
            />
          </div>
        )}
      />
    </div>
  );
}

function SectionSettingsFields({ controller }: { controller: SectionFieldController }) {
  return (
    <div className="grid gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-muted)] p-3">
      <p className="text-sm font-semibold">Display settings</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <SelectField
          controller={controller}
          label="Density"
          options={[
            { label: "Compact", value: "compact" },
            { label: "Balanced", value: "balanced" },
            { label: "Spacious", value: "spacious" },
          ]}
          path={["density"]}
          scope="settings"
        />
        <TextField controller={controller} label="Variant" path={["variant"]} scope="settings" />
        {controller.section.sectionType === "story" ? (
          <SelectField
            controller={controller}
            label="Layout"
            options={[
              { label: "Editorial", value: "editorial" },
              { label: "Timeline", value: "timeline" },
              { label: "Stacked", value: "stacked" },
            ]}
            path={["layout"]}
            scope="settings"
          />
        ) : null}
        {controller.section.sectionType === "profile" ? (
          <SelectField
            controller={controller}
            label="Layout"
            options={[
              { label: "Cards", value: "cards" },
              { label: "Split", value: "split" },
              { label: "Stacked", value: "stacked" },
            ]}
            path={["layout"]}
            scope="settings"
          />
        ) : null}
        {["details", "entourage"].includes(controller.section.sectionType) ? (
          <NumberField
            controller={controller}
            label="Columns"
            max={3}
            min={1}
            path={["columns"]}
            scope="settings"
          />
        ) : null}
        {controller.section.sectionType === "date" ? (
          <CheckboxField
            controller={controller}
            defaultValue
            label="Show live countdown"
            path={["showCountdown"]}
            scope="settings"
          />
        ) : null}
        {controller.section.sectionType === "dress_code" ? (
          <CheckboxField
            controller={controller}
            label="Show swatches"
            path={["showSwatches"]}
            scope="settings"
          />
        ) : null}
        {controller.section.sectionType === "location" ? (
          <CheckboxField
            controller={controller}
            defaultValue
            label="Show map preview"
            path={["showMapPreview"]}
            scope="settings"
          />
        ) : null}
        {controller.section.sectionType === "location" ? (
          <CheckboxField
            controller={controller}
            description="Allow guests to pan and zoom inside the embedded map."
            label="Allow map interaction"
            path={["allowMapInteraction"]}
            scope="settings"
          />
        ) : null}
        {controller.section.sectionType === "rsvp" ? (
          <CheckboxField
            controller={controller}
            label="Require guest token"
            path={["requireGuestToken"]}
            scope="settings"
          />
        ) : null}
      </div>
    </div>
  );
}

function TextField({
  controller,
  description,
  label,
  multiline = false,
  path,
  required = false,
  scope,
  type = "text",
}: {
  controller: SectionFieldController;
  description?: ReactNode;
  label: string;
  multiline?: boolean;
  path: JsonPath;
  required?: boolean;
  scope: FieldScope;
  type?: "color" | "text" | "url";
}) {
  const id = fieldId(controller.section, scope, path);
  const value = getJsonString(scope === "content" ? controller.content : controller.settings, path);
  const error = controller.fieldError(scope, path);
  const update = (nextValue: string) =>
    scope === "content"
      ? controller.updateContentValue(path, nextValue)
      : controller.updateSettingsValue(path, nextValue);

  if (multiline) {
    return (
      <DashboardTextArea
        disabled={controller.disabled}
        description={description}
        error={error}
        id={id}
        label={label}
        onChange={(event) => update(event.target.value)}
        required={required}
        value={value}
      />
    );
  }

  return (
    <DashboardTextInput
      disabled={controller.disabled}
      description={description}
      error={error}
      id={id}
      label={label}
      onChange={(event) => update(event.target.value)}
      required={required}
      type={type}
      value={type === "color" && !value ? "#000000" : value}
    />
  );
}

function DateTimeField({
  controller,
  label,
  path,
  required = false,
}: {
  controller: SectionFieldController;
  label: string;
  path: JsonPath;
  required?: boolean;
}) {
  const id = fieldId(controller.section, "content", path);
  const storedValue = getJsonString(controller.content, path);
  const timezone = getJsonString(controller.content, ["timezone"]) || "UTC";
  const value =
    isCompleteEventLocalDateTime(storedValue) || storedValue.endsWith("T")
      ? storedValue
      : eventIsoToLocalDateTime(storedValue, timezone);
  const error = controller.fieldError("content", path);

  return (
    <EventDateTimeField
      disabled={controller.disabled}
      error={error}
      id={id}
      label={label}
      onValueChange={(nextValue) =>
        controller.updateContentValue(
          path,
          nextValue ? (eventLocalDateTimeToIso(nextValue, timezone) ?? nextValue) : undefined,
        )
      }
      required={required}
      timezone={timezone}
      value={value}
    />
  );
}

function NumberField({
  controller,
  label,
  max,
  min,
  path,
  scope,
}: {
  controller: SectionFieldController;
  label: string;
  max: number;
  min: number;
  path: JsonPath;
  scope: FieldScope;
}) {
  const id = fieldId(controller.section, scope, path);
  const value = getJsonNumber(scope === "content" ? controller.content : controller.settings, path);
  const error = controller.fieldError(scope, path);
  const update = (nextValue: string) =>
    scope === "content"
      ? controller.updateContentValue(path, nextValue === "" ? undefined : Number(nextValue))
      : controller.updateSettingsValue(path, nextValue === "" ? undefined : Number(nextValue));

  return (
    <DashboardTextInput
      disabled={controller.disabled}
      error={error}
      id={id}
      label={label}
      max={max}
      min={min}
      onChange={(event) => update(event.target.value)}
      type="number"
      value={value}
    />
  );
}

function SelectField({
  controller,
  label,
  options,
  path,
  scope,
}: {
  controller: SectionFieldController;
  label: string;
  options: Array<{ label: string; value: string }>;
  path: JsonPath;
  scope: FieldScope;
}) {
  const id = fieldId(controller.section, scope, path);
  const value = getJsonString(scope === "content" ? controller.content : controller.settings, path);

  return (
    <DashboardSelect
      disabled={controller.disabled}
      id={id}
      label={label}
      onValueChange={(value) =>
        scope === "content"
          ? controller.updateContentValue(path, value)
          : controller.updateSettingsValue(path, value)
      }
      options={options}
      value={value || options[0]?.value}
    />
  );
}

function CheckboxField({
  controller,
  defaultValue = false,
  description,
  label,
  path,
  scope,
}: {
  controller: SectionFieldController;
  defaultValue?: boolean;
  description?: ReactNode;
  label: string;
  path: JsonPath;
  scope: FieldScope;
}) {
  const id = fieldId(controller.section, scope, path);
  const value = getJsonBoolean(
    scope === "content" ? controller.content : controller.settings,
    path,
    defaultValue,
  );

  return (
    <DashboardCheckbox
      checked={value}
      disabled={controller.disabled}
      description={description}
      id={id}
      label={label}
      onChange={(event) =>
        scope === "content"
          ? controller.updateContentValue(path, event.target.checked)
          : controller.updateSettingsValue(path, event.target.checked)
      }
    />
  );
}

function CommaListField({
  controller,
  label,
  path,
  required = false,
}: {
  controller: SectionFieldController;
  label: string;
  path: JsonPath;
  required?: boolean;
}) {
  const id = fieldId(controller.section, "content", path);
  const values = readStringArray(getJsonValue(controller.content, path));
  const error = controller.fieldError("content", path);

  return (
    <DashboardTextInput
      description="Separate values with commas."
      disabled={controller.disabled}
      error={error}
      id={id}
      label={label}
      onChange={(event) =>
        controller.updateContentValue(
          path,
          event.target.value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        )
      }
      required={required}
      value={values.join(", ")}
    />
  );
}

function AssetField({
  controller,
  label,
  path,
}: {
  controller: SectionFieldController;
  label: string;
  path: JsonPath;
}) {
  return <NestedAssetField controller={controller} label={label} path={path} />;
}

function NestedAssetField({
  controller,
  label,
  path,
}: {
  controller: SectionFieldController;
  label: string;
  path: JsonPath;
}) {
  const asset = isJsonObject(getJsonValue(controller.content, path))
    ? (getJsonValue(controller.content, path) as JsonObject)
    : {};
  const setAssetValue = (field: "alt" | "caption" | "url", value: string) => {
    controller.updateContentObject((draft) => {
      const current = isJsonObject(getJsonValue(draft, path))
        ? ({ ...(getJsonValue(draft, path) as JsonObject) } as JsonObject)
        : {};
      current[field] = value;

      if (!readString(current.url) && !readString(current.alt) && !readString(current.caption)) {
        setJsonPathValue(draft, path, undefined);
        return;
      }

      setJsonPathValue(draft, path, current);
    });
  };

  return (
    <div className="grid gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-muted)] p-3">
      <p className="text-sm font-semibold">{label}</p>
      <div className="grid gap-3">
        <AssetTextField
          controller={controller}
          label="Image URL"
          onChange={(value) => setAssetValue("url", value)}
          path={[...path, "url"]}
          type="url"
          value={getJsonString(asset, ["url"])}
        />
        <AssetTextField
          controller={controller}
          label="Alt text"
          onChange={(value) => setAssetValue("alt", value)}
          path={[...path, "alt"]}
          value={getJsonString(asset, ["alt"])}
        />
        <AssetTextField
          controller={controller}
          label="Caption"
          onChange={(value) => setAssetValue("caption", value)}
          path={[...path, "caption"]}
          value={getJsonString(asset, ["caption"])}
        />
      </div>
    </div>
  );
}

function AssetTextField({
  controller,
  label,
  onChange,
  path,
  type = "text",
  value,
}: {
  controller: SectionFieldController;
  label: string;
  onChange: (value: string) => void;
  path: JsonPath;
  type?: "text" | "url";
  value: string;
}) {
  const id = fieldId(controller.section, "content", path);
  const error = controller.fieldError("content", path);

  return (
    <DashboardTextInput
      disabled={controller.disabled}
      error={error}
      id={id}
      label={label}
      onChange={(event) => onChange(event.target.value)}
      type={type}
      value={value}
    />
  );
}

function RepeaterField<TItem>({
  addLabel,
  controller,
  description,
  emptyLabel,
  items,
  label,
  onAdd,
  onMove,
  onRemove,
  renderItem,
}: {
  addLabel: string;
  controller: SectionFieldController;
  description?: string;
  emptyLabel: string;
  items: TItem[];
  label: string;
  onAdd: () => void;
  onMove: (from: number, to: number) => void;
  onRemove: (index: number) => void;
  renderItem: (item: TItem, index: number) => ReactNode;
}) {
  return (
    <section className="grid gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-muted)] p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h4 className="text-sm font-semibold">{label}</h4>
          {description ? (
            <p className="mt-1 text-xs leading-5 text-[color-mix(in_srgb,var(--foreground)_64%,transparent)]">
              {description}
            </p>
          ) : null}
        </div>
        <button
          className={secondaryButtonClassName}
          disabled={controller.disabled}
          onClick={onAdd}
          type="button"
        >
          {addLabel}
        </button>
      </div>

      {items.length === 0 ? (
        <p className="rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[color-mix(in_srgb,var(--foreground)_66%,transparent)]">
          {emptyLabel}
        </p>
      ) : (
        <div className="grid gap-3">
          {items.map((item, index) => (
            <article
              className="grid gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-3"
              key={index}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[color-mix(in_srgb,var(--foreground)_58%,transparent)]">
                  {label} {index + 1}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    className={secondaryButtonClassName}
                    disabled={controller.disabled || index === 0}
                    onClick={() => onMove(index, index - 1)}
                    type="button"
                  >
                    Move up
                  </button>
                  <button
                    className={secondaryButtonClassName}
                    disabled={controller.disabled || index === items.length - 1}
                    onClick={() => onMove(index, index + 1)}
                    type="button"
                  >
                    Move down
                  </button>
                  <button
                    className={secondaryButtonClassName}
                    disabled={controller.disabled}
                    onClick={() => onRemove(index)}
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              </div>
              {renderItem(item, index)}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function DeveloperJsonEditor({
  disabled,
  errors,
  section,
  updateSection,
}: {
  disabled: boolean;
  errors: SectionErrors;
  section: SectionDraft;
  updateSection: (sectionKey: string, updates: Partial<SectionDraft>) => void;
}) {
  return (
    <details className="rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface-muted)] p-3">
      <summary className="cursor-pointer text-sm font-semibold">
        Developer JSON
        <span className="ml-2 font-normal text-[color-mix(in_srgb,var(--foreground)_62%,transparent)]">
          exact renderer payload
        </span>
      </summary>
      <div className="mt-3 grid gap-4">
        <DashboardTextArea
          aria-label={`${getSectionDefinition(section.sectionType).label} content JSON`}
          disabled={disabled}
          error={errors.content ? `Content JSON: ${errors.content}` : undefined}
          id={`${section.sectionKey}-content`}
          label="Content JSON"
          onChange={(event) =>
            updateSection(section.sectionKey, {
              contentText: event.target.value,
            })
          }
          spellCheck={false}
          textAreaClassName="min-h-44 font-mono"
          value={section.contentText}
        />

        <DashboardTextArea
          aria-label={`${getSectionDefinition(section.sectionType).label} settings JSON`}
          disabled={disabled}
          error={errors.settings ? `Settings JSON: ${errors.settings}` : undefined}
          id={`${section.sectionKey}-settings`}
          label="Settings JSON"
          onChange={(event) =>
            updateSection(section.sectionKey, {
              settingsText: event.target.value,
            })
          }
          spellCheck={false}
          textAreaClassName="min-h-24 font-mono"
          value={section.settingsText}
        />
      </div>
    </details>
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
      </div>
      <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4">
        <p className="text-base leading-7">{displayText ?? formatEventDate(startsAt, timezone)}</p>
        <p className="mt-2 text-xs text-[color-mix(in_srgb,var(--foreground)_64%,transparent)]">
          Timezone: {timezone}
        </p>
      </div>
      {showCountdown ? (
        <div className="grid gap-3 sm:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
            {countdownLabel ?? "Until the occasion"}
          </p>
          <div
            aria-label="Live countdown preview"
            className="grid grid-cols-2 gap-2 sm:grid-cols-4"
          >
            {["Days", "Hours", "Minutes", "Seconds"].map((unit) => (
              <div
                className="grid min-h-16 content-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2 py-2 text-center"
                key={unit}
              >
                <strong className="text-lg font-semibold leading-none tabular-nums">—</strong>
                <span className="mt-1 text-[0.55rem] font-semibold uppercase tracking-[0.1em] text-[color-mix(in_srgb,var(--foreground)_60%,transparent)]">
                  {unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
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
  const cards = readRecordArray(content.cards);
  const palette = readRecordArray(content.palette);
  const paletteTitle = readString(content.paletteTitle);
  const paletteDescription = readString(content.paletteDescription);
  const showSwatches = readBoolean(settings.showSwatches, true);

  return (
    <div className="grid gap-4">
      <h3 className="text-2xl font-semibold [font-family:var(--font-display)]">
        {readString(content.title) ?? "Dress code"}
      </h3>
      {readString(content.description) ? (
        <p className="text-sm leading-6">{readString(content.description)}</p>
      ) : null}
      {cards.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {cards.map((card, index) => (
            <div className="rounded-[var(--radius-md)] bg-[var(--surface-muted)] p-3" key={index}>
              {readString(card.label) ? (
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent-strong)]">
                  {readString(card.label)}
                </p>
              ) : null}
              <p className="mt-2 font-semibold">{readString(card.title) ?? "Attire note"}</p>
              <p className="mt-1 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
                {readString(card.description)}
              </p>
            </div>
          ))}
        </div>
      ) : null}
      {paletteTitle || paletteDescription ? (
        <div className="grid gap-1">
          {paletteTitle ? <p className="font-semibold">{paletteTitle}</p> : null}
          {paletteDescription ? (
            <p className="text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
              {paletteDescription}
            </p>
          ) : null}
        </div>
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
      ) : cards.length === 0 ? (
        <PreviewEmpty message="Add palette labels to show attire guidance." />
      ) : null}
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
  const location = normalizeLocationContent(content);
  const directionsUrl = location?.directionsUrl;
  const embedUrl = location?.embedUrl;
  const allowMapInteraction = readBoolean(settings.allowMapInteraction, false);
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
        {directionsUrl ? (
          <span className="inline-flex min-h-10 w-fit items-center rounded-[var(--radius-md)] bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-contrast)]">
            Open directions
          </span>
        ) : null}
      </div>
      {showMapPreview ? (
        <div
          className="grid min-h-40 place-items-end rounded-[var(--radius-md)] border border-[var(--border)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--surface-muted)_88%,transparent),color-mix(in_srgb,var(--accent)_18%,var(--surface)))] p-3"
          data-map-state={embedUrl ? "embedded" : "fallback"}
          data-map-interaction={allowMapInteraction ? "interactive" : "preview-only"}
        >
          <div className="w-full rounded-[var(--radius-sm)] bg-[var(--surface)] p-3 text-sm">
            <p className="font-semibold">{venueName}</p>
            <p className="mt-1 text-xs leading-5 text-[color-mix(in_srgb,var(--foreground)_66%,transparent)]">
              {address ?? "Address to be announced."}
            </p>
            {embedUrl ? (
              <p className="mt-2 text-xs leading-5 text-[color-mix(in_srgb,var(--foreground)_66%,transparent)]">
                {allowMapInteraction
                  ? "Guests can pan and zoom this map."
                  : "Guests see a fixed map preview without zoom controls."}
              </p>
            ) : null}
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
  const paragraphs = normalizeStoryParagraphs(content.paragraphs);
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
              <div className="grid gap-1" key={index}>
                {paragraph.title ? (
                  <h4 className="text-sm font-semibold">{paragraph.title}</h4>
                ) : null}
                <p className="text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_74%,transparent)]">
                  {paragraph.body}
                </p>
              </div>
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
      <Image
        alt={asset.alt}
        className={`${aspectClassName} w-full object-cover`}
        height={1067}
        loading="lazy"
        sizes="(min-width: 640px) 50vw, 100vw"
        src={asset.url}
        unoptimized
        width={1600}
      />
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

function getDirtySectionKeys(sections: SectionDraft[], savedSections: SectionDraft[]) {
  const savedByKey = new Map(
    savedSections.map((section) => [section.sectionKey, sectionDraftSignature(section)]),
  );
  const dirtyKeys = new Set<string>();

  sections.forEach((section) => {
    if (sectionDraftSignature(section) !== savedByKey.get(section.sectionKey)) {
      dirtyKeys.add(section.sectionKey);
    }
  });

  return dirtyKeys;
}

function sectionDraftSignature(section: SectionDraft) {
  return JSON.stringify({
    contentText: section.contentText,
    enabled: section.enabled,
    id: section.id,
    sectionKey: section.sectionKey,
    sectionType: section.sectionType,
    settingsText: section.settingsText,
    sortOrder: section.sortOrder,
    visibility: section.visibility,
  });
}

function cloneSectionDrafts(sections: SectionDraft[]) {
  return sections.map((section) => ({ ...section }));
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
    const content =
      existing?.content ??
      blueprint?.createDefaultContent(event) ??
      defaultContentForSection(sectionType, event);

    return {
      contentText: formatJsonText(
        normalizeSectionContentForEditor(sectionType, content as JsonObject),
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

function normalizeSectionContentForEditor(sectionType: SectionType, content: JsonObject) {
  const normalizedContent = {
    ...content,
    eyebrow: readString(content.eyebrow) ?? getSectionDefinition(sectionType).label,
  };

  if (sectionType !== "story") {
    return normalizedContent;
  }

  return {
    ...normalizedContent,
    paragraphs: normalizeStoryParagraphs(content.paragraphs),
  };
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
        content: stripUndefinedJsonObject(contentResult.data),
        enabled: true,
        sectionKey: section.sectionKey,
        sectionType: section.sectionType,
        settings: stripUndefinedJsonObject(settingsResult.data),
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

function readDraftObject(value: string): JsonObject {
  const parsed = parseJsonObject(value);

  return parsed.ok ? parsed.value : {};
}

function updateJsonObjectText(value: string, updater: (draft: JsonObject) => void) {
  const draft = cloneJsonObject(readDraftObject(value));

  updater(draft);

  return formatJsonText(draft);
}

function cloneJsonObject(value: JsonObject): JsonObject {
  return JSON.parse(JSON.stringify(value)) as JsonObject;
}

function getJsonValue(value: JsonObject, path: JsonPath): JsonValue | undefined {
  let current: JsonValue | undefined = value;

  for (const key of path) {
    if (typeof key === "number") {
      if (!Array.isArray(current)) {
        return undefined;
      }

      current = current[key];
      continue;
    }

    if (!isJsonObject(current)) {
      return undefined;
    }

    current = current[key];
  }

  return current;
}

function setJsonPathValue(target: JsonObject, path: JsonPath, value: JsonValue | undefined) {
  if (path.length === 0) {
    return;
  }

  let current: JsonObject | JsonValue[] = target;

  for (let index = 0; index < path.length; index += 1) {
    const key = path[index];
    const isLast = index === path.length - 1;

    if (isLast) {
      if (value === undefined) {
        if (Array.isArray(current) && typeof key === "number") {
          current.splice(key, 1);
        } else if (!Array.isArray(current) && typeof key === "string") {
          delete current[key];
        }

        return;
      }

      if (Array.isArray(current) && typeof key === "number") {
        current[key] = value;
      } else if (!Array.isArray(current) && typeof key === "string") {
        current[key] = value;
      }

      return;
    }

    const nextKey = path[index + 1];
    const nextContainer: JsonObject | JsonValue[] = typeof nextKey === "number" ? [] : {};

    if (Array.isArray(current)) {
      if (typeof key !== "number") {
        return;
      }

      const existing: JsonValue | undefined = current[key];

      if (isJsonObject(existing) || Array.isArray(existing)) {
        current = existing;
      } else {
        current[key] = nextContainer as JsonValue;
        current = nextContainer;
      }

      continue;
    }

    if (typeof key !== "string") {
      return;
    }

    const existing: JsonValue | undefined = current[key];

    if (isJsonObject(existing) || Array.isArray(existing)) {
      current = existing;
    } else {
      current[key] = nextContainer as JsonValue;
      current = nextContainer;
    }
  }
}

function getJsonString(value: JsonObject, path: JsonPath) {
  const current = getJsonValue(value, path);

  return typeof current === "string" ? current : "";
}

function getJsonNumber(value: JsonObject, path: JsonPath) {
  const current = getJsonValue(value, path);

  return typeof current === "number" ? current : "";
}

function getJsonBoolean(value: JsonObject, path: JsonPath, defaultValue = false) {
  const current = getJsonValue(value, path);

  return typeof current === "boolean" ? current : defaultValue;
}

function fieldId(section: SectionDraft, scope: FieldScope, path: JsonPath) {
  return `${section.sectionKey}-${scope}-${path.map(String).join("-")}`;
}

function getFieldError(message: string | undefined, path: JsonPath) {
  if (!message) {
    return undefined;
  }

  const pathLabel = path.map(String).join(".");
  const parentPathLabel = path.slice(0, -1).map(String).join(".");

  if (pathLabel && message.includes(`${pathLabel}:`)) {
    return message;
  }

  if (parentPathLabel && message.includes(`${parentPathLabel}:`)) {
    return message;
  }

  return undefined;
}

function moveArrayItem<TItem>(items: TItem[], from: number, to: number) {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
    return items;
  }

  const nextItems = [...items];
  const [item] = nextItems.splice(from, 1);

  if (item === undefined) {
    return items;
  }

  nextItems.splice(to, 0, item);

  return nextItems;
}

function readString(value: JsonValue | undefined) {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function readBoolean(value: JsonValue | undefined, fallback = false) {
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

function stripUndefinedJsonObject(value: unknown): JsonObject {
  const stripped = stripUndefinedJsonValue(value);

  return isJsonObject(stripped) ? stripped : {};
}

function stripUndefinedJsonValue(value: unknown): JsonValue | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => stripUndefinedJsonValue(item) ?? null);
  }

  if (isJsonObject(value)) {
    const result: JsonObject = {};

    Object.entries(value).forEach(([key, item]) => {
      const stripped = stripUndefinedJsonValue(item);

      if (stripped !== undefined) {
        result[key] = stripped;
      }
    });

    return result;
  }

  return undefined;
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

function toSectionFormError(
  error: unknown,
  sections: SectionDraft[] = [],
): {
  formMessage: string;
  sectionErrors: SectionErrorMap;
} {
  if (error instanceof ApiClientError) {
    const fields = error.apiError.error.fields ?? [];
    const sectionErrors = fields.reduce<SectionErrorMap>((errors, field) => {
      const sectionIndex =
        field.path?.[0] === "sections" && typeof field.path[1] === "number"
          ? field.path[1]
          : undefined;
      const sectionKey =
        sectionIndex === undefined ? "_form" : (sections[sectionIndex]?.sectionKey ?? "_form");
      const currentMessage = errors[sectionKey]?.content;

      errors[sectionKey] = {
        content: currentMessage ? `${currentMessage} ${field.message}` : field.message,
      };

      return errors;
    }, {});

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

const secondaryButtonClassName = dashboardButtonClassName;
