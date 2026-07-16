import { envIssuesToMessage, loadApiEnv } from "@lumiere/config";
import { createDatabase, createPostgresClient } from "@lumiere/db";
import { serve } from "@hono/node-server";

import { createDrizzleAuthStore } from "./auth";
import { createApp } from "./app";
import { createDrizzleDashboardDataStore } from "./dashboard-data";
import { createDrizzleEventStore } from "./events";
import { createDrizzleGuestGroupStore } from "./guest-groups";
import { createDrizzlePublicInviteStore } from "./public-invites";
import { createDrizzleRsvpStore } from "./rsvps";
import { createDrizzleThemeSectionStore } from "./theme-sections";

export function loadApiConfig() {
  try {
    return loadApiEnv();
  } catch (error) {
    throw new Error(`Invalid API environment: ${envIssuesToMessage(error)}`);
  }
}

export function createApiApplication(config = loadApiConfig()) {
  const client = createPostgresClient(config.DATABASE_URL);
  const db = createDatabase(client);
  const authStore = createDrizzleAuthStore(db);
  const dashboardDataStore = createDrizzleDashboardDataStore(db);
  const eventStore = createDrizzleEventStore(db);
  const guestGroupStore = createDrizzleGuestGroupStore(db);
  const publicInviteStore = createDrizzlePublicInviteStore(db);
  const rsvpStore = createDrizzleRsvpStore(db);
  const themeSectionStore = createDrizzleThemeSectionStore(db);
  return createApp({
    authStore,
    config,
    dashboardDataStore,
    eventStore,
    guestGroupStore,
    publicInviteStore,
    rsvpStore,
    themeSectionStore,
  });
}

export function startApiServer() {
  const config = loadApiConfig();
  const app = createApiApplication(config);

  return serve(
    {
      fetch: app.fetch,
      port: config.PORT,
    },
    (info) => {
      console.log(`Lumiere API listening on http://localhost:${info.port}`);
    },
  );
}

const isVercelRuntime = process.env.VERCEL === "1" && process.env.NODE_ENV !== "test";
const vercelApp = isVercelRuntime ? createApiApplication() : undefined;

export default vercelApp;

if (!isVercelRuntime && process.env.NODE_ENV !== "test") {
  startApiServer();
}
