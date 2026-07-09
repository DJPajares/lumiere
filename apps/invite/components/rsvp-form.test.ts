import { describe, expect, it, vi } from "vitest";
import type { RsvpSubmissionResponse } from "@lumiere/types";

import {
  submitRsvpFormState,
  validateRsvpFormState,
  type RsvpFormState,
  type RsvpQuestion,
} from "./rsvp-form";

describe("RSVP form flow helpers", () => {
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
