import { serve } from "@hono/node-server";

import { createApiApplication, loadApiConfig } from "./bootstrap";

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

startApiServer();
