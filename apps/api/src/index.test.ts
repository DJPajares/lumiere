import { getTheme } from "@lumiere/themes";
import type {
  ActivityEvent,
  Event,
  EventSummary,
  EventCreate,
  EventSection,
  EventUpdate,
  GuestGroup,
  GuestGroupMutation,
  ManagerRole,
  Notification,
  RsvpResponse,
} from "@lumiere/types";
import {
  apiErrorSchema,
  eventCreateResponseSchema,
  eventResponseSchema,
  eventSectionsResponseSchema,
  eventSummaryResponseSchema,
  eventThemeResponseSchema,
  guestGroupInviteResponseSchema,
  publicEventResponseSchema,
  publicGuestInviteResponseSchema,
  rsvpSubmissionResponseSchema,
} from "@lumiere/types";
import { createHmac, generateKeyPairSync, sign } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { AuthStore, EventAccessLookup, LocalUser, UpsertUserProfileInput } from "./auth";
import { createApp } from "./app";
import type { DashboardDataStore } from "./dashboard-data";
import { ApiHttpError } from "./errors";
import type { EventStore, PublishingReadiness } from "./events";
import { toApiEvent } from "./events";
import type { GuestGroupStore, InviteTokenRecord } from "./guest-groups";
import { hashInviteToken } from "./guest-groups";
import { createApiApplication, loadApiConfig } from "./bootstrap";
import type {
  PublicEventRecord,
  PublicGuestInviteRecord,
  PublicInviteStore,
} from "./public-invites";
import type { RsvpStore, RsvpSubmissionResult } from "./rsvps";
import type { EventThemeState, ThemeSectionStore } from "./theme-sections";
import { toApiTheme } from "./theme-sections";

const validApiEnv = {
  NODE_ENV: "test",
  PORT: "4000",
  DATABASE_URL: "postgresql://user:password@localhost:5432/lumiere",
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
  SUPABASE_JWT_SECRET: "jwt-secret",
  INVITE_TOKEN_SECRET: "invite-secret",
  PUBLIC_APP_BASE_URL: "http://localhost:3000",
  DASHBOARD_APP_BASE_URL: "http://localhost:3001",
};

const localUser: LocalUser = {
  id: "00000000-0000-4000-8000-000000000001",
  supabaseUserId: "supabase-user-id",
  email: "manager@example.com",
  displayName: "Ada Manager",
  createdAt: "2026-07-08T00:00:00.000Z",
  updatedAt: "2026-07-08T00:00:00.000Z",
};

const eventId = "00000000-0000-4000-8000-000000000101";

const baseEvent: Event = {
  hasPublicAccessCode: false,
  id: eventId,
  ownerUserId: localUser.id,
  slug: "launch-night",
  title: "Launch Night",
  eventType: "launch",
  status: "draft",
  timezone: "Asia/Singapore",
  startsAt: "2026-12-01T11:00:00.000Z",
  endsAt: undefined,
  venueName: "Lumiere Hall",
  venueAddress: "1 Event Way",
  selectedThemeId: undefined,
  themeMode: "system",
  themeConfig: {},
  publicSettings: {},
  rsvpSettings: {
    collectGuestMessage: true,
    collectGuestNames: true,
  },
  createdAt: "2026-07-08T00:00:00.000Z",
  updatedAt: "2026-07-08T00:00:00.000Z",
};

const guestGroupId = "00000000-0000-4000-8000-000000000301";

const baseGuestGroup: GuestGroup = {
  id: guestGroupId,
  eventId,
  label: "Tan Family",
  contactName: "Mina Tan",
  contactEmail: "mina@example.com",
  maxPax: 4,
  inviteCode: "invitecode01",
  status: "pending",
  notes: "Window table",
  lastOpenedAt: "2026-07-08T03:00:00.000Z",
  createdAt: "2026-07-08T00:00:00.000Z",
  updatedAt: "2026-07-08T00:00:00.000Z",
};

const baseThemeState: EventThemeState = {
  eventId,
  eventStatus: "draft",
  eventType: "launch",
  selectedThemeId: "lumiere-default",
  themeConfig: {},
  themeMode: "system",
};

const baseSection = {
  id: "00000000-0000-4000-8000-000000000201",
  eventId,
  sectionType: "introduction",
  sectionKey: "welcome",
  sortOrder: 0,
  visibility: "public",
  enabled: true,
  content: {
    title: "Launch Night",
  },
  settings: {},
  createdAt: "2026-07-08T00:00:00.000Z",
  updatedAt: "2026-07-08T00:00:00.000Z",
} as const;

const guestOnlyRsvpSection: EventSection = {
  id: "00000000-0000-4000-8000-000000000203",
  eventId,
  sectionType: "rsvp",
  sectionKey: "rsvp",
  sortOrder: 2,
  visibility: "guest_only",
  enabled: true,
  content: {
    title: "RSVP",
  },
  settings: {},
  createdAt: "2026-07-08T00:00:00.000Z",
  updatedAt: "2026-07-08T00:00:00.000Z",
};

const publicEventRecord: PublicEventRecord = {
  event: {
    id: eventId,
    slug: baseEvent.slug,
    title: baseEvent.title,
    eventType: baseEvent.eventType,
    status: "published",
    timezone: baseEvent.timezone,
    startsAt: baseEvent.startsAt,
    endsAt: undefined,
    venueName: baseEvent.venueName,
    venueAddress: baseEvent.venueAddress,
    publicSettings: {},
  },
  rsvpFields: {
    collectGuestMessage: true,
    collectGuestNames: true,
  },
  selectedThemeId: "lumiere-default",
  sections: [baseSection],
  themeConfig: {},
  themeMode: "system",
};

const publicGuestInviteRecord: PublicGuestInviteRecord = {
  ...publicEventRecord,
  guest: {
    guestGroup: {
      label: baseGuestGroup.label,
      maxPax: baseGuestGroup.maxPax,
      status: "pending",
    },
    response: null,
    responseStatus: null,
  },
  sections: [baseSection, guestOnlyRsvpSection],
};

const baseRsvpResponse: RsvpResponse = {
  id: "00000000-0000-4000-8000-000000000401",
  eventId,
  guestGroupId,
  responseStatus: "attending",
  attendeeCount: 2,
  guestNames: ["Mina Tan", "Alex Tan"],
  answers: [],
  message: "Excited to attend.",
  submittedAt: "2026-07-08T04:00:00.000Z",
  updatedAt: "2026-07-08T04:00:00.000Z",
};

const eventSummary: EventSummary = {
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
};

const activityEvent: ActivityEvent = {
  id: "00000000-0000-4000-8000-000000000501",
  eventId,
  actorType: "guest",
  actorId: guestGroupId,
  activityType: "rsvp_submitted",
  metadata: {
    guestGroupLabel: baseGuestGroup.label,
  },
  createdAt: "2026-07-08T06:00:00.000Z",
};

const olderActivityEvent: ActivityEvent = {
  ...activityEvent,
  id: "00000000-0000-4000-8000-000000000502",
  activityType: "guest_invite_opened",
  createdAt: "2026-07-08T05:00:00.000Z",
};

const notification: Notification = {
  id: "00000000-0000-4000-8000-000000000601",
  eventId,
  userId: localUser.id,
  notificationType: "rsvp_submitted",
  title: "RSVP submitted",
  message: "Tan Family submitted an RSVP for Launch Night.",
  readAt: undefined,
  metadata: {
    guestGroupId,
  },
  createdAt: "2026-07-08T06:01:00.000Z",
};

describe("API config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("loads valid server environment", () => {
    for (const [key, value] of Object.entries(validApiEnv)) {
      vi.stubEnv(key, value);
    }

    expect(loadApiConfig()).toMatchObject({
      NODE_ENV: "test",
      PORT: 4000,
      SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
    });
  });

  it("fails fast when a required server secret is missing", () => {
    for (const [key, value] of Object.entries(validApiEnv)) {
      vi.stubEnv(key, value);
    }
    vi.stubEnv("INVITE_TOKEN_SECRET", "");

    expect(() => loadApiConfig()).toThrow("Invalid API environment");
  });
});

describe("API app", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("returns health status with propagated request ID", async () => {
    const app = createApp({ config: loadTestConfig() });
    const response = await app.request("/health", {
      headers: {
        "x-request-id": "request-from-test",
      },
    });

    await expect(response.json()).resolves.toEqual({
      status: "ok",
      service: "lumiere-api",
      environment: "test",
      requestId: "request-from-test",
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("x-request-id")).toBe("request-from-test");
  });

  it("builds the Vercel-compatible application without starting a server", async () => {
    const app = createApiApplication(loadTestConfig());
    const response = await app.request("/health");

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      service: "lumiere-api",
      status: "ok",
    });
  });

  it("generates request IDs when callers do not provide one", async () => {
    const app = createApp({ config: loadTestConfig() });
    const response = await app.request("/health");
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("x-request-id")).toEqual(expect.any(String));
    expect(body.requestId).toBe(response.headers.get("x-request-id"));
  });

  it("allows dashboard preflight requests", async () => {
    const app = createApp({ config: loadTestConfig() });
    const response = await app.request(`/events/${eventId}/summary`, {
      headers: {
        "access-control-request-headers": "authorization",
        "access-control-request-method": "GET",
        origin: validApiEnv.DASHBOARD_APP_BASE_URL,
      },
      method: "OPTIONS",
    });

    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-origin")).toBe(
      validApiEnv.DASHBOARD_APP_BASE_URL,
    );
    expect(response.headers.get("access-control-allow-methods")).toContain("GET");
    expect(response.headers.get("access-control-allow-headers")).toContain("Authorization");
  });

  it("exposes request IDs to allowed browser origins", async () => {
    const app = createApp({ config: loadTestConfig() });
    const response = await app.request("/health", {
      headers: {
        origin: validApiEnv.PUBLIC_APP_BASE_URL,
      },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("access-control-allow-origin")).toBe(
      validApiEnv.PUBLIC_APP_BASE_URL,
    );
    expect(response.headers.get("access-control-expose-headers")).toContain("X-Request-Id");
  });

  it("does not allow browser origins outside configured apps", async () => {
    const app = createApp({ config: loadTestConfig() });
    const response = await app.request("/health", {
      headers: {
        origin: "https://attacker.example",
      },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("access-control-allow-origin")).toBeNull();
  });

  it("returns the shared API error shape for known errors", async () => {
    const app = createApp({ config: loadTestConfig() });
    const response = await app.request("/__test/error", {
      headers: {
        "x-request-id": "error-request-id",
      },
    });

    await expect(response.json()).resolves.toEqual({
      error: {
        code: "BAD_REQUEST",
        message: "Test error",
        requestId: "error-request-id",
      },
    });
    expect(response.status).toBe(400);
  });

  it("returns the shared API error shape for unknown routes", async () => {
    const app = createApp({ config: loadTestConfig() });
    const response = await app.request("/missing", {
      headers: {
        "x-request-id": "missing-request-id",
      },
    });

    await expect(response.json()).resolves.toEqual({
      error: {
        code: "NOT_FOUND",
        message: "Route not found",
        requestId: "missing-request-id",
      },
    });
    expect(response.status).toBe(404);
  });

  it("resolves current manager from bearer token and mirrors the local profile", async () => {
    const { authStore, upsertUserProfile } = createTestAuthStore();
    const app = createApp({ authStore, config: loadTestConfig() });
    const response = await app.request("/__test/manager/me", {
      headers: {
        authorization: `Bearer ${createSupabaseToken({
          email: "MANAGER@example.com",
          sub: "supabase-user-id",
          user_metadata: {
            name: "Ada Manager",
          },
        })}`,
        "x-request-id": "auth-success-request-id",
      },
    });

    await expect(response.json()).resolves.toEqual({
      manager: {
        displayName: "Ada Manager",
        email: "manager@example.com",
        supabaseUserId: "supabase-user-id",
        userId: localUser.id,
      },
    });
    expect(response.status).toBe(200);
    expect(upsertUserProfile).toHaveBeenCalledWith({
      displayName: "Ada Manager",
      email: "manager@example.com",
      supabaseUserId: "supabase-user-id",
    });
  });

  it("resolves current manager from ES256 Supabase signing key tokens", async () => {
    const { token, jwk } = createSupabaseEs256Token({
      email: "MANAGER@example.com",
      sub: "supabase-user-id",
      user_metadata: {
        name: "Ada Manager",
      },
    });
    const fetchJwks = vi.fn(
      async () =>
        new Response(JSON.stringify({ keys: [jwk] }), {
          headers: {
            "content-type": "application/json",
          },
        }),
    );
    vi.stubGlobal("fetch", fetchJwks);
    const { authStore, upsertUserProfile } = createTestAuthStore();
    const app = createApp({ authStore, config: loadTestConfig() });
    const response = await app.request("/__test/manager/me", {
      headers: {
        authorization: `Bearer ${token}`,
        "x-request-id": "es256-auth-success-request-id",
      },
    });

    await expect(response.json()).resolves.toEqual({
      manager: {
        displayName: "Ada Manager",
        email: "manager@example.com",
        supabaseUserId: "supabase-user-id",
        userId: localUser.id,
      },
    });
    expect(response.status).toBe(200);
    expect(fetchJwks).toHaveBeenCalledWith(
      "https://example.supabase.co/auth/v1/.well-known/jwks.json",
    );
    expect(upsertUserProfile).toHaveBeenCalledWith({
      displayName: "Ada Manager",
      email: "manager@example.com",
      supabaseUserId: "supabase-user-id",
    });
  });

  it("returns 401 for missing manager bearer token", async () => {
    const { authStore } = createTestAuthStore();
    const app = createApp({ authStore, config: loadTestConfig() });
    const response = await app.request("/__test/manager/me", {
      headers: {
        "x-request-id": "missing-token-request-id",
      },
    });

    await expect(response.json()).resolves.toEqual({
      error: {
        code: "UNAUTHORIZED",
        message: "Missing bearer token",
        requestId: "missing-token-request-id",
      },
    });
    expect(response.status).toBe(401);
  });

  it("returns 401 for invalid manager bearer token", async () => {
    const { authStore } = createTestAuthStore();
    const app = createApp({ authStore, config: loadTestConfig() });
    const response = await app.request("/__test/manager/me", {
      headers: {
        authorization: `Bearer ${createSupabaseToken(
          {
            email: "manager@example.com",
            sub: "supabase-user-id",
          },
          "wrong-secret",
        )}`,
        "x-request-id": "invalid-token-request-id",
      },
    });

    await expect(response.json()).resolves.toEqual({
      error: {
        code: "UNAUTHORIZED",
        message: "Invalid bearer token",
        requestId: "invalid-token-request-id",
      },
    });
    expect(response.status).toBe(401);
  });

  it("allows event access when manager role satisfies the required role", async () => {
    const { authStore, findEventAccess } = createTestAuthStore({
      access: roleAccess("editor"),
    });
    const app = createApp({ authStore, config: loadTestConfig() });
    const response = await app.request(`/__test/events/${eventId}/access/viewer`, {
      headers: {
        authorization: `Bearer ${createSupabaseToken()}`,
        "x-request-id": "event-access-request-id",
      },
    });

    await expect(response.json()).resolves.toEqual({
      access: {
        eventId,
        role: "editor",
        userId: localUser.id,
      },
    });
    expect(response.status).toBe(200);
    expect(findEventAccess).toHaveBeenCalledWith(eventId, localUser.id);
  });

  it("returns 403 when manager does not have event access", async () => {
    const { authStore } = createTestAuthStore({
      access: {
        access: null,
        eventFound: true,
      },
    });
    const app = createApp({ authStore, config: loadTestConfig() });
    const response = await app.request(`/__test/events/${eventId}/access/viewer`, {
      headers: {
        authorization: `Bearer ${createSupabaseToken()}`,
        "x-request-id": "forbidden-request-id",
      },
    });

    await expect(response.json()).resolves.toEqual({
      error: {
        code: "FORBIDDEN",
        message: "Manager does not have access to this event",
        requestId: "forbidden-request-id",
      },
    });
    expect(response.status).toBe(403);
  });

  it("returns 403 when manager role is below the required role", async () => {
    const { authStore } = createTestAuthStore({
      access: roleAccess("viewer"),
    });
    const app = createApp({ authStore, config: loadTestConfig() });
    const response = await app.request(`/__test/events/${eventId}/access/editor`, {
      headers: {
        authorization: `Bearer ${createSupabaseToken()}`,
        "x-request-id": "insufficient-role-request-id",
      },
    });

    await expect(response.json()).resolves.toEqual({
      error: {
        code: "FORBIDDEN",
        message: "Manager does not have access to this event",
        requestId: "insufficient-role-request-id",
      },
    });
    expect(response.status).toBe(403);
  });

  it("returns 404 when the event cannot be resolved", async () => {
    const { authStore } = createTestAuthStore({
      access: {
        eventFound: false,
      },
    });
    const app = createApp({ authStore, config: loadTestConfig() });
    const response = await app.request(`/__test/events/${eventId}/access/viewer`, {
      headers: {
        authorization: `Bearer ${createSupabaseToken()}`,
        "x-request-id": "missing-event-request-id",
      },
    });

    await expect(response.json()).resolves.toEqual({
      error: {
        code: "NOT_FOUND",
        message: "Event not found",
        requestId: "missing-event-request-id",
      },
    });
    expect(response.status).toBe(404);
  });

  it("lists only events managed by the authenticated user", async () => {
    const { authStore } = createTestAuthStore();
    const { eventStore, listManagedEvents } = createTestEventStore({
      events: [baseEvent],
    });
    const app = createApp({ authStore, config: loadTestConfig(), eventStore });
    const response = await app.request("/events", {
      headers: {
        authorization: `Bearer ${createSupabaseToken()}`,
      },
    });

    await expect(response.json()).resolves.toEqual({
      events: [baseEvent],
    });
    expect(response.status).toBe(200);
    expect(listManagedEvents).toHaveBeenCalledWith(localUser.id);
  });

  it("creates an event for the authenticated manager", async () => {
    const { authStore } = createTestAuthStore();
    const createdEvent = {
      ...baseEvent,
      slug: "new-launch",
      title: "New Launch",
    };
    const { createEvent, eventStore } = createTestEventStore({
      createdEvent,
    });
    const app = createApp({ authStore, config: loadTestConfig(), eventStore });
    const response = await app.request("/events", {
      body: JSON.stringify({
        eventType: "launch",
        slug: "new-launch",
        startsAt: "2026-12-01T11:00:00.000Z",
        timezone: "Asia/Singapore",
        title: "New Launch",
      }),
      headers: {
        authorization: `Bearer ${createSupabaseToken()}`,
        "content-type": "application/json",
      },
      method: "POST",
    });

    await expect(response.json()).resolves.toEqual({
      event: createdEvent,
    });
    expect(response.status).toBe(201);
    expect(createEvent).toHaveBeenCalledWith(localUser.id, {
      eventType: "launch",
      publicSettings: {},
      rsvpSettings: {
        collectGuestMessage: true,
        collectGuestNames: true,
      },
      slug: "new-launch",
      startsAt: "2026-12-01T11:00:00.000Z",
      themeMode: "system",
      timezone: "Asia/Singapore",
      title: "New Launch",
    });
  });

  it("serializes database event timestamps as shared API datetimes", () => {
    const event = toApiEvent({
      createdAt: "2026-07-08 00:00:00+00",
      deletedAt: null,
      deletedByUserId: null,
      endsAt: null,
      eventType: "launch",
      id: eventId,
      ownerUserId: localUser.id,
      publicAccessCodeHash: null,
      publicSettingsJson: {},
      publicSlug: "new-launch",
      purgeAfter: null,
      rsvpSettingsJson: {},
      selectedThemeId: null,
      startsAt: "2026-12-01 11:00:00+00",
      status: "draft",
      themeConfigJson: {},
      themeMode: "system",
      timezone: "Asia/Singapore",
      title: "New Launch",
      updatedAt: "2026-07-08 00:00:00+00",
      venueAddress: null,
      venueName: null,
    } as Parameters<typeof toApiEvent>[0]);

    expect(eventResponseSchema.parse({ event })).toEqual({
      event: {
        ...event,
        createdAt: "2026-07-08T00:00:00.000Z",
        startsAt: "2026-12-01T11:00:00.000Z",
        updatedAt: "2026-07-08T00:00:00.000Z",
      },
    });
  });

  it("returns 409 when creating an event with a duplicate slug", async () => {
    const { authStore } = createTestAuthStore();
    const { createEvent, eventStore, isEventSlugAvailable } = createTestEventStore();
    isEventSlugAvailable.mockResolvedValue(false);
    const app = createApp({ authStore, config: loadTestConfig(), eventStore });
    const response = await app.request("/events", {
      body: JSON.stringify({
        eventType: "launch",
        slug: "launch-night",
        startsAt: "2026-12-01T11:00:00.000Z",
        timezone: "Asia/Singapore",
        title: "Launch Night",
      }),
      headers: {
        authorization: `Bearer ${createSupabaseToken()}`,
        "content-type": "application/json",
        "x-request-id": "duplicate-slug-request-id",
      },
      method: "POST",
    });

    await expect(response.json()).resolves.toEqual({
      error: {
        code: "CONFLICT",
        fields: [
          {
            message: "Choose another public event slug",
            path: ["slug"],
          },
        ],
        message: "Event slug is already in use",
        requestId: "duplicate-slug-request-id",
      },
    });
    expect(response.status).toBe(409);
    expect(createEvent).not.toHaveBeenCalled();
  });

  it("returns validation errors for invalid event create requests", async () => {
    const { authStore } = createTestAuthStore();
    const { createEvent, eventStore } = createTestEventStore();
    const app = createApp({ authStore, config: loadTestConfig(), eventStore });
    const response = await app.request("/events", {
      body: JSON.stringify({
        eventType: "launch",
        slug: "Launch Night",
        startsAt: "2026-12-01T11:00:00.000Z",
        timezone: "Asia/Singapore",
        title: "Launch Night",
      }),
      headers: {
        authorization: `Bearer ${createSupabaseToken()}`,
        "content-type": "application/json",
        "x-request-id": "invalid-create-request-id",
      },
      method: "POST",
    });
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body).toMatchObject({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request body",
        requestId: "invalid-create-request-id",
      },
    });
    expect(body.error.fields).toContainEqual({
      message: "Use lowercase letters, numbers, and hyphens",
      path: ["slug"],
    });
    expect(createEvent).not.toHaveBeenCalled();
  });

  it("rejects reserved public event slugs", async () => {
    const { authStore } = createTestAuthStore();
    const { createEvent, eventStore } = createTestEventStore();
    const app = createApp({ authStore, config: loadTestConfig(), eventStore });
    const response = await app.request("/events", {
      body: JSON.stringify({
        eventType: "launch",
        slug: "events",
        startsAt: "2026-12-01T11:00:00.000Z",
        timezone: "Asia/Singapore",
        title: "Launch Night",
      }),
      headers: {
        authorization: `Bearer ${createSupabaseToken()}`,
        "content-type": "application/json",
        "x-request-id": "reserved-slug-request-id",
      },
      method: "POST",
    });
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body).toMatchObject({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request body",
        requestId: "reserved-slug-request-id",
      },
    });
    expect(body.error.fields).toContainEqual({
      message: "This event slug is reserved",
      path: ["slug"],
    });
    expect(createEvent).not.toHaveBeenCalled();
  });

  it("suggests an available public slug from the event title", async () => {
    const { authStore } = createTestAuthStore();
    const { eventStore, isEventSlugAvailable } = createTestEventStore();
    isEventSlugAvailable.mockImplementation(async (candidate) => candidate !== "launch-night");
    const app = createApp({ authStore, config: loadTestConfig(), eventStore });
    const response = await app.request("/events/slug-suggestion?title=Launch%20Night", {
      headers: {
        authorization: `Bearer ${createSupabaseToken()}`,
      },
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.slug).toMatch(/^launch-night-[a-f0-9]{6}$/);
    expect(isEventSlugAvailable).toHaveBeenCalledWith("launch-night", {
      exceptEventId: undefined,
    });
  });

  it("gets an event after enforcing manager access", async () => {
    const { authStore, findEventAccess } = createTestAuthStore({
      access: roleAccess("viewer"),
    });
    const { eventStore, getEvent } = createTestEventStore({
      events: [baseEvent],
    });
    const app = createApp({ authStore, config: loadTestConfig(), eventStore });
    const response = await app.request(`/events/${eventId}`, {
      headers: {
        authorization: `Bearer ${createSupabaseToken()}`,
      },
    });

    await expect(response.json()).resolves.toEqual({
      event: baseEvent,
    });
    expect(response.status).toBe(200);
    expect(findEventAccess).toHaveBeenCalledWith(eventId, localUser.id);
    expect(getEvent).toHaveBeenCalledWith(eventId);
  });

  it("returns event summary counts for managers", async () => {
    const { authStore, findEventAccess } = createTestAuthStore({
      access: roleAccess("viewer"),
    });
    const { dashboardDataStore, getEventSummary } = createTestDashboardDataStore();
    const app = createApp({
      authStore,
      config: loadTestConfig(),
      dashboardDataStore,
    });
    const response = await app.request(`/events/${eventId}/summary`, {
      headers: {
        authorization: `Bearer ${createSupabaseToken()}`,
      },
    });

    await expect(response.json()).resolves.toEqual({
      summary: eventSummary,
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("pragma")).toBe("no-cache");
    expect(findEventAccess).toHaveBeenCalledWith(eventId, localUser.id);
    expect(getEventSummary).toHaveBeenCalledWith(eventId);
  });

  it("returns publishing readiness from the same manager settings source", async () => {
    const { authStore } = createTestAuthStore({
      access: roleAccess("viewer"),
    });
    const themeBlocker = {
      code: "theme.selection",
      destination: "theme" as const,
      message: "Select a valid theme before publishing",
      path: ["selectedThemeId"],
    };
    const publishingReadiness = createPublishingReadiness({
      blockers: [themeBlocker],
      issues: [{ message: themeBlocker.message, path: themeBlocker.path }],
      ready: false,
      theme: undefined,
    });
    const { eventStore, getPublishingReadiness } = createTestEventStore({
      publishingReadiness,
    });
    const app = createApp({ authStore, config: loadTestConfig(), eventStore });
    const response = await app.request(`/events/${eventId}/publish-readiness`, {
      headers: {
        authorization: `Bearer ${createSupabaseToken()}`,
      },
    });
    const { publicPath: _publicPath, ...diagnostics } = publishingReadiness;

    await expect(response.json()).resolves.toEqual({
      readiness: {
        ...diagnostics,
        publicUrl: "http://localhost:3000/e/launch-night",
      },
    });
    expect(response.status).toBe(200);
    expect(getPublishingReadiness).toHaveBeenCalledWith(eventId);
  });

  it("rejects non-UUID manager event IDs before querying stores", async () => {
    const { authStore, findEventAccess } = createTestAuthStore({
      access: roleAccess("viewer"),
    });
    const { dashboardDataStore, getEventSummary } = createTestDashboardDataStore();
    const app = createApp({
      authStore,
      config: loadTestConfig(),
      dashboardDataStore,
    });
    const response = await app.request("/events/demo-event/summary", {
      headers: {
        authorization: `Bearer ${createSupabaseToken()}`,
        "x-request-id": "invalid-event-id-request-id",
      },
    });

    await expect(response.json()).resolves.toEqual({
      error: {
        code: "VALIDATION_ERROR",
        fields: [
          {
            message: "Must be a valid UUID",
            path: ["eventId"],
          },
        ],
        message: "Invalid event ID",
        requestId: "invalid-event-id-request-id",
      },
    });
    expect(response.status).toBe(422);
    expect(findEventAccess).not.toHaveBeenCalled();
    expect(getEventSummary).not.toHaveBeenCalled();
  });

  it("returns recent activity ordered by creation time", async () => {
    const { authStore } = createTestAuthStore({
      access: roleAccess("viewer"),
    });
    const { dashboardDataStore, listActivity } = createTestDashboardDataStore({
      activity: [activityEvent, olderActivityEvent],
    });
    const app = createApp({
      authStore,
      config: loadTestConfig(),
      dashboardDataStore,
    });
    const response = await app.request(`/events/${eventId}/activity`, {
      headers: {
        authorization: `Bearer ${createSupabaseToken()}`,
      },
    });

    await expect(response.json()).resolves.toEqual({
      activity: [activityEvent, olderActivityEvent],
    });
    expect(response.status).toBe(200);
    expect(listActivity).toHaveBeenCalledWith(eventId);
  });

  it("returns in-app notifications for the current manager", async () => {
    const { authStore } = createTestAuthStore({
      access: roleAccess("viewer"),
    });
    const { dashboardDataStore, listNotifications } = createTestDashboardDataStore({
      notifications: [notification],
    });
    const app = createApp({
      authStore,
      config: loadTestConfig(),
      dashboardDataStore,
    });
    const response = await app.request(`/events/${eventId}/notifications`, {
      headers: {
        authorization: `Bearer ${createSupabaseToken()}`,
      },
    });

    await expect(response.json()).resolves.toEqual({
      notifications: [notification],
    });
    expect(response.status).toBe(200);
    expect(listNotifications).toHaveBeenCalledWith(eventId, localUser.id);
  });

  it("marks an owned notification as read", async () => {
    const { authStore } = createTestAuthStore({
      access: roleAccess("viewer"),
    });
    const readNotification = {
      ...notification,
      readAt: "2026-07-08T06:02:00.000Z",
    };
    const { dashboardDataStore, markNotificationRead } = createTestDashboardDataStore();
    markNotificationRead.mockResolvedValue(readNotification);
    const app = createApp({
      authStore,
      config: loadTestConfig(),
      dashboardDataStore,
    });
    const response = await app.request(`/events/${eventId}/notifications/${notification.id}/read`, {
      headers: {
        authorization: `Bearer ${createSupabaseToken()}`,
      },
      method: "PATCH",
    });

    await expect(response.json()).resolves.toEqual({ notification: readNotification });
    expect(response.status).toBe(200);
    expect(markNotificationRead).toHaveBeenCalledWith(eventId, notification.id, localUser.id);
  });

  it("dismisses an owned notification without deleting activity data", async () => {
    const { authStore } = createTestAuthStore({
      access: roleAccess("viewer"),
    });
    const { dashboardDataStore, dismissNotification } = createTestDashboardDataStore();
    const app = createApp({
      authStore,
      config: loadTestConfig(),
      dashboardDataStore,
    });
    const response = await app.request(`/events/${eventId}/notifications/${notification.id}`, {
      headers: {
        authorization: `Bearer ${createSupabaseToken()}`,
      },
      method: "DELETE",
    });

    await expect(response.json()).resolves.toEqual({ dismissed: true });
    expect(response.status).toBe(200);
    expect(dismissNotification).toHaveBeenCalledWith(eventId, notification.id, localUser.id);
  });

  it("marks all owned notifications as read", async () => {
    const { authStore } = createTestAuthStore({
      access: roleAccess("viewer"),
    });
    const { dashboardDataStore, markAllNotificationsRead } = createTestDashboardDataStore();
    markAllNotificationsRead.mockResolvedValue(3);
    const app = createApp({
      authStore,
      config: loadTestConfig(),
      dashboardDataStore,
    });
    const response = await app.request(`/events/${eventId}/notifications/read-all`, {
      headers: {
        authorization: `Bearer ${createSupabaseToken()}`,
      },
      method: "POST",
    });

    await expect(response.json()).resolves.toEqual({ updatedCount: 3 });
    expect(response.status).toBe(200);
    expect(markAllNotificationsRead).toHaveBeenCalledWith(eventId, localUser.id);
  });

  it("rejects notification mutations for managers without event access", async () => {
    const { authStore } = createTestAuthStore({
      access: { access: null, eventFound: true },
    });
    const { dashboardDataStore, dismissNotification } = createTestDashboardDataStore();
    const app = createApp({
      authStore,
      config: loadTestConfig(),
      dashboardDataStore,
    });
    const response = await app.request(`/events/${eventId}/notifications/${notification.id}`, {
      headers: {
        authorization: `Bearer ${createSupabaseToken()}`,
      },
      method: "DELETE",
    });

    expect(response.status).toBe(403);
    expect(dismissNotification).not.toHaveBeenCalled();
  });

  it("requires manager auth before returning event summary", async () => {
    const { dashboardDataStore, getEventSummary } = createTestDashboardDataStore();
    const app = createApp({
      authStore: createTestAuthStore().authStore,
      config: loadTestConfig(),
      dashboardDataStore,
    });
    const response = await app.request(`/events/${eventId}/summary`, {
      headers: {
        "x-request-id": "summary-auth-request-id",
      },
    });

    await expect(response.json()).resolves.toEqual({
      error: {
        code: "UNAUTHORIZED",
        message: "Missing bearer token",
        requestId: "summary-auth-request-id",
      },
    });
    expect(response.status).toBe(401);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("pragma")).toBe("no-cache");
    expect(getEventSummary).not.toHaveBeenCalled();
  });

  it("updates an event when manager has editor access", async () => {
    const updatedEvent = {
      ...baseEvent,
      eventType: "dinner" as const,
      status: "published" as const,
      title: "Updated Launch",
      updatedAt: "2026-07-08T01:00:00.000Z",
    };
    const { authStore } = createTestAuthStore({
      access: roleAccess("editor"),
    });
    const { eventStore, updateEvent } = createTestEventStore({
      updatedEvent,
    });
    const app = createApp({ authStore, config: loadTestConfig(), eventStore });
    const response = await app.request(`/events/${eventId}`, {
      body: JSON.stringify({
        eventType: "dinner",
        expectedUpdatedAt: baseEvent.updatedAt,
        status: "published",
        title: "Updated Launch",
      }),
      headers: {
        authorization: `Bearer ${createSupabaseToken()}`,
        "content-type": "application/json",
      },
      method: "PATCH",
    });

    await expect(response.json()).resolves.toEqual({
      event: updatedEvent,
    });
    expect(response.status).toBe(200);
    expect(updateEvent).toHaveBeenCalledWith(eventId, {
      actorUserId: localUser.id,
      eventType: "dinner",
      expectedUpdatedAt: baseEvent.updatedAt,
      status: "published",
      title: "Updated Launch",
    });

    updateEvent.mockRejectedValueOnce(
      new ApiHttpError("CONFLICT", "Event changed since publishing readiness was checked"),
    );
    const conflictResponse = await app.request(`/events/${eventId}`, {
      body: JSON.stringify({
        expectedUpdatedAt: baseEvent.updatedAt,
        status: "published",
      }),
      headers: {
        authorization: `Bearer ${createSupabaseToken()}`,
        "content-type": "application/json",
        "x-request-id": "publish-conflict-request",
      },
      method: "PATCH",
    });

    expect(conflictResponse.status).toBe(409);
    await expect(conflictResponse.json()).resolves.toMatchObject({
      error: {
        code: "CONFLICT",
        message: "Event changed since publishing readiness was checked",
      },
    });
  });

  it("updates an event slug when the public slug is available", async () => {
    const updatedEvent = {
      ...baseEvent,
      slug: "updated-launch",
      updatedAt: "2026-07-08T01:00:00.000Z",
    };
    const { authStore } = createTestAuthStore({
      access: roleAccess("editor"),
    });
    const { eventStore, isEventSlugAvailable, updateEvent } = createTestEventStore({
      updatedEvent,
    });
    const app = createApp({ authStore, config: loadTestConfig(), eventStore });
    const response = await app.request(`/events/${eventId}`, {
      body: JSON.stringify({
        slug: "updated-launch",
      }),
      headers: {
        authorization: `Bearer ${createSupabaseToken()}`,
        "content-type": "application/json",
      },
      method: "PATCH",
    });

    await expect(response.json()).resolves.toEqual({
      event: updatedEvent,
    });
    expect(response.status).toBe(200);
    expect(isEventSlugAvailable).toHaveBeenCalledWith("updated-launch", {
      exceptEventId: eventId,
    });
    expect(updateEvent).toHaveBeenCalledWith(eventId, {
      slug: "updated-launch",
    });
  });

  it("returns 409 when editing to a duplicate public slug", async () => {
    const { authStore } = createTestAuthStore({
      access: roleAccess("editor"),
    });
    const { eventStore, isEventSlugAvailable, updateEvent } = createTestEventStore();
    isEventSlugAvailable.mockResolvedValue(false);
    const app = createApp({ authStore, config: loadTestConfig(), eventStore });
    const response = await app.request(`/events/${eventId}`, {
      body: JSON.stringify({
        slug: "taken-launch",
      }),
      headers: {
        authorization: `Bearer ${createSupabaseToken()}`,
        "content-type": "application/json",
        "x-request-id": "duplicate-slug-edit-request-id",
      },
      method: "PATCH",
    });

    await expect(response.json()).resolves.toEqual({
      error: {
        code: "CONFLICT",
        fields: [
          {
            message: "Choose another public event slug",
            path: ["slug"],
          },
        ],
        message: "Event slug is already in use",
        requestId: "duplicate-slug-edit-request-id",
      },
    });
    expect(response.status).toBe(409);
    expect(updateEvent).not.toHaveBeenCalled();
  });

  it("blocks event updates when manager only has viewer access", async () => {
    const { authStore } = createTestAuthStore({
      access: roleAccess("viewer"),
    });
    const { eventStore, updateEvent } = createTestEventStore();
    const app = createApp({ authStore, config: loadTestConfig(), eventStore });
    const response = await app.request(`/events/${eventId}`, {
      body: JSON.stringify({
        title: "Viewer Update",
      }),
      headers: {
        authorization: `Bearer ${createSupabaseToken()}`,
        "content-type": "application/json",
        "x-request-id": "viewer-update-request-id",
      },
      method: "PATCH",
    });

    await expect(response.json()).resolves.toEqual({
      error: {
        code: "FORBIDDEN",
        message: "Manager does not have access to this event",
        requestId: "viewer-update-request-id",
      },
    });
    expect(response.status).toBe(403);
    expect(updateEvent).not.toHaveBeenCalled();
  });

  it("soft deletes an owner-confirmed event and restores it as a draft", async () => {
    const publishedEvent = {
      ...baseEvent,
      status: "published" as const,
    };
    const deletedEvent = {
      ...publishedEvent,
      deletedAt: "2026-07-08T02:00:00.000Z",
      purgeAfter: "2026-08-07T02:00:00.000Z",
      status: "archived" as const,
      updatedAt: "2026-07-08T02:00:00.000Z",
    };
    const restoredEvent = {
      ...baseEvent,
      status: "draft" as const,
      updatedAt: "2026-07-08T03:00:00.000Z",
    };
    const { authStore } = createTestAuthStore({
      access: roleAccess("owner"),
    });
    const { deleteEvent, eventStore, restoreEvent } = createTestEventStore({
      deletedEvent,
      events: [publishedEvent],
      restoredEvent,
    });
    const app = createApp({ authStore, config: loadTestConfig(), eventStore });
    const response = await app.request(`/events/${eventId}`, {
      body: JSON.stringify({ confirmationTitle: baseEvent.title }),
      headers: {
        authorization: `Bearer ${createSupabaseToken()}`,
        "content-type": "application/json",
      },
      method: "DELETE",
    });

    await expect(response.json()).resolves.toEqual({
      event: deletedEvent,
    });
    expect(response.status).toBe(200);
    expect(deleteEvent).toHaveBeenCalledWith(eventId, localUser.id, baseEvent.title);

    const repeatedDeleteResponse = await app.request(`/events/${eventId}`, {
      body: JSON.stringify({ confirmationTitle: baseEvent.title }),
      headers: {
        authorization: `Bearer ${createSupabaseToken()}`,
        "content-type": "application/json",
      },
      method: "DELETE",
    });

    await expect(repeatedDeleteResponse.json()).resolves.toEqual({ event: deletedEvent });
    expect(repeatedDeleteResponse.status).toBe(200);
    expect(deleteEvent).toHaveBeenCalledTimes(2);

    const restoreResponse = await app.request(`/events/${eventId}/restore`, {
      headers: {
        authorization: `Bearer ${createSupabaseToken()}`,
      },
      method: "POST",
    });

    await expect(restoreResponse.json()).resolves.toEqual({ event: restoredEvent });
    expect(restoreResponse.status).toBe(200);
    expect(restoreEvent).toHaveBeenCalledWith(eventId, localUser.id);
  });

  it("returns registry-backed theme metadata", async () => {
    const app = createApp({ config: loadTestConfig() });
    const response = await app.request("/themes");
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.themes).toContainEqual(toApiTheme(getTheme("premium")!));
    expect(JSON.stringify(body)).not.toContain("rendererKey");
  });

  it("returns one theme definition without renderer code", async () => {
    const app = createApp({ config: loadTestConfig() });
    const response = await app.request("/themes/premium");

    await expect(response.json()).resolves.toEqual({
      theme: toApiTheme(getTheme("premium")!),
    });
    expect(response.status).toBe(200);
  });

  it("returns 404 for unknown themes", async () => {
    const app = createApp({ config: loadTestConfig() });
    const response = await app.request("/themes/unknown", {
      headers: {
        "x-request-id": "unknown-theme-request-id",
      },
    });

    await expect(response.json()).resolves.toEqual({
      error: {
        code: "NOT_FOUND",
        message: "Theme not found",
        requestId: "unknown-theme-request-id",
      },
    });
    expect(response.status).toBe(404);
  });

  it("gets event theme after enforcing manager access", async () => {
    const { authStore, findEventAccess } = createTestAuthStore({
      access: roleAccess("viewer"),
    });
    const { getEventTheme, themeSectionStore } = createTestThemeSectionStore();
    const app = createApp({
      authStore,
      config: loadTestConfig(),
      themeSectionStore,
    });
    const response = await app.request(`/events/${eventId}/theme`, {
      headers: {
        authorization: `Bearer ${createSupabaseToken()}`,
      },
    });

    await expect(response.json()).resolves.toEqual({
      selectedThemeId: "lumiere-default",
      theme: toApiTheme(getTheme("lumiere-default")!),
      themeConfig: {},
      themeMode: "system",
    });
    expect(response.status).toBe(200);
    expect(findEventAccess).toHaveBeenCalledWith(eventId, localUser.id);
    expect(getEventTheme).toHaveBeenCalledWith(eventId);
  });

  it("updates event theme when manager has editor access", async () => {
    const updatedThemeState: EventThemeState = {
      ...baseThemeState,
      eventType: "launch",
      selectedThemeId: "lumiere-default",
      themeConfig: {
        heroStyle: "editorial",
      },
      themeMode: "dark",
    };
    const { authStore } = createTestAuthStore({
      access: roleAccess("editor"),
    });
    const { themeSectionStore, updateEventTheme } = createTestThemeSectionStore({
      themeState: {
        ...baseThemeState,
        eventType: "launch",
      },
      updatedThemeState,
    });
    const app = createApp({
      authStore,
      config: loadTestConfig(),
      themeSectionStore,
    });
    const response = await app.request(`/events/${eventId}/theme`, {
      body: JSON.stringify({
        selectedThemeId: "lumiere-default",
        themeConfig: {
          heroStyle: "editorial",
        },
        themeMode: "dark",
      }),
      headers: {
        authorization: `Bearer ${createSupabaseToken()}`,
        "content-type": "application/json",
      },
      method: "PUT",
    });

    await expect(response.json()).resolves.toEqual({
      selectedThemeId: "lumiere-default",
      theme: toApiTheme(getTheme("lumiere-default")!),
      themeConfig: {
        heroStyle: "editorial",
      },
      themeMode: "dark",
    });
    expect(response.status).toBe(200);
    expect(updateEventTheme).toHaveBeenCalledWith(eventId, {
      selectedThemeId: "lumiere-default",
      themeConfig: {
        heroStyle: "editorial",
      },
      themeMode: "dark",
    });
  });

  it("rejects theme updates that do not support the event type", async () => {
    const { authStore } = createTestAuthStore({
      access: roleAccess("editor"),
    });
    const { themeSectionStore, updateEventTheme } = createTestThemeSectionStore({
      themeState: {
        ...baseThemeState,
        eventType: "kids_party",
      },
    });
    const app = createApp({
      authStore,
      config: loadTestConfig(),
      themeSectionStore,
    });
    const response = await app.request(`/events/${eventId}/theme`, {
      body: JSON.stringify({
        selectedThemeId: "premium",
        themeConfig: {},
        themeMode: "light",
      }),
      headers: {
        authorization: `Bearer ${createSupabaseToken()}`,
        "content-type": "application/json",
        "x-request-id": "unsupported-theme-request-id",
      },
      method: "PUT",
    });
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body).toMatchObject({
      error: {
        code: "VALIDATION_ERROR",
        message: "Theme does not support this event type",
        requestId: "unsupported-theme-request-id",
      },
    });
    expect(body.error.fields).toContainEqual({
      message: "Premium does not support kids_party events",
      path: ["selectedThemeId"],
    });
    expect(updateEventTheme).not.toHaveBeenCalled();
  });

  it("returns ordered configured sections after enforcing manager access", async () => {
    const laterSection = {
      ...baseSection,
      id: "00000000-0000-4000-8000-000000000202",
      sectionKey: "date",
      sectionType: "date",
      sortOrder: 1,
      content: {
        startsAt: "2026-12-01T11:00:00.000Z",
        timezone: "Asia/Singapore",
      },
    } as const;
    const { authStore } = createTestAuthStore({
      access: roleAccess("viewer"),
    });
    const { listSections, themeSectionStore } = createTestThemeSectionStore({
      sections: [baseSection, laterSection],
    });
    const app = createApp({
      authStore,
      config: loadTestConfig(),
      themeSectionStore,
    });
    const response = await app.request(`/events/${eventId}/sections`, {
      headers: {
        authorization: `Bearer ${createSupabaseToken()}`,
      },
    });

    await expect(response.json()).resolves.toEqual({
      sections: [baseSection, laterSection],
    });
    expect(response.status).toBe(200);
    expect(listSections).toHaveBeenCalledWith(eventId);
  });

  it("validates and replaces configured sections", async () => {
    const { authStore } = createTestAuthStore({
      access: roleAccess("editor"),
    });
    const { replaceSections, themeSectionStore } = createTestThemeSectionStore({
      sections: [baseSection],
    });
    const app = createApp({
      authStore,
      config: loadTestConfig(),
      themeSectionStore,
    });
    const response = await app.request(`/events/${eventId}/sections`, {
      body: JSON.stringify({
        sections: [
          {
            content: {
              title: "Launch Night",
            },
            sectionKey: "welcome",
            sectionType: "introduction",
            settings: {},
            sortOrder: 0,
            visibility: "public",
          },
        ],
      }),
      headers: {
        authorization: `Bearer ${createSupabaseToken()}`,
        "content-type": "application/json",
      },
      method: "PUT",
    });

    await expect(response.json()).resolves.toEqual({
      sections: [baseSection],
    });
    expect(response.status).toBe(200);
    expect(replaceSections).toHaveBeenCalledWith(eventId, [
      {
        content: {
          title: "Launch Night",
        },
        enabled: true,
        sectionKey: "welcome",
        sectionType: "introduction",
        settings: {},
        sortOrder: 0,
        visibility: "public",
      },
    ]);
  });

  it("allows incomplete section drafts without changing the published snapshot", async () => {
    const { authStore } = createTestAuthStore({
      access: roleAccess("editor"),
    });
    const { replaceSections, themeSectionStore } = createTestThemeSectionStore({
      themeState: {
        ...baseThemeState,
        eventStatus: "published",
        eventType: "launch",
        selectedThemeId: "lumiere-default",
        themeMode: "light",
      },
    });
    const app = createApp({
      authStore,
      config: loadTestConfig(),
      themeSectionStore,
    });
    const response = await app.request(`/events/${eventId}/sections`, {
      body: JSON.stringify({
        sections: [
          {
            content: {
              title: "Launch Night",
            },
            sectionKey: "welcome",
            sectionType: "introduction",
            settings: {},
            sortOrder: 0,
            visibility: "public",
          },
        ],
      }),
      headers: {
        authorization: `Bearer ${createSupabaseToken()}`,
        "content-type": "application/json",
      },
      method: "PUT",
    });

    await expect(response.json()).resolves.toEqual({ sections: [baseSection] });
    expect(response.status).toBe(200);
    expect(replaceSections).toHaveBeenCalledWith(eventId, [
      {
        content: { title: "Launch Night" },
        enabled: true,
        sectionKey: "welcome",
        sectionType: "introduction",
        settings: {},
        sortOrder: 0,
        visibility: "public",
      },
    ]);
  });

  it("rejects sections unsupported by the event type blueprint", async () => {
    const { authStore } = createTestAuthStore({
      access: roleAccess("editor"),
    });
    const { replaceSections, themeSectionStore } = createTestThemeSectionStore({
      themeState: {
        ...baseThemeState,
        eventType: "kids_party",
        selectedThemeId: "kids",
        themeMode: "light",
      },
    });
    const app = createApp({
      authStore,
      config: loadTestConfig(),
      themeSectionStore,
    });
    const response = await app.request(`/events/${eventId}/sections`, {
      body: JSON.stringify({
        sections: [
          {
            content: {
              people: [{ name: "Host" }],
              title: "Hosts",
            },
            sectionKey: "hosts",
            sectionType: "profile",
            settings: {},
            sortOrder: 0,
            visibility: "public",
          },
        ],
      }),
      headers: {
        authorization: `Bearer ${createSupabaseToken()}`,
        "content-type": "application/json",
        "x-request-id": "unsupported-event-section-request-id",
      },
      method: "PUT",
    });
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error.fields).toContainEqual({
      message: "Profile is not supported for Kids party events",
      path: ["sections", 0, "sectionType"],
    });
    expect(replaceSections).not.toHaveBeenCalled();
  });

  it("rejects sections that violate registry schemas", async () => {
    const { authStore } = createTestAuthStore({
      access: roleAccess("editor"),
    });
    const { replaceSections, themeSectionStore } = createTestThemeSectionStore({
      themeState: {
        ...baseThemeState,
        eventType: "dinner",
        selectedThemeId: "premium",
        themeMode: "light",
      },
    });
    const app = createApp({
      authStore,
      config: loadTestConfig(),
      themeSectionStore,
    });
    const response = await app.request(`/events/${eventId}/sections`, {
      body: JSON.stringify({
        sections: [
          {
            content: {
              title: "RSVP",
            },
            sectionKey: "rsvp",
            sectionType: "rsvp",
            settings: {},
            sortOrder: 0,
            visibility: "public",
          },
        ],
      }),
      headers: {
        authorization: `Bearer ${createSupabaseToken()}`,
        "content-type": "application/json",
        "x-request-id": "invalid-section-request-id",
      },
      method: "PUT",
    });
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body).toMatchObject({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid event sections",
        requestId: "invalid-section-request-id",
      },
    });
    expect(body.error.fields).toContainEqual({
      message: "RSVP sections cannot be public",
      path: ["sections", 0],
    });
    expect(replaceSections).not.toHaveBeenCalled();
  });

  it("rejects unsafe section content before replacing configured sections", async () => {
    const { authStore } = createTestAuthStore({
      access: roleAccess("editor"),
    });
    const { replaceSections, themeSectionStore } = createTestThemeSectionStore({
      themeState: {
        ...baseThemeState,
        eventType: "dinner",
        selectedThemeId: "premium",
        themeMode: "light",
      },
    });
    const app = createApp({
      authStore,
      config: loadTestConfig(),
      themeSectionStore,
    });
    const response = await app.request(`/events/${eventId}/sections`, {
      body: JSON.stringify({
        sections: [
          {
            content: {
              title: "Welcome",
              body: '<script>alert("bad")</script>',
            },
            sectionKey: "welcome",
            sectionType: "introduction",
            settings: {},
            sortOrder: 0,
            visibility: "public",
          },
        ],
      }),
      headers: {
        authorization: `Bearer ${createSupabaseToken()}`,
        "content-type": "application/json",
        "x-request-id": "unsafe-section-request-id",
      },
      method: "PUT",
    });
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body).toMatchObject({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid event sections",
        requestId: "unsafe-section-request-id",
      },
    });
    expect(body.error.fields).toContainEqual({
      message: "welcome: content.body contains unsafe markup or script",
      path: ["sections", 0],
    });
    expect(replaceSections).not.toHaveBeenCalled();
  });

  it("lists guest groups after enforcing manager access", async () => {
    const { authStore, findEventAccess } = createTestAuthStore({
      access: roleAccess("viewer"),
    });
    const { guestGroupStore, listGuestGroups } = createTestGuestGroupStore({
      guestGroups: [baseGuestGroup],
    });
    const app = createApp({
      authStore,
      config: loadTestConfig(),
      eventStore: createTestEventStore().eventStore,
      guestGroupStore,
    });
    const response = await app.request(`/events/${eventId}/guest-groups`, {
      headers: {
        authorization: `Bearer ${createSupabaseToken()}`,
      },
    });

    await expect(response.json()).resolves.toEqual({
      guestGroups: [baseGuestGroup],
    });
    expect(response.status).toBe(200);
    expect(findEventAccess).toHaveBeenCalledWith(eventId, localUser.id);
    expect(listGuestGroups).toHaveBeenCalledWith(eventId);
  });

  it("creates guest groups with high-entropy invite links and hashed stored tokens", async () => {
    const { authStore } = createTestAuthStore({
      access: roleAccess("editor"),
    });
    const { createGuestGroup, guestGroupStore } = createTestGuestGroupStore({
      createdGuestGroup: baseGuestGroup,
    });
    const app = createApp({
      authStore,
      config: loadTestConfig(),
      eventStore: createTestEventStore().eventStore,
      guestGroupStore,
    });
    const response = await app.request(`/events/${eventId}/guest-groups`, {
      body: JSON.stringify({
        contactEmail: "mina@example.com",
        contactName: "Mina Tan",
        label: "Tan Family",
        maxPax: 4,
        members: [{ name: "Mina Tan" }, { name: "Alex Tan" }],
        notes: "Window table",
      }),
      headers: {
        authorization: `Bearer ${createSupabaseToken()}`,
        "content-type": "application/json",
      },
      method: "POST",
    });
    const body = await response.json();
    const guestToken = extractGuestToken(body.inviteLink);
    const inviteRecord = createGuestGroup.mock.calls[0]?.[2];

    expect(response.status).toBe(201);
    expect(body).toEqual({
      guestGroup: baseGuestGroup,
      inviteLink: `http://localhost:3000/e/${baseEvent.slug}/g/${guestToken}`,
    });
    expect(guestToken.length).toBeGreaterThanOrEqual(32);
    expect(createGuestGroup).toHaveBeenCalledWith(
      eventId,
      {
        contactEmail: "mina@example.com",
        contactName: "Mina Tan",
        label: "Tan Family",
        maxPax: 4,
        members: [{ name: "Mina Tan" }, { name: "Alex Tan" }],
        notes: "Window table",
      },
      expect.objectContaining({
        inviteCode: expect.any(String),
        inviteTokenHash: hashInviteToken(guestToken, validApiEnv.INVITE_TOKEN_SECRET),
      }),
    );
    expect(JSON.stringify(inviteRecord)).not.toContain(guestToken);
  });

  it("rejects guest group max pax below one", async () => {
    const { authStore } = createTestAuthStore({
      access: roleAccess("editor"),
    });
    const { createGuestGroup, guestGroupStore } = createTestGuestGroupStore();
    const app = createApp({
      authStore,
      config: loadTestConfig(),
      eventStore: createTestEventStore().eventStore,
      guestGroupStore,
    });
    const response = await app.request(`/events/${eventId}/guest-groups`, {
      body: JSON.stringify({
        label: "Invalid group",
        maxPax: 0,
      }),
      headers: {
        authorization: `Bearer ${createSupabaseToken()}`,
        "content-type": "application/json",
        "x-request-id": "invalid-max-pax-request-id",
      },
      method: "POST",
    });
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body).toMatchObject({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request body",
        requestId: "invalid-max-pax-request-id",
      },
    });
    expect(body.error.fields).toContainEqual({
      message: "Too small: expected number to be >=1",
      path: ["maxPax"],
    });
    expect(createGuestGroup).not.toHaveBeenCalled();
  });

  it("updates guest group fields after enforcing editor access", async () => {
    const updatedGuestGroup = {
      ...baseGuestGroup,
      label: "Tan and Lee Family",
      maxPax: 5,
      status: "opened" as const,
    };
    const { authStore } = createTestAuthStore({
      access: roleAccess("editor"),
    });
    const { guestGroupStore, updateGuestGroup } = createTestGuestGroupStore({
      updatedGuestGroup,
    });
    const app = createApp({
      authStore,
      config: loadTestConfig(),
      eventStore: createTestEventStore().eventStore,
      guestGroupStore,
    });
    const response = await app.request(`/events/${eventId}/guest-groups/${guestGroupId}`, {
      body: JSON.stringify({
        contactEmail: "mina@example.com",
        contactName: "Mina Tan",
        label: "Tan and Lee Family",
        maxPax: 5,
        members: [
          { id: "member_2", name: "Alex Tan" },
          { id: "member_1", name: "Mina Tan" },
        ],
        notes: "Window table",
        status: "opened",
      }),
      headers: {
        authorization: `Bearer ${createSupabaseToken()}`,
        "content-type": "application/json",
      },
      method: "PATCH",
    });

    await expect(response.json()).resolves.toEqual({
      guestGroup: updatedGuestGroup,
    });
    expect(response.status).toBe(200);
    expect(updateGuestGroup).toHaveBeenCalledWith(eventId, guestGroupId, {
      contactEmail: "mina@example.com",
      contactName: "Mina Tan",
      label: "Tan and Lee Family",
      maxPax: 5,
      members: [
        { id: "member_2", name: "Alex Tan" },
        { id: "member_1", name: "Mina Tan" },
      ],
      notes: "Window table",
      status: "opened",
    });
  });

  it("disables guest groups instead of exposing hard deletes", async () => {
    const disabledGuestGroup = {
      ...baseGuestGroup,
      status: "disabled" as const,
    };
    const { authStore } = createTestAuthStore({
      access: roleAccess("editor"),
    });
    const { disableGuestGroup, guestGroupStore } = createTestGuestGroupStore({
      disabledGuestGroup,
    });
    const app = createApp({
      authStore,
      config: loadTestConfig(),
      eventStore: createTestEventStore().eventStore,
      guestGroupStore,
    });
    const response = await app.request(`/events/${eventId}/guest-groups/${guestGroupId}`, {
      headers: {
        authorization: `Bearer ${createSupabaseToken()}`,
      },
      method: "DELETE",
    });

    await expect(response.json()).resolves.toEqual({
      guestGroup: disabledGuestGroup,
    });
    expect(response.status).toBe(200);
    expect(disableGuestGroup).toHaveBeenCalledWith(eventId, guestGroupId);
  });

  it("regenerates invite links with new hashed tokens", async () => {
    const regeneratedGuestGroup = {
      ...baseGuestGroup,
      inviteCode: "newinvite01",
      status: "pending" as const,
    };
    const { authStore } = createTestAuthStore({
      access: roleAccess("editor"),
    });
    const { guestGroupStore, regenerateInvite } = createTestGuestGroupStore({
      regeneratedGuestGroup,
    });
    const app = createApp({
      authStore,
      config: loadTestConfig(),
      eventStore: createTestEventStore().eventStore,
      guestGroupStore,
    });
    const response = await app.request(
      `/events/${eventId}/guest-groups/${guestGroupId}/regenerate-link`,
      {
        headers: {
          authorization: `Bearer ${createSupabaseToken()}`,
        },
        method: "POST",
      },
    );
    const body = await response.json();
    const guestToken = extractGuestToken(body.inviteLink);
    const inviteRecord = regenerateInvite.mock.calls[0]?.[2];

    expect(response.status).toBe(200);
    expect(body).toEqual({
      guestGroup: regeneratedGuestGroup,
      inviteLink: `http://localhost:3000/e/${baseEvent.slug}/g/${guestToken}`,
    });
    expect(regenerateInvite).toHaveBeenCalledWith(
      eventId,
      guestGroupId,
      expect.objectContaining({
        inviteCode: expect.any(String),
        inviteTokenHash: hashInviteToken(guestToken, validApiEnv.INVITE_TOKEN_SECRET),
      }),
    );
    expect(JSON.stringify(inviteRecord)).not.toContain(guestToken);
  });

  it("blocks guest group changes without event access", async () => {
    const { authStore } = createTestAuthStore({
      access: {
        access: null,
        eventFound: true,
      },
    });
    const { createGuestGroup, guestGroupStore } = createTestGuestGroupStore();
    const app = createApp({
      authStore,
      config: loadTestConfig(),
      eventStore: createTestEventStore().eventStore,
      guestGroupStore,
    });
    const response = await app.request(`/events/${eventId}/guest-groups`, {
      body: JSON.stringify({
        label: "Blocked group",
        maxPax: 2,
      }),
      headers: {
        authorization: `Bearer ${createSupabaseToken()}`,
        "content-type": "application/json",
        "x-request-id": "blocked-guest-group-request-id",
      },
      method: "POST",
    });

    await expect(response.json()).resolves.toEqual({
      error: {
        code: "FORBIDDEN",
        message: "Manager does not have access to this event",
        requestId: "blocked-guest-group-request-id",
      },
    });
    expect(response.status).toBe(403);
    expect(createGuestGroup).not.toHaveBeenCalled();
  });

  it("returns published public event data without guest or manager-only fields", async () => {
    const { getPublicEventBySlug, publicInviteStore } = createTestPublicInviteStore();
    const app = createApp({
      config: loadTestConfig(),
      publicInviteStore,
    });
    const response = await app.request(`/public/events/${baseEvent.slug}`);
    const body = await response.json();

    expect(response.status).toBe(200);
    const { id: _internalEventId, ...publicEvent } = publicEventRecord.event;
    expect(body).toEqual({
      event: publicEvent,
      selectedThemeId: "lumiere-default",
      theme: toApiTheme(getTheme("lumiere-default")!),
      themeConfig: {},
      themeMode: "system",
      sections: [baseSection],
    });
    expect(JSON.stringify(body)).not.toContain("ownerUserId");
    expect(JSON.stringify(body)).not.toContain(baseGuestGroup.label);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("pragma")).toBe("no-cache");
    expect(getPublicEventBySlug).toHaveBeenCalledWith({
      eventSlug: baseEvent.slug,
      publicAccessCodeHash: undefined,
    });
  });

  it("returns 404 for unpublished or archived public events", async () => {
    const { publicInviteStore } = createTestPublicInviteStore({
      publicEvent: null,
    });
    const app = createApp({
      config: loadTestConfig(),
      publicInviteStore,
    });
    const response = await app.request(`/public/events/${baseEvent.slug}`, {
      headers: {
        "x-request-id": "unpublished-public-event-request-id",
      },
    });

    await expect(response.json()).resolves.toEqual({
      error: {
        code: "NOT_FOUND",
        message: "Public event not found",
        requestId: "unpublished-public-event-request-id",
      },
    });
    expect(response.status).toBe(404);
  });

  it("does not return hidden or guest-only sections for generic public events", async () => {
    const { publicInviteStore } = createTestPublicInviteStore({
      publicEvent: {
        ...publicEventRecord,
        sections: [baseSection],
      },
    });
    const app = createApp({
      config: loadTestConfig(),
      publicInviteStore,
    });
    const response = await app.request(`/public/events/${baseEvent.slug}`);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.sections).toEqual([baseSection]);
    expect(body.sections).not.toContainEqual(
      expect.objectContaining({
        visibility: "hidden",
      }),
    );
    expect(body.sections).not.toContainEqual(
      expect.objectContaining({
        visibility: "guest_only",
      }),
    );
  });

  it("validates guest token and returns personalized RSVP context", async () => {
    const guestToken = "guest-token-for-public-route";
    const { getPublicGuestInvite, publicInviteStore } = createTestPublicInviteStore();
    const app = createApp({
      config: loadTestConfig(),
      publicInviteStore,
    });
    const response = await app.request(`/public/events/${baseEvent.slug}/guest/${guestToken}`);
    const { id: _internalEventId, ...guestPublicEvent } = publicGuestInviteRecord.event;

    await expect(response.json()).resolves.toEqual({
      event: JSON.parse(JSON.stringify(guestPublicEvent)),
      selectedThemeId: "lumiere-default",
      theme: toApiTheme(getTheme("lumiere-default")!),
      themeConfig: {},
      themeMode: "system",
      sections: [baseSection, guestOnlyRsvpSection],
      guest: publicGuestInviteRecord.guest,
      rsvpFields: publicGuestInviteRecord.rsvpFields,
    });
    expect(response.status).toBe(200);
    expect(getPublicGuestInvite).toHaveBeenCalledWith({
      eventSlug: baseEvent.slug,
      inviteTokenHash: hashInviteToken(guestToken, validApiEnv.INVITE_TOKEN_SECRET),
    });
  });

  it("returns 404 for invalid guest tokens", async () => {
    const { getPublicGuestInvite, publicInviteStore } = createTestPublicInviteStore({
      guestInvite: null,
    });
    const app = createApp({
      config: loadTestConfig(),
      publicInviteStore,
    });
    const guestToken = "invalid-token-for-public-route";
    const response = await app.request(`/public/events/${baseEvent.slug}/guest/${guestToken}`, {
      headers: {
        "x-request-id": "invalid-guest-token-request-id",
      },
    });

    await expect(response.json()).resolves.toEqual({
      error: {
        code: "NOT_FOUND",
        message: "Guest invite not found",
        requestId: "invalid-guest-token-request-id",
      },
    });
    expect(response.status).toBe(404);
    expect(getPublicGuestInvite).toHaveBeenCalledWith({
      eventSlug: baseEvent.slug,
      inviteTokenHash: hashInviteToken(guestToken, validApiEnv.INVITE_TOKEN_SECRET),
    });
  });

  it("returns 403 for disabled guest invites", async () => {
    const { publicInviteStore } = createTestPublicInviteStore({
      guestInvite: "disabled",
    });
    const app = createApp({
      config: loadTestConfig(),
      publicInviteStore,
    });
    const response = await app.request(
      `/public/events/${baseEvent.slug}/guest/disabled-token-for-public-route`,
      {
        headers: {
          "x-request-id": "disabled-guest-token-request-id",
        },
      },
    );

    await expect(response.json()).resolves.toEqual({
      error: {
        code: "FORBIDDEN",
        message: "Guest invite is disabled",
        requestId: "disabled-guest-token-request-id",
      },
    });
    expect(response.status).toBe(403);
  });

  it("submits attending RSVPs for valid guest tokens", async () => {
    const guestToken = "rsvp-attending-token-for-public-route";
    const { rsvpStore, submitGuestRsvp } = createTestRsvpStore();
    const app = createApp({
      config: loadTestConfig(),
      rsvpStore,
    });
    const response = await app.request(
      `/public/events/${baseEvent.slug}/guest/${guestToken}/rsvp`,
      {
        body: JSON.stringify({
          responseStatus: "attending",
          attendeeCount: 2,
          guestNames: [],
          answers: [],
          message: "Excited to attend.",
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      },
    );

    await expect(response.json()).resolves.toEqual({
      response: baseRsvpResponse,
    });
    expect(response.status).toBe(200);
    expect(submitGuestRsvp).toHaveBeenCalledWith({
      eventSlug: baseEvent.slug,
      inviteTokenHash: hashInviteToken(guestToken, validApiEnv.INVITE_TOKEN_SECRET),
      submission: {
        responseStatus: "attending",
        attendeeCount: 2,
        guestNames: [],
        answers: [],
        message: "Excited to attend.",
      },
    });
  });

  it("rate limits repeated RSVP submissions for the same guest link and client", async () => {
    const guestToken = "rsvp-rate-limit-token-for-public-route";
    const { rsvpStore, submitGuestRsvp } = createTestRsvpStore();
    const app = createApp({
      config: loadTestConfig(),
      rsvpStore,
    });
    const requestBody = JSON.stringify({
      responseStatus: "attending",
      attendeeCount: 1,
    });
    const submit = () =>
      app.request(`/public/events/${baseEvent.slug}/guest/${guestToken}/rsvp`, {
        body: requestBody,
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "203.0.113.10",
        },
        method: "POST",
      });

    for (let attempt = 0; attempt < 20; attempt += 1) {
      const response = await submit();
      expect(response.status).toBe(200);
    }

    const limitedResponse = await submit();
    const body = await limitedResponse.json();

    expect(limitedResponse.status).toBe(429);
    expect(body).toEqual({
      error: {
        code: "RATE_LIMITED",
        message: "Too many RSVP attempts. Please try again shortly.",
        requestId: expect.any(String),
      },
    });
    expect(limitedResponse.headers.get("retry-after")).toEqual(expect.any(String));
    expect(limitedResponse.headers.get("x-ratelimit-limit")).toBe("20");
    expect(limitedResponse.headers.get("x-ratelimit-remaining")).toBe("0");
    expect(submitGuestRsvp).toHaveBeenCalledTimes(20);
  });

  it("submits not attending RSVPs", async () => {
    const notAttendingResponse: RsvpResponse = {
      ...baseRsvpResponse,
      responseStatus: "not_attending",
      attendeeCount: 0,
      guestNames: [],
      message: "Sorry to miss it.",
    };
    const { rsvpStore } = createTestRsvpStore({
      result: {
        response: notAttendingResponse,
        updatedExisting: false,
      },
    });
    const app = createApp({
      config: loadTestConfig(),
      rsvpStore,
    });
    const response = await app.request(
      `/public/events/${baseEvent.slug}/guest/not-attending-token-for-public-route/rsvp`,
      {
        body: JSON.stringify({
          responseStatus: "not_attending",
          attendeeCount: 0,
          message: "Sorry to miss it.",
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      },
    );

    await expect(response.json()).resolves.toEqual({
      response: notAttendingResponse,
    });
    expect(response.status).toBe(200);
  });

  it("updates existing RSVPs while RSVP is open", async () => {
    const updatedResponse: RsvpResponse = {
      ...baseRsvpResponse,
      attendeeCount: 3,
      guestNames: ["Mina Tan", "Alex Tan", "Jamie Tan"],
      updatedAt: "2026-07-08T05:00:00.000Z",
    };
    const { rsvpStore } = createTestRsvpStore({
      result: {
        response: updatedResponse,
        updatedExisting: true,
      },
    });
    const app = createApp({
      config: loadTestConfig(),
      rsvpStore,
    });
    const response = await app.request(
      `/public/events/${baseEvent.slug}/guest/update-rsvp-token-for-public-route/rsvp`,
      {
        body: JSON.stringify({
          responseStatus: "attending",
          attendeeCount: 3,
          guestNames: ["Mina Tan", "Alex Tan", "Jamie Tan"],
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      },
    );

    await expect(response.json()).resolves.toEqual({
      response: updatedResponse,
    });
    expect(response.status).toBe(200);
  });

  it("returns 404 for invalid RSVP guest tokens", async () => {
    const { rsvpStore } = createTestRsvpStore({
      result: null,
    });
    const app = createApp({
      config: loadTestConfig(),
      rsvpStore,
    });
    const response = await app.request(
      `/public/events/${baseEvent.slug}/guest/invalid-rsvp-token-for-public-route/rsvp`,
      {
        body: JSON.stringify({
          responseStatus: "attending",
          attendeeCount: 1,
        }),
        headers: {
          "content-type": "application/json",
          "x-request-id": "invalid-rsvp-token-request-id",
        },
        method: "POST",
      },
    );

    await expect(response.json()).resolves.toEqual({
      error: {
        code: "NOT_FOUND",
        message: "Guest invite not found",
        requestId: "invalid-rsvp-token-request-id",
      },
    });
    expect(response.status).toBe(404);
  });

  it("rejects RSVP attendee counts above max pax", async () => {
    const { rsvpStore } = createTestRsvpStore({
      result: {
        reason: "max_pax_exceeded",
        maxPax: baseGuestGroup.maxPax,
      },
    });
    const app = createApp({
      config: loadTestConfig(),
      rsvpStore,
    });
    const response = await app.request(
      `/public/events/${baseEvent.slug}/guest/max-pax-rsvp-token-for-public-route/rsvp`,
      {
        body: JSON.stringify({
          responseStatus: "attending",
          attendeeCount: 5,
        }),
        headers: {
          "content-type": "application/json",
          "x-request-id": "max-pax-rsvp-request-id",
        },
        method: "POST",
      },
    );

    await expect(response.json()).resolves.toEqual({
      error: {
        code: "VALIDATION_ERROR",
        message: "Attendee count cannot exceed guest group max pax",
        requestId: "max-pax-rsvp-request-id",
        fields: [
          {
            message: "Attendee count cannot exceed 4",
            path: ["attendeeCount"],
          },
        ],
      },
    });
    expect(response.status).toBe(422);
  });

  it("rejects closed RSVP submissions", async () => {
    const { rsvpStore } = createTestRsvpStore({
      result: {
        reason: "closed",
      },
    });
    const app = createApp({
      config: loadTestConfig(),
      rsvpStore,
    });
    const response = await app.request(
      `/public/events/${baseEvent.slug}/guest/closed-rsvp-token-for-public-route/rsvp`,
      {
        body: JSON.stringify({
          responseStatus: "attending",
          attendeeCount: 1,
        }),
        headers: {
          "content-type": "application/json",
          "x-request-id": "closed-rsvp-request-id",
        },
        method: "POST",
      },
    );

    await expect(response.json()).resolves.toEqual({
      error: {
        code: "FORBIDDEN",
        message: "RSVP is closed",
        requestId: "closed-rsvp-request-id",
      },
    });
    expect(response.status).toBe(403);
  });

  it("rejects maybe RSVPs unless enabled", async () => {
    const { rsvpStore } = createTestRsvpStore({
      result: {
        reason: "maybe_disabled",
      },
    });
    const app = createApp({
      config: loadTestConfig(),
      rsvpStore,
    });
    const response = await app.request(
      `/public/events/${baseEvent.slug}/guest/maybe-rsvp-token-for-public-route/rsvp`,
      {
        body: JSON.stringify({
          responseStatus: "maybe",
          attendeeCount: 1,
        }),
        headers: {
          "content-type": "application/json",
          "x-request-id": "maybe-disabled-rsvp-request-id",
        },
        method: "POST",
      },
    );

    await expect(response.json()).resolves.toEqual({
      error: {
        code: "VALIDATION_ERROR",
        message: "Maybe RSVPs are not enabled",
        requestId: "maybe-disabled-rsvp-request-id",
        fields: [
          {
            message: "Maybe RSVPs are not enabled for this event",
            path: ["responseStatus"],
          },
        ],
      },
    });
    expect(response.status).toBe(422);
  });

  it("smokes the MVP host-to-guest RSVP workflow across API contracts", async () => {
    const smoke = createIntegrationSmokeStores();
    const app = createApp({
      authStore: smoke.authStore,
      config: loadTestConfig(),
      dashboardDataStore: smoke.dashboardDataStore,
      eventStore: smoke.eventStore,
      guestGroupStore: smoke.guestGroupStore,
      publicInviteStore: smoke.publicInviteStore,
      rsvpStore: smoke.rsvpStore,
      themeSectionStore: smoke.themeSectionStore,
    });
    const managerHeaders = {
      authorization: `Bearer ${createSupabaseToken()}`,
      "content-type": "application/json",
    };

    const createEventResponse = await app.request("/events", {
      body: JSON.stringify({
        eventType: "wedding",
        publicSettings: {},
        rsvpSettings: {
          enabled: true,
        },
        slug: "smoke-wedding",
        startsAt: "2031-02-14T10:30:00.000Z",
        timezone: "Asia/Singapore",
        title: "Smoke Wedding",
        venueAddress: "18 Marina Gardens Drive, Singapore",
        venueName: "Emerald Gardens",
      }),
      headers: managerHeaders,
      method: "POST",
    });
    const createdEvent = eventCreateResponseSchema.parse(await createEventResponse.json()).event;

    expect(createEventResponse.status).toBe(201);
    expect(createdEvent).toMatchObject({
      eventType: "wedding",
      id: eventId,
      slug: "smoke-wedding",
      status: "draft",
      title: "Smoke Wedding",
    });

    const publishResponse = await app.request(`/events/${eventId}`, {
      body: JSON.stringify({
        expectedUpdatedAt: createdEvent.updatedAt,
        status: "published",
      }),
      headers: managerHeaders,
      method: "PATCH",
    });
    const publishedEvent = eventResponseSchema.parse(await publishResponse.json()).event;

    expect(publishResponse.status).toBe(200);
    expect(publishedEvent.status).toBe("published");

    const themeResponse = await app.request(`/events/${eventId}/theme`, {
      body: JSON.stringify({
        selectedThemeId: "premium",
        themeConfig: {
          entrance: "garden",
        },
        themeMode: "light",
      }),
      headers: managerHeaders,
      method: "PUT",
    });
    const themeBody = eventThemeResponseSchema.parse(await themeResponse.json());

    expect(themeResponse.status).toBe(200);
    expect(themeBody.selectedThemeId).toBe("premium");
    expect(themeBody.theme?.metadata).toMatchObject({
      composition: expect.objectContaining({
        rsvpDesign: "editorial",
      }),
      rsvpTreatment: expect.any(String),
    });

    const sectionsResponse = await app.request(`/events/${eventId}/sections`, {
      body: JSON.stringify({
        sections: [
          {
            content: {
              eyebrow: "Wedding invitation",
              subtitle: "A garden celebration with dinner and dancing.",
              title: "Amara and Jules",
            },
            sectionKey: "welcome",
            sectionType: "introduction",
            settings: {
              density: "spacious",
            },
            sortOrder: 0,
            visibility: "public",
          },
          {
            content: {
              displayText: "Saturday, 14 February 2031 at 6:30 PM",
              startsAt: "2031-02-14T10:30:00.000Z",
              timezone: "Asia/Singapore",
              title: "When",
            },
            sectionKey: "date",
            sectionType: "date",
            settings: {},
            sortOrder: 1,
            visibility: "public",
          },
          {
            content: {
              address: "18 Marina Gardens Drive, Singapore",
              notes: "Please use the Garden East entrance.",
              venueName: "Emerald Gardens",
            },
            sectionKey: "venue",
            sectionType: "location",
            settings: {},
            sortOrder: 2,
            visibility: "public",
          },
          {
            content: {
              questions: [
                {
                  key: "meal-choice",
                  label: "Meal choice",
                  options: ["Classic", "Vegetarian"],
                  required: true,
                  type: "single_choice",
                },
              ],
              title: "Your reply",
            },
            sectionKey: "rsvp",
            sectionType: "rsvp",
            settings: {
              requireGuestToken: true,
            },
            sortOrder: 3,
            visibility: "guest_only",
          },
        ],
      }),
      headers: managerHeaders,
      method: "PUT",
    });
    const sectionsBody = eventSectionsResponseSchema.parse(await sectionsResponse.json());

    expect(sectionsResponse.status).toBe(200);
    expect(sectionsBody.sections.map((section) => section.sectionType)).toEqual([
      "introduction",
      "date",
      "location",
      "rsvp",
    ]);

    const guestGroupResponse = await app.request(`/events/${eventId}/guest-groups`, {
      body: JSON.stringify({
        contactEmail: "mina@example.com",
        contactName: "Mina Tan",
        label: "Tan Family",
        maxPax: 4,
      }),
      headers: managerHeaders,
      method: "POST",
    });
    const guestGroupBody = guestGroupInviteResponseSchema.parse(await guestGroupResponse.json());
    const guestToken = extractGuestToken(guestGroupBody.inviteLink);

    expect(guestGroupResponse.status).toBe(201);
    expect(guestGroupBody.guestGroup).toMatchObject({
      eventId,
      label: "Tan Family",
      maxPax: 4,
      status: "pending",
    });
    expect(guestToken.length).toBeGreaterThanOrEqual(32);
    expect(JSON.stringify(guestGroupBody.guestGroup)).not.toContain(guestToken);

    const publicEventResponse = await app.request("/public/events/smoke-wedding");
    const publicEventBody = publicEventResponseSchema.parse(await publicEventResponse.json());

    expect(publicEventResponse.status).toBe(200);
    expect(publicEventBody.event).toMatchObject({
      slug: "smoke-wedding",
      title: "Smoke Wedding",
    });
    expect(publicEventBody.selectedThemeId).toBe("premium");
    expect(publicEventBody.sections.map((section) => section.sectionType)).toEqual([
      "introduction",
      "date",
      "location",
    ]);
    expect(JSON.stringify(publicEventBody)).not.toContain("Tan Family");
    expect(JSON.stringify(publicEventBody)).not.toContain("mina@example.com");

    const guestInviteResponse = await app.request(
      `/public/events/smoke-wedding/guest/${guestToken}`,
    );
    const guestInviteBody = publicGuestInviteResponseSchema.parse(await guestInviteResponse.json());

    expect(guestInviteResponse.status).toBe(200);
    expect(guestInviteBody.guest).toEqual({
      guestGroup: {
        label: "Tan Family",
        maxPax: 4,
        status: "pending",
      },
      response: null,
      responseStatus: null,
    });
    expect(guestInviteBody.sections.map((section) => section.sectionType)).toContain("rsvp");
    expect(JSON.stringify(guestInviteBody)).not.toContain("mina@example.com");
    expect(JSON.stringify(guestInviteBody)).not.toContain(guestToken);

    const rsvpResponse = await app.request(
      `/public/events/smoke-wedding/guest/${guestToken}/rsvp`,
      {
        body: JSON.stringify({
          answers: [
            {
              questionKey: "meal-choice",
              value: "Vegetarian",
            },
          ],
          attendeeCount: 2,
          guestNames: ["Mina Tan", "Alex Tan"],
          message: "Excited to celebrate.",
          responseStatus: "attending",
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      },
    );
    const rsvpBody = rsvpSubmissionResponseSchema.parse(await rsvpResponse.json());

    expect(rsvpResponse.status).toBe(200);
    expect(rsvpBody.response).toMatchObject({
      attendeeCount: 2,
      eventId,
      guestGroupId,
      guestNames: ["Mina Tan", "Alex Tan"],
      responseStatus: "attending",
    });

    const updatedGuestInviteResponse = await app.request(
      `/public/events/smoke-wedding/guest/${guestToken}`,
    );
    const updatedGuestInviteBody = publicGuestInviteResponseSchema.parse(
      await updatedGuestInviteResponse.json(),
    );

    expect(updatedGuestInviteBody.guest.response).toEqual({
      attendeeCount: 2,
      guestNames: ["Mina Tan", "Alex Tan"],
      responseStatus: "attending",
    });

    const summaryResponse = await app.request(`/events/${eventId}/summary`, {
      headers: {
        authorization: `Bearer ${createSupabaseToken()}`,
      },
    });
    const summaryBody = eventSummaryResponseSchema.parse(await summaryResponse.json());

    expect(summaryResponse.status).toBe(200);
    expect(summaryBody.summary).toEqual({
      attending: {
        groups: 1,
        pax: 2,
      },
      maybe: {
        groups: 0,
        pax: 0,
      },
      notAttending: {
        groups: 0,
        pax: 0,
      },
      pending: {
        groups: 0,
        pax: 0,
      },
      totalGroups: 1,
      totalInvitedPax: 4,
      totalRespondedPax: 2,
    });
  });

  it("smokes critical integration failure states", async () => {
    const smoke = createIntegrationSmokeStores();
    const app = createApp({
      authStore: smoke.authStore,
      config: loadTestConfig(),
      dashboardDataStore: smoke.dashboardDataStore,
      publicInviteStore: smoke.publicInviteStore,
    });

    const invalidGuestResponse = await app.request(
      "/public/events/smoke-wedding/guest/not-a-real-guest-token",
      {
        headers: {
          "x-request-id": "smoke-invalid-guest-token",
        },
      },
    );
    const invalidGuestBody = apiErrorSchema.parse(await invalidGuestResponse.json());

    expect(invalidGuestResponse.status).toBe(404);
    expect(invalidGuestBody).toEqual({
      error: {
        code: "NOT_FOUND",
        message: "Guest invite not found",
        requestId: "smoke-invalid-guest-token",
      },
    });

    const unauthorizedSummaryResponse = await app.request(`/events/${eventId}/summary`, {
      headers: {
        "x-request-id": "smoke-unauthorized-dashboard",
      },
    });
    const unauthorizedSummaryBody = apiErrorSchema.parse(await unauthorizedSummaryResponse.json());

    expect(unauthorizedSummaryResponse.status).toBe(401);
    expect(unauthorizedSummaryBody).toEqual({
      error: {
        code: "UNAUTHORIZED",
        message: "Missing bearer token",
        requestId: "smoke-unauthorized-dashboard",
      },
    });
  });
});

function loadTestConfig() {
  for (const [key, value] of Object.entries(validApiEnv)) {
    vi.stubEnv(key, value);
  }

  return loadApiConfig();
}

function createTestAuthStore({
  access = roleAccess("owner"),
}: { access?: EventAccessLookup } = {}) {
  const upsertUserProfile = vi.fn(async (input: UpsertUserProfileInput) => ({
    ...localUser,
    displayName: input.displayName,
    email: input.email,
    supabaseUserId: input.supabaseUserId,
  }));
  const findEventAccess = vi.fn(async () => access);
  const authStore: AuthStore = {
    findEventAccess,
    upsertUserProfile,
  };

  return {
    authStore,
    findEventAccess,
    upsertUserProfile,
  };
}

function createTestDashboardDataStore({
  activity = [activityEvent, olderActivityEvent],
  notifications = [notification],
  summary = eventSummary,
}: {
  activity?: ActivityEvent[];
  notifications?: Notification[];
  summary?: EventSummary;
} = {}) {
  const getEventSummary = vi.fn(async () => summary);
  const listActivity = vi.fn(async () => activity);
  const listNotifications = vi.fn(async () => notifications);
  const dismissNotification = vi.fn(async () => true);
  const markAllNotificationsRead = vi.fn(
    async () => notifications.filter((item) => !item.readAt).length,
  );
  const markNotificationRead = vi.fn(async () => notifications[0] ?? null);
  const dashboardDataStore: DashboardDataStore = {
    dismissNotification,
    getEventSummary,
    listActivity,
    listNotifications,
    markAllNotificationsRead,
    markNotificationRead,
  };

  return {
    dashboardDataStore,
    dismissNotification,
    getEventSummary,
    listActivity,
    listNotifications,
    markAllNotificationsRead,
    markNotificationRead,
  };
}

function createPublishingReadiness(
  overrides: Partial<PublishingReadiness> = {},
): PublishingReadiness {
  return {
    blockers: [],
    eventUpdatedAt: baseEvent.updatedAt,
    issues: [],
    publicPath: `/e/${baseEvent.slug}`,
    ready: true,
    rsvpStatus: "open",
    status: baseEvent.status,
    theme: {
      id: "lumiere-default",
      mode: "system",
      name: "Lumiere Default",
    },
    updatePolicy: "immediate",
    warnings: [],
    ...overrides,
  };
}

function createTestEventStore({
  deletedEvent = {
    ...baseEvent,
    deletedAt: "2026-07-08T02:00:00.000Z",
    purgeAfter: "2026-08-07T02:00:00.000Z",
    status: "archived",
  } as Event,
  createError,
  createdEvent = baseEvent,
  deletedEvents = [],
  events = [baseEvent],
  publishingReadiness = createPublishingReadiness(),
  updatedEvent = baseEvent,
  restoredEvent = baseEvent,
}: {
  deletedEvent?: Event | null;
  createError?: Error;
  createdEvent?: Event;
  deletedEvents?: Event[];
  events?: Event[];
  publishingReadiness?: PublishingReadiness | null;
  updatedEvent?: Event | null;
  restoredEvent?: Event | "expired" | "not_deleted" | null;
} = {}) {
  const deleteEvent = vi.fn(async () => deletedEvent);
  const createEvent = vi.fn(async (_ownerUserId: string, _input: EventCreate) => {
    if (createError) {
      throw createError;
    }

    return createdEvent;
  });
  const getEvent = vi.fn(
    async (requestedEventId: string) =>
      events.find((event) => event.id === requestedEventId) ?? null,
  );
  const getEventBySlug = vi.fn(
    async (requestedSlug: string) => events.find((event) => event.slug === requestedSlug) ?? null,
  );
  const getPublishingReadiness = vi.fn(async () => publishingReadiness);
  const isEventSlugAvailable = vi.fn(
    async (requestedSlug: string, options: { exceptEventId?: string } = {}) => {
      const event = events.find((event) => event.slug === requestedSlug);

      return !event || event.id === options.exceptEventId;
    },
  );
  const listManagedEvents = vi.fn(async () => events);
  const listDeletedEvents = vi.fn(async () => deletedEvents);
  const restoreEvent = vi.fn(async () => restoredEvent);
  const updateEvent = vi.fn(async (_eventId: string, _input: EventUpdate) => updatedEvent);
  const eventStore: EventStore = {
    createEvent,
    deleteEvent,
    getEvent,
    getEventBySlug,
    getPublishingReadiness,
    isEventSlugAvailable,
    listDeletedEvents,
    listManagedEvents,
    restoreEvent,
    updateEvent,
  };

  return {
    createEvent,
    deleteEvent,
    eventStore,
    getEvent,
    getEventBySlug,
    getPublishingReadiness,
    isEventSlugAvailable,
    listDeletedEvents,
    listManagedEvents,
    restoreEvent,
    updateEvent,
  };
}

function createTestThemeSectionStore({
  sections = [baseSection],
  themeState = baseThemeState,
  updatedThemeState = themeState,
}: {
  sections?: Awaited<ReturnType<ThemeSectionStore["listSections"]>>;
  themeState?: EventThemeState | null;
  updatedThemeState?: EventThemeState | null;
} = {}) {
  const getEventTheme = vi.fn(async () => themeState);
  const listSections = vi.fn(async () => sections);
  const replaceSections = vi.fn(async () => sections);
  const updateEventTheme = vi.fn(async () => updatedThemeState);
  const themeSectionStore: ThemeSectionStore = {
    getEventTheme,
    listSections,
    replaceSections,
    updateEventTheme,
  };

  return {
    getEventTheme,
    listSections,
    replaceSections,
    themeSectionStore,
    updateEventTheme,
  };
}

function createTestGuestGroupStore({
  createdGuestGroup = baseGuestGroup,
  disabledGuestGroup = {
    ...baseGuestGroup,
    status: "disabled",
  } as GuestGroup,
  guestGroups = [baseGuestGroup],
  regeneratedGuestGroup = baseGuestGroup,
  updatedGuestGroup = baseGuestGroup,
}: {
  createdGuestGroup?: GuestGroup;
  disabledGuestGroup?: GuestGroup | null;
  guestGroups?: GuestGroup[];
  regeneratedGuestGroup?: GuestGroup | null;
  updatedGuestGroup?: GuestGroup | null;
} = {}) {
  const createGuestGroup = vi.fn(
    async (_eventId: string, _input: GuestGroupMutation, _invite: InviteTokenRecord) =>
      createdGuestGroup,
  );
  const disableGuestGroup = vi.fn(async () => disabledGuestGroup);
  const listGuestGroups = vi.fn(async () => guestGroups);
  const regenerateInvite = vi.fn(
    async (_eventId: string, _groupId: string, _invite: InviteTokenRecord) => regeneratedGuestGroup,
  );
  const updateGuestGroup = vi.fn(
    async (_eventId: string, _groupId: string, _input: GuestGroupMutation) => updatedGuestGroup,
  );
  const guestGroupStore: GuestGroupStore = {
    createGuestGroup,
    disableGuestGroup,
    listGuestGroups,
    regenerateInvite,
    updateGuestGroup,
  };

  return {
    createGuestGroup,
    disableGuestGroup,
    guestGroupStore,
    listGuestGroups,
    regenerateInvite,
    updateGuestGroup,
  };
}

function createTestPublicInviteStore({
  guestInvite = publicGuestInviteRecord,
  publicEvent = publicEventRecord,
}: {
  guestInvite?: PublicGuestInviteRecord | "disabled" | null;
  publicEvent?: PublicEventRecord | null;
} = {}) {
  const getPublicEventBySlug = vi.fn(async () => publicEvent);
  const getPublicGuestInvite = vi.fn(async () => guestInvite);
  const publicInviteStore: PublicInviteStore = {
    getPublicEventBySlug,
    getPublicGuestInvite,
  };

  return {
    getPublicEventBySlug,
    getPublicGuestInvite,
    publicInviteStore,
  };
}

function createTestRsvpStore({
  result = {
    response: baseRsvpResponse,
    updatedExisting: false,
  },
}: {
  result?: RsvpSubmissionResult;
} = {}) {
  const submitGuestRsvp = vi.fn(async () => result);
  const rsvpStore: RsvpStore = {
    submitGuestRsvp,
  };

  return {
    rsvpStore,
    submitGuestRsvp,
  };
}

function createIntegrationSmokeStores() {
  const smokeNow = "2031-01-01T00:00:00.000Z";
  let event: Event | null = null;
  let sections: EventSection[] = [];
  let guestGroupRecord: (GuestGroup & InviteTokenRecord) | null = null;
  let responseRecord: RsvpResponse | null = null;
  let activity: ActivityEvent[] = [];
  let notifications: Notification[] = [];

  const authStore: AuthStore = {
    findEventAccess: vi.fn(
      async (requestedEventId: string, userId: string): Promise<EventAccessLookup> => {
        if (!event || requestedEventId !== event.id) {
          return {
            eventFound: false as const,
          };
        }

        return {
          access:
            userId === localUser.id
              ? {
                  eventId: event.id,
                  role: "owner" as const,
                  userId,
                }
              : null,
          eventFound: true as const,
        };
      },
    ),
    upsertUserProfile: vi.fn(async (input) => ({
      ...localUser,
      displayName: input.displayName,
      email: input.email,
      supabaseUserId: input.supabaseUserId,
    })),
  };

  const eventStore: EventStore = {
    deleteEvent: vi.fn(async (requestedEventId, actorUserId, confirmationTitle) => {
      if (!event || requestedEventId !== event.id) {
        return null;
      }

      if (event.title !== confirmationTitle) {
        throw new ApiHttpError("VALIDATION_ERROR", "Event title confirmation does not match");
      }

      if (event.deletedAt) {
        return event;
      }

      event = {
        ...event,
        deletedAt: smokeNow,
        purgeAfter: "2031-01-31T00:00:00.000Z",
        status: "archived",
        updatedAt: smokeNow,
      };
      activity = [
        ...activity,
        {
          actorId: actorUserId,
          actorType: "manager",
          activityType: "event_deleted",
          createdAt: smokeNow,
          eventId: event.id,
          id: "00000000-0000-4000-8000-000000000904",
          metadata: {},
        },
      ];

      return event;
    }),
    createEvent: vi.fn(async (ownerUserId, input) => {
      event = {
        createdAt: smokeNow,
        endsAt: input.endsAt,
        eventType: input.eventType,
        id: eventId,
        hasPublicAccessCode: Boolean(input.publicAccessCodeHash),
        ownerUserId,
        publicSettings: input.publicSettings,
        rsvpSettings: input.rsvpSettings,
        selectedThemeId: input.selectedThemeId,
        slug: input.slug,
        startsAt: input.startsAt,
        status: "draft",
        themeConfig: {},
        themeMode: input.themeMode,
        timezone: input.timezone,
        title: input.title,
        updatedAt: smokeNow,
        venueAddress: input.venueAddress,
        venueName: input.venueName,
      };

      return event!;
    }),
    getEvent: vi.fn(async (requestedEventId) =>
      event && requestedEventId === event.id ? event : null,
    ),
    getEventBySlug: vi.fn(async (requestedSlug) =>
      event && event.slug === requestedSlug ? event : null,
    ),
    getPublishingReadiness: vi.fn(async (requestedEventId) =>
      event && event.id === requestedEventId
        ? createPublishingReadiness({
            eventUpdatedAt: event.updatedAt,
            publicPath: `/e/${event.slug}`,
            status: event.status,
          })
        : null,
    ),
    isEventSlugAvailable: vi.fn(async (requestedSlug, options = {}) => {
      if (!event || event.slug !== requestedSlug) {
        return true;
      }

      return event.id === options.exceptEventId;
    }),
    listDeletedEvents: vi.fn(async (userId) =>
      event && event.ownerUserId === userId && event.deletedAt ? [event] : [],
    ),
    listManagedEvents: vi.fn(async (userId) =>
      event && event.ownerUserId === userId && !event.deletedAt ? [event] : [],
    ),
    restoreEvent: vi.fn(async (requestedEventId, actorUserId) => {
      if (!event || requestedEventId !== event.id) {
        return null;
      }

      if (!event.deletedAt) {
        return "not_deleted" as const;
      }

      event = {
        ...event,
        deletedAt: undefined,
        purgeAfter: undefined,
        status: "draft",
        updatedAt: smokeNow,
      };
      activity = [
        ...activity,
        {
          actorId: actorUserId,
          actorType: "manager",
          activityType: "event_restored",
          createdAt: smokeNow,
          eventId: event.id,
          id: "00000000-0000-4000-8000-000000000905",
          metadata: {},
        },
      ];

      return event;
    }),
    updateEvent: vi.fn(async (requestedEventId, input) => {
      if (!event || requestedEventId !== event.id) {
        return null;
      }

      event = {
        ...event,
        ...input,
        updatedAt: smokeNow,
      };

      return event;
    }),
  };

  const themeSectionStore: ThemeSectionStore = {
    getEventTheme: vi.fn(async (requestedEventId) =>
      event && requestedEventId === event.id
        ? {
            eventId: event.id,
            eventStatus: event.status,
            eventType: event.eventType,
            selectedThemeId: event.selectedThemeId,
            themeConfig: event.themeConfig,
            themeMode: event.themeMode,
          }
        : null,
    ),
    listSections: vi.fn(async (requestedEventId) =>
      event && requestedEventId === event.id ? [...sections] : [],
    ),
    replaceSections: vi.fn(
      async (
        requestedEventId: string,
        inputSections: Parameters<ThemeSectionStore["replaceSections"]>[1],
      ) => {
        if (!event || requestedEventId !== event.id) {
          return [];
        }

        sections = inputSections.map((section, index) => ({
          ...section,
          createdAt: smokeNow,
          eventId: eventId,
          id: smokeSectionId(index),
          updatedAt: smokeNow,
        }));

        return [...sections];
      },
    ),
    updateEventTheme: vi.fn(async (requestedEventId, input) => {
      if (!event || requestedEventId !== event.id) {
        return null;
      }

      event = {
        ...event,
        selectedThemeId: input.selectedThemeId,
        themeConfig: input.themeConfig,
        themeMode: input.themeMode,
        updatedAt: smokeNow,
      };

      return {
        eventId: event.id,
        eventStatus: event.status,
        eventType: event.eventType,
        selectedThemeId: event.selectedThemeId,
        themeConfig: event.themeConfig,
        themeMode: event.themeMode,
      };
    }),
  };

  const guestGroupStore: GuestGroupStore = {
    createGuestGroup: vi.fn(async (requestedEventId, input, invite) => {
      if (!event || requestedEventId !== event.id) {
        throw new ApiHttpError("NOT_FOUND", "Event not found");
      }

      guestGroupRecord = {
        contactEmail: input.contactEmail,
        contactName: input.contactName,
        createdAt: smokeNow,
        eventId: event.id,
        id: guestGroupId,
        inviteCode: invite.inviteCode,
        inviteTokenHash: invite.inviteTokenHash,
        label: input.label,
        lastOpenedAt: undefined,
        maxPax: input.maxPax,
        notes: input.notes,
        status: input.status ?? "pending",
        updatedAt: smokeNow,
      };

      return toSmokeGuestGroup(guestGroupRecord!);
    }),
    disableGuestGroup: vi.fn(async (_requestedEventId, requestedGroupId) => {
      if (!guestGroupRecord || requestedGroupId !== guestGroupRecord.id) {
        return null;
      }

      guestGroupRecord = {
        ...guestGroupRecord,
        status: "disabled",
        updatedAt: smokeNow,
      };

      return toSmokeGuestGroup(guestGroupRecord!);
    }),
    listGuestGroups: vi.fn(async (requestedEventId) =>
      guestGroupRecord && requestedEventId === guestGroupRecord.eventId
        ? [toSmokeGuestGroup(guestGroupRecord)]
        : [],
    ),
    regenerateInvite: vi.fn(async (_requestedEventId, requestedGroupId, invite) => {
      if (!guestGroupRecord || requestedGroupId !== guestGroupRecord.id) {
        return null;
      }

      guestGroupRecord = {
        ...guestGroupRecord,
        inviteCode: invite.inviteCode,
        inviteTokenHash: invite.inviteTokenHash,
        status: "pending",
        updatedAt: smokeNow,
      };

      return toSmokeGuestGroup(guestGroupRecord!);
    }),
    updateGuestGroup: vi.fn(async (_requestedEventId, requestedGroupId, input) => {
      if (!guestGroupRecord || requestedGroupId !== guestGroupRecord.id) {
        return null;
      }

      guestGroupRecord = {
        ...guestGroupRecord,
        ...input,
        updatedAt: smokeNow,
      };

      return toSmokeGuestGroup(guestGroupRecord!);
    }),
  };

  const publicInviteStore: PublicInviteStore = {
    getPublicEventBySlug: vi.fn(async ({ eventSlug }) => {
      const publicEvent = toSmokePublicEventRecord(event, sections);

      return publicEvent && publicEvent.event.slug === eventSlug ? publicEvent : null;
    }),
    getPublicGuestInvite: vi.fn(async ({ eventSlug, inviteTokenHash }) => {
      const publicEvent = toSmokePublicEventRecord(event, sections);

      if (!publicEvent || publicEvent.event.slug !== eventSlug || !guestGroupRecord) {
        return null;
      }

      if (guestGroupRecord.inviteTokenHash !== inviteTokenHash) {
        return null;
      }

      if (guestGroupRecord.status === "disabled") {
        return "disabled";
      }

      return {
        ...publicEvent,
        guest: {
          guestGroup: {
            label: guestGroupRecord.label,
            maxPax: guestGroupRecord.maxPax,
            status: guestGroupRecord.status,
          },
          response: responseRecord
            ? {
                attendeeCount: responseRecord.attendeeCount,
                guestNames: responseRecord.guestNames,
                responseStatus: responseRecord.responseStatus,
              }
            : null,
          responseStatus: responseRecord?.responseStatus ?? null,
        },
        sections: sections
          .filter(
            (section) =>
              section.enabled &&
              (section.visibility === "public" || section.visibility === "guest_only"),
          )
          .sort((left, right) => left.sortOrder - right.sortOrder),
      };
    }),
  };

  const rsvpStore: RsvpStore = {
    submitGuestRsvp: vi.fn(
      async ({
        eventSlug,
        inviteTokenHash,
        submission,
      }: Parameters<RsvpStore["submitGuestRsvp"]>[0]): Promise<RsvpSubmissionResult> => {
        if (
          !event ||
          event.status !== "published" ||
          event.slug !== eventSlug ||
          !guestGroupRecord
        ) {
          return null;
        }

        if (guestGroupRecord.inviteTokenHash !== inviteTokenHash) {
          return null;
        }

        if (guestGroupRecord.status === "disabled") {
          return "disabled";
        }

        if (submission.attendeeCount > guestGroupRecord.maxPax) {
          return {
            maxPax: guestGroupRecord.maxPax,
            reason: "max_pax_exceeded" as const,
          };
        }

        responseRecord = {
          answers: submission.answers,
          attendeeCount: submission.attendeeCount,
          eventId: event.id,
          guestGroupId: guestGroupRecord.id,
          guestNames: submission.guestNames,
          id: baseRsvpResponse.id,
          message: submission.message,
          responseStatus: submission.responseStatus,
          submittedAt: smokeNow,
          updatedAt: smokeNow,
        };
        guestGroupRecord = {
          ...guestGroupRecord,
          status: "responded",
          updatedAt: smokeNow,
        };
        activity = [
          {
            actorId: guestGroupRecord.id,
            actorType: "guest",
            activityType: "rsvp_submitted",
            createdAt: smokeNow,
            eventId: event.id,
            id: activityEvent.id,
            metadata: {
              guestGroupLabel: guestGroupRecord.label,
            },
          },
        ];
        notifications = [
          {
            createdAt: smokeNow,
            eventId: event.id,
            id: notification.id,
            message: `${guestGroupRecord.label} submitted an RSVP for ${event.title}.`,
            metadata: {
              guestGroupId: guestGroupRecord.id,
            },
            notificationType: "rsvp_submitted",
            readAt: undefined,
            title: "RSVP submitted",
            userId: localUser.id,
          },
        ];

        return {
          response: responseRecord,
          updatedExisting: false,
        };
      },
    ),
  };

  const dashboardDataStore: DashboardDataStore = {
    dismissNotification: vi.fn(async () => true),
    getEventSummary: vi.fn(async () => buildSmokeSummary(guestGroupRecord, responseRecord)),
    listActivity: vi.fn(async () => activity),
    listNotifications: vi.fn(async () => notifications),
    markAllNotificationsRead: vi.fn(
      async () => notifications.filter((item) => !item.readAt).length,
    ),
    markNotificationRead: vi.fn(async () => notifications[0] ?? null),
  };

  return {
    authStore,
    dashboardDataStore,
    eventStore,
    guestGroupStore,
    publicInviteStore,
    rsvpStore,
    themeSectionStore,
  };
}

function smokeSectionId(index: number) {
  return `00000000-0000-4000-8000-${String(700 + index).padStart(12, "0")}`;
}

function toSmokeGuestGroup(record: GuestGroup & InviteTokenRecord): GuestGroup {
  const { inviteTokenHash: _inviteTokenHash, ...guestGroup } = record;

  return guestGroup;
}

function toSmokePublicEventRecord(
  event: Event | null,
  sections: EventSection[],
): PublicEventRecord | null {
  if (!event || event.status !== "published") {
    return null;
  }

  return {
    event: {
      endsAt: event.endsAt,
      eventType: event.eventType,
      id: event.id,
      publicSettings: event.publicSettings,
      slug: event.slug,
      startsAt: event.startsAt,
      status: event.status,
      timezone: event.timezone,
      title: event.title,
      venueAddress: event.venueAddress,
      venueName: event.venueName,
    },
    rsvpFields: {
      collectGuestMessage: event.rsvpSettings.collectGuestMessage,
      collectGuestNames: event.rsvpSettings.collectGuestNames,
    },
    selectedThemeId: event.selectedThemeId,
    sections: sections
      .filter((section) => section.enabled && section.visibility === "public")
      .sort((left, right) => left.sortOrder - right.sortOrder),
    themeConfig: event.themeConfig,
    themeMode: event.themeMode,
  };
}

function buildSmokeSummary(
  guestGroup: (GuestGroup & InviteTokenRecord) | null,
  response: RsvpResponse | null,
): EventSummary {
  const empty = {
    groups: 0,
    pax: 0,
  };

  if (!guestGroup) {
    return {
      attending: empty,
      maybe: empty,
      notAttending: empty,
      pending: empty,
      totalGroups: 0,
      totalInvitedPax: 0,
      totalRespondedPax: 0,
    };
  }

  return {
    attending:
      response?.responseStatus === "attending"
        ? {
            groups: 1,
            pax: response.attendeeCount,
          }
        : empty,
    maybe:
      response?.responseStatus === "maybe"
        ? {
            groups: 1,
            pax: response.attendeeCount,
          }
        : empty,
    notAttending:
      response?.responseStatus === "not_attending"
        ? {
            groups: 1,
            pax: response.attendeeCount,
          }
        : empty,
    pending: response
      ? empty
      : {
          groups: 1,
          pax: guestGroup.maxPax,
        },
    totalGroups: 1,
    totalInvitedPax: guestGroup.maxPax,
    totalRespondedPax: response ? response.attendeeCount : 0,
  };
}

function roleAccess(role: ManagerRole): EventAccessLookup {
  return {
    access: {
      eventId,
      role,
      userId: localUser.id,
    },
    eventFound: true,
  };
}

function createSupabaseToken(
  payload: Record<string, unknown> = {
    email: "manager@example.com",
    sub: "supabase-user-id",
    user_metadata: {
      name: "Ada Manager",
    },
  },
  secret = validApiEnv.SUPABASE_JWT_SECRET,
) {
  const encodedHeader = base64UrlEncode({
    alg: "HS256",
    typ: "JWT",
  });
  const encodedPayload = base64UrlEncode({
    aud: "authenticated",
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...payload,
  });
  const signedContent = `${encodedHeader}.${encodedPayload}`;
  const signature = createHmac("sha256", secret).update(signedContent).digest("base64url");

  return `${signedContent}.${signature}`;
}

function createSupabaseEs256Token(
  payload: Record<string, unknown> = {
    email: "manager@example.com",
    sub: "supabase-user-id",
    user_metadata: {
      name: "Ada Manager",
    },
  },
) {
  const kid = "test-signing-key-id";
  const { privateKey, publicKey } = generateKeyPairSync("ec", {
    namedCurve: "P-256",
  });
  const jwk = {
    ...publicKey.export({ format: "jwk" }),
    alg: "ES256",
    kid,
    use: "sig",
  };
  const encodedHeader = base64UrlEncode({
    alg: "ES256",
    kid,
    typ: "JWT",
  });
  const encodedPayload = base64UrlEncode({
    aud: "authenticated",
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...payload,
  });
  const signedContent = `${encodedHeader}.${encodedPayload}`;
  const signature = sign("sha256", Buffer.from(signedContent), {
    dsaEncoding: "ieee-p1363",
    key: privateKey,
  }).toString("base64url");

  return {
    jwk,
    token: `${signedContent}.${signature}`,
  };
}

function base64UrlEncode(value: Record<string, unknown>) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function extractGuestToken(inviteLink: string) {
  const token = new URL(inviteLink).pathname.split("/").filter(Boolean).pop();

  if (!token) {
    throw new Error(`Unable to extract guest token from ${inviteLink}`);
  }

  return token;
}
