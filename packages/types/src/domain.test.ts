import { describe, expect, it } from "vitest";

import {
  apiErrorSchema,
  eventCreateSchema,
  eventUpdateSchema,
  eventSectionsUpdateSchema,
  guestGroupMutationSchema,
  rsvpSubmissionSchema,
} from ".";

const startsAt = "2026-12-24T18:30:00+08:00";

describe("shared schemas", () => {
  it("accepts valid event creation input", () => {
    expect(
      eventCreateSchema.parse({
        slug: "holiday-dinner",
        title: "Holiday Dinner",
        eventType: "dinner",
        timezone: "Asia/Singapore",
        startsAt,
      }),
    ).toMatchObject({
      slug: "holiday-dinner",
      themeMode: "system",
      publicSettings: {},
      rsvpSettings: {
        collectGuestMessage: true,
        collectGuestNames: true,
      },
    });
  });

  it("rejects invalid event slugs and date ranges", () => {
    expect(() =>
      eventCreateSchema.parse({
        slug: "Holiday Dinner",
        title: "Holiday Dinner",
        eventType: "dinner",
        timezone: "Asia/Singapore",
        startsAt,
        endsAt: "2026-12-24T17:30:00+08:00",
      }),
    ).toThrow();

    expect(() =>
      eventCreateSchema.parse({
        slug: "events",
        title: "Holiday Dinner",
        eventType: "dinner",
        timezone: "Asia/Singapore",
        startsAt,
      }),
    ).toThrow("This event slug is reserved");
  });

  it("validates event update input without defaulting omitted metadata", () => {
    expect(
      eventUpdateSchema.parse({
        eventType: "dinner",
        status: "published",
        title: "Updated dinner",
      }),
    ).toEqual({
      eventType: "dinner",
      status: "published",
      title: "Updated dinner",
    });

    expect(() => eventUpdateSchema.parse({})).toThrow("At least one event field is required");

    expect(
      eventUpdateSchema.parse({
        rsvpSettings: {
          collectGuestNames: false,
        },
      }),
    ).toEqual({
      rsvpSettings: {
        collectGuestNames: false,
      },
    });
  });

  it("allows an event update to clear its optional end time", () => {
    expect(eventUpdateSchema.parse({ endsAt: null })).toEqual({ endsAt: null });
    expect(
      eventUpdateSchema.parse({
        expectedUpdatedAt: "2030-01-01T00:00:00.000Z",
        status: "published",
      }),
    ).toEqual({
      expectedUpdatedAt: "2030-01-01T00:00:00.000Z",
      status: "published",
    });
  });

  it("rejects duplicate section keys", () => {
    expect(() =>
      eventSectionsUpdateSchema.parse({
        sections: [
          {
            sectionType: "introduction",
            sectionKey: "hero",
            sortOrder: 0,
            visibility: "public",
            content: { title: "Welcome" },
          },
          {
            sectionType: "story",
            sectionKey: "hero",
            sortOrder: 1,
            visibility: "public",
            content: { title: "Our story" },
          },
        ],
      }),
    ).toThrow("Section keys must be unique");
  });

  it("validates guest group max pax", () => {
    expect(() =>
      guestGroupMutationSchema.parse({
        label: "Family table",
        maxPax: 0,
      }),
    ).toThrow();
  });

  it("validates RSVP attendee rules", () => {
    expect(() =>
      rsvpSubmissionSchema.parse({
        responseStatus: "attending",
        attendeeCount: 0,
      }),
    ).toThrow("at least one attendee");

    expect(
      rsvpSubmissionSchema.parse({
        responseStatus: "not_attending",
        attendeeCount: 0,
      }),
    ).toMatchObject({
      responseStatus: "not_attending",
      guestNames: [],
      answers: [],
    });
  });

  it("validates API error shape", () => {
    expect(
      apiErrorSchema.parse({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request",
          requestId: "req_123",
          fields: [{ path: ["title"], message: "Required" }],
        },
      }),
    ).toMatchObject({
      error: {
        code: "VALIDATION_ERROR",
      },
    });
  });
});
