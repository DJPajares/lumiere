export type DashboardPublicEnv = {
  apiBaseUrl: string;
  appName: string;
  siteUrl: string;
  supabaseAnonKey: string;
  supabaseUrl: string;
};

const defaultDashboardAppName = "Lumiere Dashboard";

export function readDashboardPublicEnv(): DashboardPublicEnv {
  const env = {
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ?? "",
    appName: process.env.NEXT_PUBLIC_APP_NAME?.trim() || defaultDashboardAppName,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "",
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "",
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "",
  };
  const missing = Object.entries(env)
    .filter(([key, value]) => key !== "siteUrl" && !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Dashboard auth is not configured. Missing ${missing.join(", ")}.`);
  }

  assertUrl(env.apiBaseUrl, "NEXT_PUBLIC_API_BASE_URL");
  if (env.siteUrl) {
    assertUrl(env.siteUrl, "NEXT_PUBLIC_SITE_URL");
  }
  assertUrl(env.supabaseUrl, "NEXT_PUBLIC_SUPABASE_URL");

  return {
    apiBaseUrl: env.apiBaseUrl,
    appName: env.appName,
    siteUrl: env.siteUrl,
    supabaseAnonKey: env.supabaseAnonKey,
    supabaseUrl: env.supabaseUrl,
  };
}

function assertUrl(value: string, key: string) {
  try {
    new URL(value);
  } catch {
    throw new Error(`Dashboard auth is not configured. ${key} must be a valid URL.`);
  }
}
