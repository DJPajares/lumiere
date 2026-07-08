import { envIssuesToMessage, loadApiEnv } from "@lumiere/config";
import { serve } from "@hono/node-server";

import { createApp } from "./app";

export function loadApiConfig() {
  try {
    return loadApiEnv();
  } catch (error) {
    throw new Error(`Invalid API environment: ${envIssuesToMessage(error)}`);
  }
}

export function startApiServer() {
  const config = loadApiConfig();
  const app = createApp({ config });

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
