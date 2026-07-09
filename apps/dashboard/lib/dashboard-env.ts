export type DashboardPublicEnv = {
  apiBaseUrl: string;
  appName: string;
  supabaseAnonKey: string;
  supabaseUrl: string;
};

export function readDashboardPublicEnv(): DashboardPublicEnv {
  const env = {
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ?? "",
    appName: process.env.NEXT_PUBLIC_APP_NAME?.trim() ?? "",
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "",
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "",
  };
  const missing = Object.entries(env)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Dashboard auth is not configured. Missing ${missing.join(", ")}.`);
  }

  assertUrl(env.apiBaseUrl, "NEXT_PUBLIC_API_BASE_URL");
  assertUrl(env.supabaseUrl, "NEXT_PUBLIC_SUPABASE_URL");

  return {
    apiBaseUrl: env.apiBaseUrl,
    appName: env.appName,
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
