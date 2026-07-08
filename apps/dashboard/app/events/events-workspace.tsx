"use client";

import { ApiClientError } from "@lumiere/api-client";
import {
  eventCreateRequestSchema,
  type Event,
  type EventCreateRequest,
  type EventType,
} from "@lumiere/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";

import { useDashboardAuth, type DashboardApiClient } from "../auth/dashboard-auth-provider";

type FieldErrors = Partial<Record<EventFormField, string>>;

type EventFormField =
  | "endsAt"
  | "eventType"
  | "slug"
  | "startsAt"
  | "timezone"
  | "title"
  | "venueAddress"
  | "venueName";

type EventFormState = {
  fieldErrors: FieldErrors;
  formError: string | null;
};

const eventTypes: Array<{ label: string; value: EventType }> = [
  { label: "Wedding", value: "wedding" },
  { label: "Birthday", value: "birthday" },
  { label: "Kids party", value: "kids_party" },
  { label: "Holiday", value: "holiday" },
  { label: "Dinner", value: "dinner" },
  { label: "Launch", value: "launch" },
  { label: "Private event", value: "private_event" },
  { label: "Other", value: "other" },
];

const emptyFormState: EventFormState = {
  fieldErrors: {},
  formError: null,
};

export function EventsWorkspace() {
  const router = useRouter();
  const { apiClient } = useDashboardAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formState, setFormState] = useState<EventFormState>(emptyFormState);
  const [slugTouched, setSlugTouched] = useState(false);
  const [slugValue, setSlugValue] = useState("");

  useEffect(() => {
    let isMounted = true;

    if (!apiClient) {
      setIsLoading(false);
      setLoadError("Dashboard API is not configured.");
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    apiClient
      .listEvents()
      .then(({ events }) => {
        if (!isMounted) {
          return;
        }

        setEvents(events);
        setIsLoading(false);
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return;
        }

        setLoadError(toFriendlyApiMessage(error));
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [apiClient]);

  const metrics = useMemo(() => getEventMetrics(events), [events]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const parsed = parseEventCreateForm(formData);

    if (!parsed.ok) {
      setFormState({
        fieldErrors: parsed.fieldErrors,
        formError: parsed.formError,
      });
      return;
    }

    if (!apiClient) {
      setFormState({
        fieldErrors: {},
        formError: "Dashboard API is not configured.",
      });
      return;
    }

    setIsCreating(true);
    setFormState(emptyFormState);

    try {
      const { event } = await apiClient.createEvent(parsed.input);
      router.push(`/events/${event.id}`);
    } catch (error) {
      setFormState(toEventFormError(error));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="grid gap-5">
      <section className="grid gap-4 md:grid-cols-3" aria-label="Event totals">
        {metrics.map((item) => (
          <article
            className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5"
            key={item.label}
          >
            <p className="text-sm text-[color-mix(in_srgb,var(--foreground)_68%,transparent)]">
              {item.label}
            </p>
            <p className="mt-3 text-3xl font-semibold">{item.value}</p>
            <p className="mt-3 rounded-[var(--radius-sm)] bg-[var(--surface-muted)] px-3 py-2 text-sm">
              {item.state}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,26rem)]">
        <div className="grid content-start gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Manager events</h2>
              <p className="mt-1 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_70%,transparent)]">
                Events returned for this manager account appear here.
              </p>
            </div>
            <a
              className="inline-flex min-h-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] px-4 text-sm font-semibold transition hover:bg-[var(--surface-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              href="#new-event"
            >
              New event
            </a>
          </div>

          <EventList events={events} isLoading={isLoading} loadError={loadError} />
        </div>

        <form
          className="grid content-start gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5"
          id="new-event"
          noValidate
          onSubmit={handleCreate}
        >
          <div>
            <p className="text-sm font-semibold text-[var(--accent-strong)]">Create event</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">Start with the basics</h2>
            <p className="mt-1 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_70%,transparent)]">
              Capture the public name, URL slug, date, and venue. Theme and guest setup come next.
            </p>
          </div>

          {formState.formError ? (
            <p
              className="rounded-[var(--radius-md)] border border-[var(--error)] bg-[color-mix(in_srgb,var(--error)_10%,var(--surface))] px-3 py-2 text-sm text-[var(--error)]"
              role="alert"
            >
              {formState.formError}
            </p>
          ) : null}

          <Field label="Event title" error={formState.fieldErrors.title} htmlFor="event-title">
            <input
              className={inputClassName}
              id="event-title"
              name="title"
              onChange={(event) => {
                if (!slugTouched) {
                  setSlugValue(toSlug(event.target.value));
                }
              }}
              type="text"
            />
          </Field>

          <Field label="Event type" error={formState.fieldErrors.eventType} htmlFor="event-type">
            <select
              className={inputClassName}
              defaultValue="wedding"
              id="event-type"
              name="eventType"
            >
              {eventTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="URL slug" error={formState.fieldErrors.slug} htmlFor="event-slug">
            <input
              className={inputClassName}
              id="event-slug"
              name="slug"
              onChange={(event) => {
                setSlugTouched(true);
                setSlugValue(toSlug(event.target.value));
              }}
              type="text"
              value={slugValue}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Starts" error={formState.fieldErrors.startsAt} htmlFor="event-starts-at">
              <input
                className={inputClassName}
                id="event-starts-at"
                name="startsAt"
                type="datetime-local"
              />
            </Field>
            <Field
              label="Ends optional"
              error={formState.fieldErrors.endsAt}
              htmlFor="event-ends-at"
            >
              <input
                className={inputClassName}
                id="event-ends-at"
                name="endsAt"
                type="datetime-local"
              />
            </Field>
          </div>

          <Field label="Timezone" error={formState.fieldErrors.timezone} htmlFor="event-timezone">
            <input
              className={inputClassName}
              defaultValue={getBrowserTimezone()}
              id="event-timezone"
              name="timezone"
              type="text"
            />
          </Field>

          <Field
            label="Venue name"
            error={formState.fieldErrors.venueName}
            htmlFor="event-venue-name"
          >
            <input className={inputClassName} id="event-venue-name" name="venueName" type="text" />
          </Field>

          <Field
            label="Venue address"
            error={formState.fieldErrors.venueAddress}
            htmlFor="event-venue-address"
          >
            <textarea
              className={`${inputClassName} min-h-24 resize-y`}
              id="event-venue-address"
              name="venueAddress"
            />
          </Field>

          <button
            className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--surface)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isCreating}
            type="submit"
          >
            {isCreating ? "Creating event..." : "Create event"}
          </button>
        </form>
      </section>
    </div>
  );
}

function EventList({
  events,
  isLoading,
  loadError,
}: {
  events: Event[];
  isLoading: boolean;
  loadError: string | null;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-3" aria-label="Loading events" aria-live="polite">
        {[0, 1, 2].map((index) => (
          <div
            className="h-24 animate-pulse rounded-[var(--radius-md)] bg-[var(--surface-muted)]"
            key={index}
          />
        ))}
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        className="rounded-[var(--radius-md)] border border-[var(--error)] bg-[color-mix(in_srgb,var(--error)_10%,var(--surface))] p-4 text-sm text-[var(--error)]"
        role="alert"
      >
        {loadError}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="grid gap-3 rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[color-mix(in_srgb,var(--surface-muted)_48%,var(--surface))] p-5">
        <h3 className="text-lg font-semibold">Create your first event</h3>
        <p className="max-w-2xl text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
          Add the event details first. After it is created, you can choose a theme, configure
          sections, and invite guest groups from the event workspace.
        </p>
        <a
          className="inline-flex min-h-10 w-fit items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--surface)]"
          href="#new-event"
        >
          Create event
        </a>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {events.map((event) => (
        <article
          className="grid gap-3 rounded-[var(--radius-md)] border border-[var(--border)] p-4 transition hover:bg-[color-mix(in_srgb,var(--surface-muted)_42%,var(--surface))]"
          key={event.id}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                <Link
                  className="focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  href={`/events/${event.id}`}
                >
                  {event.title}
                </Link>
              </h3>
              <p className="mt-1 text-sm text-[color-mix(in_srgb,var(--foreground)_68%,transparent)]">
                /e/{event.slug} · {formatEventType(event.eventType)}
              </p>
            </div>
            <span className={statusClassName(event.status)}>{formatStatus(event.status)}</span>
          </div>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-[color-mix(in_srgb,var(--foreground)_62%,transparent)]">Date</dt>
              <dd className="mt-1 font-medium">{formatDateTime(event.startsAt)}</dd>
            </div>
            <div>
              <dt className="text-[color-mix(in_srgb,var(--foreground)_62%,transparent)]">Venue</dt>
              <dd className="mt-1 font-medium">{event.venueName || "Venue not set"}</dd>
            </div>
          </dl>
        </article>
      ))}
    </div>
  );
}

function Field({
  children,
  error,
  htmlFor,
  label,
}: {
  children: ReactNode;
  error?: string;
  htmlFor: string;
  label: string;
}) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-semibold" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-sm text-[var(--error)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function parseEventCreateForm(formData: FormData):
  | {
      input: EventCreateRequest;
      ok: true;
    }
  | {
      fieldErrors: FieldErrors;
      formError: string | null;
      ok: false;
    } {
  const input = {
    endsAt: toOptionalIsoDateTime(readFormString(formData, "endsAt")),
    eventType: readFormString(formData, "eventType"),
    publicSettings: {},
    rsvpSettings: {},
    slug: readFormString(formData, "slug"),
    startsAt: toIsoDateTime(readFormString(formData, "startsAt")),
    themeMode: "system",
    timezone: readFormString(formData, "timezone") || getBrowserTimezone(),
    title: readFormString(formData, "title"),
    venueAddress: toOptionalString(readFormString(formData, "venueAddress")),
    venueName: toOptionalString(readFormString(formData, "venueName")),
  };

  const parsed = eventCreateRequestSchema.safeParse(input);

  if (parsed.success) {
    return {
      input: parsed.data,
      ok: true,
    };
  }

  return {
    fieldErrors: issuesToFieldErrors(parsed.error.issues),
    formError: "Check the highlighted fields before creating the event.",
    ok: false,
  };
}

export async function createEventFromFormData(
  apiClient: Pick<DashboardApiClient, "createEvent">,
  formData: FormData,
) {
  const parsed = parseEventCreateForm(formData);

  if (!parsed.ok) {
    return parsed;
  }

  const response = await apiClient.createEvent(parsed.input);

  return {
    event: response.event,
    ok: true as const,
  };
}

function getEventMetrics(events: Event[]) {
  const published = events.filter((event) => event.status === "published").length;
  const drafts = events.filter((event) => event.status === "draft").length;

  return [
    {
      label: "Total events",
      state: events.length === 0 ? "Ready for setup" : "Manager scope",
      value: String(events.length),
    },
    {
      label: "Published events",
      state: published === 0 ? "None live" : "Visible to guests",
      value: String(published),
    },
    {
      label: "Draft events",
      state: drafts === 0 ? "No drafts" : "Needs setup",
      value: String(drafts),
    },
  ];
}

function toEventFormError(error: unknown): EventFormState {
  if (error instanceof ApiClientError) {
    return {
      fieldErrors: issuesToFieldErrors(error.apiError.error.fields ?? []),
      formError: error.apiError.error.message,
    };
  }

  return {
    fieldErrors: {},
    formError: toFriendlyApiMessage(error),
  };
}

function issuesToFieldErrors(issues: Array<{ message: string; path: readonly unknown[] }>) {
  const fieldErrors: FieldErrors = {};

  for (const issue of issues) {
    const field = issue.path[0];

    if (typeof field === "string" && isEventFormField(field) && !fieldErrors[field]) {
      fieldErrors[field] = toFriendlyFieldMessage(field, issue.message);
    }
  }

  return fieldErrors;
}

function toFriendlyFieldMessage(field: EventFormField, message: string) {
  if (field === "title") {
    return "Event title is required.";
  }

  if (field === "startsAt") {
    return "Choose the event start date and time.";
  }

  if (field === "slug") {
    return "Use lowercase letters, numbers, and hyphens.";
  }

  if (field === "timezone") {
    return "Enter the event timezone.";
  }

  return message;
}

function isEventFormField(value: string): value is EventFormField {
  return [
    "endsAt",
    "eventType",
    "slug",
    "startsAt",
    "timezone",
    "title",
    "venueAddress",
    "venueName",
  ].includes(value);
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

function readFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function toIsoDateTime(value: string) {
  if (!value) {
    return value;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}

function toOptionalIsoDateTime(value: string) {
  return value ? toIsoDateTime(value) : undefined;
}

function toOptionalString(value: string) {
  return value || undefined;
}

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function getBrowserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatEventType(value: EventType) {
  return eventTypes.find((type) => type.value === value)?.label ?? "Event";
}

function formatStatus(value: Event["status"]) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function statusClassName(value: Event["status"]) {
  const base =
    "inline-flex w-fit rounded-[var(--radius-sm)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]";

  if (value === "published") {
    return `${base} bg-[color-mix(in_srgb,var(--success)_14%,var(--surface))] text-[var(--success)]`;
  }

  if (value === "archived") {
    return `${base} bg-[var(--surface-muted)] text-[color-mix(in_srgb,var(--foreground)_64%,transparent)]`;
  }

  return `${base} bg-[color-mix(in_srgb,var(--warning)_14%,var(--surface))] text-[var(--warning)]`;
}

const inputClassName =
  "min-h-11 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[color-mix(in_srgb,var(--foreground)_42%,transparent)] hover:border-[var(--accent)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]";
