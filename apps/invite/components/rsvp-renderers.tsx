import type { ThemeRsvpCopy, ThemeRsvpPresentation, ThemeRsvpRendererId } from "@lumiere/themes";
import type { RsvpResponseFields, RsvpStatus, RsvpSubmissionResponse } from "@lumiere/types";
import type { ComponentType, FormEventHandler } from "react";

import { invitePressFeedbackProps } from "./invite-motion-primitives";
import type { RsvpFormErrors, RsvpFormState, RsvpQuestion, RsvpRecoveryState } from "./rsvp-form";

type ReplyTone = "accepted" | "blocked" | "declined" | "draft" | "sent" | "updating";

type ReplyStatusCopy = {
  body: string;
  meta: string;
  title: string;
};

export type RsvpRendererContract = {
  actions: {
    addAttendee: () => void;
    removeAttendee: () => void;
    setAnswer: (questionKey: string, value: string | string[]) => void;
    setDetailsOpen: (isOpen: boolean) => void;
    setGuestName: (index: number, value: string) => void;
    setMessage: (value: string) => void;
    setResponseStatus: (status: RsvpStatus) => void;
    submit: FormEventHandler<HTMLFormElement>;
  };
  context: {
    eventSlug: string;
    guestGroup: {
      label: string;
      maxPax: number;
    };
  };
  copy: ThemeRsvpCopy;
  details: {
    isOpen: boolean;
    label: string;
  };
  enabledFields: RsvpResponseFields;
  errors: RsvpFormErrors;
  flags: {
    canRetry: boolean;
    hasDetails: boolean;
    isLocked: boolean;
    isResponding: boolean;
    isSubmitting: boolean;
    isUpdatingExistingReply: boolean;
  };
  formState: RsvpFormState;
  presentation: ThemeRsvpPresentation;
  questions: RsvpQuestion[];
  recoveryState: RsvpRecoveryState | null;
  reservedSeatsCopy: string;
  status: {
    copy: ReplyStatusCopy;
    tone: ReplyTone;
  };
  submittedResponse: RsvpSubmissionResponse["response"] | null;
};

const rsvpRenderers = {
  common: CommonRsvpRenderer,
  "editorial-ledger": EditorialLedgerRsvpRenderer,
} satisfies Record<ThemeRsvpRendererId, ComponentType<RsvpRendererContract>>;

export function resolveRsvpRenderer(
  rendererId: string | null | undefined,
): ComponentType<RsvpRendererContract> {
  return rendererId && rendererId in rsvpRenderers
    ? rsvpRenderers[rendererId as ThemeRsvpRendererId]
    : rsvpRenderers.common;
}

function CommonRsvpRenderer(contract: RsvpRendererContract) {
  return (
    <form
      className={contract.presentation.cardClassName}
      data-rsvp-renderer="common"
      data-rsvp-state={contract.status.tone}
      onSubmit={contract.actions.submit}
    >
      <RsvpHeader contract={contract} />
      <RsvpFeedback contract={contract} />
      <AttendanceControls contract={contract} />
      <DetailsControls contract={contract} />
      <SubmitAction contract={contract} />
      <ReplyStatusPanel copy={contract.status.copy} tone={contract.status.tone} />
    </form>
  );
}

function EditorialLedgerRsvpRenderer(contract: RsvpRendererContract) {
  return (
    <form
      className={contract.presentation.cardClassName}
      data-rsvp-has-details={String(contract.flags.hasDetails)}
      data-rsvp-layout="editorial-ledger"
      data-rsvp-renderer="editorial-ledger"
      data-rsvp-state={contract.status.tone}
      onSubmit={contract.actions.submit}
    >
      <header className="grid gap-5 border-b border-[var(--border)] px-5 py-6 sm:px-7 sm:py-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <RsvpHeader contract={contract} />
        <dl className="grid grid-cols-2 gap-5 border-t border-[var(--border)] pt-4 text-sm lg:border-t-0 lg:border-l lg:pl-6 lg:pt-0">
          <div>
            <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
              Party
            </dt>
            <dd className="mt-2 font-medium">{contract.context.guestGroup.label}</dd>
          </div>
          <div>
            <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
              Reserved
            </dt>
            <dd className="mt-2 font-medium">
              {contract.context.guestGroup.maxPax} {contract.copy.guestLabelPlural.toLowerCase()}
            </dd>
          </div>
        </dl>
      </header>

      {contract.submittedResponse ||
      contract.recoveryState ||
      contract.errors.form ||
      contract.flags.isUpdatingExistingReply ? (
        <div className="grid gap-4 px-5 pt-5 sm:px-7">
          <RsvpFeedback contract={contract} />
        </div>
      ) : null}

      <div
        className={
          contract.flags.hasDetails
            ? "grid border-y border-[var(--border)] lg:grid-cols-[0.78fr_1.22fr]"
            : "grid border-y border-[var(--border)]"
        }
      >
        <section
          aria-label="Attendance"
          className="grid content-start gap-6 bg-[color-mix(in_srgb,var(--surface-muted)_56%,transparent)] px-5 py-6 sm:px-7 lg:border-r lg:border-[var(--border)] lg:py-8"
        >
          <AttendanceControls contract={contract} />
        </section>
        {contract.flags.hasDetails ? (
          <section
            aria-label="Guest details"
            className="grid content-start px-5 py-6 sm:px-7 lg:py-8"
          >
            <DetailsControls contract={contract} expandedLabel />
          </section>
        ) : null}
      </div>

      <div className="grid gap-5 px-5 py-6 sm:px-7 lg:grid-cols-[0.72fr_1.28fr] lg:items-stretch">
        <SubmitAction contract={contract} />
        <ReplyStatusPanel copy={contract.status.copy} tone={contract.status.tone} />
      </div>
    </form>
  );
}

function RsvpHeader({ contract }: { contract: RsvpRendererContract }) {
  return (
    <div className="grid gap-2">
      <p className={contract.presentation.eyebrowClassName}>{contract.copy.eyebrow}</p>
      <h3 className={contract.presentation.titleClassName}>
        <span className="opacity-80">{contract.copy.greetingPrefix} </span>
        {contract.context.guestGroup.label}
      </h3>
      <p className="text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_68%,transparent)]">
        {contract.reservedSeatsCopy}
      </p>
    </div>
  );
}

function RsvpFeedback({ contract }: { contract: RsvpRendererContract }) {
  return (
    <>
      {contract.submittedResponse ? (
        <div
          className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[color-mix(in_srgb,var(--success)_42%,var(--border))] bg-[color-mix(in_srgb,var(--success)_12%,var(--surface))] p-5 text-center"
          role="status"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--success)]">
            {contract.copy.successTitle}
          </p>
          <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
            {contract.copy.successDescription}
          </p>
          <p className="mt-1 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
            {formatRsvpStatus(contract.submittedResponse.responseStatus)}
            {contract.submittedResponse.attendeeCount > 0
              ? `, ${contract.submittedResponse.attendeeCount} ${
                  contract.submittedResponse.attendeeCount === 1
                    ? contract.copy.guestLabelSingular.toLowerCase()
                    : contract.copy.guestLabelPlural.toLowerCase()
                }`
              : ""}
            .
          </p>
        </div>
      ) : null}

      {contract.recoveryState ? (
        <RecoveryNotice canRetry={contract.flags.canRetry} state={contract.recoveryState} />
      ) : null}

      {contract.errors.form ? (
        <p
          className="rounded-[var(--radius-md)] border border-[color-mix(in_srgb,var(--error)_44%,var(--border))] bg-[color-mix(in_srgb,var(--error)_10%,var(--surface))] px-4 py-3 text-sm leading-6 text-[var(--error)]"
          role="alert"
        >
          {contract.errors.form}
        </p>
      ) : null}

      {contract.flags.isUpdatingExistingReply ? (
        <p className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
          {contract.copy.updateNotice}
        </p>
      ) : null}
    </>
  );
}

function AttendanceControls({ contract }: { contract: RsvpRendererContract }) {
  const isDisabled = contract.flags.isLocked || contract.flags.isSubmitting;

  return (
    <>
      <fieldset className="grid gap-3" disabled={isDisabled}>
        <legend className={contract.presentation.fieldLabelClassName}>
          {contract.copy.attendancePrompt}
        </legend>
        <div className="grid grid-cols-2 rounded-full border border-[var(--border)] bg-[var(--surface)] p-1 shadow-inner focus-within:ring-2 focus-within:ring-[var(--focus)]">
          <RsvpStatusOption
            checked={contract.formState.responseStatus === "attending"}
            describedBy={contract.errors.responseStatus ? "responseStatus-error" : undefined}
            label={contract.copy.acceptLabel}
            name="responseStatus"
            onChange={() => contract.actions.setResponseStatus("attending")}
            value="attending"
          />
          <RsvpStatusOption
            checked={contract.formState.responseStatus === "not_attending"}
            describedBy={contract.errors.responseStatus ? "responseStatus-error" : undefined}
            label={contract.copy.declineLabel}
            name="responseStatus"
            onChange={() => contract.actions.setResponseStatus("not_attending")}
            value="not_attending"
          />
        </div>
        <FieldError id="responseStatus-error" message={contract.errors.responseStatus} />
      </fieldset>

      {contract.flags.isResponding ? (
        <div className="grid gap-2">
          <p className={contract.presentation.fieldLabelClassName}>{contract.copy.countPrompt}</p>
          <div
            aria-describedby={contract.errors.attendeeCount ? "attendeeCount-error" : undefined}
            aria-invalid={Boolean(contract.errors.attendeeCount)}
            className="grid grid-cols-[3.5rem_1fr_3.5rem] items-center rounded-full border border-[var(--border)] bg-[var(--surface)] p-1 shadow-sm"
          >
            <CounterButton
              disabled={isDisabled || contract.formState.attendeeCount <= 1}
              label="Remove one guest"
              onClick={contract.actions.removeAttendee}
            >
              -
            </CounterButton>
            <div className="grid place-items-center px-3 py-2 text-center">
              <span className={contract.presentation.counterValueClassName}>
                {contract.formState.attendeeCount}
              </span>
              <span className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[color-mix(in_srgb,var(--foreground)_54%,transparent)]">
                {contract.formState.attendeeCount === 1
                  ? contract.copy.guestLabelSingular
                  : contract.copy.guestLabelPlural}
              </span>
            </div>
            <CounterButton
              disabled={
                isDisabled || contract.formState.attendeeCount >= contract.context.guestGroup.maxPax
              }
              label="Add one guest"
              onClick={contract.actions.addAttendee}
            >
              +
            </CounterButton>
          </div>
          <FieldError id="attendeeCount-error" message={contract.errors.attendeeCount} />
        </div>
      ) : null}
    </>
  );
}

function DetailsControls({
  contract,
  expandedLabel = false,
}: {
  contract: RsvpRendererContract;
  expandedLabel?: boolean;
}) {
  if (!contract.flags.hasDetails) {
    return null;
  }

  return (
    <details
      className={
        expandedLabel
          ? "group border-y border-[var(--border)]"
          : "group rounded-[var(--radius-lg)] border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_82%,transparent)] px-4"
      }
      onToggle={(event) => contract.actions.setDetailsOpen(event.currentTarget.open)}
      open={contract.details.isOpen}
    >
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 rounded-md text-sm font-semibold text-(--accent-strong) focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]">
        <span>{contract.details.label}</span>
        <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.12em] text-[color-mix(in_srgb,var(--foreground)_54%,transparent)] hover:text-[color-mix(in_srgb,var(--foreground)_72%,transparent)] focus:text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
          {contract.details.isOpen
            ? contract.copy.detailsCloseLabel
            : contract.copy.detailsOpenLabel}
        </span>
      </summary>

      <div className="grid gap-5 border-t border-[var(--border)] pb-4 pt-4">
        {contract.flags.isResponding && contract.enabledFields.collectGuestNames ? (
          <div className="grid gap-3">
            <p className={contract.presentation.fieldLabelClassName}>
              {contract.copy.guestNamesLabel}
            </p>
            {contract.formState.guestNames.map((name, index) => (
              <label className="grid gap-2" htmlFor={`guestName-${index}`} key={index}>
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[color-mix(in_srgb,var(--foreground)_64%,transparent)]">
                  {contract.copy.guestNameLabel} {index + 1}
                </span>
                <input
                  aria-describedby={
                    contract.errors[`guestNames.${index}`] ? `guestName-${index}-error` : undefined
                  }
                  aria-invalid={Boolean(contract.errors[`guestNames.${index}`])}
                  className={contract.presentation.inputClassName}
                  disabled={contract.flags.isLocked || contract.flags.isSubmitting}
                  id={`guestName-${index}`}
                  onChange={(event) =>
                    contract.actions.setGuestName(index, event.currentTarget.value)
                  }
                  value={name}
                />
                <FieldError
                  id={`guestName-${index}-error`}
                  message={contract.errors[`guestNames.${index}`]}
                />
              </label>
            ))}
            <FieldError id="guestNames-error" message={contract.errors.guestNames} />
          </div>
        ) : null}

        {contract.questions.length > 0 ? (
          <div className="grid gap-4">
            <div>
              <p className={contract.presentation.fieldLabelClassName}>
                {contract.copy.questionGroupTitle}
              </p>
              <p className="mt-1 text-xs leading-5 text-[color-mix(in_srgb,var(--foreground)_64%,transparent)]">
                {contract.copy.questionGroupDescription}
              </p>
            </div>
            {contract.questions.map((question) => (
              <QuestionField
                error={contract.errors[`answers.${question.key}`]}
                isDisabled={contract.flags.isLocked || contract.flags.isSubmitting}
                inputClassName={contract.presentation.inputClassName}
                key={question.key}
                onChange={(value) => contract.actions.setAnswer(question.key, value)}
                question={question}
                value={
                  contract.formState.answers[question.key] ??
                  (question.type === "multi_choice" ? [] : "")
                }
              />
            ))}
          </div>
        ) : null}

        {contract.enabledFields.collectGuestMessage ? (
          <label className="grid gap-2" htmlFor="rsvp-message">
            <span className={contract.presentation.fieldLabelClassName}>
              {contract.copy.messageLabel}
            </span>
            <textarea
              aria-describedby={contract.errors.message ? "rsvp-message-error" : undefined}
              aria-invalid={Boolean(contract.errors.message)}
              className={`${contract.presentation.inputClassName} min-h-24 py-3 leading-6`}
              disabled={contract.flags.isLocked || contract.flags.isSubmitting}
              id="rsvp-message"
              onChange={(event) => contract.actions.setMessage(event.currentTarget.value)}
              placeholder={contract.copy.messagePlaceholder}
              value={contract.formState.message}
            />
            <FieldError id="rsvp-message-error" message={contract.errors.message} />
          </label>
        ) : null}
      </div>
    </details>
  );
}

function SubmitAction({ contract }: { contract: RsvpRendererContract }) {
  return (
    <button
      {...invitePressFeedbackProps}
      className={contract.presentation.submitClassName}
      disabled={contract.flags.isSubmitting || contract.flags.isLocked}
      type="submit"
    >
      {contract.flags.isSubmitting
        ? contract.flags.isUpdatingExistingReply
          ? contract.copy.updatingLabel
          : contract.copy.submittingLabel
        : contract.flags.isUpdatingExistingReply
          ? contract.copy.updateLabel
          : contract.copy.submitLabel}
    </button>
  );
}

function ReplyStatusPanel({ copy, tone }: { copy: ReplyStatusCopy; tone: ReplyTone }) {
  return (
    <section className={replyStatusClassName(tone)} aria-live="polite">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] opacity-70">{copy.meta}</p>
        <p className="mt-2 text-xl font-semibold">{copy.title}</p>
        <p className="mt-1 text-sm leading-6 opacity-75">{copy.body}</p>
      </div>
      <span
        aria-hidden="true"
        className="hidden h-px flex-1 bg-[color-mix(in_srgb,currentColor_28%,transparent)] sm:block"
      />
    </section>
  );
}

function RecoveryNotice({ canRetry, state }: { canRetry: boolean; state: RsvpRecoveryState }) {
  return (
    <section
      className="grid gap-2 rounded-[var(--radius-lg)] border border-[color-mix(in_srgb,var(--warning)_42%,var(--border))] bg-[color-mix(in_srgb,var(--warning)_10%,var(--surface))] px-4 py-3 text-[color-mix(in_srgb,var(--foreground)_84%,transparent)]"
      role="alert"
    >
      <p className="font-semibold">{state.title}</p>
      <p className="text-sm leading-6">{state.body}</p>
      {canRetry ? (
        <p className="text-xs leading-5 text-[color-mix(in_srgb,var(--foreground)_64%,transparent)]">
          Your answers are still here. Review the highlighted fields, then try again.
        </p>
      ) : null}
    </section>
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
      {...invitePressFeedbackProps}
      aria-label={label}
      className="grid size-12 place-items-center rounded-full text-2xl font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)] disabled:cursor-not-allowed disabled:opacity-35 cursor-pointer"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function RsvpStatusOption({
  checked,
  describedBy,
  label,
  name,
  onChange,
  value,
}: {
  checked: boolean;
  describedBy?: string;
  label: string;
  name: string;
  onChange: () => void;
  value: RsvpStatus;
}) {
  return (
    <label
      className={
        checked
          ? "grid min-h-11 cursor-pointer place-items-center rounded-full bg-[var(--accent)] px-4 py-3 text-center text-sm font-semibold text-[var(--accent-contrast)] shadow-sm transition"
          : "grid min-h-11 cursor-pointer place-items-center rounded-full px-4 py-3 text-center text-sm font-semibold text-[color-mix(in_srgb,var(--foreground)_72%,transparent)] transition hover:bg-[var(--surface-muted)]"
      }
    >
      <input
        aria-describedby={describedBy}
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
  isDisabled,
  inputClassName,
  onChange,
  question,
  value,
}: {
  error?: string;
  isDisabled: boolean;
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
          disabled={isDisabled}
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
          disabled={isDisabled}
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
      <fieldset aria-describedby={describedBy} className="grid gap-2">
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
                disabled={isDisabled}
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
        disabled={isDisabled}
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

function replyStatusClassName(tone: ReplyTone) {
  const base =
    "flex flex-col gap-3 rounded-[var(--radius-lg)] border px-4 py-4 text-[var(--foreground)] sm:flex-row sm:items-center";

  switch (tone) {
    case "accepted":
      return `${base} border-[color-mix(in_srgb,var(--success)_34%,var(--border))] bg-[color-mix(in_srgb,var(--success)_8%,var(--surface))]`;
    case "blocked":
      return `${base} border-[color-mix(in_srgb,var(--warning)_38%,var(--border))] bg-[color-mix(in_srgb,var(--warning)_10%,var(--surface))]`;
    case "declined":
      return `${base} border-[color-mix(in_srgb,var(--foreground)_22%,var(--border))] bg-[var(--surface-muted)]`;
    case "sent":
      return `${base} border-[color-mix(in_srgb,var(--success)_42%,var(--border))] bg-[color-mix(in_srgb,var(--success)_12%,var(--surface))]`;
    case "updating":
      return `${base} border-[color-mix(in_srgb,var(--accent)_34%,var(--border))] bg-[color-mix(in_srgb,var(--accent)_8%,var(--surface))]`;
    default:
      return `${base} border-[var(--border)] bg-[var(--surface-muted)]`;
  }
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
