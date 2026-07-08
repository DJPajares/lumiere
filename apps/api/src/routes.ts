import type { ApiEnv } from "@lumiere/config";
import { managerRoleSchema } from "@lumiere/types";
import { Hono, type MiddlewareHandler } from "hono";

import { assertEventAccess, requireManagerAuth, type AuthStore } from "./auth";
import { ApiHttpError } from "./errors";
import type { ApiBindings } from "./request-context";

export type AppOptions = {
  authStore?: AuthStore;
  config: ApiEnv;
};

export const createRoutes = ({ authStore, config }: AppOptions) => {
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

  routes.get(
    "/__test/manager/me",
    requireTestMode(config),
    requireManagerAuth({ authStore, config }),
    (context) => {
      const manager = context.get("manager");

      return context.json({
        manager: {
          displayName: manager.displayName,
          email: manager.email,
          supabaseUserId: manager.supabaseUserId,
          userId: manager.user.id,
        },
      });
    },
  );

  routes.get(
    "/__test/events/:eventId/access/:minimumRole",
    requireTestMode(config),
    requireManagerAuth({ authStore, config }),
    async (context) => {
      if (!authStore) {
        throw new ApiHttpError("INTERNAL_ERROR", "Auth store is not configured");
      }

      const eventId = context.req.param("eventId");
      const minimumRole = managerRoleSchema.safeParse(context.req.param("minimumRole"));

      if (!eventId || !minimumRole.success) {
        throw new ApiHttpError("VALIDATION_ERROR", "Invalid minimum role");
      }

      const access = await assertEventAccess({
        authStore,
        eventId,
        manager: context.get("manager"),
        minimumRole: minimumRole.data,
      });

      return context.json({
        access,
      });
    },
  );

  return routes;
};

const requireTestMode = (config: ApiEnv): MiddlewareHandler<ApiBindings> => {
  return async (_context, next) => {
    if (config.NODE_ENV !== "test") {
      throw new ApiHttpError("NOT_FOUND", "Route not found");
    }

    await next();
  };
};
