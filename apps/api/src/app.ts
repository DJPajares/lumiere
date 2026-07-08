import type { ApiEnv } from "@lumiere/config";
import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { secureHeaders } from "hono/secure-headers";

import type { AuthStore } from "./auth";
import type { DashboardDataStore } from "./dashboard-data";
import { ApiHttpError, createApiError } from "./errors";
import type { EventStore } from "./events";
import type { GuestGroupStore } from "./guest-groups";
import type { PublicInviteStore } from "./public-invites";
import { requestIdMiddleware, type ApiBindings } from "./request-context";
import { createRoutes } from "./routes";
import type { RsvpStore } from "./rsvps";
import type { ThemeSectionStore } from "./theme-sections";

export type CreateAppOptions = {
  authStore?: AuthStore;
  config: ApiEnv;
  dashboardDataStore?: DashboardDataStore;
  eventStore?: EventStore;
  guestGroupStore?: GuestGroupStore;
  publicInviteStore?: PublicInviteStore;
  rsvpStore?: RsvpStore;
  themeSectionStore?: ThemeSectionStore;
};

const resolveRequestId = (context: Context<ApiBindings>) => context.get("requestId") || "unknown";

export const createApp = ({
  authStore,
  config,
  dashboardDataStore,
  eventStore,
  guestGroupStore,
  publicInviteStore,
  rsvpStore,
  themeSectionStore,
}: CreateAppOptions) => {
  const app = new Hono<ApiBindings>();

  app.use(
    "*",
    cors({
      allowHeaders: ["Authorization", "Content-Type", "X-Request-Id"],
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      exposeHeaders: ["X-Request-Id"],
      origin: [config.PUBLIC_APP_BASE_URL, config.DASHBOARD_APP_BASE_URL],
    }),
  );
  app.use("*", secureHeaders());
  app.use("*", requestIdMiddleware());

  app.route(
    "/",
    createRoutes({
      authStore,
      config,
      dashboardDataStore,
      eventStore,
      guestGroupStore,
      publicInviteStore,
      rsvpStore,
      themeSectionStore,
    }),
  );

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
