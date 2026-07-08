import { envIssuesToMessage, loadApiEnv } from "@lumiere/config";
import { createDatabase, createPostgresClient } from "@lumiere/db";
import { serve } from "@hono/node-server";

import { createDrizzleAuthStore } from "./auth";
import { createApp } from "./app";
import { createDrizzleEventStore } from "./events";
import { createDrizzleThemeSectionStore } from "./theme-sections";

export function loadApiConfig() {
  try {
    return loadApiEnv();
  } catch (error) {
    throw new Error(`Invalid API environment: ${envIssuesToMessage(error)}`);
  }
}

export function startApiServer() {
  const config = loadApiConfig();
  const client = createPostgresClient(config.DATABASE_URL);
  const db = createDatabase(client);
  const authStore = createDrizzleAuthStore(db);
  const eventStore = createDrizzleEventStore(db);
  const themeSectionStore = createDrizzleThemeSectionStore(db);
  const app = createApp({ authStore, config, eventStore, themeSectionStore });

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

if (process.env.NODE_ENV !== "test") {
  startApiServer();
}
