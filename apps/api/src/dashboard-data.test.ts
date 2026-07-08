import { describe, expect, it } from "vitest";

import { buildEventSummary } from "./dashboard-data";

describe("dashboard data", () => {
  it("builds response counts and pax metrics from active guest groups", () => {
    const summary = buildEventSummary(
      [
        {
          id: "00000000-0000-4000-8000-000000000301",
          maxPax: 4,
          status: "pending",
        },
        {
          id: "00000000-0000-4000-8000-000000000302",
          maxPax: 2,
          status: "responded",
        },
        {
          id: "00000000-0000-4000-8000-000000000303",
          maxPax: 3,
          status: "declined",
        },
        {
          id: "00000000-0000-4000-8000-000000000304",
          maxPax: 2,
          status: "responded",
        },
        {
          id: "00000000-0000-4000-8000-000000000305",
          maxPax: 5,
          status: "disabled",
        },
      ],
      [
        {
          attendeeCount: 2,
          guestGroupId: "00000000-0000-4000-8000-000000000302",
          responseStatus: "attending",
        },
        {
          attendeeCount: 0,
          guestGroupId: "00000000-0000-4000-8000-000000000303",
          responseStatus: "not_attending",
        },
        {
          attendeeCount: 1,
          guestGroupId: "00000000-0000-4000-8000-000000000304",
          responseStatus: "maybe",
        },
      ],
    );

    expect(summary).toEqual({
      attending: {
        groups: 1,
        pax: 2,
      },
      notAttending: {
        groups: 1,
        pax: 0,
      },
      maybe: {
        groups: 1,
        pax: 1,
      },
      pending: {
        groups: 1,
        pax: 4,
      },
      totalGroups: 4,
      totalInvitedPax: 11,
      totalRespondedPax: 3,
    });
  });
});
