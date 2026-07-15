"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { readDashboardPublicEnv } from "./dashboard-env";

export type DashboardSupabaseClient = SupabaseClient;

const dashboardSupabaseClientCacheKey = "__lumiere_dashboard_supabase_client__";
const dashboardGlobal = globalThis as typeof globalThis & Record<string, unknown>;

export function createDashboardSupabaseClient(): DashboardSupabaseClient {
  const cachedClient = dashboardGlobal[dashboardSupabaseClientCacheKey] as
    DashboardSupabaseClient | undefined;

  if (cachedClient) {
    return cachedClient;
  }

  const env = readDashboardPublicEnv();
  const client = createClient(env.supabaseUrl, env.supabaseAnonKey);

  dashboardGlobal[dashboardSupabaseClientCacheKey] = client;

  return client;
}
