"use client";

import { ApiClientError } from "@lumiere/api-client";
import type { RsvpStatus, RsvpSubmissionRequest, RsvpSubmissionResponse } from "@lumiere/types";
import type { FormEvent } from "react";
import { useState } from "react";

import { createInviteApiClient } from "../lib/invite-api";

export type RsvpQuestionType = "multi_choice" | "single_choice" | "text" | "textarea";

export type RsvpQuestion = {
  key: string;
  label: string;
  options: string[];
  required: boolean;
  type: RsvpQuestionType;
};

export type RsvpFormState = {
  answers: Record<string, string | string[]>;
  attendeeCount: number;
  guestNames: string[];
  message: string;
  responseStatus: RsvpStatus | "";
};

export type RsvpFormErrors = Record<string, string>;

export type SubmitRsvp = (
  eventSlug: string,
  guestToken: string,
  input: RsvpSubmissionRequest,
) => Promise<RsvpSubmissionResponse>;

export type RsvpFormSubmitResult =
  | {
      errors: RsvpFormErrors;
      ok: false;
    }
  | {
      response: RsvpSubmissionResponse["response"];
      ok: true;
    };

type RsvpFormProps = {
  eventSlug: string;
  guestGroup: {
    label: string;
    maxPax: number;
  };
  guestToken: string;
  initialResponseStatus: RsvpStatus | null;
  questions: RsvpQuestion[];
  submitLabel: string;
};

export function RsvpForm({
  eventSlug,
  guestGroup,
  guestToken,
  initialResponseStatus,
  questions,
  submitLabel,
}: RsvpFormProps) {
  const [state, setState] = useState(() =>
    createInitialRsvpFormState(guestGroup.maxPax, initialResponseStatus),
  );
  const [errors, setErrors] = useState<RsvpFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedResponse, setSubmittedResponse] = useState<
    RsvpSubmissionResponse["response"] | null
  >(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmittedResponse(null);

    const result = await submitRsvpFormState({
      eventSlug,
      guestToken,
      maxPax: guestGroup.maxPax,
      questions,
      state,
      submit: (...args) => createInviteApiClient().submitRsvp(...args),
    });

    if (result.ok) {
      setErrors({});
      setSubmittedResponse(result.response);
    } else {
      setErrors(result.errors);
    }

    setIsSubmitting(false);
  };

  const isResponding = state.responseStatus !== "not_attending";
  const attendeeOptions = Array.from({ length: guestGroup.maxPax }, (_, index) => index + 1);

  return (
    <form
      className="grid gap-5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_18px_60px_color-mix(in_srgb,var(--accent)_10%,transparent)] sm:p-5"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent-strong)]">
          Your response
        </p>
        <h3 className="text-2xl font-semibold tracking-tight">{guestGroup.label}</h3>
        <p className="text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
          This invite covers up to {guestGroup.maxPax} pax. Your details stay attached to this
          private link.
        </p>
      </div>

      {submittedResponse ? (
        <div
          className="rounded-[var(--radius-md)] border border-[color-mix(in_srgb,var(--success)_42%,var(--border))] bg-[color-mix(in_srgb,var(--success)_12%,var(--surface))] p-4"
          role="status"
        >
          <p className="font-semibold text-[var(--success)]">RSVP received</p>
          <p className="mt-1 text-sm leading-6">
            We recorded this response as {formatRsvpStatus(submittedResponse.responseStatus)}
            {submittedResponse.attendeeCount > 0
              ? ` for ${submittedResponse.attendeeCount} pax`
              : ""}
            .
          </p>
        </div>
      ) : null}

      {errors.form ? (
        <p
          className="rounded-[var(--radius-md)] border border-[color-mix(in_srgb,var(--error)_44%,var(--border))] bg-[color-mix(in_srgb,var(--error)_10%,var(--surface))] px-4 py-3 text-sm leading-6 text-[var(--error)]"
          role="alert"
        >
          {errors.form}
        </p>
      ) : null}

      <fieldset className="grid gap-3">
        <legend className="text-sm font-semibold">Will you attend?</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <RsvpStatusOption
            checked={state.responseStatus === "attending"}
            label="Attending"
            name="responseStatus"
            onChange={() =>
              setState((current) => withResponseStatus(current, "attending", guestGroup.maxPax))
            }
            value="attending"
          />
          <RsvpStatusOption
            checked={state.responseStatus === "not_attending"}
            label="Not attending"
            name="responseStatus"
            onChange={() =>
              setState((current) => withResponseStatus(current, "not_attending", guestGroup.maxPax))
            }
            value="not_attending"
          />
        </div>
        <FieldError id="responseStatus-error" message={errors.responseStatus} />
      </fieldset>

      {isResponding ? (
        <div className="grid gap-5">
          <label className="grid gap-2" htmlFor="attendeeCount">
            <span className="text-sm font-semibold">Attendee count</span>
            <select
              aria-describedby={errors.attendeeCount ? "attendeeCount-error" : undefined}
              aria-invalid={Boolean(errors.attendeeCount)}
              className="min-h-11 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)]"
              id="attendeeCount"
              onChange={(event) => {
                const attendeeCount = Number(event.currentTarget.value);
                setState((current) => ({
                  ...current,
                  attendeeCount,
                  guestNames: resizeGuestNames(current.guestNames, attendeeCount),
                }));
              }}
              value={state.attendeeCount}
            >
              {attendeeOptions.map((count) => (
                <option key={count} value={count}>
                  {count} pax
                </option>
              ))}
            </select>
          </label>
          <FieldError id="attendeeCount-error" message={errors.attendeeCount} />

          <div className="grid gap-3">
            <p className="text-sm font-semibold">Guest names</p>
            {state.guestNames.map((name, index) => (
              <label className="grid gap-2" htmlFor={`guestName-${index}`} key={index}>
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[color-mix(in_srgb,var(--foreground)_64%,transparent)]">
                  Guest {index + 1}
                </span>
                <input
                  aria-describedby={
                    errors[`guestNames.${index}`] ? `guestName-${index}-error` : undefined
                  }
                  aria-invalid={Boolean(errors[`guestNames.${index}`])}
                  className="min-h-11 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)]"
                  id={`guestName-${index}`}
                  onChange={(event) => {
                    const value = event.currentTarget.value;
                    setState((current) => ({
                      ...current,
                      guestNames: current.guestNames.map((item, itemIndex) =>
                        itemIndex === index ? value : item,
                      ),
                    }));
                  }}
                  value={name}
                />
                <FieldError
                  id={`guestName-${index}-error`}
                  message={errors[`guestNames.${index}`]}
                />
              </label>
            ))}
          </div>
        </div>
      ) : (
        <p className="rounded-[var(--radius-md)] bg-[var(--surface-muted)] px-4 py-3 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
          We will let the host know your group cannot attend.
        </p>
      )}

      {questions.length > 0 ? (
        <div className="grid gap-4">
          <div>
            <p className="text-sm font-semibold">A few details for the host</p>
            <p className="mt-1 text-xs leading-5 text-[color-mix(in_srgb,var(--foreground)_64%,transparent)]">
              Required questions apply when your group is attending.
            </p>
          </div>
          {questions.map((question) => (
            <QuestionField
              error={errors[`answers.${question.key}`]}
              key={question.key}
              onChange={(value) =>
                setState((current) => ({
                  ...current,
                  answers: {
                    ...current.answers,
                    [question.key]: value,
                  },
                }))
              }
              question={question}
              value={state.answers[question.key] ?? (question.type === "multi_choice" ? [] : "")}
            />
          ))}
        </div>
      ) : null}

      <label className="grid gap-2" htmlFor="rsvp-message">
        <span className="text-sm font-semibold">Message for the host</span>
        <textarea
          className="min-h-28 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm leading-6 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)]"
          id="rsvp-message"
          onChange={(event) =>
            setState((current) => ({
              ...current,
              message: event.currentTarget.value,
            }))
          }
          placeholder="Optional"
          value={state.message}
        />
      </label>

      <button
        className="min-h-11 rounded-[var(--radius-md)] bg-[var(--accent)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)] focus:ring-offset-2 focus:ring-offset-[var(--surface)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Sending RSVP..." : submitLabel}
      </button>
    </form>
  );
}

function RsvpStatusOption({
  checked,
  label,
  name,
  onChange,
  value,
}: {
  checked: boolean;
  label: string;
  name: string;
  onChange: () => void;
  value: RsvpStatus;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm font-semibold transition hover:bg-[color-mix(in_srgb,var(--surface-muted)_70%,var(--surface))]">
      <input
        checked={checked}
        className="size-4 accent-[var(--accent)]"
        name={name}
        onChange={onChange}
        type="radio"
        value={value}
      />
      {label}
    </label>
  );
}

function QuestionField({
  error,
  onChange,
  question,
  value,
}: {
  error?: string;
  onChange: (value: string | string[]) => void;
  question: RsvpQuestion;
  value: string | string[];
}) {
  const inputId = `answer-${question.key}`;
  const describedBy = error ? `${inputId}-error` : undefined;

  if (question.type === "textarea") {
    return (
      <label className="grid gap-2" htmlFor={inputId}>
        <QuestionLabel question={question} />
        <textarea
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          className="min-h-24 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm leading-6 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)]"
          id={inputId}
          onChange={(event) => onChange(event.currentTarget.value)}
          value={typeof value === "string" ? value : ""}
        />
        <FieldError id={`${inputId}-error`} message={error} />
      </label>
    );
  }

  if (question.type === "single_choice" && question.options.length > 0) {
    return (
      <label className="grid gap-2" htmlFor={inputId}>
        <QuestionLabel question={question} />
        <select
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          className="min-h-11 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)]"
          id={inputId}
          onChange={(event) => onChange(event.currentTarget.value)}
          value={typeof value === "string" ? value : ""}
        >
          <option value="">Choose one</option>
          {question.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <FieldError id={`${inputId}-error`} message={error} />
      </label>
    );
  }

  if (question.type === "multi_choice" && question.options.length > 0) {
    const values = Array.isArray(value) ? value : [];

    return (
      <fieldset className="grid gap-2">
        <legend>
          <QuestionLabel question={question} />
        </legend>
        <div className="grid gap-2">
          {question.options.map((option) => (
            <label
              className="flex min-h-10 items-center gap-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
              key={option}
            >
              <input
                checked={values.includes(option)}
                className="size-4 accent-[var(--accent)]"
                onChange={(event) => {
                  onChange(
                    event.currentTarget.checked
                      ? [...values, option]
                      : values.filter((item) => item !== option),
                  );
                }}
                type="checkbox"
                value={option}
              />
              {option}
            </label>
          ))}
        </div>
        <FieldError id={`${inputId}-error`} message={error} />
      </fieldset>
    );
  }

  return (
    <label className="grid gap-2" htmlFor={inputId}>
      <QuestionLabel question={question} />
      <input
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        className="min-h-11 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)]"
        id={inputId}
        onChange={(event) => onChange(event.currentTarget.value)}
        value={typeof value === "string" ? value : ""}
      />
      <FieldError id={`${inputId}-error`} message={error} />
    </label>
  );
}

function QuestionLabel({ question }: { question: RsvpQuestion }) {
  return (
    <span className="text-sm font-semibold">
      {question.label}
      {question.required ? (
        <span className="ml-1 text-[var(--accent-strong)]" aria-label="required">
          *
        </span>
      ) : null}
    </span>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p className="text-sm leading-6 text-[var(--error)]" id={id}>
      {message}
    </p>
  ) : null;
}

export function createInitialRsvpFormState(
  maxPax: number,
  responseStatus: RsvpStatus | null,
): RsvpFormState {
  if (responseStatus === "not_attending") {
    return {
      answers: {},
      attendeeCount: 0,
      guestNames: [],
      message: "",
      responseStatus,
    };
  }

  return {
    answers: {},
    attendeeCount: 1,
    guestNames: [""],
    message: "",
    responseStatus:
      responseStatus === "attending" || responseStatus === "maybe" ? responseStatus : "",
  };
}

export function validateRsvpFormState({
  maxPax,
  questions,
  state,
}: {
  maxPax: number;
  questions: RsvpQuestion[];
  state: RsvpFormState;
}):
  | {
      errors: RsvpFormErrors;
      ok: false;
    }
  | {
      input: RsvpSubmissionRequest;
      ok: true;
    } {
  const errors: RsvpFormErrors = {};

  if (!state.responseStatus) {
    errors.responseStatus = "Choose whether your group can attend.";
  }

  const isAttending = state.responseStatus === "attending" || state.responseStatus === "maybe";
  const attendeeCount = isAttending ? state.attendeeCount : 0;

  if (isAttending && attendeeCount < 1) {
    errors.attendeeCount = "Choose at least one attendee.";
  }

  if (attendeeCount > maxPax) {
    errors.attendeeCount = `This invite allows up to ${maxPax} pax.`;
  }

  const guestNames = isAttending
    ? state.guestNames.slice(0, attendeeCount).map((name) => name.trim())
    : [];

  if (isAttending) {
    for (let index = 0; index < attendeeCount; index += 1) {
      if (!guestNames[index]) {
        errors[`guestNames.${index}`] = "Add this guest name.";
      }
    }
  }

  const answers = questions.flatMap((question) => {
    const value = state.answers[question.key];
    const normalized = normalizeAnswerValue(value);

    if (isAttending && question.required && isEmptyAnswer(normalized)) {
      errors[`answers.${question.key}`] = "This question is required.";
    }

    return isEmptyAnswer(normalized)
      ? []
      : [
          {
            questionKey: question.key,
            value: normalized,
          },
        ];
  });

  if (Object.keys(errors).length > 0 || !state.responseStatus) {
    return {
      errors,
      ok: false,
    };
  }

  return {
    input: {
      answers,
      attendeeCount,
      guestNames,
      message: state.message.trim() || undefined,
      responseStatus: state.responseStatus,
    },
    ok: true,
  };
}

export async function submitRsvpFormState({
  eventSlug,
  guestToken,
  maxPax,
  questions,
  state,
  submit,
}: {
  eventSlug: string;
  guestToken: string;
  maxPax: number;
  questions: RsvpQuestion[];
  state: RsvpFormState;
  submit: SubmitRsvp;
}): Promise<RsvpFormSubmitResult> {
  const validation = validateRsvpFormState({ maxPax, questions, state });

  if (!validation.ok) {
    return validation;
  }

  try {
    const result = await submit(eventSlug, guestToken, validation.input);

    return {
      ok: true,
      response: result.response,
    };
  } catch (error) {
    return {
      errors: {
        ...readApiFieldErrors(error),
        form: readSubmitErrorMessage(error),
      },
      ok: false,
    };
  }
}

function withResponseStatus(
  state: RsvpFormState,
  responseStatus: RsvpStatus,
  maxPax: number,
): RsvpFormState {
  if (responseStatus === "not_attending") {
    return {
      ...state,
      attendeeCount: 0,
      guestNames: [],
      responseStatus,
    };
  }

  const attendeeCount = state.attendeeCount > 0 ? Math.min(state.attendeeCount, maxPax) : 1;

  return {
    ...state,
    attendeeCount,
    guestNames: resizeGuestNames(state.guestNames, attendeeCount),
    responseStatus,
  };
}

function resizeGuestNames(guestNames: string[], attendeeCount: number) {
  return Array.from({ length: attendeeCount }, (_, index) => guestNames[index] ?? "");
}

function normalizeAnswerValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).filter(Boolean);
  }

  return typeof value === "string" ? value.trim() : "";
}

function isEmptyAnswer(value: string | string[]) {
  return Array.isArray(value) ? value.length === 0 : value.length === 0;
}

function readSubmitErrorMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    switch (error.apiError.error.code) {
      case "FORBIDDEN":
        return error.message || "This RSVP is not available anymore.";
      case "VALIDATION_ERROR":
        return "Please check the RSVP details and try again.";
      case "NOT_FOUND":
        return "This guest invite could not be found. Ask the host for a fresh link.";
      default:
        return error.message || "We could not send your RSVP. Please try again.";
    }
  }

  return "We could not send your RSVP. Please try again.";
}

function readApiFieldErrors(error: unknown) {
  if (!(error instanceof ApiClientError)) {
    return {};
  }

  return Object.fromEntries(
    (error.apiError.error.fields ?? []).flatMap((field) => {
      const key = field.path.join(".");

      return key ? [[key, field.message]] : [];
    }),
  );
}

function formatRsvpStatus(status: RsvpStatus) {
  switch (status) {
    case "attending":
      return "attending";
    case "maybe":
      return "maybe";
    case "not_attending":
      return "not attending";
  }
}
