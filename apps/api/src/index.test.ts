import type { ManagerRole } from "@lumiere/types";
import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { AuthStore, EventAccessLookup, LocalUser, UpsertUserProfileInput } from "./auth";
import { createApp } from "./app";
import { loadApiConfig } from "./index";

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
