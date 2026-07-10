import { describe, expect, it } from "vitest";

import { parseEventCreateValues, parseEventUpdateValues } from "./event-basics-form";

const values = {
  endsAt: "",
  eventType: "dinner" as const,
  slug: "spring-dinner",
  startsAt: "2030-06-01T18:30",
  status: "draft" as const,
  timezone: "Asia/Singapore",
  title: "Spring Dinner",
  venueAddress: "",
  venueName: "",
};

describe("event basics form parsing", () => {
  it("omits an empty end time when creating an event", () => {
    const result = parseEventCreateValues(values);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.input.endsAt).toBeUndefined();
    }
  });

  it("sends null when an existing event end time is cleared", () => {
    const result = parseEventUpdateValues(values);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.input.endsAt).toBeNull();
    }
  });
});
