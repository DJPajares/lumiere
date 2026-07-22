import type { ApiError, PublicEventResponse } from "@lumiere/types";
import { describe, expect, it, vi } from "vitest";

import { ApiClientError, createApiClient } from "./index";

const publicEventResponse: PublicEventResponse = {
  event: {
    slug: "launch-night",
    title: "Launch Night",
    eventType: "launch",
    status: "published",
    timezone: "Asia/Singapore",
    startsAt: "2026-12-01T11:00:00.000Z",
    publicSettings: {},
  },
  themeConfig: {},
  themeMode: "system",
  sections: [],
};

describe("API client", () => {
  it("injects manager auth tokens into dashboard requests", async () => {
    const fetch = createFetchMock({
      events: [],
    });
    const client = createApiClient({
      authToken: async () => "manager-token",
      baseUrl: "https://api.example.test/v1",
      fetch,
    });

    await expect(client.listEvents()).resolves.toEqual({
      events: [],
    });

    expect(fetch).toHaveBeenCalledWith(
      "https://api.example.test/v1/events",
      expect.objectContaining({
        method: "GET",
      }),
    );
    expect(requestHeaders(fetch).get("authorization")).toBe("Bearer manager-token");
  });

  it("loads the signed-in manager's pending collaborator invitations", async () => {
    const invitation = {
      createdAt: "2026-07-08T00:00:00.000Z",
      email: "editor@example.com",
      eventId: "00000000-0000-4000-8000-000000000101",
      eventTitle: "Launch Night",
      expiresAt: "2026-07-15T00:00:00.000Z",
      id: "00000000-0000-4000-8000-000000000111",
      invitedByDisplayName: "Ada Host",
      invitedByEmail: "host@example.com",
      invitedByUserId: "00000000-0000-4000-8000-000000000102",
      lastSentAt: "2026-07-08T00:00:00.000Z",
      role: "editor",
      sendCount: 1,
      status: "pending",
      updatedAt: "2026-07-08T00:00:00.000Z",
    } as const;
    const fetch = createFetchMock({ invitations: [invitation] });
    const client = createApiClient({
      authToken: "manager-token",
      baseUrl: "https://api.example.test",
      fetch,
    });

    await expect(client.listPendingCollaboratorInvitations()).resolves.toEqual({
      invitations: [invitation],
    });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.example.test/collaborator-invitations",
      expect.objectContaining({ method: "GET" }),
    );
    expect(requestHeaders(fetch).get("authorization")).toBe("Bearer manager-token");
  });

  it("does not require Supabase tokens for public invite calls", async () => {
    const fetch = createFetchMock(publicEventResponse);
    const client = createApiClient({
      authToken: "manager-token",
      baseUrl: "https://api.example.test/",
      fetch,
    });

    await expect(client.getPublicEvent("launch-night")).resolves.toEqual(publicEventResponse);

    expect(fetch).toHaveBeenCalledWith(
      "https://api.example.test/public/events/launch-night",
      expect.objectContaining({
        method: "GET",
      }),
    );
    expect(requestHeaders(fetch).has("authorization")).toBe(false);
  });

  it("serializes query params for list calls", async () => {
    const fetch = createFetchMock({
      activity: [],
    });
    const client = createApiClient({
      authToken: "manager-token",
      baseUrl: "https://api.example.test",
      fetch,
    });

    await expect(
      client.listEventActivity("00000000-0000-4000-8000-000000000101", {
        limit: 10,
        type: ["rsvp_submitted", "rsvp_updated"],
        unread: false,
      }),
    ).resolves.toEqual({
      activity: [],
    });

    expect(fetch).toHaveBeenCalledWith(
      "https://api.example.test/events/00000000-0000-4000-8000-000000000101/activity?limit=10&type=rsvp_submitted&type=rsvp_updated&unread=false",
      expect.anything(),
    );
  });

  it("downloads authenticated guest exports with the server filename", async () => {
    const fetch = vi.fn(
      async () =>
        new Response("\uFEFFGroup label\r\nTan Family\r\n", {
          headers: {
            "content-disposition": 'attachment; filename="launch-night-guest-data-2026-07-18.csv"',
            "content-type": "text/csv; charset=utf-8",
          },
        }),
    );
    const client = createApiClient({
      authToken: "manager-token",
      baseUrl: "https://api.example.test",
      fetch,
    });
    const download = await client.downloadGuestData("00000000-0000-4000-8000-000000000101", {
      format: "csv",
      q: "tan",
      scope: "filtered",
      status: "responded",
      tracking: "responded",
    });

    expect(download.filename).toBe("launch-night-guest-data-2026-07-18.csv");
    await expect(download.blob.text()).resolves.toContain("Tan Family");
    expect(fetch).toHaveBeenCalledWith(
      "https://api.example.test/events/00000000-0000-4000-8000-000000000101/guest-data-export?format=csv&q=tan&scope=filtered&status=responded&tracking=responded",
      expect.objectContaining({ method: "GET" }),
    );
    expect(requestHeaders(fetch as ReturnType<typeof createFetchMock>).get("authorization")).toBe(
      "Bearer manager-token",
    );
  });

  it("requests manager slug suggestions with the event title query", async () => {
    const fetch = createFetchMock({
      slug: "launch-night-a1b2c3",
    });
    const client = createApiClient({
      authToken: "manager-token",
      baseUrl: "https://api.example.test",
      fetch,
    });

    await expect(client.suggestEventSlug({ title: "Launch Night" })).resolves.toEqual({
      slug: "launch-night-a1b2c3",
    });

    expect(fetch).toHaveBeenCalledWith(
      "https://api.example.test/events/slug-suggestion?title=Launch+Night",
      expect.anything(),
    );
  });

  it("returns manager publishing readiness diagnostics", async () => {
    const readiness = {
      blockers: [
        {
          code: "theme.selection",
          destination: "theme",
          message: "Select a valid theme before publishing",
          path: ["selectedThemeId"],
        },
      ],
      eventUpdatedAt: "2026-07-08T00:00:00.000Z",
      issues: [
        {
          message: "Select a valid theme before publishing",
          path: ["selectedThemeId"],
        },
      ],
      publicUrl: "https://invite.example.test/e/launch-night",
      ready: false,
      rsvpStatus: "not_included",
      status: "draft",
      updatePolicy: "immediate",
      warnings: [],
    };
    const fetch = createFetchMock({
      readiness,
    });
    const client = createApiClient({
      authToken: "manager-token",
      baseUrl: "https://api.example.test",
      fetch,
    });

    await expect(
      client.getEventPublishingReadiness("00000000-0000-4000-8000-000000000101"),
    ).resolves.toMatchObject({
      readiness: { ready: false },
    });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.example.test/events/00000000-0000-4000-8000-000000000101/publish-readiness",
      expect.anything(),
    );

    const event = {
      createdAt: "2026-07-08T00:00:00.000Z",
      eventType: "launch",
      id: "00000000-0000-4000-8000-000000000101",
      ownerUserId: "00000000-0000-4000-8000-000000000102",
      publicSettings: {},
      rsvpSettings: {},
      slug: "launch-night",
      startsAt: "2026-12-01T11:00:00.000Z",
      status: "published",
      themeConfig: {},
      themeMode: "system",
      timezone: "Asia/Singapore",
      title: "Launch Night",
      updatedAt: "2026-07-08T01:00:00.000Z",
    } as const;
    const mutationFetch = createFetchMock({ event });
    const mutationClient = createApiClient({
      authToken: "manager-token",
      baseUrl: "https://api.example.test",
      fetch: mutationFetch,
    });

    await mutationClient.publishEvent(event.id, readiness.eventUpdatedAt);
    await mutationClient.unpublishEvent(event.id, event.updatedAt);

    expect(mutationFetch).toHaveBeenNthCalledWith(
      1,
      `https://api.example.test/events/${event.id}`,
      expect.objectContaining({
        body: JSON.stringify({
          expectedUpdatedAt: readiness.eventUpdatedAt,
          status: "published",
        }),
        method: "PATCH",
      }),
    );
    expect(mutationFetch).toHaveBeenNthCalledWith(
      2,
      `https://api.example.test/events/${event.id}`,
      expect.objectContaining({
        body: JSON.stringify({ expectedUpdatedAt: event.updatedAt, status: "draft" }),
        method: "PATCH",
      }),
    );
  });

  it("normalizes API errors to the shared error shape", async () => {
    const apiError: ApiError = {
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request body",
        requestId: "request-id-1",
        fields: [
          {
            message: "Required",
            path: ["title"],
          },
        ],
      },
    };
    const fetch = createFetchMock(apiError, {
      status: 422,
    });
    const client = createApiClient({
      authToken: "manager-token",
      baseUrl: "https://api.example.test",
      fetch,
    });

    await expect(client.listEvents()).rejects.toMatchObject({
      apiError,
      status: 422,
    } satisfies Partial<ApiClientError>);
  });
});

const createFetchMock = (body: unknown, init: ResponseInit = {}) =>
  vi.fn(async () => new Response(JSON.stringify(body), init));

const requestHeaders = (fetch: ReturnType<typeof createFetchMock>) =>
  new Headers(
    (fetch.mock.calls[0] as unknown as [RequestInfo | URL, RequestInit | undefined])[1]?.headers,
  );
