"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";

import { useDashboardAuth } from "../../../../auth/dashboard-auth-provider";
import { EventTabs } from "../../../placeholder-panels";
import {
  EventBasicsForm,
  createEventFormValuesFromEvent,
  emptyEventFormState,
  formatDateTime,
  formatEventType,
  formatStatus,
  parseEventUpdateValues,
  statusClassName,
  toEventFormError,
  toFriendlyApiMessage,
  type EventBasicsFormValues,
  type EventFormField,
  type EventFormState,
} from "../../event-basics-form";

type SettingsState =
  | {
      baseline: EventBasicsFormValues;
      error: null;
      formState: EventFormState;
      isSaving: boolean;
      status: "ready";
      statusMessage: string | null;
      values: EventBasicsFormValues;
    }
  | {
      error: string | null;
      status: "error" | "loading";
    };

type ReadySettingsState = Extract<SettingsState, { status: "ready" }>;

export function EventSettingsWorkspace({ eventId }: { eventId: string }) {
  const { apiClient } = useDashboardAuth();
  const [state, setState] = useState<SettingsState>({
    error: null,
    status: "loading",
  });

  const loadEvent = useCallback(async () => {
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
      const response = await apiClient.getEvent(eventId);
      const values = createEventFormValuesFromEvent(response.event);

      setState({
        baseline: values,
        error: null,
        formState: emptyEventFormState,
        isSaving: false,
        status: "ready",
        statusMessage: null,
        values,
      });
    } catch (error) {
      setState({
        error: toFriendlyApiMessage(error),
        status: "error",
      });
    }
  }, [apiClient, eventId]);

  useEffect(() => {
    void loadEvent();
  }, [loadEvent]);

  if (state.status === "loading") {
    return (
      <div className="grid gap-5">
        <EventTabs active="settings" eventId={eventId} />
        <SettingsLoading />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="grid gap-5">
        <EventTabs active="settings" eventId={eventId} />
        <section
          className="grid gap-3 rounded-[var(--radius-lg)] border border-[var(--error)] bg-[color-mix(in_srgb,var(--error)_10%,var(--surface))] p-5 text-[var(--error)]"
          role="alert"
        >
          <h2 className="text-lg font-semibold">Unable to load event settings</h2>
          <p className="text-sm">{state.error}</p>
          <button
            className="inline-flex min-h-10 w-fit items-center justify-center rounded-[var(--radius-md)] border border-[var(--error)] px-4 text-sm font-semibold transition hover:bg-[color-mix(in_srgb,var(--error)_12%,transparent)] focus:outline-none focus:ring-2 focus:ring-[var(--error)]"
            onClick={() => void loadEvent()}
            type="button"
          >
            Try again
          </button>
        </section>
      </div>
    );
  }

  const readyState = state as ReadySettingsState;
  const dirty = !areEventFormValuesEqual(readyState.values, readyState.baseline);

  const updateField = (field: EventFormField, value: string) => {
    setState((current) => {
      if (current.status !== "ready") {
        return current;
      }

      return {
        ...current,
        statusMessage: null,
        values: updateEventFormValues(current.values, field, value),
      };
    });
  };

  const cancelChanges = () => {
    setState((current) => {
      if (current.status !== "ready") {
        return current;
      }

      return {
        ...current,
        formState: emptyEventFormState,
        statusMessage: null,
        values: current.baseline,
      };
    });
  };

  const saveChanges = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!apiClient) {
      setState((current) =>
        current.status === "ready"
          ? {
              ...current,
              formState: {
                fieldErrors: {},
                formError: "Dashboard API is not configured.",
              },
              statusMessage: null,
            }
          : current,
      );
      return;
    }

    const parsed = parseEventUpdateValues(readyState.values);

    if (!parsed.ok) {
      setState({
        ...readyState,
        formState: {
          fieldErrors: parsed.fieldErrors,
          formError: parsed.formError,
        },
        statusMessage: null,
      });
      return;
    }

    setState({
      ...readyState,
      formState: emptyEventFormState,
      isSaving: true,
      statusMessage: null,
    });

    try {
      const response = await apiClient.updateEvent(eventId, parsed.input);
      const values = createEventFormValuesFromEvent(response.event);

      setState({
        baseline: values,
        error: null,
        formState: emptyEventFormState,
        isSaving: false,
        status: "ready",
        statusMessage: "Event settings saved.",
        values,
      });
    } catch (error) {
      setState({
        ...readyState,
        formState: toEventFormError(error),
        isSaving: false,
        statusMessage: null,
      });
    }
  };

  return (
    <div className="grid gap-5">
      <EventTabs active="settings" eventId={eventId} />

      <section className="grid gap-5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--accent-strong)]">Event settings</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              {readyState.values.title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_70%,transparent)]">
              Keep the public identity, schedule, venue, and publish state aligned before guests
              open the invitation.
            </p>
          </div>
          <span className={statusClassName(readyState.values.status)}>
            {formatStatus(readyState.values.status)}
          </span>
        </div>

        <dl className="grid gap-3 text-sm md:grid-cols-3">
          <MetadataItem label="Public slug" value={`/e/${readyState.values.slug}`} />
          <MetadataItem label="Type" value={formatEventType(readyState.values.eventType)} />
          <MetadataItem
            label="Starts"
            value={
              readyState.values.startsAt ? formatDateTime(readyState.values.startsAt) : "Not set"
            }
          />
        </dl>

        <EventBasicsForm
          dirty={dirty}
          formId="workspace-event-settings"
          formState={readyState.formState}
          isSaving={readyState.isSaving}
          mode="edit"
          onCancel={cancelChanges}
          onFieldChange={updateField}
          onSubmit={saveChanges}
          statusMessage={readyState.statusMessage}
          submitLabel="Save settings"
          values={readyState.values}
        />
      </section>
    </div>
  );
}

function SettingsLoading() {
  return (
    <div className="grid gap-4" aria-label="Loading event settings" aria-live="polite">
      <div className="h-48 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-muted)]" />
      <div className="h-80 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-muted)]" />
    </div>
  );
}

function MetadataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--surface-muted)] p-3">
      <dt className="text-[color-mix(in_srgb,var(--foreground)_58%,transparent)]">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
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
