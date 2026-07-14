import { activityEvents, guestGroups, notifications, rsvpResponses } from "@lumiere/db";
import { describe, expect, it } from "vitest";

import { createDrizzleRsvpStore } from "./rsvps";

const eventId = "00000000-0000-4000-8000-000000000101";
const guestGroupId = "00000000-0000-4000-8000-000000000301";
const responseId = "00000000-0000-4000-8000-000000000401";
const ownerUserId = "00000000-0000-4000-8000-000000000001";
const managerUserId = "00000000-0000-4000-8000-000000000002";

const eventRow = {
  id: eventId,
  ownerUserId,
  rsvpSettingsJson: {
    allowMaybe: true,
  },
  slug: "launch-night",
  status: "published",
  title: "Launch Night",
};

const guestGroupRow = {
  id: guestGroupId,
  eventId,
  inviteTokenHash: "hashed-token",
  label: "Tan Family",
  maxPax: 4,
  status: "pending",
};

const responseRow = {
  id: responseId,
  eventId,
  guestGroupId,
  responseStatus: "attending" as const,
  attendeeCount: 2,
  guestNamesJson: ["Mina Tan", "Alex Tan"],
  answersJson: [],
  message: "Excited to attend.",
  submittedAt: "2026-07-08T04:00:00.000Z",
  updatedAt: "2026-07-08T04:00:00.000Z",
};

describe("RSVP store", () => {
  it("creates a response, updates the guest group, and records submitted activity", async () => {
    const db = new FakeRsvpDb(
      [[eventRow], [guestGroupRow], [], [{ userId: ownerUserId }, { userId: managerUserId }]],
      responseRow,
    );
    const store = createDrizzleRsvpStore(db.asDatabase());

    const result = await store.submitGuestRsvp({
      eventSlug: "launch-night",
      inviteTokenHash: "hashed-token",
      submission: {
        responseStatus: "attending",
        attendeeCount: 2,
        guestNames: ["Mina Tan", "Alex Tan"],
        answers: [],
        message: "Excited to attend.",
      },
    });

    expect(result).toEqual({
      response: {
        id: responseId,
        eventId,
        guestGroupId,
        responseStatus: "attending",
        attendeeCount: 2,
        guestNames: ["Mina Tan", "Alex Tan"],
        answers: [],
        message: "Excited to attend.",
        submittedAt: "2026-07-08T04:00:00.000Z",
        updatedAt: "2026-07-08T04:00:00.000Z",
      },
      updatedExisting: false,
    });
    expect(db.insertValues).toContainEqual({
      table: rsvpResponses,
      values: {
        answersJson: [],
        attendeeCount: 2,
        eventId,
        guestGroupId,
        guestNamesJson: ["Mina Tan", "Alex Tan"],
        message: "Excited to attend.",
        responseStatus: "attending",
      },
    });
    expect(db.updateValues).toContainEqual({
      table: guestGroups,
      values: {
        status: "responded",
        updatedAt: expect.anything(),
      },
    });
    expect(db.insertValues).toContainEqual({
      table: activityEvents,
      values: {
        actorId: guestGroupId,
        actorType: "guest",
        activityType: "rsvp_submitted",
        eventId,
        metadataJson: {
          attendeeCount: 2,
          guestGroupId,
          guestGroupLabel: "Tan Family",
          responseId,
          responseStatus: "attending",
        },
      },
    });
    expect(db.insertValues).toContainEqual({
      table: notifications,
      values: [
        {
          eventId,
          message: "Tan Family submitted an RSVP for Launch Night.",
          metadataJson: {
            attendeeCount: 2,
            guestGroupId,
            guestGroupLabel: "Tan Family",
            responseId,
            responseStatus: "attending",
          },
          notificationType: "rsvp_submitted",
          title: "RSVP submitted",
          userId: ownerUserId,
        },
        {
          eventId,
          message: "Tan Family submitted an RSVP for Launch Night.",
          metadataJson: {
            attendeeCount: 2,
            guestGroupId,
            guestGroupLabel: "Tan Family",
            responseId,
            responseStatus: "attending",
          },
          notificationType: "rsvp_submitted",
          title: "RSVP submitted",
          userId: managerUserId,
        },
      ],
    });
  });

  it("updates an existing response and records updated activity", async () => {
    const updatedResponse = {
      ...responseRow,
      attendeeCount: 3,
      updatedAt: "2026-07-08T05:00:00.000Z",
    };
    const eventWithResponseFieldsDisabled = {
      ...eventRow,
      rsvpSettingsJson: {
        ...eventRow.rsvpSettingsJson,
        collectGuestMessage: false,
        collectGuestNames: false,
      },
    };
    const db = new FakeRsvpDb(
      [
        [eventWithResponseFieldsDisabled],
        [guestGroupRow],
        [responseRow],
        [{ userId: ownerUserId }],
      ],
      updatedResponse,
    );
    const store = createDrizzleRsvpStore(db.asDatabase());

    const result = await store.submitGuestRsvp({
      eventSlug: "launch-night",
      inviteTokenHash: "hashed-token",
      submission: {
        responseStatus: "attending",
        attendeeCount: 3,
        guestNames: [],
        answers: [],
        message: undefined,
      },
    });

    expect(result).toMatchObject({
      response: {
        id: responseId,
        attendeeCount: 3,
        guestNames: ["Mina Tan", "Alex Tan"],
        message: "Excited to attend.",
      },
      updatedExisting: true,
    });
    expect(db.updateValues).toContainEqual({
      table: rsvpResponses,
      values: {
        answersJson: [],
        attendeeCount: 3,
        guestNamesJson: ["Mina Tan", "Alex Tan"],
        message: "Excited to attend.",
        responseStatus: "attending",
        updatedAt: expect.anything(),
      },
    });
    expect(db.insertValues).toContainEqual({
      table: activityEvents,
      values: expect.objectContaining({
        activityType: "rsvp_updated",
        actorId: guestGroupId,
      }),
    });
    expect(db.insertValues).toContainEqual({
      table: notifications,
      values: [
        expect.objectContaining({
          message: "Tan Family updated an RSVP for Launch Night.",
          notificationType: "rsvp_updated",
          title: "RSVP updated",
          userId: ownerUserId,
        }),
      ],
    });

    const namesOnlyEvent = {
      ...eventRow,
      rsvpSettingsJson: {
        ...eventRow.rsvpSettingsJson,
        collectGuestMessage: false,
        collectGuestNames: true,
      },
    };
    const namesOnlyDb = new FakeRsvpDb(
      [[namesOnlyEvent], [guestGroupRow], [], [{ userId: ownerUserId }]],
      { ...responseRow, message: null },
    );
    const namesOnlyResult = await createDrizzleRsvpStore(namesOnlyDb.asDatabase()).submitGuestRsvp({
      eventSlug: "launch-night",
      inviteTokenHash: "hashed-token",
      submission: {
        responseStatus: "attending",
        attendeeCount: 2,
        guestNames: ["Mina Tan", "Alex Tan"],
        answers: [],
        message: undefined,
      },
    });

    expect(namesOnlyResult).toMatchObject({ response: { guestNames: ["Mina Tan", "Alex Tan"] } });
    expect(namesOnlyDb.insertValues).toContainEqual({
      table: rsvpResponses,
      values: expect.objectContaining({
        guestNamesJson: ["Mina Tan", "Alex Tan"],
        message: undefined,
      }),
    });

    const messageOnlyEvent = {
      ...eventRow,
      rsvpSettingsJson: {
        ...eventRow.rsvpSettingsJson,
        collectGuestMessage: true,
        collectGuestNames: false,
      },
    };
    const messageOnlyDb = new FakeRsvpDb(
      [[messageOnlyEvent], [guestGroupRow], [], [{ userId: ownerUserId }]],
      { ...responseRow, guestNamesJson: [], message: "See you there." },
    );
    const messageOnlyResult = await createDrizzleRsvpStore(
      messageOnlyDb.asDatabase(),
    ).submitGuestRsvp({
      eventSlug: "launch-night",
      inviteTokenHash: "hashed-token",
      submission: {
        responseStatus: "attending",
        attendeeCount: 2,
        guestNames: [],
        answers: [],
        message: "See you there.",
      },
    });

    expect(messageOnlyResult).toMatchObject({
      response: { guestNames: [], message: "See you there." },
    });
    expect(messageOnlyDb.insertValues).toContainEqual({
      table: rsvpResponses,
      values: expect.objectContaining({
        guestNamesJson: [],
        message: "See you there.",
      }),
    });

    const optionalNamesDb = new FakeRsvpDb([[eventRow], [guestGroupRow]], {
      ...responseRow,
      guestNamesJson: [],
    });
    const optionalNamesResult = await createDrizzleRsvpStore(
      optionalNamesDb.asDatabase(),
    ).submitGuestRsvp({
      eventSlug: "launch-night",
      inviteTokenHash: "hashed-token",
      submission: {
        responseStatus: "attending",
        attendeeCount: 2,
        guestNames: [],
        answers: [],
        message: undefined,
      },
    });
    const disabledMessageResult = await createDrizzleRsvpStore(
      new FakeRsvpDb([[namesOnlyEvent], [guestGroupRow]], responseRow).asDatabase(),
    ).submitGuestRsvp({
      eventSlug: "launch-night",
      inviteTokenHash: "hashed-token",
      submission: {
        responseStatus: "attending",
        attendeeCount: 2,
        guestNames: ["Mina Tan", "Alex Tan"],
        answers: [],
        message: "This should be rejected.",
      },
    });
    const disabledNamesResult = await createDrizzleRsvpStore(
      new FakeRsvpDb([[messageOnlyEvent], [guestGroupRow]], responseRow).asDatabase(),
    ).submitGuestRsvp({
      eventSlug: "launch-night",
      inviteTokenHash: "hashed-token",
      submission: {
        responseStatus: "attending",
        attendeeCount: 2,
        guestNames: ["Mina Tan", "Alex Tan"],
        answers: [],
        message: "Allowed note.",
      },
    });

    expect(optionalNamesResult).toMatchObject({ response: { guestNames: [] } });
    expect(optionalNamesDb.insertValues).toContainEqual({
      table: rsvpResponses,
      values: expect.objectContaining({ guestNamesJson: [] }),
    });
    expect(disabledMessageResult).toEqual({ reason: "message_disabled" });
    expect(disabledNamesResult).toEqual({ reason: "guest_names_disabled" });
  });
});

class FakeRsvpDb {
  readonly insertValues: Array<{ table: unknown; values: unknown }> = [];
  readonly updateValues: Array<{ table: unknown; values: unknown }> = [];

  constructor(
    private readonly selectResults: unknown[][],
    private readonly persistedResponse: unknown,
  ) {}

  asDatabase(): Parameters<typeof createDrizzleRsvpStore>[0] {
    return this as unknown as Parameters<typeof createDrizzleRsvpStore>[0];
  }

  select() {
    const builder = {
      innerJoin: () => builder,
      where: () => {
        const result = this.selectResults.shift() ?? [];
        return Object.assign(Promise.resolve(result), {
          limit: async () => result,
        });
      },
    };

    return {
      from: () => builder,
    };
  }

  insert(table: unknown) {
    return {
      values: (values: unknown) => {
        this.insertValues.push({ table, values });

        if (table === rsvpResponses) {
          return {
            returning: async () => [this.persistedResponse],
          };
        }

        return Promise.resolve([]);
      },
    };
  }

  update(table: unknown) {
    return {
      set: (values: unknown) => {
        this.updateValues.push({ table, values });

        return {
          where: () => {
            if (table === rsvpResponses) {
              return {
                returning: async () => [this.persistedResponse],
              };
            }

            return Promise.resolve([]);
          },
        };
      },
    };
  }

  transaction<TValue>(operation: (tx: FakeRsvpDb) => TValue) {
    return operation(this);
  }
}
