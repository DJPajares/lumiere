import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { EventSection, PublicEventResponse } from "@lumiere/types";

import GuestEventPage from "./e/[eventSlug]/g/[guestToken]/page";
import PublicEventPage from "./e/[eventSlug]/page";
import InviteHome from "./page";

describe("invite app routes", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the root scaffold with links to public and guest routes", () => {
    const html = renderToStaticMarkup(createElement(InviteHome));

    expect(html).toContain("Lumiere invite app");
    expect(html).toContain("/e/launch-night");
    expect(html).toContain("/e/launch-night/g/sample-guest-token-for-preview");
  });

  it("renders the generic public event route without guest RSVP context", async () => {
    mockPublicEventResponse(publicEventResponse);

    const element = await PublicEventPage({
      params: Promise.resolve({
        eventSlug: "launch-night",
      }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Spring Dinner");
    expect(html).toContain("Welcome to Spring Dinner");
    expect(html).toContain("Dinner begins at 6:30 PM");
    expect(html).toContain("Glass Hall");
    expect(html).toContain('data-theme-id="premium"');
    expect(html).toContain('data-theme-mode="dark"');
    expect(html).not.toContain("Private RSVP");
    expect(html).not.toContain("Guest-only shuttle");
  });

  it("renders an unavailable state for missing or unpublished public events", async () => {
    mockApiError(404, "Public event not found");

    const element = await PublicEventPage({
      params: Promise.resolve({
        eventSlug: "draft-event",
      }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Invitation unavailable");
    expect(html).toContain("not published");
    expect(html).toContain("draft-event");
  });

  it("renders the personalized guest event route with RSVP placeholder context", async () => {
    const element = await GuestEventPage({
      params: Promise.resolve({
        eventSlug: "launch-night",
        guestToken: "sample-guest-token-for-preview",
      }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Guest invitation");
    expect(html).toContain("Tan Family");
    expect(html).toContain("review");
    expect(html).toContain("RSVP form arrives next");
  });
});

function mockPublicEventResponse(response: PublicEventResponse) {
  const fetch = vi.fn(async () => Response.json(response));

  vi.stubGlobal("fetch", fetch);

  return fetch;
}

function mockApiError(status: number, message: string) {
  const fetch = vi.fn(async () =>
    Response.json(
      {
        error: {
          code: status === 404 ? "NOT_FOUND" : "INTERNAL_ERROR",
          message,
          requestId: "invite-test-request",
        },
      },
      {
        status,
      },
    ),
  );

  vi.stubGlobal("fetch", fetch);

  return fetch;
}

const publicEventResponse: PublicEventResponse = {
  event: {
    eventType: "dinner",
    id: "evt_123",
    publicSettings: {},
    slug: "launch-night",
    startsAt: "2030-06-01T10:30:00.000Z",
    status: "published",
    timezone: "Asia/Singapore",
    title: "Spring Dinner",
    venueAddress: "12 Orchard Road",
    venueName: "Glass Hall",
  },
  sections: [
    createSection({
      content: {
        body: "An intimate dinner for family and friends.",
        eyebrow: "Dinner invitation",
        subtitle: "Join us for an evening at Glass Hall.",
        title: "Welcome to Spring Dinner",
      },
      sectionKey: "welcome",
      sectionType: "introduction",
      sortOrder: 0,
    }),
    createSection({
      content: {
        displayText: "Dinner begins at 6:30 PM",
        startsAt: "2030-06-01T10:30:00.000Z",
        timezone: "Asia/Singapore",
        title: "When",
      },
      sectionKey: "when",
      sectionType: "date",
      sortOrder: 1,
    }),
    createSection({
      content: {
        address: "12 Orchard Road",
        notes: "Use the main entrance.",
        venueName: "Glass Hall",
      },
      sectionKey: "venue",
      sectionType: "location",
      sortOrder: 2,
    }),
    createSection({
      content: {
        items: [
          {
            label: "Transport",
            value: "Guest-only shuttle",
          },
        ],
        title: "Private details",
      },
      sectionKey: "guest-details",
      sectionType: "details",
      sortOrder: 3,
      visibility: "guest_only",
    }),
    createSection({
      content: {
        title: "Private RSVP",
      },
      sectionKey: "rsvp",
      sectionType: "rsvp",
      sortOrder: 4,
      visibility: "guest_only",
    }),
  ],
  selectedThemeId: "premium",
  themeConfig: {},
  themeMode: "dark",
};

function createSection(
  input: Pick<EventSection, "content" | "sectionKey" | "sectionType" | "sortOrder"> &
    Partial<Pick<EventSection, "settings" | "visibility">>,
): EventSection {
  return {
    content: input.content,
    createdAt: "2030-01-01T00:00:00.000Z",
    enabled: true,
    eventId: "evt_123",
    id: `section_${input.sectionKey}`,
    sectionKey: input.sectionKey,
    sectionType: input.sectionType,
    settings: input.settings ?? {},
    sortOrder: input.sortOrder,
    updatedAt: "2030-01-01T00:00:00.000Z",
    visibility: input.visibility ?? "public",
  };
}
