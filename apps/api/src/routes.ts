import type { ApiEnv } from "@lumiere/config";
import { Hono } from "hono";

import { ApiHttpError } from "./errors";
import type { ApiBindings } from "./request-context";

export type AppOptions = {
  config: ApiEnv;
};

export const createRoutes = ({ config }: AppOptions) => {
  const routes = new Hono<ApiBindings>();

  routes.get("/health", (context) =>
    context.json({
      status: "ok",
      service: "lumiere-api",
      environment: config.NODE_ENV,
      requestId: context.get("requestId"),
    }),
  );

  routes.get("/__test/error", () => {
    if (config.NODE_ENV !== "test") {
      throw new ApiHttpError("NOT_FOUND", "Route not found");
    }

    throw new ApiHttpError("BAD_REQUEST", "Test error");
  });

  return routes;
};
