import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { EventSection, PublicEventResponse, PublicGuestInviteResponse } from "@lumiere/types";

import GuestEventPage, {
  generateMetadata as generateGuestInviteMetadata,
} from "../app/e/[eventSlug]/g/[guestToken]/page";
import PublicEventPage, {
  generateMetadata as generatePublicEventMetadata,
} from "../app/e/[eventSlug]/page";
import { metadata as inviteAppMetadata } from "../app/layout";
import InviteHome, { metadata as inviteHomeMetadata } from "../app/page";

describe("invite app routes", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the root scaffold with links to available curated demos", async () => {
    const fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("milo-turns-eight")) {
        return Response.json(
          {
            error: {
              code: "NOT_FOUND",
              message: "Public event not found",
              requestId: "missing-demo-request",
            },
          },
          { status: 404 },
        );
      }

      const slug = url.includes("after-hours-studio-18")
        ? "after-hours-studio-18"
        : "amara-theo-garden-wedding";

      return Response.json({
        ...publicEventResponse,
        event: {
          ...publicEventResponse.event,
          slug,
        },
      });
    });
    vi.stubGlobal("fetch", fetch);

    const element = await InviteHome();
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Lumiere invite app");
    expect(html).toContain("View demo events");
    expect(html).toContain("/e/amara-theo-garden-wedding");
    expect(html).toContain("/e/after-hours-studio-18");
    expect(html).not.toContain('href="/e/milo-turns-eight"');
    expect(html).toContain("Demo not seeded");
    expect(html).toContain("pnpm db:seed");
    expect(html).not.toContain("/g/");
    expect(html).not.toContain("guestToken");
  });

  it("declares invite PWA metadata and icons", () => {
    expect(inviteAppMetadata.applicationName).toBe("Lumiere Invite");
    expect(inviteAppMetadata.manifest).toBe("/manifest.webmanifest");
    expect(inviteAppMetadata.appleWebApp).toMatchObject({
      capable: true,
      title: "Lumiere Invite",
    });
    expect(JSON.stringify(inviteAppMetadata.icons)).toContain("/icons/icon-192.png");
    expect(JSON.stringify(inviteAppMetadata.icons)).toContain("/icons/icon-512.png");
    expect(JSON.stringify(inviteAppMetadata.icons)).toContain("/apple-touch-icon.png");
    expect(JSON.stringify(inviteAppMetadata.icons)).toContain("/icons/maskable-icon-512.png");
    expect(JSON.stringify(inviteAppMetadata.icons)).not.toContain(".svg");
    expect(inviteAppMetadata.robots).toMatchObject({
      follow: false,
      index: false,
    });
    expect(inviteHomeMetadata).toMatchObject({
      title: "Lumiere Demo Invitations",
      robots: {
        follow: false,
        index: false,
      },
    });
  });

  it("declares invite install icons in the web manifest", () => {
    const manifest = JSON.parse(
      readFileSync(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"),
    );

    expect(manifest).toMatchObject({
      background_color: "#fffaf1",
      name: "Lumiere Invite",
      short_name: "Lumiere",
      theme_color: "#b97732",
    });
    expect(manifest.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          src: "/icons/icon-192.png",
          purpose: "any",
        }),
        expect.objectContaining({
          src: "/icons/maskable-icon-192.png",
          purpose: "maskable",
        }),
        expect.objectContaining({
          src: "/icons/maskable-icon-512.png",
          purpose: "maskable",
        }),
      ]),
    );
    expect(JSON.stringify(manifest.icons)).not.toContain(".svg");
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
    expect(html).not.toContain("data-theme-mode-control=");
    expect(html).toContain('data-map-state="fallback"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain("Open directions");
    expect(html).toContain('data-invite-modernization="editorial-v1"');
    expect(html).toContain('class="lumiere-scroll-progress"');
    expect(html).not.toContain("Private RSVP");
    expect(html).not.toContain("Guest-only shuttle");
  });

  it("generates safe share metadata for generic public event routes", async () => {
    mockPublicEventResponse(publicEventResponse);

    const metadata = await generatePublicEventMetadata({
      params: Promise.resolve({
        eventSlug: "launch-night",
      }),
    });

    expect(metadata.title).toBe("Spring Dinner");
    expect(metadata.description).toContain("Invitation for Spring Dinner at Glass Hall");
    expect(metadata.description).toContain("June 1, 2030");
    expect(metadata.openGraph).toMatchObject({
      description: metadata.description,
      siteName: "Lumiere Invite",
      title: "Spring Dinner",
      type: "website",
    });
    expect(metadata.robots).toMatchObject({
      follow: false,
      index: false,
    });

    mockApiError(404, "Public event not found");
    const unavailableMetadata = await generatePublicEventMetadata({
      params: Promise.resolve({
        eventSlug: "untrusted-public-event-name",
      }),
    });

    expect(unavailableMetadata).toMatchObject({
      description: "This public invitation could not be opened.",
      title: "Invitation unavailable",
    });
    expect(JSON.stringify(unavailableMetadata)).not.toContain("untrusted-public-event-name");
  });

  it("renders an unavailable state for missing or unpublished public events", async () => {
    mockApiError(404, "Public event not found");

    const element = await PublicEventPage({
      params: Promise.resolve({
        eventSlug: "draft-event",
      }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain('data-invite-access-state="public-missing"');
    expect(html).toContain("This event is not available.");
    expect(html).toContain("Explore demo invitations");
    expect(html).not.toContain("draft-event");
    expect(html).not.toContain("Try again");

    mockApiError(503, "Public invite service unavailable");
    const retryableElement = await PublicEventPage({
      params: Promise.resolve({
        eventSlug: "draft-event",
      }),
    });
    const retryableHtml = renderToStaticMarkup(retryableElement);

    expect(retryableHtml).toContain('data-invite-access-state="service-error"');
    expect(retryableHtml).toContain("We could not load the invitation.");
    expect(retryableHtml).toContain("Try again");
    expect(retryableHtml).not.toContain("draft-event");
    expect(retryableHtml).not.toContain("invite-test-request");
  });

  it("renders a valid guest event route with public, guest-only, and RSVP context", async () => {
    mockPublicEventResponse(publicGuestInviteResponse);

    const element = await GuestEventPage({
      params: Promise.resolve({
        eventSlug: "launch-night",
        guestToken: "sample-guest-token-for-preview",
      }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Spring Dinner");
    expect(html).toContain("Guest invitation");
    expect(html).toContain("Tan Family");
    expect(html).toContain("Max 4 pax");
    expect(html).toContain("Dinner begins at 6:30 PM");
    expect(html).toContain("Guest-only shuttle");
    expect(html).toContain("Private RSVP");
    expect(html).toContain("Meal choice");
    expect(html).toContain("Will you celebrate with us?");
    expect(html).toContain("Confirm attendance");
    expect(html).toContain('data-rsvp-design="editorial"');
    expect(html).toContain('data-invite-context="guest"');
    expect(html).toContain('data-theme-id="premium"');
    expect(html).toContain('data-theme-mode="dark"');
    expect(html).toContain('data-invite-modernization="editorial-v1"');
    expect(html).toContain("lumiere-rsvp-layout");
  });

  it("generates noindex guest metadata without leaking guest context", async () => {
    mockPublicEventResponse(publicGuestInviteResponse);

    const metadata = await generateGuestInviteMetadata({
      params: Promise.resolve({
        eventSlug: "launch-night",
        guestToken: "sample-guest-token-for-preview",
      }),
    });

    expect(metadata.title).toBe("Spring Dinner RSVP");
    expect(metadata.description).toBe(
      "Invitation details for Spring Dinner. RSVP access stays private to each guest link.",
    );
    expect(JSON.stringify(metadata)).not.toContain("Tan Family");
    expect(JSON.stringify(metadata)).not.toContain("sample-guest-token-for-preview");
    expect(metadata.robots).toMatchObject({
      follow: false,
      index: false,
    });

    mockApiError(404, "Guest invite not found");
    const invalidMetadata = await generateGuestInviteMetadata({
      params: Promise.resolve({
        eventSlug: "untrusted-event-name",
        guestToken: "untrusted-private-token",
      }),
    });

    expect(invalidMetadata).toMatchObject({
      description: "Private RSVP invitation link.",
      title: "Private invitation unavailable",
    });
    expect(JSON.stringify(invalidMetadata)).not.toContain("untrusted-event-name");
    expect(JSON.stringify(invalidMetadata)).not.toContain("untrusted-private-token");
  });

  it("renders an unavailable state for invalid guest tokens", async () => {
    mockApiError(404, "Guest invite not found");

    const element = await GuestEventPage({
      params: Promise.resolve({
        eventSlug: "launch-night",
        guestToken: "invalid-guest-token",
      }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain('data-invite-access-state="guest-invalid"');
    expect(html).toContain("This private link does not work.");
    expect(html).toContain("Contact the host");
    expect(html).not.toContain("Try again");
    expect(html).not.toContain("launch-night");
    expect(html).not.toContain("invalid-guest-token");

    mockApiError(503, "Guest invite service unavailable");
    const retryableElement = await GuestEventPage({
      params: Promise.resolve({
        eventSlug: "launch-night",
        guestToken: "invalid-guest-token",
      }),
    });
    const retryableHtml = renderToStaticMarkup(retryableElement);

    expect(retryableHtml).toContain('data-invite-access-state="service-error"');
    expect(retryableHtml).toContain("Try again");
    expect(retryableHtml).not.toContain("Contact the host");
    expect(retryableHtml).not.toContain("invite-test-request");
  });

  it("renders a disabled state for disabled guest groups", async () => {
    mockApiError(403, "Guest invite is disabled");

    const element = await GuestEventPage({
      params: Promise.resolve({
        eventSlug: "launch-night",
        guestToken: "disabled-guest-token",
      }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain('data-invite-access-state="guest-disabled"');
    expect(html).toContain("This private link has been disabled.");
    expect(html).toContain("Request another link");
    expect(html).not.toContain("Try again");

    mockApiError(410, "Guest invite expired");
    const expiredElement = await GuestEventPage({
      params: Promise.resolve({
        eventSlug: "launch-night",
        guestToken: "expired-guest-token",
      }),
    });
    const expiredHtml = renderToStaticMarkup(expiredElement);

    expect(expiredHtml).toContain('data-invite-access-state="guest-expired"');
    expect(expiredHtml).toContain("This private link has expired.");
    expect(expiredHtml).toContain("Request a fresh link");
    expect(expiredHtml).not.toContain("disabled");
    expect(expiredHtml).not.toContain("expired-guest-token");

    mockApiError(403, "RSVP is closed");
    const closedElement = await GuestEventPage({
      params: Promise.resolve({
        eventSlug: "launch-night",
        guestToken: "closed-rsvp-token",
      }),
    });
    const closedHtml = renderToStaticMarkup(closedElement);

    expect(closedHtml).toContain('data-invite-access-state="guest-rsvp-closed"');
    expect(closedHtml).toContain("RSVP is closed for this event.");
    expect(closedHtml).toContain("Ask the host");
  });
});

function mockPublicEventResponse(response: PublicEventResponse | PublicGuestInviteResponse) {
  const fetch = vi.fn(async () => Response.json(response));

  vi.stubGlobal("fetch", fetch);

  return fetch;
}

function mockApiError(status: number, message: string) {
  const fetch = vi.fn(async () =>
    Response.json(
      {
        error: {
          code: status === 404 ? "NOT_FOUND" : status === 403 ? "FORBIDDEN" : "INTERNAL_ERROR",
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
        questions: [
          {
            key: "meal-choice",
            label: "Meal choice",
            required: true,
            type: "single_choice",
          },
        ],
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

const publicGuestInviteResponse: PublicGuestInviteResponse = {
  ...publicEventResponse,
  guest: {
    guestGroup: {
      label: "Tan Family",
      maxPax: 4,
      status: "opened",
    },
    responseStatus: null,
  },
  rsvpFields: {
    collectGuestMessage: true,
    collectGuestNames: true,
  },
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
