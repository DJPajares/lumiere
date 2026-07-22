"use client";

import { ApiClientError } from "@lumiere/api-client";
import {
  defaultRsvpCopy,
  defaultRsvpPresentation,
  type ThemeRsvpCopy,
  type ThemeRsvpPresentation,
} from "@lumiere/themes";
import {
  defaultRsvpResponseFields,
  type RsvpResponseFields,
  type RsvpStatus,
  type RsvpSubmissionRequest,
  type RsvpSubmissionResponse,
} from "@lumiere/types";
import type { FormEvent } from "react";
import { useState } from "react";

import { resolveRsvpRenderer, type RsvpRendererContract } from "./rsvp-renderers";
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
  staleGuestNames?: string[];
};

export type RsvpFormErrors = Record<string, string>;
export type RsvpRecoveryKind = "closed" | "disabled" | "expired" | "rate_limited" | "unavailable";

export type RsvpRecoveryState = {
  body: string;
  kind: RsvpRecoveryKind;
  title: string;
};

type ReplyTone = "accepted" | "blocked" | "declined" | "draft" | "sent" | "updating";

export type SubmitRsvp = (
  eventSlug: string,
  guestToken: string,
  input: RsvpSubmissionRequest,
) => Promise<RsvpSubmissionResponse>;

export type RsvpFormSubmitResult =
  | {
      errors: RsvpFormErrors;
      ok: false;
      recoveryState?: RsvpRecoveryState;
    }
  | {
      response: RsvpSubmissionResponse["response"];
      ok: true;
    };

export type RsvpFormProps = {
  copy?: ThemeRsvpCopy;
  eventSlug: string;
  guestGroup: {
    label: string;
    members?: Array<{
      name: string;
      sortOrder: number;
    }>;
    maxPax: number;
  };
  guestToken: string;
  initialResponse?: {
    attendeeCount: number;
    guestNames: string[];
    responseStatus: RsvpStatus;
  } | null;
  initialResponseStatus: RsvpStatus | null;
  presentation?: ThemeRsvpPresentation;
  questions: RsvpQuestion[];
  rsvpFields?: RsvpResponseFields;
};

export function RsvpForm(props: RsvpFormProps) {
  const contract = useRsvpFormController(props);
  const Renderer = resolveRsvpRenderer(contract.presentation.rendererId);

  return <Renderer {...contract} />;
}

export function useRsvpFormController({
  copy = defaultRsvpCopy,
  eventSlug,
  guestGroup,
  guestToken,
  initialResponse,
  initialResponseStatus,
  presentation = defaultRsvpPresentation,
  questions,
  rsvpFields = defaultRsvpResponseFields,
}: RsvpFormProps): RsvpRendererContract {
  const members = guestGroup.members ?? [];
  const hasStructuredMembers = rsvpFields.collectGuestNames && members.length > 0;
  const savedResponseStatus = initialResponse?.responseStatus ?? initialResponseStatus;
  const [state, setState] = useState(() =>
    createInitialRsvpFormState(guestGroup.maxPax, savedResponseStatus, rsvpFields, {
      initialResponse,
      members,
    }),
  );
  const [errors, setErrors] = useState<RsvpFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedResponse, setSubmittedResponse] = useState<
    RsvpSubmissionResponse["response"] | null
  >(null);
  const [isEditingExistingReply, setIsEditingExistingReply] = useState(false);
  const [recoveryState, setRecoveryState] = useState<RsvpRecoveryState | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const responseStatus = submittedResponse?.responseStatus ?? state.responseStatus;
  const hasExistingReply = Boolean(savedResponseStatus || submittedResponse);
  const isConfirmationVisible = hasExistingReply && !isEditingExistingReply;
  const isUpdatingExistingReply = hasExistingReply && isEditingExistingReply;
  const hasSubmittedReply = Boolean(submittedResponse);
  const isResponding = state.responseStatus !== "not_attending";
  const hasDetails =
    questions.length > 0 ||
    rsvpFields.collectGuestMessage ||
    (rsvpFields.collectGuestNames && !hasStructuredMembers);
  const detailsLabel = resolveDetailsLabel(copy, {
    collectGuestMessage: rsvpFields.collectGuestMessage,
    collectGuestNames: rsvpFields.collectGuestNames && !hasStructuredMembers,
    hasQuestions: questions.length > 0,
  });
  const isLocked = isRsvpLocked(recoveryState);
  const statusTone = getReplyTone({
    hasSubmittedReply,
    isUpdatingExistingReply,
    recoveryState,
    responseStatus,
  });
  const statusCopy = getReplyStatusCopy({
    attendeeCount: submittedResponse?.attendeeCount ?? state.attendeeCount,
    collectGuestMessage: rsvpFields.collectGuestMessage,
    guestGroupLabel: guestGroup.label,
    hasSubmittedReply,
    initialResponseStatus: savedResponseStatus,
    maxPax: guestGroup.maxPax,
    recoveryState,
    responseStatus,
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLocked) {
      return;
    }

    setIsSubmitting(true);
    setSubmittedResponse(null);
    setRecoveryState(null);

    const result = await submitRsvpFormState({
      eventSlug,
      guestToken,
      maxPax: guestGroup.maxPax,
      members,
      questions,
      rsvpFields,
      state,
      submit: (...args) => createInviteApiClient().submitRsvp(...args),
    });

    if (result.ok) {
      setErrors({});
      setSubmittedResponse(result.response);
      setDetailsOpen(false);
      setIsEditingExistingReply(false);
    } else {
      setErrors(result.errors);
      setRecoveryState(result.recoveryState ?? null);
      setDetailsOpen(true);
    }

    setIsSubmitting(false);
  };

  return {
    actions: {
      addAttendee: () =>
        setState((current) =>
          withAttendeeCount(
            current,
            Math.min(guestGroup.maxPax, current.attendeeCount + 1),
            rsvpFields.collectGuestNames,
            hasStructuredMembers,
          ),
        ),
      editReply: () => {
        setSubmittedResponse(null);
        setIsEditingExistingReply(true);
      },
      removeAttendee: () =>
        setState((current) =>
          withAttendeeCount(
            current,
            Math.max(1, current.attendeeCount - 1),
            rsvpFields.collectGuestNames,
            hasStructuredMembers,
          ),
        ),
      setAnswer: (questionKey, value) =>
        setState((current) => ({
          ...current,
          answers: {
            ...current.answers,
            [questionKey]: value,
          },
        })),
      setDetailsOpen,
      setGuestName: (index, value) =>
        setState((current) => ({
          ...current,
          guestNames: current.guestNames.map((item, itemIndex) =>
            itemIndex === index ? value : item,
          ),
        })),
      toggleGuestMember: (name) =>
        setState((current) => ({
          ...current,
          guestNames: current.guestNames.includes(name)
            ? current.guestNames.filter((guestName) => guestName !== name)
            : [...current.guestNames, name],
          staleGuestNames: [],
        })),
      setMessage: (message) => setState((current) => ({ ...current, message })),
      setResponseStatus: (responseStatus) =>
        setState((current) =>
          withResponseStatus(
            current,
            responseStatus,
            guestGroup.maxPax,
            rsvpFields.collectGuestNames,
            hasStructuredMembers,
          ),
        ),
      submit: handleSubmit,
    },
    context: {
      eventSlug,
      guestGroup,
    },
    copy,
    details: {
      isOpen: detailsOpen,
      label: detailsLabel,
    },
    enabledFields: rsvpFields,
    errors,
    flags: {
      canRetry: !isLocked,
      hasDetails,
      isLocked,
      isResponding,
      isSubmitting,
      isConfirmationVisible,
      isUpdatingExistingReply,
    },
    formState: state,
    presentation,
    questions,
    recoveryState,
    reservedSeatsCopy: `${copy.reservedSeatsIntro} ${guestGroup.maxPax} ${
      guestGroup.maxPax === 1 ? "seat" : "seats"
    } for your party.`,
    status: {
      copy: statusCopy,
      tone: statusTone,
    },
    submittedResponse,
  };
}

export function createInitialRsvpFormState(
  maxPax: number,
  responseStatus: RsvpStatus | null,
  rsvpFields: RsvpResponseFields = defaultRsvpResponseFields,
  options: {
    initialResponse?: RsvpFormProps["initialResponse"];
    members?: RsvpFormProps["guestGroup"]["members"];
  } = {},
): RsvpFormState {
  const members = options.members ?? [];
  const hasStructuredMembers = rsvpFields.collectGuestNames && members.length > 0;
  const initialGuestNames = options.initialResponse?.guestNames ?? [];
  const { matchedNames, staleNames } = hasStructuredMembers
    ? matchGuestNamesToMembers(initialGuestNames, members)
    : { matchedNames: [], staleNames: [] };

  if (responseStatus === "not_attending") {
    return {
      answers: {},
      attendeeCount: 0,
      guestNames: hasStructuredMembers
        ? matchedNames
        : rsvpFields.collectGuestNames
          ? initialGuestNames.length > 0
            ? initialGuestNames
            : [""]
          : [],
      message: "",
      responseStatus,
      ...(staleNames.length > 0 ? { staleGuestNames: staleNames } : {}),
    };
  }

  const attendeeCount = options.initialResponse
    ? Math.max(1, Math.min(maxPax, options.initialResponse.attendeeCount))
    : 1;

  return {
    answers: {},
    attendeeCount,
    guestNames: hasStructuredMembers
      ? matchedNames
      : rsvpFields.collectGuestNames
        ? resizeGuestNames(initialGuestNames, attendeeCount)
        : [],
    message: "",
    responseStatus:
      responseStatus === "attending" || responseStatus === "maybe" ? responseStatus : "",
    ...(staleNames.length > 0 ? { staleGuestNames: staleNames } : {}),
  };
}

export function validateRsvpFormState({
  maxPax,
  members = [],
  questions,
  rsvpFields = defaultRsvpResponseFields,
  state,
}: {
  maxPax: number;
  members?: RsvpFormProps["guestGroup"]["members"];
  questions: RsvpQuestion[];
  rsvpFields?: RsvpResponseFields;
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

  const hasStructuredMembers = rsvpFields.collectGuestNames && members.length > 0;
  const selectedMemberNames = hasStructuredMembers
    ? matchGuestNamesToMembers(state.guestNames, members).matchedNames
    : [];
  const guestNames =
    isAttending && rsvpFields.collectGuestNames
      ? hasStructuredMembers
        ? selectedMemberNames
        : state.guestNames
            .slice(0, attendeeCount)
            .map((name) => name.trim())
            .filter(Boolean)
      : [];

  if (isAttending && hasStructuredMembers) {
    const hasStaleSelection = Boolean(state.staleGuestNames?.length);

    if (hasStaleSelection) {
      errors.guestNames = `Some saved attendees are no longer in this guest group. Select exactly ${attendeeCount} current ${
        attendeeCount === 1 ? "member" : "members"
      }.`;
    } else if (guestNames.length !== attendeeCount) {
      errors.guestNames = `Select exactly ${attendeeCount} named ${
        attendeeCount === 1 ? "member" : "members"
      }. ${guestNames.length} selected.`;
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
      message: rsvpFields.collectGuestMessage ? state.message.trim() || undefined : undefined,
      responseStatus: state.responseStatus,
    },
    ok: true,
  };
}

export async function submitRsvpFormState({
  eventSlug,
  guestToken,
  maxPax,
  members = [],
  questions,
  rsvpFields = defaultRsvpResponseFields,
  state,
  submit,
}: {
  eventSlug: string;
  guestToken: string;
  maxPax: number;
  members?: RsvpFormProps["guestGroup"]["members"];
  questions: RsvpQuestion[];
  rsvpFields?: RsvpResponseFields;
  state: RsvpFormState;
  submit: SubmitRsvp;
}): Promise<RsvpFormSubmitResult> {
  const validation = validateRsvpFormState({ maxPax, members, questions, rsvpFields, state });

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
      recoveryState: readRsvpRecoveryState(error),
    };
  }
}

function getReplyStatusCopy({
  attendeeCount,
  collectGuestMessage,
  guestGroupLabel,
  hasSubmittedReply,
  initialResponseStatus,
  maxPax,
  recoveryState,
  responseStatus,
}: {
  attendeeCount: number;
  collectGuestMessage: boolean;
  guestGroupLabel: string;
  hasSubmittedReply: boolean;
  initialResponseStatus: RsvpStatus | null;
  maxPax: number;
  recoveryState: RsvpRecoveryState | null;
  responseStatus: RsvpStatus | "";
}) {
  if (recoveryState) {
    return {
      body:
        recoveryState.kind === "rate_limited"
          ? "Please wait a moment before trying again. Your reply details have been kept here."
          : "This invite cannot accept a reply right now. Your latest draft remains visible below.",
      meta: "RSVP status",
      title: recoveryState.title,
    };
  }

  if (hasSubmittedReply) {
    return {
      body: `${formatRsvpStatus(responseStatus || "attending")} for ${guestGroupLabel}. ${
        attendeeCount > 0 ? `${attendeeCount} of ${maxPax} seats confirmed.` : "No seats claimed."
      }`,
      meta: "Saved reply",
      title: "The host has your latest response.",
    };
  }

  if (initialResponseStatus) {
    return {
      body: `Current host record: ${formatRsvpStatus(initialResponseStatus)}. Adjust anything below and send an update when ready.`,
      meta: "Already submitted",
      title: "You can still update this reply.",
    };
  }

  if (responseStatus === "attending" || responseStatus === "maybe") {
    return {
      body: `${attendeeCount} of ${maxPax} reserved seats selected for ${guestGroupLabel}.`,
      meta: "Draft reply",
      title: "We will tell the host you plan to attend.",
    };
  }

  if (responseStatus === "not_attending") {
    return {
      body: collectGuestMessage
        ? `No seats will be held for ${guestGroupLabel}. You can still leave the host a note.`
        : `No seats will be held for ${guestGroupLabel}. The host will receive your attendance reply.`,
      meta: "Draft reply",
      title: "Sending regrets is okay.",
    };
  }

  return {
    body: `${maxPax} ${maxPax === 1 ? "seat is" : "seats are"} reserved for ${guestGroupLabel}.`,
    meta: "Awaiting reply",
    title: "Tell the host whether you can make it.",
  };
}

function getReplyTone({
  hasSubmittedReply,
  isUpdatingExistingReply,
  recoveryState,
  responseStatus,
}: {
  hasSubmittedReply: boolean;
  isUpdatingExistingReply: boolean;
  recoveryState: RsvpRecoveryState | null;
  responseStatus: RsvpStatus | "";
}): ReplyTone {
  if (recoveryState) {
    return "blocked";
  }

  if (hasSubmittedReply) {
    return "sent";
  }

  if (isUpdatingExistingReply) {
    return "updating";
  }

  if (responseStatus === "not_attending") {
    return "declined";
  }

  if (responseStatus === "attending" || responseStatus === "maybe") {
    return "accepted";
  }

  return "draft";
}

function isRsvpLocked(recoveryState: RsvpRecoveryState | null) {
  return (
    recoveryState?.kind === "closed" ||
    recoveryState?.kind === "disabled" ||
    recoveryState?.kind === "expired" ||
    recoveryState?.kind === "unavailable"
  );
}

function withResponseStatus(
  state: RsvpFormState,
  responseStatus: RsvpStatus,
  maxPax: number,
  collectGuestNames: boolean,
  hasStructuredMembers: boolean,
): RsvpFormState {
  if (responseStatus === "not_attending") {
    return {
      ...state,
      attendeeCount: 0,
      guestNames: collectGuestNames
        ? hasStructuredMembers
          ? state.guestNames
          : state.guestNames.length > 0
            ? state.guestNames
            : [""]
        : [],
      responseStatus,
    };
  }

  const attendeeCount = state.attendeeCount > 0 ? Math.min(state.attendeeCount, maxPax) : 1;

  return {
    ...state,
    attendeeCount,
    guestNames: collectGuestNames
      ? hasStructuredMembers
        ? state.guestNames
        : resizeGuestNames(state.guestNames, attendeeCount)
      : [],
    responseStatus,
  };
}

function withAttendeeCount(
  state: RsvpFormState,
  attendeeCount: number,
  collectGuestNames: boolean,
  hasStructuredMembers: boolean,
): RsvpFormState {
  return {
    ...state,
    attendeeCount,
    guestNames: collectGuestNames
      ? hasStructuredMembers
        ? state.guestNames
        : resizeGuestNames(state.guestNames, attendeeCount)
      : [],
  };
}

function resizeGuestNames(guestNames: string[], attendeeCount: number) {
  return Array.from({ length: attendeeCount }, (_, index) => guestNames[index] ?? "");
}

function matchGuestNamesToMembers(
  guestNames: string[],
  members: NonNullable<RsvpFormProps["guestGroup"]["members"]>,
) {
  const memberNames = new Map(
    members.map((member) => [normalizeGuestName(member.name), member.name] as const),
  );
  const matchedNames: string[] = [];
  const staleNames: string[] = [];

  for (const guestName of guestNames) {
    const trimmedName = guestName.trim();
    if (!trimmedName) continue;

    const memberName = memberNames.get(normalizeGuestName(trimmedName));
    if (memberName && !matchedNames.includes(memberName)) {
      matchedNames.push(memberName);
    } else if (!memberName) {
      staleNames.push(trimmedName);
    }
  }

  return { matchedNames, staleNames };
}

function normalizeGuestName(name: string) {
  return name.trim().toLocaleLowerCase();
}

function resolveDetailsLabel(
  copy: ThemeRsvpCopy,
  {
    collectGuestMessage,
    collectGuestNames,
    hasQuestions,
  }: {
    collectGuestMessage: boolean;
    collectGuestNames: boolean;
    hasQuestions: boolean;
  },
) {
  if (collectGuestNames && collectGuestMessage) {
    return copy.detailsLabel;
  }

  if (collectGuestNames) {
    return hasQuestions ? copy.detailsNamesAndAnswersLabel : copy.detailsNamesLabel;
  }

  if (collectGuestMessage) {
    return hasQuestions ? copy.detailsAnswersOrNoteLabel : copy.detailsNoteLabel;
  }

  return copy.detailsQuestionsLabel;
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
    const recoveryState = readRsvpRecoveryState(error);

    if (recoveryState) {
      return recoveryState.body;
    }

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

export function readRsvpRecoveryState(error: unknown): RsvpRecoveryState | undefined {
  if (!(error instanceof ApiClientError)) {
    return undefined;
  }

  const message = error.apiError.error.message || error.message;
  const normalized = message.toLowerCase();

  if (error.apiError.error.code === "INVITE_EXPIRED") {
    return {
      body: "This RSVP link has expired. Ask the host for a fresh invite link.",
      kind: "expired",
      title: "This invite link has expired.",
    };
  }

  if (error.apiError.error.code === "RATE_LIMITED") {
    return {
      body: "Too many reply attempts were sent in a short time. Please wait a moment, then try again.",
      kind: "rate_limited",
      title: "Please pause before trying again.",
    };
  }

  if (normalized.includes("expired")) {
    return {
      body: "This RSVP link appears to be expired. Ask the host for a fresh invite link.",
      kind: "expired",
      title: "This invite link has expired.",
    };
  }

  if (normalized.includes("disabled")) {
    return {
      body: "This guest invite is disabled. Ask the host for help before sending another reply.",
      kind: "disabled",
      title: "This guest invite is disabled.",
    };
  }

  if (normalized.includes("closed")) {
    return {
      body: "RSVP is closed for this event. You can still contact the host directly.",
      kind: "closed",
      title: "RSVP is closed.",
    };
  }

  if (error.apiError.error.code === "NOT_FOUND") {
    return {
      body: "This guest invite could not be found. Ask the host for a fresh link.",
      kind: "unavailable",
      title: "We could not find this invite.",
    };
  }

  return undefined;
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
