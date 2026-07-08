"use client";

import { readDashboardPublicEnv } from "./dashboard-env";

export type DashboardApiFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
export type DashboardSupabaseSessionClient = {
  auth: {
    getSession: () => Promise<{
      data: {
        session: {
          access_token: string;
        } | null;
      };
    }>;
  };
};

type DashboardApiClientOptions = {
  baseUrl?: string;
  fetch?: DashboardApiFetch;
};

export function createDashboardApiClient(
  supabase: DashboardSupabaseSessionClient,
  options: DashboardApiClientOptions = {},
) {
  const baseUrl = options.baseUrl ?? readDashboardPublicEnv().apiBaseUrl;
  const fetchImplementation = options.fetch ?? globalThis.fetch?.bind(globalThis);

  if (!fetchImplementation) {
    throw new Error("Dashboard API requests require a fetch implementation.");
  }

  return {
    authorizedFetch: async (path: string, init: RequestInit = {}) => {
      const headers = new Headers(init.headers);
      const token = await getDashboardAccessToken(supabase);

      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }

      return fetchImplementation(buildApiUrl(baseUrl, path), {
        ...init,
        headers,
      });
    },
    baseUrl,
    getAccessToken: () => getDashboardAccessToken(supabase),
  };
}

async function getDashboardAccessToken(supabase: DashboardSupabaseSessionClient) {
  const { data } = await supabase.auth.getSession();

  return data.session?.access_token ?? null;
}

function buildApiUrl(baseUrl: string, path: string) {
  return new URL(path.replace(/^\/+/, ""), `${baseUrl.replace(/\/+$/, "")}/`).toString();
}
