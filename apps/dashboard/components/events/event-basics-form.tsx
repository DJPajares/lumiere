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
import type { FormEvent } from "react";

import type { DashboardApiClient } from "../../auth/dashboard-auth-provider";
import {
  DashboardButton,
  DashboardCombobox,
  DashboardNotice,
  DashboardSelect,
  DashboardTextArea,
  DashboardTextInput,
} from "../ui/dashboard-fields";
import {
  EventDateTimeRange,
  eventIsoToLocalDateTime,
  eventLocalDateTimeToIso,
} from "../ui/event-date-time-picker";

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

      <DashboardTextInput
        disabled={disabled}
        error={formState.fieldErrors.title}
        id={`${formId}-title`}
        label="Event title"
        name="title"
        onChange={(event) => onFieldChange("title", event.target.value)}
        required
        type="text"
        value={values.title}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <DashboardSelect
          disabled={disabled}
          error={formState.fieldErrors.eventType}
          id={`${formId}-event-type`}
          label="Event type"
          name="eventType"
          onValueChange={(value) => onFieldChange("eventType", value)}
          options={eventTypes}
          value={values.eventType}
        />

        {mode === "edit" ? (
          <DashboardSelect
            description={eventStatuses.find((status) => status.value === values.status)?.help}
            disabled={disabled}
            error={formState.fieldErrors.status}
            id={`${formId}-status`}
            label="Publish status"
            name="status"
            onValueChange={(value) => onFieldChange("status", value)}
            options={eventStatuses}
            value={values.status}
          />
        ) : null}
      </div>

      <DashboardTextInput
        description="Lowercase letters, numbers, and hyphens only."
        disabled={disabled}
        error={formState.fieldErrors.slug}
        id={`${formId}-slug`}
        label="URL slug"
        name="slug"
        onChange={(event) => onFieldChange("slug", toSlug(event.target.value))}
        required
        type="text"
        value={values.slug}
      />

      <EventDateTimeRange
        disabled={disabled}
        endError={formState.fieldErrors.endsAt}
        endId={`${formId}-ends-at`}
        endName="endsAt"
        endValue={values.endsAt}
        onEndValueChange={(value) => onFieldChange("endsAt", value)}
        onStartValueChange={(value) => onFieldChange("startsAt", value)}
        startError={formState.fieldErrors.startsAt}
        startId={`${formId}-starts-at`}
        startName="startsAt"
        startValue={values.startsAt}
        timezone={values.timezone || getBrowserTimezone()}
      />

      <DashboardCombobox
        description="Search IANA timezones by region or city."
        disabled={disabled}
        emptyMessage="No matching timezone. Search by a region such as Asia or Europe."
        error={formState.fieldErrors.timezone}
        id={`${formId}-timezone`}
        label="Timezone"
        name="timezone"
        onValueChange={(value) => onFieldChange("timezone", value)}
        options={getTimezoneOptions(values.timezone)}
        placeholder="Search timezones"
        required
        value={values.timezone}
      />

      <DashboardTextInput
        disabled={disabled}
        error={formState.fieldErrors.venueName}
        id={`${formId}-venue-name`}
        label="Venue name"
        name="venueName"
        onChange={(event) => onFieldChange("venueName", event.target.value)}
        type="text"
        value={values.venueName}
      />

      <DashboardTextArea
        disabled={disabled}
        error={formState.fieldErrors.venueAddress}
        id={`${formId}-venue-address`}
        label="Venue address"
        name="venueAddress"
        onChange={(event) => onFieldChange("venueAddress", event.target.value)}
        value={values.venueAddress}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <DashboardButton
          disabled={disabled || (mode === "edit" && !dirty)}
          variant="primary"
          type="submit"
        >
          {isSaving ? "Saving..." : submitLabel}
        </DashboardButton>
        {onCancel ? (
          <DashboardButton disabled={disabled || !dirty} onClick={onCancel}>
            Cancel changes
          </DashboardButton>
        ) : null}
      </div>
    </form>
  );
}

const fallbackTimezones = [
  "Africa/Johannesburg",
  "America/Chicago",
  "America/Los_Angeles",
  "America/New_York",
  "Asia/Dubai",
  "Asia/Hong_Kong",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Europe/London",
  "Europe/Paris",
  "Pacific/Auckland",
  "UTC",
];

function getTimezoneOptions(currentTimezone: string) {
  const supportedTimezones =
    typeof Intl.supportedValuesOf === "function"
      ? Intl.supportedValuesOf("timeZone")
      : fallbackTimezones;
  const timezones = new Set([...supportedTimezones, ...fallbackTimezones]);

  if (currentTimezone) {
    timezones.add(currentTimezone);
  }

  return [...timezones].sort().map((timezone) => ({
    label: timezone.replaceAll("_", " "),
    value: timezone,
  }));
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
    endsAt: eventIsoToLocalDateTime(event.endsAt, event.timezone),
    eventType: event.eventType,
    slug: event.slug,
    startsAt: eventIsoToLocalDateTime(event.startsAt, event.timezone),
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
  const normalizedDateTimes = normalizeEventDateTimes(values);

  const input = {
    endsAt: normalizedDateTimes.endsAt,
    eventType: values.eventType,
    publicSettings: {},
    rsvpSettings: {},
    slug: values.slug,
    startsAt: normalizedDateTimes.startsAt,
    themeMode: "system",
    timezone: values.timezone || getBrowserTimezone(),
    title: values.title,
    venueAddress: toOptionalString(values.venueAddress),
    venueName: toOptionalString(values.venueName),
  };

  const parsed = eventCreateRequestSchema.safeParse(input);

  if (parsed.success && Object.keys(normalizedDateTimes.fieldErrors).length === 0) {
    return {
      input: parsed.data,
      ok: true,
    };
  }

  return {
    fieldErrors: {
      ...(parsed.success ? {} : issuesToFieldErrors(parsed.error.issues)),
      ...normalizedDateTimes.fieldErrors,
    },
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
  const normalizedDateTimes = normalizeEventDateTimes(values);

  const input = {
    endsAt: normalizedDateTimes.endsAt ?? null,
    eventType: values.eventType,
    slug: values.slug,
    startsAt: normalizedDateTimes.startsAt,
    status: values.status,
    timezone: values.timezone,
    title: values.title,
    venueAddress: values.venueAddress,
    venueName: values.venueName,
  };

  const parsed = eventUpdateRequestSchema.safeParse(input);

  if (parsed.success && Object.keys(normalizedDateTimes.fieldErrors).length === 0) {
    return {
      input: parsed.data,
      ok: true,
    };
  }

  return {
    fieldErrors: {
      ...(parsed.success ? {} : issuesToFieldErrors(parsed.error.issues)),
      ...normalizedDateTimes.fieldErrors,
    },
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
  const canonicalValue =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value) && timeZone
      ? eventLocalDateTimeToIso(value, timeZone)
      : value;
  const date = new Date(canonicalValue ?? value);

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
    return <DashboardNotice tone="error">{formError}</DashboardNotice>;
  }

  if (statusMessage) {
    return <DashboardNotice tone="success">{statusMessage}</DashboardNotice>;
  }

  return null;
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

function toOptionalString(value: string) {
  return value || undefined;
}

function normalizeEventDateTimes(values: EventBasicsFormValues) {
  const timezone = values.timezone || getBrowserTimezone();
  const startsAt = eventLocalDateTimeToIso(values.startsAt, timezone);
  const endsAt = values.endsAt ? eventLocalDateTimeToIso(values.endsAt, timezone) : undefined;
  const fieldErrors: FieldErrors = {};

  if (!startsAt) {
    fieldErrors.startsAt = values.startsAt
      ? "Choose a valid start date and time in the event timezone."
      : "Choose the event start date and time.";
  }

  if (values.endsAt && !endsAt) {
    fieldErrors.endsAt = "Choose a valid end date and time in the event timezone.";
  }

  return {
    endsAt: values.endsAt ? (endsAt ?? values.endsAt) : undefined,
    fieldErrors,
    startsAt: startsAt ?? values.startsAt,
  };
}
