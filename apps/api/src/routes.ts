import type { ApiEnv } from "@lumiere/config";
import {
  byEventIdParamsSchema,
  eventCreateRequestSchema,
  eventUpdateRequestSchema,
  managerRoleSchema,
} from "@lumiere/types";
import { Hono, type Context, type MiddlewareHandler } from "hono";

import { assertEventAccess, requireManagerAuth, type AuthStore } from "./auth";
import { ApiHttpError } from "./errors";
import type { EventStore } from "./events";
import type { ApiBindings } from "./request-context";

export type AppOptions = {
  authStore?: AuthStore;
  config: ApiEnv;
  eventStore?: EventStore;
};

type ValidationIssue = {
  message: string;
  path: readonly PropertyKey[];
};

type SafeParseSchema<TOutput> = {
  safeParse(value: unknown):
    | {
        data: TOutput;
        success: true;
      }
    | {
        error: {
          issues: ValidationIssue[];
        };
        success: false;
      };
};

export const createRoutes = ({ authStore, config, eventStore }: AppOptions) => {
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

  routes.get("/events", requireManagerAuth({ authStore, config }), async (context) => {
    const store = requireEventStore(eventStore);
    const manager = context.get("manager");
    const events = await store.listManagedEvents(manager.user.id);

    return context.json({
      events,
    });
  });

  routes.post("/events", requireManagerAuth({ authStore, config }), async (context) => {
    const store = requireEventStore(eventStore);
    const manager = context.get("manager");
    const input = await parseJsonBody(context, eventCreateRequestSchema);
    const event = await store.createEvent(manager.user.id, input);

    return context.json(
      {
        event,
      },
      201,
    );
  });

  routes.get("/events/:eventId", requireManagerAuth({ authStore, config }), async (context) => {
    const stores = requireManagerStores({ authStore, eventStore });
    const eventId = parseEventIdParam(context.req.param("eventId"));
    await assertEventAccess({
      authStore: stores.authStore,
      eventId,
      manager: context.get("manager"),
    });
    const event = await stores.eventStore.getEvent(eventId);

    if (!event) {
      throw new ApiHttpError("NOT_FOUND", "Event not found");
    }

    return context.json({
      event,
    });
  });

  routes.patch("/events/:eventId", requireManagerAuth({ authStore, config }), async (context) => {
    const stores = requireManagerStores({ authStore, eventStore });
    const eventId = parseEventIdParam(context.req.param("eventId"));
    const input = await parseJsonBody(context, eventUpdateRequestSchema);
    await assertEventAccess({
      authStore: stores.authStore,
      eventId,
      manager: context.get("manager"),
      minimumRole: "editor",
    });
    const event = await stores.eventStore.updateEvent(eventId, input);

    if (!event) {
      throw new ApiHttpError("NOT_FOUND", "Event not found");
    }

    return context.json({
      event,
    });
  });

  routes.delete("/events/:eventId", requireManagerAuth({ authStore, config }), async (context) => {
    const stores = requireManagerStores({ authStore, eventStore });
    const eventId = parseEventIdParam(context.req.param("eventId"));
    await assertEventAccess({
      authStore: stores.authStore,
      eventId,
      manager: context.get("manager"),
      minimumRole: "owner",
    });
    const event = await stores.eventStore.archiveEvent(eventId);

    if (!event) {
      throw new ApiHttpError("NOT_FOUND", "Event not found");
    }

    return context.json({
      event,
    });
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

const requireEventStore = (eventStore: EventStore | undefined) => {
  if (!eventStore) {
    throw new ApiHttpError("INTERNAL_ERROR", "Event store is not configured");
  }

  return eventStore;
};

const requireManagerStores = ({
  authStore,
  eventStore,
}: {
  authStore: AuthStore | undefined;
  eventStore: EventStore | undefined;
}) => {
  if (!authStore) {
    throw new ApiHttpError("INTERNAL_ERROR", "Auth store is not configured");
  }

  return {
    authStore,
    eventStore: requireEventStore(eventStore),
  };
};

const parseEventIdParam = (eventId: string | undefined) => {
  const result = byEventIdParamsSchema.safeParse({
    eventId,
  });

  if (!result.success) {
    throw new ApiHttpError("VALIDATION_ERROR", "Invalid event ID", {
      fields: zodIssuesToFieldErrors(result.error.issues),
    });
  }

  return result.data.eventId;
};

const parseJsonBody = async <TOutput>(
  context: Context<ApiBindings>,
  schema: SafeParseSchema<TOutput>,
): Promise<TOutput> => {
  let body: unknown;

  try {
    body = await context.req.json();
  } catch {
    throw new ApiHttpError("BAD_REQUEST", "Request body must be valid JSON");
  }

  const result = schema.safeParse(body);

  if (!result.success) {
    throw new ApiHttpError("VALIDATION_ERROR", "Invalid request body", {
      fields: zodIssuesToFieldErrors(result.error.issues),
    });
  }

  return result.data;
};

const zodIssuesToFieldErrors = (issues: ValidationIssue[]) =>
  issues.map((issue) => ({
    message: issue.message,
    path: issue.path.map((part) => (typeof part === "number" ? part : String(part))),
  }));
