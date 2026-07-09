"use client";

import type { Event } from "@lumiere/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import { useDashboardAuth } from "../../auth/dashboard-auth-provider";
import {
  EventBasicsForm,
  createBlankEventFormValues,
  createEventFormValuesFromEvent,
  emptyEventFormState,
  formatDateTime,
  formatEventType,
  formatStatus,
  parseEventCreateValues,
  parseEventUpdateValues,
  statusClassName,
  toEventFormError,
  toFriendlyApiMessage,
  toSlug,
  type EventBasicsFormValues,
  type EventFormField,
  type EventFormState,
} from "./event-basics-form";

export { createEventFromFormData, parseEventCreateForm } from "./event-basics-form";

export function EventsWorkspace() {
  const router = useRouter();
  const { apiClient } = useDashboardAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [createValues, setCreateValues] = useState<EventBasicsFormValues>(() =>
    createBlankEventFormValues(),
  );
  const [createSlugTouched, setCreateSlugTouched] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editBaseline, setEditBaseline] = useState<EventBasicsFormValues | null>(null);
  const [editValues, setEditValues] = useState<EventBasicsFormValues | null>(null);
  const [editFormState, setEditFormState] = useState<EventFormState>(emptyEventFormState);
  const [editStatusMessage, setEditStatusMessage] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formState, setFormState] = useState<EventFormState>(emptyEventFormState);

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
  const editingEvent = useMemo(
    () => events.find((event) => event.id === editingEventId) ?? null,
    [editingEventId, events],
  );
  const editDirty = Boolean(
    editValues && editBaseline && !areEventFormValuesEqual(editValues, editBaseline),
  );

  const handleCreateFieldChange = (field: EventFormField, value: string) => {
    if (field === "slug") {
      setCreateSlugTouched(true);
    }

    setCreateValues((current) => {
      const next = updateEventFormValues(current, field, value);

      if (field === "title" && !createSlugTouched) {
        return {
          ...next,
          slug: toSlug(value),
        };
      }

      return next;
    });
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsed = parseEventCreateValues(createValues);

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
    setFormState(emptyEventFormState);

    try {
      const { event } = await apiClient.createEvent(parsed.input);
      router.push(`/events/${event.id}`);
    } catch (error) {
      setFormState(toEventFormError(error));
    } finally {
      setIsCreating(false);
    }
  };

  const startEditingEvent = (event: Event) => {
    const values = createEventFormValuesFromEvent(event);

    setEditingEventId(event.id);
    setEditBaseline(values);
    setEditValues(values);
    setEditFormState(emptyEventFormState);
    setEditStatusMessage(null);
  };

  const cancelEditingEvent = () => {
    setEditValues(editBaseline);
    setEditFormState(emptyEventFormState);
    setEditStatusMessage(null);
  };

  const handleEditFieldChange = (field: EventFormField, value: string) => {
    setEditValues((current) => {
      if (!current) {
        return current;
      }

      return updateEventFormValues(current, field, value);
    });
    setEditStatusMessage(null);
  };

  const handleSaveEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingEventId || !editValues) {
      return;
    }

    const parsed = parseEventUpdateValues(editValues);

    if (!parsed.ok) {
      setEditFormState({
        fieldErrors: parsed.fieldErrors,
        formError: parsed.formError,
      });
      setEditStatusMessage(null);
      return;
    }

    if (!apiClient) {
      setEditFormState({
        fieldErrors: {},
        formError: "Dashboard API is not configured.",
      });
      setEditStatusMessage(null);
      return;
    }

    setIsSavingEdit(true);
    setEditFormState(emptyEventFormState);
    setEditStatusMessage(null);

    try {
      const response = await apiClient.updateEvent(editingEventId, parsed.input);
      const nextValues = createEventFormValuesFromEvent(response.event);

      setEvents((current) =>
        current.map((event) => (event.id === response.event.id ? response.event : event)),
      );
      setEditBaseline(nextValues);
      setEditValues(nextValues);
      setEditStatusMessage("Event basics saved.");
    } catch (error) {
      setEditFormState(toEventFormError(error));
    } finally {
      setIsSavingEdit(false);
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

          <EventList
            editingEventId={editingEventId}
            events={events}
            isLoading={isLoading}
            loadError={loadError}
            onEdit={startEditingEvent}
          />

          {editingEvent && editValues ? (
            <section
              aria-label={`Edit ${editingEvent.title}`}
              className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_5%,var(--surface))] p-4"
              id="edit-event"
            >
              <div>
                <p className="text-sm font-semibold text-[var(--accent-strong)]">Edit event</p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight">{editingEvent.title}</h2>
                <p className="mt-1 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_70%,transparent)]">
                  Update the public basics, timing, venue, and publish status without leaving the
                  event list.
                </p>
              </div>

              <EventBasicsForm
                dirty={editDirty}
                formId="edit-event-basics"
                formState={editFormState}
                isSaving={isSavingEdit}
                mode="edit"
                onCancel={cancelEditingEvent}
                onFieldChange={handleEditFieldChange}
                onSubmit={handleSaveEdit}
                statusMessage={editStatusMessage}
                submitLabel="Save event"
                values={editValues}
              />
            </section>
          ) : null}
        </div>

        <section
          className="grid content-start gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5"
          id="new-event"
        >
          <div>
            <p className="text-sm font-semibold text-[var(--accent-strong)]">Create event</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">Start with the basics</h2>
            <p className="mt-1 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_70%,transparent)]">
              Capture the public name, URL slug, date, and venue. Theme and guest setup come next.
            </p>
          </div>

          <EventBasicsForm
            formId="new-event-basics"
            formState={formState}
            isSaving={isCreating}
            mode="create"
            onFieldChange={handleCreateFieldChange}
            onSubmit={handleCreate}
            submitLabel="Create event"
            values={createValues}
          />
        </section>
      </section>
    </div>
  );
}

function EventList({
  editingEventId,
  events,
  isLoading,
  loadError,
  onEdit,
}: {
  editingEventId: string | null;
  events: Event[];
  isLoading: boolean;
  loadError: string | null;
  onEdit: (event: Event) => void;
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
          className="inline-flex min-h-10 w-fit items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-contrast)] transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--surface)]"
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
          <div className="flex flex-wrap gap-2 border-t border-[var(--border)] pt-3">
            <Link
              className="inline-flex min-h-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] px-3 text-sm font-semibold text-[var(--accent-contrast)] transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--surface)]"
              href={`/events/${event.id}`}
            >
              Open workspace
            </Link>
            <button
              aria-expanded={editingEventId === event.id}
              aria-controls="edit-event"
              className="inline-flex min-h-9 items-center justify-center rounded-[var(--radius-md)] border border-[var(--accent)] px-3 text-sm font-semibold text-[var(--accent-strong)] transition hover:bg-[color-mix(in_srgb,var(--accent)_9%,transparent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              onClick={() => onEdit(event)}
              type="button"
            >
              Edit
            </button>
            {eventQuickLinks.map((item) => (
              <Link
                className="inline-flex min-h-9 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] px-3 text-sm font-semibold transition hover:bg-[var(--surface-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                href={`/events/${event.id}/${item.href}`}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
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

function updateEventFormValues(
  values: EventBasicsFormValues,
  field: EventFormField,
  value: string,
): EventBasicsFormValues {
  return {
    ...values,
    [field]: value,
  } as EventBasicsFormValues;
}

function areEventFormValuesEqual(first: EventBasicsFormValues, second: EventBasicsFormValues) {
  return JSON.stringify(first) === JSON.stringify(second);
}

const eventQuickLinks = [
  { href: "theme", label: "Theme" },
  { href: "content", label: "Content" },
  { href: "guests", label: "Guests" },
  { href: "activity", label: "Activity" },
] as const;
