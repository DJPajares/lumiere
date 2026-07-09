"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { readDashboardPublicEnv } from "./dashboard-env";

export type DashboardSupabaseClient = SupabaseClient;

export function createDashboardSupabaseClient(): DashboardSupabaseClient {
  const env = readDashboardPublicEnv();

  return createClient(env.supabaseUrl, env.supabaseAnonKey);
}
