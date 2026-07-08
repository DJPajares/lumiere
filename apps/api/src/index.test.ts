import { afterEach, describe, expect, it, vi } from "vitest";

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
});

function loadTestConfig() {
  for (const [key, value] of Object.entries(validApiEnv)) {
    vi.stubEnv(key, value);
  }

  return loadApiConfig();
}
