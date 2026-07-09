import type { ApiError, PublicEventResponse } from "@lumiere/types";
import { describe, expect, it, vi } from "vitest";

import { ApiClientError, createApiClient } from "./index";

const publicEventResponse: PublicEventResponse = {
  event: {
    id: "00000000-0000-4000-8000-000000000101",
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
