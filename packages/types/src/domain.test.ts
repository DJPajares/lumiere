import { describe, expect, it } from "vitest";

import {
  apiErrorSchema,
  demoEventCatalog,
  demoEventCatalogEntrySchema,
  eventCreateSchema,
  eventUpdateSchema,
  eventSectionsUpdateSchema,
  guestInviteAccessExpiryConstraintSchema,
  guestGroupMutationSchema,
  isInviteAccessExpired,
  resolveEffectiveInviteAccessExpiry,
  rsvpSubmissionSchema,
} from ".";

const startsAt = "2026-12-24T18:30:00+08:00";

describe("shared schemas", () => {
  it("exposes a public-only curated demo event catalog", () => {
    expect(demoEventCatalog.map((entry) => demoEventCatalogEntrySchema.parse(entry))).toEqual(
      demoEventCatalog,
    );
    expect(demoEventCatalog.map((entry) => entry.publicSlug)).toEqual([
      "amara-theo-garden-wedding",
      "milo-turns-eight",
      "after-hours-studio-18",
    ]);
    expect(JSON.stringify(demoEventCatalog)).not.toContain("guestToken");
    expect(JSON.stringify(demoEventCatalog)).not.toContain("manager");
  });

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

    expect(
      guestGroupMutationSchema.parse({
        label: "Family table",
        maxPax: 2,
        status: "disabled",
      }).status,
    ).toBe("disabled");
    expect(
      guestGroupMutationSchema.parse({
        label: "Family table",
        maxPax: 2,
        status: "responded",
      }).status,
    ).toBe("responded");
  });

  it("validates ordered guest members against capacity and duplicate names", () => {
    expect(
      guestGroupMutationSchema.parse({
        label: "Family table",
        maxPax: 2,
        members: [{ name: " Mina Tan " }, { name: "Alex Tan" }],
      }),
    ).toMatchObject({
      members: [{ name: "Mina Tan" }, { name: "Alex Tan" }],
    });

    expect(() =>
      guestGroupMutationSchema.parse({
        label: "Family table",
        maxPax: 1,
        members: [{ name: "Mina Tan" }, { name: "Alex Tan" }],
      }),
    ).toThrow("maximum party size");

    expect(() =>
      guestGroupMutationSchema.parse({
        label: "Family table",
        maxPax: 2,
        members: [{ name: "Mina Tan" }, { name: " mina tan " }],
      }),
    ).toThrow("duplicates");
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

  it("validates API error and invite expiration contract shapes", () => {
    expect(
      apiErrorSchema.parse({
        error: {
          code: "INVITE_EXPIRED",
          message: "Invitation access has expired",
          requestId: "req_123",
        },
      }),
    ).toMatchObject({
      error: {
        code: "INVITE_EXPIRED",
      },
    });

    const access = guestInviteAccessExpiryConstraintSchema.parse({
      eventAccessExpiresAt: "2026-12-25T00:00:00+08:00",
      guestAccessExpiresAt: "2026-12-24T23:00:00+08:00",
    });

    expect(resolveEffectiveInviteAccessExpiry(access)).toBe("2026-12-24T23:00:00+08:00");
    expect(isInviteAccessExpired(access.guestAccessExpiresAt, access.guestAccessExpiresAt!)).toBe(
      true,
    );
    expect(() =>
      guestInviteAccessExpiryConstraintSchema.parse({
        eventAccessExpiresAt: "2026-12-25T00:00:00+08:00",
        guestAccessExpiresAt: "2026-12-25T00:00:01+08:00",
      }),
    ).toThrow("Guest access expiry cannot be later than the event access expiry");
  });
});
