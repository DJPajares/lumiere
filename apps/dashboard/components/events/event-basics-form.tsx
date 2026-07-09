"use client";

import { ApiClientError } from "@lumiere/api-client";
import {
  eventCreateRequestSchema,
  eventUpdateRequestSchema,
  type Event,
  type EventCreateRequest,
  type EventStatus,
  type EventType,
  type EventUpdateRequest,
} from "@lumiere/types";
import type { FormEvent, ReactNode } from "react";

import type { DashboardApiClient } from "../../auth/dashboard-auth-provider";

export type FieldErrors = Partial<Record<EventFormField, string>>;

export type EventFormField =
  | "endsAt"
  | "eventType"
  | "slug"
  | "startsAt"
  | "status"
  | "timezone"
  | "title"
  | "venueAddress"
  | "venueName";

export type EventFormState = {
  fieldErrors: FieldErrors;
  formError: string | null;
};

export type EventBasicsFormValues = {
  endsAt: string;
  eventType: EventType;
  slug: string;
  startsAt: string;
  status: EventStatus;
  timezone: string;
  title: string;
  venueAddress: string;
  venueName: string;
};

export type EventBasicsFormProps = {
  dirty?: boolean;
  formId: string;
  formState: EventFormState;
  isSaving: boolean;
  mode: "create" | "edit";
  onCancel?: () => void;
  onFieldChange: (field: EventFormField, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  statusMessage?: string | null;
  submitLabel: string;
  values: EventBasicsFormValues;
};

export const emptyEventFormState: EventFormState = {
  fieldErrors: {},
  formError: null,
};

export const eventTypes: Array<{ label: string; value: EventType }> = [
  { label: "Wedding", value: "wedding" },
  { label: "Birthday", value: "birthday" },
  { label: "Kids party", value: "kids_party" },
  { label: "Holiday", value: "holiday" },
  { label: "Dinner", value: "dinner" },
  { label: "Launch", value: "launch" },
  { label: "Private event", value: "private_event" },
  { label: "Other", value: "other" },
];

const eventStatuses: Array<{ help: string; label: string; value: EventStatus }> = [
  { help: "Hidden from guests while setup is in progress.", label: "Draft", value: "draft" },
  { help: "Visible on public invite routes.", label: "Published", value: "published" },
  {
    help: "Kept for records and removed from public access.",
    label: "Archived",
    value: "archived",
  },
];

export function EventBasicsForm({
  dirty = false,
  formId,
  formState,
  isSaving,
  mode,
  onCancel,
  onFieldChange,
  onSubmit,
  statusMessage,
  submitLabel,
  values,
}: EventBasicsFormProps) {
  const disabled = isSaving;

  return (
    <form className="grid content-start gap-4" id={formId} noValidate onSubmit={onSubmit}>
      <FormMessage formError={formState.formError} statusMessage={statusMessage} />

      {mode === "edit" ? (
        <div className="flex flex-wrap items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm">
          <span className="font-semibold">{dirty ? "Unsaved changes" : "All changes saved"}</span>
          <span className="text-[color-mix(in_srgb,var(--foreground)_62%,transparent)]">
            {dirty ? "Review and save when ready." : "You can leave this screen safely."}
          </span>
        </div>
      ) : null}

      <Field label="Event title" error={formState.fieldErrors.title} htmlFor={`${formId}-title`}>
        <input
          aria-invalid={Boolean(formState.fieldErrors.title)}
          className={inputClassName}
          disabled={disabled}
          id={`${formId}-title`}
          name="title"
          onChange={(event) => onFieldChange("title", event.target.value)}
          type="text"
          value={values.title}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Event type"
          error={formState.fieldErrors.eventType}
          htmlFor={`${formId}-event-type`}
        >
          <select
            aria-invalid={Boolean(formState.fieldErrors.eventType)}
            className={inputClassName}
            disabled={disabled}
            id={`${formId}-event-type`}
            name="eventType"
            onChange={(event) => onFieldChange("eventType", event.target.value)}
            value={values.eventType}
          >
            {eventTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </Field>

        {mode === "edit" ? (
          <Field
            label="Publish status"
            error={formState.fieldErrors.status}
            htmlFor={`${formId}-status`}
          >
            <select
              aria-invalid={Boolean(formState.fieldErrors.status)}
              className={inputClassName}
              disabled={disabled}
              id={`${formId}-status`}
              name="status"
              onChange={(event) => onFieldChange("status", event.target.value)}
              value={values.status}
            >
              {eventStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <p className="text-xs leading-5 text-[color-mix(in_srgb,var(--foreground)_58%,transparent)]">
              {eventStatuses.find((status) => status.value === values.status)?.help}
            </p>
          </Field>
        ) : null}
      </div>

      <Field label="URL slug" error={formState.fieldErrors.slug} htmlFor={`${formId}-slug`}>
        <input
          aria-invalid={Boolean(formState.fieldErrors.slug)}
          className={inputClassName}
          disabled={disabled}
          id={`${formId}-slug`}
          name="slug"
          onChange={(event) => onFieldChange("slug", toSlug(event.target.value))}
          type="text"
          value={values.slug}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Starts"
          error={formState.fieldErrors.startsAt}
          htmlFor={`${formId}-starts-at`}
        >
          <input
            aria-invalid={Boolean(formState.fieldErrors.startsAt)}
            className={inputClassName}
            disabled={disabled}
            id={`${formId}-starts-at`}
            name="startsAt"
            onChange={(event) => onFieldChange("startsAt", event.target.value)}
            type="datetime-local"
            value={values.startsAt}
          />
        </Field>
        <Field
          label="Ends optional"
          error={formState.fieldErrors.endsAt}
          htmlFor={`${formId}-ends-at`}
        >
          <input
            aria-invalid={Boolean(formState.fieldErrors.endsAt)}
            className={inputClassName}
            disabled={disabled}
            id={`${formId}-ends-at`}
            name="endsAt"
            onChange={(event) => onFieldChange("endsAt", event.target.value)}
            type="datetime-local"
            value={values.endsAt}
          />
        </Field>
      </div>

      <Field label="Timezone" error={formState.fieldErrors.timezone} htmlFor={`${formId}-timezone`}>
        <input
          aria-invalid={Boolean(formState.fieldErrors.timezone)}
          className={inputClassName}
          disabled={disabled}
          id={`${formId}-timezone`}
          name="timezone"
          onChange={(event) => onFieldChange("timezone", event.target.value)}
          type="text"
          value={values.timezone}
        />
      </Field>

      <Field
        label="Venue name"
        error={formState.fieldErrors.venueName}
        htmlFor={`${formId}-venue-name`}
      >
        <input
          aria-invalid={Boolean(formState.fieldErrors.venueName)}
          className={inputClassName}
          disabled={disabled}
          id={`${formId}-venue-name`}
          name="venueName"
          onChange={(event) => onFieldChange("venueName", event.target.value)}
          type="text"
          value={values.venueName}
        />
      </Field>

      <Field
        label="Venue address"
        error={formState.fieldErrors.venueAddress}
        htmlFor={`${formId}-venue-address`}
      >
        <textarea
          aria-invalid={Boolean(formState.fieldErrors.venueAddress)}
          className={`${inputClassName} min-h-24 resize-y`}
          disabled={disabled}
          id={`${formId}-venue-address`}
          name="venueAddress"
          onChange={(event) => onFieldChange("venueAddress", event.target.value)}
          value={values.venueAddress}
        />
      </Field>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-contrast)] transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--surface)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled || (mode === "edit" && !dirty)}
          type="submit"
        >
          {isSaving ? "Saving..." : submitLabel}
        </button>
        {onCancel ? (
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] px-4 text-sm font-semibold transition hover:bg-[var(--surface-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={disabled || !dirty}
            onClick={onCancel}
            type="button"
          >
            Cancel changes
          </button>
        ) : null}
      </div>
    </form>
  );
}

export function createBlankEventFormValues(): EventBasicsFormValues {
  return {
    endsAt: "",
    eventType: "wedding",
    slug: "",
    startsAt: "",
    status: "draft",
    timezone: getBrowserTimezone(),
    title: "",
    venueAddress: "",
    venueName: "",
  };
}

export function createEventFormValuesFromEvent(event: Event): EventBasicsFormValues {
  return {
    endsAt: toDateTimeLocalValue(event.endsAt),
    eventType: event.eventType,
    slug: event.slug,
    startsAt: toDateTimeLocalValue(event.startsAt),
    status: event.status,
    timezone: event.timezone,
    title: event.title,
    venueAddress: event.venueAddress ?? "",
    venueName: event.venueName ?? "",
  };
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
  return parseEventCreateValues(readEventValuesFromFormData(formData));
}

export function parseEventCreateValues(values: EventBasicsFormValues):
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
    endsAt: toOptionalIsoDateTime(values.endsAt),
    eventType: values.eventType,
    publicSettings: {},
    rsvpSettings: {},
    slug: values.slug,
    startsAt: toIsoDateTime(values.startsAt),
    themeMode: "system",
    timezone: values.timezone || getBrowserTimezone(),
    title: values.title,
    venueAddress: toOptionalString(values.venueAddress),
    venueName: toOptionalString(values.venueName),
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

export function parseEventUpdateValues(values: EventBasicsFormValues):
  | {
      input: EventUpdateRequest;
      ok: true;
    }
  | {
      fieldErrors: FieldErrors;
      formError: string | null;
      ok: false;
    } {
  const input = {
    endsAt: toOptionalIsoDateTime(values.endsAt),
    eventType: values.eventType,
    slug: values.slug,
    startsAt: toIsoDateTime(values.startsAt),
    status: values.status,
    timezone: values.timezone,
    title: values.title,
    venueAddress: values.venueAddress,
    venueName: values.venueName,
  };

  const parsed = eventUpdateRequestSchema.safeParse(input);

  if (parsed.success) {
    return {
      input: parsed.data,
      ok: true,
    };
  }

  return {
    fieldErrors: issuesToFieldErrors(parsed.error.issues),
    formError: "Check the highlighted fields before saving the event.",
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

export function toEventFormError(error: unknown): EventFormState {
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

export function toFriendlyApiMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.apiError.error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to complete the dashboard request.";
}

export function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function getBrowserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function formatDateTime(value: string, timeZone?: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(date);
}

export function formatEventType(value: EventType) {
  return eventTypes.find((type) => type.value === value)?.label ?? "Event";
}

export function formatStatus(value: Event["status"]) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function statusClassName(value: Event["status"]) {
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

function FormMessage({
  formError,
  statusMessage,
}: {
  formError: string | null;
  statusMessage?: string | null;
}) {
  if (formError) {
    return (
      <p
        className="rounded-[var(--radius-md)] border border-[var(--error)] bg-[color-mix(in_srgb,var(--error)_10%,var(--surface))] px-3 py-2 text-sm text-[var(--error)]"
        role="alert"
      >
        {formError}
      </p>
    );
  }

  if (statusMessage) {
    return (
      <p
        className="rounded-[var(--radius-md)] border border-[var(--success)] bg-[color-mix(in_srgb,var(--success)_10%,var(--surface))] px-3 py-2 text-sm text-[var(--success)]"
        role="status"
      >
        {statusMessage}
      </p>
    );
  }

  return null;
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

function readEventValuesFromFormData(formData: FormData): EventBasicsFormValues {
  return {
    endsAt: readFormString(formData, "endsAt"),
    eventType: readFormString(formData, "eventType") as EventType,
    slug: readFormString(formData, "slug"),
    startsAt: readFormString(formData, "startsAt"),
    status: (readFormString(formData, "status") || "draft") as EventStatus,
    timezone: readFormString(formData, "timezone") || getBrowserTimezone(),
    title: readFormString(formData, "title"),
    venueAddress: readFormString(formData, "venueAddress"),
    venueName: readFormString(formData, "venueName"),
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

  if (field === "status") {
    return "Choose whether this event is draft, published, or archived.";
  }

  return message;
}

function isEventFormField(value: string): value is EventFormField {
  return [
    "endsAt",
    "eventType",
    "slug",
    "startsAt",
    "status",
    "timezone",
    "title",
    "venueAddress",
    "venueName",
  ].includes(value);
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

function toDateTimeLocalValue(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

const inputClassName =
  "min-h-11 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[color-mix(in_srgb,var(--foreground)_42%,transparent)] hover:border-[var(--accent)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60";
