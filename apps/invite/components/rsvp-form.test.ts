import { describe, expect, it, vi } from "vitest";
import { ApiClientError } from "@lumiere/api-client";
import { resolveThemeRsvpCopy, themeRegistry } from "@lumiere/themes";
import type { RsvpSubmissionResponse } from "@lumiere/types";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  createInitialRsvpFormState,
  RsvpForm,
  readRsvpRecoveryState,
  submitRsvpFormState,
  validateRsvpFormState,
  type RsvpFormState,
  type RsvpQuestion,
} from "./rsvp-form";

describe("RSVP form flow helpers", () => {
  it("renders an awaiting-reply state with the guest group and max pax", () => {
    const html = renderToStaticMarkup(
      createElement(RsvpForm, {
        eventSlug: "garden-evening",
        guestGroup,
        guestToken: "sample-guest-token-for-preview",
        initialResponseStatus: null,
        questions,
      }),
    );

    expect(html).toContain('data-rsvp-state="draft"');
    expect(html).toContain("Tan Family");
    expect(html).toContain("4 seats");
    expect(html).toContain("Awaiting reply");
    expect(html).toContain("focus-within:ring-2");
    expect(html).toContain("Names for the guest list");
    expect(html).toContain('id="rsvp-message"');

    const playfulHtml = renderToStaticMarkup(
      createElement(RsvpForm, {
        copy: resolveThemeRsvpCopy(themeRegistry.kids),
        eventSlug: "birthday-party",
        guestGroup,
        guestToken: "sample-guest-token-for-preview",
        initialResponseStatus: null,
        presentation: themeRegistry.kids.presentation.rsvp,
        questions,
      }),
    );

    expect(playfulHtml).toContain("Can you join the party?");
    expect(playfulHtml).toContain("Your party reply");
    expect(playfulHtml).toContain("border-2");
  });

  it("renders an already-submitted reply as an update flow", () => {
    const html = renderToStaticMarkup(
      createElement(RsvpForm, {
        eventSlug: "garden-evening",
        guestGroup,
        guestToken: "sample-guest-token-for-preview",
        initialResponseStatus: "attending",
        questions,
        rsvpFields: {
          collectGuestMessage: false,
          collectGuestNames: false,
        },
      }),
    );

    expect(html).toContain('data-rsvp-state="updating"');
    expect(html).toContain("Already submitted");
    expect(html).toContain("Update RSVP");
    expect(html).not.toContain("Names for the guest list");
    expect(html).not.toContain('id="rsvp-message"');

    const namesOnlyHtml = renderToStaticMarkup(
      createElement(RsvpForm, {
        eventSlug: "garden-evening",
        guestGroup,
        guestToken: "sample-guest-token-for-preview",
        initialResponseStatus: "attending",
        questions,
        rsvpFields: {
          collectGuestMessage: false,
          collectGuestNames: true,
        },
      }),
    );
    const messageOnlyHtml = renderToStaticMarkup(
      createElement(RsvpForm, {
        eventSlug: "garden-evening",
        guestGroup,
        guestToken: "sample-guest-token-for-preview",
        initialResponseStatus: "attending",
        questions,
        rsvpFields: {
          collectGuestMessage: true,
          collectGuestNames: false,
        },
      }),
    );

    expect(namesOnlyHtml).toContain("Names for the guest list");
    expect(namesOnlyHtml).not.toContain('id="rsvp-message"');
    expect(messageOnlyHtml).not.toContain("Names for the guest list");
    expect(messageOnlyHtml).toContain('id="rsvp-message"');
  });

  it("submits an attending RSVP with guest names and custom answers", async () => {
    const submit = vi.fn(async (): Promise<RsvpSubmissionResponse> => createResponse("attending"));
    const state: RsvpFormState = {
      answers: {
        meal: "Fish",
        notes: "No peanuts, please.",
      },
      attendeeCount: 2,
      guestNames: ["Ari Tan", "Bea Tan"],
      message: "Looking forward to it.",
      responseStatus: "attending",
    };

    const result = await submitRsvpFormState({
      eventSlug: "garden-evening",
      guestToken: "sample-guest-token-for-preview",
      maxPax: 4,
      questions,
      state,
      submit,
    });

    expect(result.ok).toBe(true);
    expect(submit).toHaveBeenCalledWith("garden-evening", "sample-guest-token-for-preview", {
      answers: [
        {
          questionKey: "meal",
          value: "Fish",
        },
        {
          questionKey: "notes",
          value: "No peanuts, please.",
        },
      ],
      attendeeCount: 2,
      guestNames: ["Ari Tan", "Bea Tan"],
      message: "Looking forward to it.",
      responseStatus: "attending",
    });
  });

  it("submits a not-attending RSVP without attendee names or required answers", async () => {
    const submit = vi.fn(async (): Promise<RsvpSubmissionResponse> =>
      createResponse("not_attending", 0),
    );
    const state: RsvpFormState = {
      answers: {},
      attendeeCount: 0,
      guestNames: [],
      message: "We are sorry to miss it.",
      responseStatus: "not_attending",
    };

    const result = await submitRsvpFormState({
      eventSlug: "garden-evening",
      guestToken: "sample-guest-token-for-preview",
      maxPax: 4,
      questions,
      state,
      submit,
    });

    expect(result.ok).toBe(true);
    expect(submit).toHaveBeenCalledWith("garden-evening", "sample-guest-token-for-preview", {
      answers: [],
      attendeeCount: 0,
      guestNames: [],
      message: "We are sorry to miss it.",
      responseStatus: "not_attending",
    });
  });

  it("blocks attendee counts above max pax", () => {
    const result = validateRsvpFormState({
      maxPax: 2,
      questions,
      state: {
        answers: {
          meal: "Fish",
        },
        attendeeCount: 3,
        guestNames: ["Ari Tan", "Bea Tan", "Cal Tan"],
        message: "",
        responseStatus: "attending",
      },
    });

    expect(result.ok).toBe(false);
    expect(result.ok ? undefined : result.errors.attendeeCount).toBe(
      "This invite allows up to 2 pax.",
    );
  });

  it("returns field-level validation errors for missing required questions", () => {
    const result = validateRsvpFormState({
      maxPax: 4,
      questions,
      state: {
        answers: {},
        attendeeCount: 2,
        guestNames: ["Ari Tan", ""],
        message: "",
        responseStatus: "attending",
      },
    });

    expect(result.ok).toBe(false);
    expect(result.ok ? undefined : result.errors["answers.meal"]).toBe(
      "This question is required.",
    );
    expect(result.ok ? undefined : result.errors["guestNames.1"]).toBe(
      "Enter a name for this attendee.",
    );
  });

  it("preserves form state on submit failure by returning errors only", async () => {
    const submit = vi.fn(async (): Promise<RsvpSubmissionResponse> => {
      throw new Error("network down");
    });
    const state: RsvpFormState = {
      answers: {
        meal: "Vegetarian",
      },
      attendeeCount: 1,
      guestNames: ["Ari Tan"],
      message: "Still here after failure.",
      responseStatus: "attending",
    };

    const result = await submitRsvpFormState({
      eventSlug: "garden-evening",
      guestToken: "sample-guest-token-for-preview",
      maxPax: 4,
      questions,
      state,
      submit,
    });

    expect(result.ok).toBe(false);
    expect(result.ok ? undefined : result.errors.form).toBe(
      "We could not send your RSVP. Please try again.",
    );
    expect(state).toEqual({
      answers: {
        meal: "Vegetarian",
      },
      attendeeCount: 1,
      guestNames: ["Ari Tan"],
      message: "Still here after failure.",
      responseStatus: "attending",
    });
  });

  it("keeps submitted guests in update mode for already-submitted attending replies", () => {
    expect(createInitialRsvpFormState(4, "attending")).toEqual({
      answers: {},
      attendeeCount: 1,
      guestNames: [""],
      message: "",
      responseStatus: "attending",
    });
  });

  it("maps closed RSVP API failures to a blocking recovery state", async () => {
    const submit = vi.fn(async (): Promise<RsvpSubmissionResponse> => {
      throw createApiError("FORBIDDEN", "RSVP is closed");
    });
    const state: RsvpFormState = {
      answers: {
        meal: "Fish",
      },
      attendeeCount: 1,
      guestNames: ["Ari Tan"],
      message: "Please keep this note.",
      responseStatus: "attending",
    };

    const result = await submitRsvpFormState({
      eventSlug: "garden-evening",
      guestToken: "sample-guest-token-for-preview",
      maxPax: 4,
      questions,
      state,
      submit,
    });

    expect(result.ok).toBe(false);
    expect(result.ok ? undefined : result.recoveryState).toEqual({
      body: "RSVP is closed for this event. You can still contact the host directly.",
      kind: "closed",
      title: "RSVP is closed.",
    });
    expect(result.ok ? undefined : result.errors.form).toBe(
      "RSVP is closed for this event. You can still contact the host directly.",
    );
    expect(state.message).toBe("Please keep this note.");
  });

  it("classifies disabled, expired, unavailable, and rate-limited recovery states", () => {
    expect(
      readRsvpRecoveryState(createApiError("FORBIDDEN", "Guest invite is disabled")),
    ).toMatchObject({
      kind: "disabled",
      title: "This guest invite is disabled.",
    });
    expect(
      readRsvpRecoveryState(createApiError("FORBIDDEN", "Guest invite expired")),
    ).toMatchObject({
      kind: "expired",
      title: "This invite link has expired.",
    });
    expect(
      readRsvpRecoveryState(createApiError("NOT_FOUND", "Guest invite not found")),
    ).toMatchObject({
      kind: "unavailable",
      title: "We could not find this invite.",
    });
    expect(
      readRsvpRecoveryState(createApiError("RATE_LIMITED", "Too many requests")),
    ).toMatchObject({
      kind: "rate_limited",
      title: "Please pause before trying again.",
    });
  });
});

const questions: RsvpQuestion[] = [
  {
    key: "meal",
    label: "Meal choice",
    options: ["Fish", "Vegetarian"],
    required: true,
    type: "single_choice",
  },
  {
    key: "notes",
    label: "Dietary notes",
    options: [],
    required: false,
    type: "textarea",
  },
];

const guestGroup = {
  label: "Tan Family",
  maxPax: 4,
};

function createResponse(
  responseStatus: RsvpSubmissionResponse["response"]["responseStatus"],
  attendeeCount = 2,
): RsvpSubmissionResponse {
  return {
    response: {
      answers: [],
      attendeeCount,
      eventId: "evt_renderer",
      guestGroupId: "guest_group_renderer",
      guestNames: attendeeCount > 0 ? ["Ari Tan", "Bea Tan"].slice(0, attendeeCount) : [],
      id: "rsvp_renderer",
      responseStatus,
      submittedAt: "2030-01-01T00:00:00.000Z",
      updatedAt: "2030-01-01T00:00:00.000Z",
    },
  };
}

function createApiError(
  code: ConstructorParameters<typeof ApiClientError>[1]["error"]["code"],
  message: string,
) {
  return new ApiClientError(403, {
    error: {
      code,
      message,
      requestId: "request_for_rsvp_test",
    },
  });
}
