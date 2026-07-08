import type { ApiEnv } from "@lumiere/config";
import { Hono, type Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { secureHeaders } from "hono/secure-headers";

import { ApiHttpError, createApiError } from "./errors";
import { requestIdMiddleware, type ApiBindings } from "./request-context";
import { createRoutes } from "./routes";

export type CreateAppOptions = {
  config: ApiEnv;
};

const resolveRequestId = (context: Context<ApiBindings>) => context.get("requestId") || "unknown";

export const createApp = ({ config }: CreateAppOptions) => {
  const app = new Hono<ApiBindings>();

  app.use("*", secureHeaders());
  app.use("*", requestIdMiddleware());

  app.route("/", createRoutes({ config }));

  app.notFound((context) =>
    context.json(createApiError("NOT_FOUND", "Route not found", resolveRequestId(context)), 404),
  );

  app.onError((error, context) => {
    const requestId = resolveRequestId(context);

    if (error instanceof ApiHttpError) {
      return context.json(
        createApiError(error.code, error.message, requestId, error.fields),
        error.status,
      );
    }

    if (error instanceof HTTPException) {
      return context.json(
        createApiError("BAD_REQUEST", error.message || "Bad request", requestId),
        error.status,
      );
    }

    console.error({ error, requestId }, "Unhandled API error");

    return context.json(createApiError("INTERNAL_ERROR", "Internal server error", requestId), 500);
  });

  return app;
};
