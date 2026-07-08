"use client";

import { ApiClientError } from "@lumiere/api-client";
import { getSectionDefinition } from "@lumiere/themes";
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
  type Dispatch,
  type SetStateAction,
} from "react";

import { useDashboardAuth } from "../../../auth/dashboard-auth-provider";
import { EventTabs } from "../../../components/placeholder-panels";

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
            className="inline-flex min-h-10 w-fit items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--surface)]"
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

    const parsed = parseSectionDrafts(state.sections);

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
              {state.theme.name} supports {state.sections.length} section types. Enable sections,
              set visibility, edit validated JSON content, and use move controls to adjust order.
            </p>
          </div>
          <button
            className="inline-flex min-h-10 w-fit items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--surface)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={state.isSaving}
            onClick={() => void saveSections()}
            type="button"
          >
            {state.isSaving ? "Saving sections..." : "Save sections"}
          </button>
        </div>

        <dl className="grid gap-3 text-sm sm:grid-cols-3">
          <SummaryItem label="Enabled sections" value={`${enabledCount}`} />
          <SummaryItem label="Selected theme" value={state.theme.name} />
          <SummaryItem label="Theme mode" value={formatMode(state.event.themeMode)} />
        </dl>

        {state.formMessage ? (
          <p
            className={`rounded-[var(--radius-md)] border px-3 py-2 text-sm ${
              Object.keys(state.sectionErrors).length > 0
                ? "border-[var(--error)] bg-[color-mix(in_srgb,var(--error)_10%,var(--surface))] text-[var(--error)]"
                : "border-[var(--success)] bg-[color-mix(in_srgb,var(--success)_10%,var(--surface))] text-[var(--success)]"
            }`}
            role="status"
          >
            {state.formMessage}
          </p>
        ) : null}
      </section>

      <section className="grid gap-4" aria-label="Supported sections">
        {state.sections.map((section, index) => (
          <SectionEditor
            errors={state.sectionErrors[section.sectionKey] ?? {}}
            isFirst={index === 0}
            isLast={index === state.sections.length - 1}
            key={section.sectionKey}
            moveSection={moveSection}
            section={section}
            updateSection={updateSection}
          />
        ))}
      </section>
    </div>
  );
}

function SectionEditor({
  errors,
  isFirst,
  isLast,
  moveSection,
  section,
  updateSection,
}: {
  errors: SectionErrors;
  isFirst: boolean;
  isLast: boolean;
  moveSection: (sectionKey: string, direction: -1 | 1) => void;
  section: SectionDraft;
  updateSection: (sectionKey: string, updates: Partial<SectionDraft>) => void;
}) {
  const definition = getSectionDefinition(section.sectionType);

  return (
    <article className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-semibold tracking-tight">{definition.label}</h3>
            {definition.requiresGuestContext ? <Badge label="Guest context" /> : null}
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
            {definition.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
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
              onChange={(event) =>
                updateSection(section.sectionKey, {
                  enabled: event.target.checked,
                })
              }
              type="checkbox"
            />
            <span>
              <span className="block font-semibold">Enabled</span>
              <span className="mt-1 block text-[color-mix(in_srgb,var(--foreground)_66%,transparent)]">
                Disabled sections are omitted from the saved invite config.
              </span>
            </span>
          </label>

          <div className="grid gap-2">
            <label className="text-sm font-semibold" htmlFor={`${section.sectionKey}-visibility`}>
              Visibility
            </label>
            <select
              aria-label={`${definition.label} visibility`}
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
                {errors.visibility}
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
              aria-label={`${definition.label} content JSON`}
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
              <p className="text-sm text-[var(--error)]" role="alert">
                {errors.content}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold" htmlFor={`${section.sectionKey}-settings`}>
              Settings JSON
            </label>
            <textarea
              aria-label={`${definition.label} settings JSON`}
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
              <p className="text-sm text-[var(--error)]" role="alert">
                {errors.settings}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </article>
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

function Badge({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-[var(--radius-sm)] bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[color-mix(in_srgb,var(--foreground)_68%,transparent)]">
      {label}
    </span>
  );
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
  const rhythmTypes = readSectionTypes(theme.metadata.sectionRhythm);
  const existingByType = new Map(
    existingSections
      .filter((section) => supportedTypes.includes(section.sectionType))
      .sort((first, second) => first.sortOrder - second.sortOrder)
      .map((section) => [section.sectionType, section] as const),
  );
  const orderedTypes = uniqueSectionTypes([
    ...existingByType.keys(),
    ...rhythmTypes.filter((type) => supportedTypes.includes(type)),
    ...supportedTypes,
  ]);

  return orderedTypes.map((sectionType, index) => {
    const existing = existingByType.get(sectionType);
    const definition = getSectionDefinition(sectionType);

    return {
      contentText: formatJsonText(
        existing?.content ?? defaultContentForSection(sectionType, event),
      ),
      enabled: existing?.enabled ?? false,
      id: existing?.id,
      sectionKey: existing?.sectionKey ?? toSectionKey(sectionType),
      sectionType,
      settingsText: formatJsonText(existing?.settings ?? {}),
      sortOrder: index,
      visibility: existing?.visibility ?? definition.defaultVisibility,
    };
  });
}

export function parseSectionDrafts(sections: SectionDraft[]):
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

function toSectionFormError(error: unknown) {
  if (error instanceof ApiClientError) {
    return {
      formMessage: error.apiError.error.message,
      sectionErrors: {},
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
