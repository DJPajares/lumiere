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
  design?: RsvpDesign;
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

export type RsvpDesign = "default" | "kids" | "noel" | "premium";

export function RsvpForm({
  design = "default",
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
  const [detailsOpen, setDetailsOpen] = useState(() =>
    questions.some((question) => question.required),
  );
  const copy = getRsvpDesignCopy(design);
  const style = getRsvpDesignStyle(design);

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
      setDetailsOpen(true);
    }

    setIsSubmitting(false);
  };

  const isResponding = state.responseStatus !== "not_attending";
  const reservedSeatsCopy = `We've saved ${guestGroup.maxPax} ${
    guestGroup.maxPax === 1 ? "seat" : "seats"
  } for your party.`;

  return (
    <form className={style.card} data-rsvp-design={design} onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <p className={style.eyebrow}>{copy.eyebrow}</p>
        <h3 className={style.title}>
          <span className="opacity-80">Hi </span>
          {guestGroup.label}
        </h3>
        <p className="text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_68%,transparent)]">
          {reservedSeatsCopy}
        </p>
      </div>

      {submittedResponse ? (
        <div
          className="rounded-[var(--radius-lg)] border border-[color-mix(in_srgb,var(--success)_42%,var(--border))] bg-[color-mix(in_srgb,var(--success)_12%,var(--surface))] p-4 text-center"
          role="status"
        >
          <p className="font-semibold text-[var(--success)]">{copy.successTitle}</p>
          <p className="mt-1 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
            {formatRsvpStatus(submittedResponse.responseStatus)}
            {submittedResponse.attendeeCount > 0
              ? `, ${submittedResponse.attendeeCount} ${
                  submittedResponse.attendeeCount === 1 ? "guest" : "guests"
                }`
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
        <legend className={style.fieldLabel}>{copy.attendancePrompt}</legend>
        <div className="grid rounded-full border border-[var(--border)] bg-[var(--surface)] p-1 shadow-inner sm:grid-cols-2">
          <RsvpStatusOption
            checked={state.responseStatus === "attending"}
            label={copy.acceptLabel}
            name="responseStatus"
            onChange={() =>
              setState((current) => withResponseStatus(current, "attending", guestGroup.maxPax))
            }
            value="attending"
          />
          <RsvpStatusOption
            checked={state.responseStatus === "not_attending"}
            label={copy.declineLabel}
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
        <div className="grid gap-2">
          <p className={style.fieldLabel}>{copy.countPrompt}</p>
          <div
            aria-describedby={errors.attendeeCount ? "attendeeCount-error" : undefined}
            className="grid grid-cols-[3.5rem_1fr_3.5rem] items-center rounded-full border border-[var(--border)] bg-[var(--surface)] p-1 shadow-sm"
          >
            <CounterButton
              disabled={state.attendeeCount <= 1}
              label="Remove one guest"
              onClick={() =>
                setState((current) =>
                  withAttendeeCount(current, Math.max(1, current.attendeeCount - 1)),
                )
              }
            >
              -
            </CounterButton>
            <div className="grid place-items-center px-3 py-2 text-center">
              <span className={style.counterValue}>{state.attendeeCount}</span>
              <span className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[color-mix(in_srgb,var(--foreground)_54%,transparent)]">
                {state.attendeeCount === 1 ? "Guest" : "Guests"}
              </span>
            </div>
            <CounterButton
              disabled={state.attendeeCount >= guestGroup.maxPax}
              label="Add one guest"
              onClick={() =>
                setState((current) =>
                  withAttendeeCount(
                    current,
                    Math.min(guestGroup.maxPax, current.attendeeCount + 1),
                  ),
                )
              }
            >
              +
            </CounterButton>
          </div>
          <FieldError id="attendeeCount-error" message={errors.attendeeCount} />
        </div>
      ) : (
        <p className="rounded-[var(--radius-lg)] bg-[var(--surface-muted)] px-4 py-3 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
          {copy.declineNote}
        </p>
      )}

      <details
        className="group rounded-[var(--radius-lg)] border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_82%,transparent)] p-4"
        onToggle={(event) => setDetailsOpen(event.currentTarget.open)}
        open={detailsOpen}
      >
        <summary className="cursor-pointer list-none text-sm font-semibold text-[var(--accent-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)]">
          {copy.detailsLabel}
          <span className="float-right text-[color-mix(in_srgb,var(--foreground)_54%,transparent)]">
            {detailsOpen ? "Close" : "Open"}
          </span>
        </summary>

        <div className="mt-4 grid gap-5">
          {isResponding ? (
            <div className="grid gap-3">
              <p className={style.fieldLabel}>Names for the guest list</p>
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
                    className={style.input}
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
          ) : null}

          {questions.length > 0 ? (
            <div className="grid gap-4">
              <div>
                <p className={style.fieldLabel}>A note for the host</p>
                <p className="mt-1 text-xs leading-5 text-[color-mix(in_srgb,var(--foreground)_64%,transparent)]">
                  Required questions apply when your group is attending.
                </p>
              </div>
              {questions.map((question) => (
                <QuestionField
                  error={errors[`answers.${question.key}`]}
                  inputClassName={style.input}
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
                  value={
                    state.answers[question.key] ?? (question.type === "multi_choice" ? [] : "")
                  }
                />
              ))}
            </div>
          ) : null}

          <label className="grid gap-2" htmlFor="rsvp-message">
            <span className={style.fieldLabel}>{copy.messageLabel}</span>
            <textarea
              className={`${style.input} min-h-24 py-3 leading-6`}
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
        </div>
      </details>

      <button className={style.submit} disabled={isSubmitting} type="submit">
        {isSubmitting ? copy.submittingLabel : submitLabel}
      </button>
    </form>
  );
}

function CounterButton({
  children,
  disabled,
  label,
  onClick,
}: {
  children: string;
  disabled: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className="grid size-12 place-items-center rounded-full text-2xl font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)] disabled:cursor-not-allowed disabled:opacity-35"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function getRsvpDesignCopy(design: RsvpDesign) {
  switch (design) {
    case "kids":
      return {
        acceptLabel: "We're coming",
        attendancePrompt: "Can you join the party?",
        countPrompt: "How many party guests?",
        declineLabel: "Can't come",
        declineNote: "We will let the host know your family cannot make it.",
        detailsLabel: "Add names or a note",
        eyebrow: "Your party reply",
        messageLabel: "Anything the host should know?",
        submittingLabel: "Sending reply...",
        successTitle: "Reply sent",
      };
    case "noel":
      return {
        acceptLabel: "We'll be there",
        attendancePrompt: "Will you gather with us?",
        countPrompt: "Who's joining?",
        declineLabel: "Warm regrets",
        declineNote: "We will send your warm regrets to the host.",
        detailsLabel: "Add names or a note",
        eyebrow: "Your holiday reply",
        messageLabel: "A note for the host",
        submittingLabel: "Sending reply...",
        successTitle: "Reply received",
      };
    case "premium":
      return {
        acceptLabel: "I'll be there",
        attendancePrompt: "Will you celebrate with us?",
        countPrompt: "Who's joining you?",
        declineLabel: "Can't make it",
        declineNote: "We will let the host know you cannot attend.",
        detailsLabel: "Add names or a note",
        eyebrow: "Your reply",
        messageLabel: "Message for the host",
        submittingLabel: "Sending reply...",
        successTitle: "Reply received",
      };
    default:
      return {
        acceptLabel: "I'll be there",
        attendancePrompt: "Will you join us?",
        countPrompt: "Who's coming?",
        declineLabel: "Can't make it",
        declineNote: "We will let the host know your group cannot attend.",
        detailsLabel: "Add names or a note",
        eyebrow: "Your reply",
        messageLabel: "Message for the host",
        submittingLabel: "Sending RSVP...",
        successTitle: "RSVP received",
      };
  }
}

function getRsvpDesignStyle(design: RsvpDesign) {
  const base = {
    card: "grid gap-5 rounded-[calc(var(--radius-lg)*1.6)] border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] p-6 shadow-[0_28px_90px_color-mix(in_srgb,var(--accent)_16%,transparent)] backdrop-blur sm:p-7",
    counterValue: "text-2xl font-semibold leading-none",
    eyebrow: "text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent-strong)]",
    fieldLabel:
      "text-xs font-semibold uppercase tracking-[0.18em] text-[color-mix(in_srgb,var(--foreground)_58%,transparent)]",
    input:
      "min-h-11 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)]",
    submit:
      "min-h-12 rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-white shadow-[0_16px_44px_color-mix(in_srgb,var(--accent)_28%,transparent)] transition hover:bg-[var(--accent-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)] focus:ring-offset-2 focus:ring-offset-[var(--surface)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60",
    title: "text-3xl font-light tracking-tight",
  };

  if (design === "premium") {
    return {
      ...base,
      card: `${base.card} lg:-mt-8`,
      title:
        "font-serif text-3xl font-light tracking-[-0.01em] text-[var(--foreground)] sm:text-4xl",
    };
  }

  if (design === "kids") {
    return {
      ...base,
      card: "grid gap-5 rounded-[calc(var(--radius-lg)*1.4)] border-2 border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_20px_70px_color-mix(in_srgb,var(--accent)_18%,transparent)] sm:p-6",
      submit: `${base.submit} rounded-[var(--radius-lg)]`,
      title: "text-3xl font-semibold tracking-tight",
    };
  }

  if (design === "noel") {
    return {
      ...base,
      card: "grid gap-5 rounded-[calc(var(--radius-lg)*1.3)] border border-[var(--border)] bg-[linear-gradient(160deg,color-mix(in_srgb,var(--surface)_96%,transparent),color-mix(in_srgb,var(--surface-muted)_74%,var(--surface)))] p-6 shadow-[0_28px_90px_color-mix(in_srgb,var(--accent)_16%,transparent)] sm:p-7",
      title: "font-serif text-3xl font-light tracking-tight sm:text-4xl",
    };
  }

  return base;
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
    <label
      className={
        checked
          ? "grid min-h-11 cursor-pointer place-items-center rounded-full bg-[var(--accent)] px-4 py-3 text-center text-sm font-semibold text-white shadow-sm transition"
          : "grid min-h-11 cursor-pointer place-items-center rounded-full px-4 py-3 text-center text-sm font-semibold text-[color-mix(in_srgb,var(--foreground)_72%,transparent)] transition hover:bg-[var(--surface-muted)]"
      }
    >
      <input
        checked={checked}
        className="sr-only"
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
  inputClassName,
  onChange,
  question,
  value,
}: {
  error?: string;
  inputClassName: string;
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
          className={`${inputClassName} min-h-24 py-3 leading-6`}
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
          className={inputClassName}
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
        className={inputClassName}
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
    ? state.guestNames
        .slice(0, attendeeCount)
        .map((name) => name.trim())
        .filter(Boolean)
    : [];

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

function withAttendeeCount(state: RsvpFormState, attendeeCount: number): RsvpFormState {
  return {
    ...state,
    attendeeCount,
    guestNames: resizeGuestNames(state.guestNames, attendeeCount),
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
