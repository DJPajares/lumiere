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
import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { AuthStore, EventAccessLookup, LocalUser, UpsertUserProfileInput } from "./auth";
import { createApp } from "./app";
import type { DashboardDataStore } from "./dashboard-data";
import { ApiHttpError } from "./errors";
import type { EventStore } from "./events";
import type { GuestGroupStore, InviteTokenRecord } from "./guest-groups";
import { hashInviteToken } from "./guest-groups";
import { loadApiConfig } from "./index";
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
  rsvpSettings: {},
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

  it("generates request IDs when callers do not provide one", async () => {
    const app = createApp({ config: loadTestConfig() });
    const response = await app.request("/health");
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("x-request-id")).toEqual(expect.any(String));
    expect(body.requestId).toBe(response.headers.get("x-request-id"));
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
      rsvpSettings: {},
      slug: "new-launch",
      startsAt: "2026-12-01T11:00:00.000Z",
      themeMode: "system",
      timezone: "Asia/Singapore",
      title: "New Launch",
    });
  });

  it("returns 409 when creating an event with a duplicate slug", async () => {
    const { authStore } = createTestAuthStore();
    const { eventStore } = createTestEventStore({
      createError: new ApiHttpError("CONFLICT", "Event slug is already in use"),
    });
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
        message: "Event slug is already in use",
        requestId: "duplicate-slug-request-id",
      },
    });
    expect(response.status).toBe(409);
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
    expect(findEventAccess).toHaveBeenCalledWith(eventId, localUser.id);
    expect(getEventSummary).toHaveBeenCalledWith(eventId);
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
    expect(getEventSummary).not.toHaveBeenCalled();
  });

  it("updates an event when manager has editor access", async () => {
    const updatedEvent = {
      ...baseEvent,
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
      title: "Updated Launch",
    });
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

  it("archives an event instead of hard deleting it", async () => {
    const archivedEvent = {
      ...baseEvent,
      status: "archived" as const,
      updatedAt: "2026-07-08T02:00:00.000Z",
    };
    const { authStore } = createTestAuthStore({
      access: roleAccess("owner"),
    });
    const { archiveEvent, eventStore } = createTestEventStore({
      archivedEvent,
    });
    const app = createApp({ authStore, config: loadTestConfig(), eventStore });
    const response = await app.request(`/events/${eventId}`, {
      headers: {
        authorization: `Bearer ${createSupabaseToken()}`,
      },
      method: "DELETE",
    });

    await expect(response.json()).resolves.toEqual({
      event: archivedEvent,
    });
    expect(response.status).toBe(200);
    expect(archiveEvent).toHaveBeenCalledWith(eventId);
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
    expect(body).toEqual({
      event: publicEventRecord.event,
      selectedThemeId: "lumiere-default",
      theme: toApiTheme(getTheme("lumiere-default")!),
      themeConfig: {},
      themeMode: "system",
      sections: [baseSection],
    });
    expect(JSON.stringify(body)).not.toContain("ownerUserId");
    expect(JSON.stringify(body)).not.toContain(baseGuestGroup.label);
    expect(getPublicEventBySlug).toHaveBeenCalledWith(baseEvent.slug);
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

    await expect(response.json()).resolves.toEqual({
      event: publicGuestInviteRecord.event,
      selectedThemeId: "lumiere-default",
      theme: toApiTheme(getTheme("lumiere-default")!),
      themeConfig: {},
      themeMode: "system",
      sections: [baseSection, guestOnlyRsvpSection],
      guest: publicGuestInviteRecord.guest,
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
          guestNames: ["Mina Tan", "Alex Tan"],
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
        guestNames: ["Mina Tan", "Alex Tan"],
        answers: [],
        message: "Excited to attend.",
      },
    });
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
  const dashboardDataStore: DashboardDataStore = {
    getEventSummary,
    listActivity,
    listNotifications,
  };

  return {
    dashboardDataStore,
    getEventSummary,
    listActivity,
    listNotifications,
  };
}

function createTestEventStore({
  archivedEvent = {
    ...baseEvent,
    status: "archived",
  } as Event,
  createError,
  createdEvent = baseEvent,
  events = [baseEvent],
  updatedEvent = baseEvent,
}: {
  archivedEvent?: Event | null;
  createError?: Error;
  createdEvent?: Event;
  events?: Event[];
  updatedEvent?: Event | null;
} = {}) {
  const archiveEvent = vi.fn(async () => archivedEvent);
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
  const listManagedEvents = vi.fn(async () => events);
  const updateEvent = vi.fn(async (_eventId: string, _input: EventUpdate) => updatedEvent);
  const eventStore: EventStore = {
    archiveEvent,
    createEvent,
    getEvent,
    listManagedEvents,
    updateEvent,
  };

  return {
    archiveEvent,
    createEvent,
    eventStore,
    getEvent,
    listManagedEvents,
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
