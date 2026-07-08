import type { ApiEnv } from "@lumiere/config";
import { availableThemes, getTheme, isThemeId, validateThemeSections } from "@lumiere/themes";
import {
  byEventAndGuestGroupIdParamsSchema,
  byEventIdParamsSchema,
  eventCreateRequestSchema,
  eventSectionsUpdateRequestSchema,
  eventThemeUpdateRequestSchema,
  eventUpdateRequestSchema,
  guestGroupMutationRequestSchema,
  guestInviteParamsSchema,
  managerRoleSchema,
  publicEventParamsSchema,
  rsvpSubmissionRequestSchema,
  type EventType,
  type ThemeMode,
} from "@lumiere/types";
import { Hono, type Context, type MiddlewareHandler } from "hono";

import { assertEventAccess, requireManagerAuth, type AuthStore } from "./auth";
import { ApiHttpError } from "./errors";
import type { EventStore } from "./events";
import {
  buildGuestInviteLink,
  generateInvite,
  type GuestGroupStore,
  type InviteTokenRecord,
  hashInviteToken,
} from "./guest-groups";
import type {
  PublicEventRecord,
  PublicGuestInviteRecord,
  PublicInviteStore,
} from "./public-invites";
import type { ApiBindings } from "./request-context";
import type { RsvpStore, RsvpSubmissionRejected } from "./rsvps";
import { toApiTheme, type ThemeSectionStore } from "./theme-sections";

export type AppOptions = {
  authStore?: AuthStore;
  config: ApiEnv;
  eventStore?: EventStore;
  guestGroupStore?: GuestGroupStore;
  publicInviteStore?: PublicInviteStore;
  rsvpStore?: RsvpStore;
  themeSectionStore?: ThemeSectionStore;
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

export const createRoutes = ({
  authStore,
  config,
  eventStore,
  guestGroupStore,
  publicInviteStore,
  rsvpStore,
  themeSectionStore,
}: AppOptions) => {
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

  routes.get("/themes", (context) =>
    context.json({
      themes: availableThemes.map(toApiTheme),
    }),
  );

  routes.get("/themes/:themeId", (context) => {
    const theme = getTheme(context.req.param("themeId"));

    if (!theme) {
      throw new ApiHttpError("NOT_FOUND", "Theme not found");
    }

    return context.json({
      theme: toApiTheme(theme),
    });
  });

  routes.get("/public/events/:eventSlug", async (context) => {
    const store = requirePublicInviteStore(publicInviteStore);
    const { eventSlug } = parsePublicEventParams(context.req.param("eventSlug"));
    const publicEvent = await store.getPublicEventBySlug(eventSlug);

    if (!publicEvent) {
      throw new ApiHttpError("NOT_FOUND", "Public event not found");
    }

    return context.json(toPublicEventResponse(publicEvent));
  });

  routes.get("/public/events/:eventSlug/guest/:guestToken", async (context) => {
    const store = requirePublicInviteStore(publicInviteStore);
    const { eventSlug, guestToken } = parseGuestInviteParams({
      eventSlug: context.req.param("eventSlug"),
      guestToken: context.req.param("guestToken"),
    });
    const publicGuestInvite = await store.getPublicGuestInvite({
      eventSlug,
      inviteTokenHash: hashInviteToken(guestToken, config.INVITE_TOKEN_SECRET),
    });

    if (!publicGuestInvite) {
      throw new ApiHttpError("NOT_FOUND", "Guest invite not found");
    }

    if (publicGuestInvite === "disabled") {
      throw new ApiHttpError("FORBIDDEN", "Guest invite is disabled");
    }

    return context.json(toPublicGuestInviteResponse(publicGuestInvite));
  });

  routes.post("/public/events/:eventSlug/guest/:guestToken/rsvp", async (context) => {
    const store = requireRsvpStore(rsvpStore);
    const { eventSlug, guestToken } = parseGuestInviteParams({
      eventSlug: context.req.param("eventSlug"),
      guestToken: context.req.param("guestToken"),
    });
    const submission = await parseJsonBody(context, rsvpSubmissionRequestSchema);
    const result = await store.submitGuestRsvp({
      eventSlug,
      inviteTokenHash: hashInviteToken(guestToken, config.INVITE_TOKEN_SECRET),
      submission,
    });

    if (!result) {
      throw new ApiHttpError("NOT_FOUND", "Guest invite not found");
    }

    if (result === "disabled") {
      throw new ApiHttpError("FORBIDDEN", "Guest invite is disabled");
    }

    if ("response" in result) {
      return context.json({
        response: result.response,
      });
    }

    throwRsvpRejection(result);
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
    "/events/:eventId/theme",
    requireManagerAuth({ authStore, config }),
    async (context) => {
      const stores = requireManagerConfigurationStores({ authStore, themeSectionStore });
      const eventId = parseEventIdParam(context.req.param("eventId"));
      await assertEventAccess({
        authStore: stores.authStore,
        eventId,
        manager: context.get("manager"),
      });
      const state = await stores.themeSectionStore.getEventTheme(eventId);

      if (!state) {
        throw new ApiHttpError("NOT_FOUND", "Event not found");
      }

      const theme = state.selectedThemeId ? getTheme(state.selectedThemeId) : undefined;

      return context.json({
        selectedThemeId: state.selectedThemeId,
        theme: theme ? toApiTheme(theme) : undefined,
        themeConfig: state.themeConfig,
        themeMode: state.themeMode,
      });
    },
  );

  routes.put(
    "/events/:eventId/theme",
    requireManagerAuth({ authStore, config }),
    async (context) => {
      const stores = requireManagerConfigurationStores({ authStore, themeSectionStore });
      const eventId = parseEventIdParam(context.req.param("eventId"));
      const input = await parseJsonBody(context, eventThemeUpdateRequestSchema);
      await assertEventAccess({
        authStore: stores.authStore,
        eventId,
        manager: context.get("manager"),
        minimumRole: "editor",
      });

      const currentThemeState = await stores.themeSectionStore.getEventTheme(eventId);

      if (!currentThemeState) {
        throw new ApiHttpError("NOT_FOUND", "Event not found");
      }

      const theme = getTheme(input.selectedThemeId);

      if (!theme) {
        throw new ApiHttpError("NOT_FOUND", "Theme not found");
      }

      assertThemeCanBeApplied({
        eventType: currentThemeState.eventType,
        theme,
        themeMode: input.themeMode,
      });

      const state = await stores.themeSectionStore.updateEventTheme(eventId, input);

      if (!state) {
        throw new ApiHttpError("NOT_FOUND", "Event not found");
      }

      return context.json({
        selectedThemeId: state.selectedThemeId,
        theme: toApiTheme(theme),
        themeConfig: state.themeConfig,
        themeMode: state.themeMode,
      });
    },
  );

  routes.get(
    "/events/:eventId/sections",
    requireManagerAuth({ authStore, config }),
    async (context) => {
      const stores = requireManagerConfigurationStores({ authStore, themeSectionStore });
      const eventId = parseEventIdParam(context.req.param("eventId"));
      await assertEventAccess({
        authStore: stores.authStore,
        eventId,
        manager: context.get("manager"),
      });
      const sections = await stores.themeSectionStore.listSections(eventId);

      return context.json({
        sections,
      });
    },
  );

  routes.put(
    "/events/:eventId/sections",
    requireManagerAuth({ authStore, config }),
    async (context) => {
      const stores = requireManagerConfigurationStores({ authStore, themeSectionStore });
      const eventId = parseEventIdParam(context.req.param("eventId"));
      const input = await parseJsonBody(context, eventSectionsUpdateRequestSchema);
      await assertEventAccess({
        authStore: stores.authStore,
        eventId,
        manager: context.get("manager"),
        minimumRole: "editor",
      });
      const state = await stores.themeSectionStore.getEventTheme(eventId);

      if (!state) {
        throw new ApiHttpError("NOT_FOUND", "Event not found");
      }

      if (!state.selectedThemeId || !isThemeId(state.selectedThemeId)) {
        throw new ApiHttpError("VALIDATION_ERROR", "Select a valid theme before updating sections");
      }

      const theme = getTheme(state.selectedThemeId);

      if (!theme) {
        throw new ApiHttpError("VALIDATION_ERROR", "Select a valid theme before updating sections");
      }

      assertThemeCanBeApplied({
        eventType: state.eventType,
        theme,
        themeMode: state.themeMode,
      });

      const validationResults = validateThemeSections(state.selectedThemeId, input.sections);
      const invalidSectionFields = validationResults.flatMap((result, index) =>
        result.ok
          ? []
          : result.issues.map((message) => ({
              message,
              path: ["sections", index],
            })),
      );

      if (invalidSectionFields.length > 0) {
        throw new ApiHttpError("VALIDATION_ERROR", "Invalid event sections", {
          fields: invalidSectionFields,
        });
      }

      const sections = await stores.themeSectionStore.replaceSections(
        eventId,
        validationResults.flatMap((result) => (result.ok ? [result.section] : [])),
      );

      return context.json({
        sections,
      });
    },
  );

  routes.get(
    "/events/:eventId/guest-groups",
    requireManagerAuth({ authStore, config }),
    async (context) => {
      const stores = requireManagerGuestGroupStores({ authStore, eventStore, guestGroupStore });
      const eventId = parseEventIdParam(context.req.param("eventId"));
      await assertEventAccess({
        authStore: stores.authStore,
        eventId,
        manager: context.get("manager"),
      });
      const guestGroups = await stores.guestGroupStore.listGuestGroups(eventId);

      return context.json({
        guestGroups,
      });
    },
  );

  routes.post(
    "/events/:eventId/guest-groups",
    requireManagerAuth({ authStore, config }),
    async (context) => {
      const stores = requireManagerGuestGroupStores({ authStore, eventStore, guestGroupStore });
      const eventId = parseEventIdParam(context.req.param("eventId"));
      const input = await parseJsonBody(context, guestGroupMutationRequestSchema);
      await assertEventAccess({
        authStore: stores.authStore,
        eventId,
        manager: context.get("manager"),
        minimumRole: "editor",
      });
      const event = await stores.eventStore.getEvent(eventId);

      if (!event) {
        throw new ApiHttpError("NOT_FOUND", "Event not found");
      }

      const invite = generateInvite(config.INVITE_TOKEN_SECRET);
      const guestGroup = await stores.guestGroupStore.createGuestGroup(
        eventId,
        input,
        toInviteTokenRecord(invite),
      );

      return context.json(
        {
          guestGroup,
          inviteLink: buildGuestInviteLink({
            baseUrl: config.PUBLIC_APP_BASE_URL,
            eventSlug: event.slug,
            token: invite.token,
          }),
        },
        201,
      );
    },
  );

  routes.patch(
    "/events/:eventId/guest-groups/:groupId",
    requireManagerAuth({ authStore, config }),
    async (context) => {
      const stores = requireManagerGuestGroupStores({ authStore, eventStore, guestGroupStore });
      const { eventId, groupId } = parseEventAndGuestGroupIdParams({
        eventId: context.req.param("eventId"),
        groupId: context.req.param("groupId"),
      });
      const input = await parseJsonBody(context, guestGroupMutationRequestSchema);
      await assertEventAccess({
        authStore: stores.authStore,
        eventId,
        manager: context.get("manager"),
        minimumRole: "editor",
      });
      const guestGroup = await stores.guestGroupStore.updateGuestGroup(eventId, groupId, input);

      if (!guestGroup) {
        throw new ApiHttpError("NOT_FOUND", "Guest group not found");
      }

      return context.json({
        guestGroup,
      });
    },
  );

  routes.delete(
    "/events/:eventId/guest-groups/:groupId",
    requireManagerAuth({ authStore, config }),
    async (context) => {
      const stores = requireManagerGuestGroupStores({ authStore, eventStore, guestGroupStore });
      const { eventId, groupId } = parseEventAndGuestGroupIdParams({
        eventId: context.req.param("eventId"),
        groupId: context.req.param("groupId"),
      });
      await assertEventAccess({
        authStore: stores.authStore,
        eventId,
        manager: context.get("manager"),
        minimumRole: "editor",
      });
      const guestGroup = await stores.guestGroupStore.disableGuestGroup(eventId, groupId);

      if (!guestGroup) {
        throw new ApiHttpError("NOT_FOUND", "Guest group not found");
      }

      return context.json({
        guestGroup,
      });
    },
  );

  routes.post(
    "/events/:eventId/guest-groups/:groupId/regenerate-link",
    requireManagerAuth({ authStore, config }),
    async (context) => {
      const stores = requireManagerGuestGroupStores({ authStore, eventStore, guestGroupStore });
      const { eventId, groupId } = parseEventAndGuestGroupIdParams({
        eventId: context.req.param("eventId"),
        groupId: context.req.param("groupId"),
      });
      await assertEventAccess({
        authStore: stores.authStore,
        eventId,
        manager: context.get("manager"),
        minimumRole: "editor",
      });
      const event = await stores.eventStore.getEvent(eventId);

      if (!event) {
        throw new ApiHttpError("NOT_FOUND", "Event not found");
      }

      const invite = generateInvite(config.INVITE_TOKEN_SECRET);
      const guestGroup = await stores.guestGroupStore.regenerateInvite(
        eventId,
        groupId,
        toInviteTokenRecord(invite),
      );

      if (!guestGroup) {
        throw new ApiHttpError("NOT_FOUND", "Guest group not found");
      }

      return context.json({
        guestGroup,
        inviteLink: buildGuestInviteLink({
          baseUrl: config.PUBLIC_APP_BASE_URL,
          eventSlug: event.slug,
          token: invite.token,
        }),
      });
    },
  );

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

const requireThemeSectionStore = (themeSectionStore: ThemeSectionStore | undefined) => {
  if (!themeSectionStore) {
    throw new ApiHttpError("INTERNAL_ERROR", "Theme section store is not configured");
  }

  return themeSectionStore;
};

const requireManagerConfigurationStores = ({
  authStore,
  themeSectionStore,
}: {
  authStore: AuthStore | undefined;
  themeSectionStore: ThemeSectionStore | undefined;
}) => {
  if (!authStore) {
    throw new ApiHttpError("INTERNAL_ERROR", "Auth store is not configured");
  }

  return {
    authStore,
    themeSectionStore: requireThemeSectionStore(themeSectionStore),
  };
};

const requireGuestGroupStore = (guestGroupStore: GuestGroupStore | undefined) => {
  if (!guestGroupStore) {
    throw new ApiHttpError("INTERNAL_ERROR", "Guest group store is not configured");
  }

  return guestGroupStore;
};

const requirePublicInviteStore = (publicInviteStore: PublicInviteStore | undefined) => {
  if (!publicInviteStore) {
    throw new ApiHttpError("INTERNAL_ERROR", "Public invite store is not configured");
  }

  return publicInviteStore;
};

const requireRsvpStore = (rsvpStore: RsvpStore | undefined) => {
  if (!rsvpStore) {
    throw new ApiHttpError("INTERNAL_ERROR", "RSVP store is not configured");
  }

  return rsvpStore;
};

const requireManagerGuestGroupStores = ({
  authStore,
  eventStore,
  guestGroupStore,
}: {
  authStore: AuthStore | undefined;
  eventStore: EventStore | undefined;
  guestGroupStore: GuestGroupStore | undefined;
}) => ({
  ...requireManagerStores({ authStore, eventStore }),
  guestGroupStore: requireGuestGroupStore(guestGroupStore),
});

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

const parseEventAndGuestGroupIdParams = ({
  eventId,
  groupId,
}: {
  eventId: string | undefined;
  groupId: string | undefined;
}) => {
  const result = byEventAndGuestGroupIdParamsSchema.safeParse({
    eventId,
    groupId,
  });

  if (!result.success) {
    throw new ApiHttpError("VALIDATION_ERROR", "Invalid guest group ID", {
      fields: zodIssuesToFieldErrors(result.error.issues),
    });
  }

  return result.data;
};

const parsePublicEventParams = (eventSlug: string | undefined) => {
  const result = publicEventParamsSchema.safeParse({
    eventSlug,
  });

  if (!result.success) {
    throw new ApiHttpError("VALIDATION_ERROR", "Invalid event slug", {
      fields: zodIssuesToFieldErrors(result.error.issues),
    });
  }

  return result.data;
};

const parseGuestInviteParams = ({
  eventSlug,
  guestToken,
}: {
  eventSlug: string | undefined;
  guestToken: string | undefined;
}) => {
  const result = guestInviteParamsSchema.safeParse({
    eventSlug,
    guestToken,
  });

  if (!result.success) {
    throw new ApiHttpError("VALIDATION_ERROR", "Invalid guest invite", {
      fields: zodIssuesToFieldErrors(result.error.issues),
    });
  }

  return result.data;
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

const throwRsvpRejection = (rejection: RsvpSubmissionRejected): never => {
  if (rejection.reason === "closed") {
    throw new ApiHttpError("FORBIDDEN", "RSVP is closed");
  }

  if (rejection.reason === "max_pax_exceeded") {
    throw new ApiHttpError("VALIDATION_ERROR", "Attendee count cannot exceed guest group max pax", {
      fields: [
        {
          message: `Attendee count cannot exceed ${rejection.maxPax}`,
          path: ["attendeeCount"],
        },
      ],
    });
  }

  if (rejection.reason === "maybe_disabled") {
    throw new ApiHttpError("VALIDATION_ERROR", "Maybe RSVPs are not enabled", {
      fields: [
        {
          message: "Maybe RSVPs are not enabled for this event",
          path: ["responseStatus"],
        },
      ],
    });
  }

  throw new ApiHttpError("CONFLICT", "RSVP updates are not allowed");
};

const assertThemeCanBeApplied = ({
  eventType,
  theme,
  themeMode,
}: {
  eventType: EventType;
  theme: NonNullable<ReturnType<typeof getTheme>>;
  themeMode: ThemeMode;
}) => {
  if (!theme.supportedEventTypes.includes(eventType)) {
    throw new ApiHttpError("VALIDATION_ERROR", "Theme does not support this event type", {
      fields: [
        {
          message: `${theme.label} does not support ${eventType} events`,
          path: ["selectedThemeId"],
        },
      ],
    });
  }

  if (!theme.supportedModes.includes(themeMode)) {
    throw new ApiHttpError("VALIDATION_ERROR", "Theme does not support this mode", {
      fields: [
        {
          message: `${theme.label} does not support ${themeMode} mode`,
          path: ["themeMode"],
        },
      ],
    });
  }
};

const toInviteTokenRecord = ({
  inviteCode,
  inviteTokenHash,
}: InviteTokenRecord): InviteTokenRecord => ({
  inviteCode,
  inviteTokenHash,
});

const toPublicEventResponse = (publicEvent: PublicEventRecord) => {
  const theme = publicEvent.selectedThemeId ? getTheme(publicEvent.selectedThemeId) : undefined;

  return {
    event: publicEvent.event,
    selectedThemeId: publicEvent.selectedThemeId,
    theme: theme ? toApiTheme(theme) : undefined,
    themeConfig: publicEvent.themeConfig,
    themeMode: publicEvent.themeMode,
    sections: publicEvent.sections,
  };
};

const toPublicGuestInviteResponse = (publicGuestInvite: PublicGuestInviteRecord) => ({
  ...toPublicEventResponse(publicGuestInvite),
  guest: publicGuestInvite.guest,
});
