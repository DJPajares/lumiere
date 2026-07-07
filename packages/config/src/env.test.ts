import { describe, expect, it } from "vitest";

import { parseApiEnv, parseDashboardPublicEnv, parseInvitePublicEnv, type EnvSource } from "./env";

const apiEnv: EnvSource = {
  NODE_ENV: "development",
  PORT: "4000",
  DATABASE_URL: "postgresql://user:password@localhost:5432/lumiere",
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
  SUPABASE_JWT_SECRET: "jwt-secret",
  INVITE_TOKEN_SECRET: "invite-secret",
  PUBLIC_APP_BASE_URL: "http://localhost:3000",
  DASHBOARD_APP_BASE_URL: "http://localhost:3001",
};

describe("environment config", () => {
  it("parses required API server env", () => {
    expect(parseApiEnv(apiEnv)).toMatchObject({
      NODE_ENV: "development",
      PORT: 4000,
      SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
    });
  });

  it("rejects missing API secrets", () => {
    expect(() =>
      parseApiEnv({
        ...apiEnv,
        SUPABASE_SERVICE_ROLE_KEY: "",
      }),
    ).toThrow();
  });

  it("parses invite public env without server secrets", () => {
    expect(
      parseInvitePublicEnv({
        NEXT_PUBLIC_API_BASE_URL: "http://localhost:4000",
        NEXT_PUBLIC_APP_NAME: "Lumiere",
        INVITE_TOKEN_SECRET: "server-secret",
      }),
    ).toEqual({
      NEXT_PUBLIC_API_BASE_URL: "http://localhost:4000",
      NEXT_PUBLIC_APP_NAME: "Lumiere",
    });
  });

  it("parses dashboard public env without server secrets", () => {
    expect(
      parseDashboardPublicEnv({
        NEXT_PUBLIC_API_BASE_URL: "http://localhost:4000",
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
        NEXT_PUBLIC_APP_NAME: "Lumiere Dashboard",
        SUPABASE_SERVICE_ROLE_KEY: "server-secret",
      }),
    ).toEqual({
      NEXT_PUBLIC_API_BASE_URL: "http://localhost:4000",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      NEXT_PUBLIC_APP_NAME: "Lumiere Dashboard",
    });
  });
});
