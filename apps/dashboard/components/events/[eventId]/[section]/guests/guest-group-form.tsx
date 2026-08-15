import { ApiClientError } from "@lumiere/api-client";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@lumiere/dashboard-ui/components/field";
import { Input } from "@lumiere/dashboard-ui/components/input";
import { Textarea } from "@lumiere/dashboard-ui/components/textarea";
import {
  guestInviteAccessExpiryConstraintSchema,
  guestGroupMutationRequestSchema,
  isInviteAccessExpired,
  type Event,
  type GuestGroup,
  type GuestGroupMemberMutationInput,
  type GuestGroupMutationRequest,
} from "@lumiere/types";

import { DashboardSelect } from "../../../../ui/dashboard-fields";
import {
  EventDateTimeField,
  eventLocalDateTimeToIso,
  isCompleteEventLocalDateTime,
} from "../../../../ui/event-date-time-picker";
import { toFriendlyApiMessage } from "./guest-errors";
import { guestStatuses } from "./guest-filters";
import { formatAccessExpiry, formatStatus } from "./guest-formatters";

export type FormValues = {
  accessExpiresAt: string;
  contactEmail: string;
  contactName: string;
  invitedBy: string;
  label: string;
  members: GuestGroupMemberMutationInput[];
  maxPax: string;
  notes: string;
  status: string;
};

export type TextFormField = Exclude<keyof FormValues, "members">;

export type FormErrors = Partial<Record<keyof FormValues | "_form", string>> & {
  memberNames?: Record<number, string>;
};

export const defaultFormValues: FormValues = {
  accessExpiresAt: "",
  contactEmail: "",
  contactName: "",
  invitedBy: "",
  label: "",
  members: createMemberFields([], 2),
  maxPax: "2",
  notes: "",
  status: "pending",
};

export function GuestGroupForm({
  editingGroup,
  errors,
  event,
  invitedByValues,
  onUpdate,
  onUpdateMember,
  values,
}: {
  editingGroup?: GuestGroup;
  errors: FormErrors;
  event: Event;
  invitedByValues: string[];
  onUpdate: (field: TextFormField, value: string) => void;
  onUpdateMember: (index: number, name: string) => void;
  values: FormValues;
}) {
  const previewAccessExpiry = values.accessExpiresAt
    ? eventLocalDateTimeToIso(values.accessExpiresAt, event.timezone)
    : null;

  return (
    <div className="grid gap-4">
      {errors._form ? (
        <p
          className="rounded-[var(--radius-md)] border border-[var(--error)] bg-[color-mix(in_srgb,var(--error)_10%,var(--surface))] px-4 py-3 text-sm text-[var(--error)]"
          role="alert"
        >
          {errors._form}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <TextField
          error={errors.label}
          label="Group label"
          onChange={(value) => onUpdate("label", value)}
          required
          value={values.label}
        />
        <TextField
          error={errors.maxPax}
          inputMode="numeric"
          label="Max pax"
          max="50"
          min="1"
          onChange={(value) => onUpdate("maxPax", value)}
          required
          type="number"
          value={values.maxPax}
        />
        <TextField
          error={errors.contactEmail}
          label="Contact email"
          onChange={(value) => onUpdate("contactEmail", value)}
          type="email"
          value={values.contactEmail}
        />
        <InvitedByField
          error={errors.invitedBy}
          onChange={(value) => onUpdate("invitedBy", value)}
          suggestions={invitedByValues}
          value={values.invitedBy}
        />
      </div>

      <FieldSet className="rounded-[var(--radius-md)] border border-border bg-muted/20 p-4">
        <FieldLegend variant="label">Named members</FieldLegend>
        <FieldDescription>
          One field is created for every seat in Max pax. Enter each guest&apos;s full name.
        </FieldDescription>
        <FieldGroup className="grid gap-3 sm:grid-cols-2">
          {values.members.map((member, index) => {
            const error = errors.memberNames?.[index];
            const memberId = `guest-member-${index}`;

            return (
              <Field data-invalid={Boolean(error)} key={member.id ?? memberId}>
                <FieldLabel htmlFor={memberId}>Member {index + 1}</FieldLabel>
                <Input
                  aria-describedby={error ? `${memberId}-error` : undefined}
                  aria-invalid={Boolean(error)}
                  id={memberId}
                  onChange={(event) => onUpdateMember(index, event.target.value)}
                  placeholder="Full name"
                  value={member.name}
                />
                {error ? <FieldError id={`${memberId}-error`}>{error}</FieldError> : null}
              </Field>
            );
          })}
        </FieldGroup>
        {errors.members ? <FieldError>{errors.members}</FieldError> : null}
      </FieldSet>

      {editingGroup ? (
        <DashboardSelect
          description="Pending asks the guest to respond again without deleting the previous RSVP record. Opened, Responded, and Declined require matching guest activity; Disabled blocks this invite link."
          error={errors.status}
          id="guest-invite-status"
          label="Invite status"
          onValueChange={(value) => onUpdate("status", value)}
          options={guestStatuses.map((status) => ({
            label: formatStatus(status),
            value: status,
          }))}
          value={values.status}
        />
      ) : null}

      <FieldSet className="rounded-[var(--radius-md)] border border-border bg-muted/20 p-4">
        <FieldLegend variant="label">Private link expiration</FieldLegend>
        <FieldDescription>
          Leave blank to inherit the event-wide deadline
          {event.accessExpiresAt
            ? ` (${formatAccessExpiry(event.accessExpiresAt, event.timezone)}).`
            : ". The event currently has no deadline."}
        </FieldDescription>
        <FieldGroup>
          <EventDateTimeField
            description="This guest link cannot remain active later than the event-wide deadline."
            disabled={false}
            error={errors.accessExpiresAt}
            id="guest-access-expiry"
            label="Guest link expires optional"
            onValueChange={(value) => onUpdate("accessExpiresAt", value)}
            timezone={event.timezone}
            value={values.accessExpiresAt}
          />
          {previewAccessExpiry && isInviteAccessExpired(previewAccessExpiry) ? (
            <p
              className="rounded-[var(--radius-md)] border border-destructive/35 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              Saving this time will expire this private link immediately. Use Disable instead when
              you want an immediate manual revocation with no scheduled deadline.
            </p>
          ) : null}
        </FieldGroup>
      </FieldSet>

      <Field data-invalid={Boolean(errors.notes)}>
        <FieldLabel htmlFor="guest-notes">Notes</FieldLabel>
        <Textarea
          aria-describedby={errors.notes ? "guest-notes-error" : undefined}
          aria-invalid={Boolean(errors.notes)}
          className="min-h-24"
          id="guest-notes"
          onChange={(event) => onUpdate("notes", event.target.value)}
          value={values.notes}
        />
        {errors.notes ? <FieldError id="guest-notes-error">{errors.notes}</FieldError> : null}
      </Field>
    </div>
  );
}

/**
 * Free text, not a fixed list: the person responsible for an invite is usually a
 * relative or friend rather than a Lumiere user. A native datalist offers the values
 * already used in this event while still accepting anything typed.
 */
function InvitedByField({
  error,
  onChange,
  suggestions,
  value,
}: {
  error?: string;
  onChange: (value: string) => void;
  suggestions: string[];
  value: string;
}) {
  const listId = "guest-invited-by-suggestions";

  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor="guest-invited-by">Invited by</FieldLabel>
      <Input
        aria-describedby={error ? "guest-invited-by-error" : undefined}
        aria-invalid={Boolean(error)}
        className="h-10"
        id="guest-invited-by"
        list={suggestions.length > 0 ? listId : undefined}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Who is responsible for this invite?"
        value={value}
      />
      {suggestions.length > 0 ? (
        <datalist id={listId}>
          {suggestions.map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
      ) : null}
      {error ? <FieldError id="guest-invited-by-error">{error}</FieldError> : null}
    </Field>
  );
}

function TextField({
  error,
  inputMode,
  label,
  max,
  min,
  onChange,
  required = false,
  type = "text",
  value,
}: {
  error?: string;
  inputMode?: "numeric";
  label: string;
  max?: string;
  min?: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: "email" | "number" | "text";
  value: string;
}) {
  const inputId = `guest-${toFieldId(label)}`;
  const errorId = `${inputId}-error`;

  return (
    <label className="grid gap-2 text-sm font-medium" htmlFor={inputId}>
      {label}
      <Input
        aria-label={label}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? true : undefined}
        className="h-10"
        id={inputId}
        inputMode={inputMode}
        max={max}
        min={min}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        type={type}
        value={value}
      />
      {error ? (
        <span className="text-sm text-[var(--error)]" id={errorId}>
          {error}
        </span>
      ) : null}
    </label>
  );
}

export function parseGuestGroupForm(
  values: FormValues,
  timezone: string,
  eventAccessExpiresAt: string | null,
):
  | {
      input: GuestGroupMutationRequest;
      ok: true;
    }
  | {
      errors: FormErrors;
      ok: false;
    } {
  const maxPax = Number(values.maxPax);
  const guestAccessExpiresAt = values.accessExpiresAt
    ? eventLocalDateTimeToIso(values.accessExpiresAt, timezone)
    : null;

  if (
    (values.accessExpiresAt && !isCompleteEventLocalDateTime(values.accessExpiresAt)) ||
    (values.accessExpiresAt && !guestAccessExpiresAt)
  ) {
    return {
      errors: {
        _form: "Check the private link expiration.",
        accessExpiresAt: "Choose both a valid date and time, or leave the deadline blank.",
      },
      ok: false,
    };
  }

  const expiryConstraint = guestInviteAccessExpiryConstraintSchema.safeParse({
    eventAccessExpiresAt,
    guestAccessExpiresAt,
  });

  if (!expiryConstraint.success) {
    return {
      errors: {
        _form: "Check the private link expiration.",
        accessExpiresAt: expiryConstraint.error.issues[0]?.message,
      },
      ok: false,
    };
  }

  const result = guestGroupMutationRequestSchema.safeParse({
    accessExpiresAt: guestAccessExpiresAt,
    contactEmail: emptyToUndefined(values.contactEmail),
    contactName: emptyToUndefined(values.contactName),
    invitedBy: emptyToUndefined(values.invitedBy),
    label: values.label,
    maxPax,
    members: values.members.filter((member) => member.name.trim().length > 0),
    notes: values.notes,
    status: values.status,
  });

  if (result.success) {
    return {
      input: result.data as GuestGroupMutationRequest,
      ok: true,
    };
  }

  const errors: FormErrors = {};

  for (const issue of result.error.issues) {
    const field = issue.path[0];

    if (field === "members") {
      const memberIndex = issue.path[1];

      if (typeof memberIndex === "number" && issue.path[2] === "name") {
        errors.memberNames = {
          ...errors.memberNames,
          [memberIndex]: issue.message,
        };
      } else {
        errors.members = issue.message;
      }
      continue;
    }

    if (typeof field === "string" && isFormField(field)) {
      errors[field] = issue.message;
    } else {
      errors._form = issue.message;
    }
  }

  return {
    errors,
    ok: false,
  };
}

export function toGuestGroupMutationRequest(
  group: GuestGroup,
  status: "disabled" | "pending",
): GuestGroupMutationRequest {
  return {
    accessExpiresAt: group.accessExpiresAt ?? null,
    contactEmail: group.contactEmail,
    contactName: group.contactName,
    invitedBy: group.invitedBy,
    label: group.label,
    maxPax: group.maxPax,
    members: group.members?.map(({ id, name }) => ({ id, name })),
    notes: group.notes,
    status,
  };
}

export function toFormErrors(error: unknown): FormErrors {
  if (error instanceof ApiClientError) {
    const errors: FormErrors = {
      _form: error.apiError.error.message,
    };

    for (const fieldError of error.apiError.error.fields ?? []) {
      const field = fieldError.path[0];

      if (typeof field === "string" && isFormField(field)) {
        errors[field] = fieldError.message;
      }
    }

    return errors;
  }

  return {
    _form: toFriendlyApiMessage(error),
  };
}

export function emptyToUndefined(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function createMemberFields(
  members: GuestGroupMemberMutationInput[],
  count: number,
): GuestGroupMemberMutationInput[] {
  return Array.from({ length: count }, (_, index) => members[index] ?? { name: "" });
}

function isFormField(value: string): value is keyof FormValues {
  return (
    value === "contactEmail" ||
    value === "contactName" ||
    value === "invitedBy" ||
    value === "label" ||
    value === "members" ||
    value === "maxPax" ||
    value === "notes" ||
    value === "status"
  );
}

function toFieldId(label: string) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
