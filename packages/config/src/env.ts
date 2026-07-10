import { z } from "zod";

export type EnvSource = Record<string, string | undefined>;

const nonEmptyString = z.string().trim().min(1, "Required");

const optionalNonEmptyString = z.preprocess(
  (value) => (value === "" ? undefined : value),
  nonEmptyString.optional(),
);

const appUrl = nonEmptyString.url("Must be a valid URL");

const apiEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  PORT: z.coerce.number().int().positive().max(65535),
  DATABASE_URL: nonEmptyString,
  SUPABASE_URL: appUrl,
  SUPABASE_SERVICE_ROLE_KEY: nonEmptyString,
  SUPABASE_JWT_SECRET: nonEmptyString,
  SUPABASE_JWKS: optionalNonEmptyString,
  INVITE_TOKEN_SECRET: nonEmptyString,
  PUBLIC_APP_BASE_URL: appUrl,
  DASHBOARD_APP_BASE_URL: appUrl,
});

const invitePublicEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: appUrl,
  NEXT_PUBLIC_APP_NAME: nonEmptyString,
});

const dashboardPublicEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: appUrl,
  NEXT_PUBLIC_SUPABASE_URL: appUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: nonEmptyString,
  NEXT_PUBLIC_APP_NAME: nonEmptyString,
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;
export type InvitePublicEnv = z.infer<typeof invitePublicEnvSchema>;
export type DashboardPublicEnv = z.infer<typeof dashboardPublicEnvSchema>;

export function parseApiEnv(source: EnvSource): ApiEnv {
  return apiEnvSchema.parse(source);
}

export function parseInvitePublicEnv(source: EnvSource): InvitePublicEnv {
  return invitePublicEnvSchema.parse(source);
}

export function parseDashboardPublicEnv(source: EnvSource): DashboardPublicEnv {
  return dashboardPublicEnvSchema.parse(source);
}

export function loadApiEnv(source: EnvSource = process.env): ApiEnv {
  return parseApiEnv(source);
}

export function loadInvitePublicEnv(source: EnvSource = process.env): InvitePublicEnv {
  return parseInvitePublicEnv(source);
}

export function loadDashboardPublicEnv(source: EnvSource = process.env): DashboardPublicEnv {
  return parseDashboardPublicEnv(source);
}

export function envIssuesToMessage(error: unknown): string {
  if (!(error instanceof z.ZodError)) {
    return error instanceof Error ? error.message : String(error);
  }

  return error.issues
    .map((issue) => {
      const key = issue.path.join(".") || "environment";
      return `${key}: ${issue.message}`;
    })
    .join("; ");
}
