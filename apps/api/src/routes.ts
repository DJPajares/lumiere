import type { ApiEnv } from "@lumiere/config";
import {
  availableThemes,
  evaluateThemeCompatibility,
  getTheme,
  isThemeId,
  validateEventTypeSections,
  validateThemeSections,
} from "@lumiere/themes";
import {
  byEventAndGuestGroupIdParamsSchema,
  byEventAndNotificationIdParamsSchema,
  byEventIdParamsSchema,
  eventCreateRequestSchema,
  eventDeletionRequestSchema,
  eventSectionsUpdateRequestSchema,
  eventSlugSuggestionRequestSchema,
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
import { createHmac } from "node:crypto";

import { assertEventAccess, requireManagerAuth, type AuthStore } from "./auth";
import type { DashboardDataStore } from "./dashboard-data";
import { ApiHttpError } from "./errors";
import type { EventStore } from "./events";
import {
  buildGuestInviteLink,
  decryptInviteToken,
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
import { suggestPublicSlug } from "./public-slugs";
import type { ApiBindings } from "./request-context";
import type { RsvpStore, RsvpSubmissionRejected } from "./rsvps";
import { toApiTheme, type ThemeSectionStore } from "./theme-sections";

export type AppOptions = {
  authStore?: AuthStore;
  config: ApiEnv;
  dashboardDataStore?: DashboardDataStore;
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

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rsvpRateLimitMaxAttempts = 20;
const rsvpRateLimitWindowMs = 10 * 60 * 1000;

export const createRoutes = ({
  authStore,
  config,
  dashboardDataStore,
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
    const publicAccessCode = context.req.query("accessCode");
    const publicEvent = await store.getPublicEventBySlug({
      eventSlug,
      publicAccessCodeHash: publicAccessCode
        ? hashPublicAccessCode(publicAccessCode, config.INVITE_TOKEN_SECRET)
        : undefined,
    });

    if (!publicEvent) {
      throw new ApiHttpError("NOT_FOUND", "Public event not found");
    }

    if (publicEvent === "access_required") {
      throw new ApiHttpError("FORBIDDEN", "Public event access code is required");
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

  routes.post(
    "/public/events/:eventSlug/guest/:guestToken/rsvp",
    createRsvpRateLimitMiddleware(config),
    async (context) => {
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
    },
  );

  routes.get("/events", requireManagerAuth({ authStore, config }), async (context) => {
    const store = requireEventStore(eventStore);
    const manager = context.get("manager");
    const events = await store.listManagedEvents(manager.user.id);

    return context.json({
      events,
    });
  });

  routes.get("/events/trash", requireManagerAuth({ authStore, config }), async (context) => {
    const store = requireEventStore(eventStore);
    const manager = context.get("manager");
    const events = await store.listDeletedEvents(manager.user.id);

    return context.json({ events });
  });

  routes.get(
    "/events/slug-suggestion",
    requireManagerAuth({ authStore, config }),
    async (context) => {
      const stores = requireManagerStores({ authStore, eventStore });
      const input = parseEventSlugSuggestionQuery({
        eventId: context.req.query("eventId"),
        title: context.req.query("title"),
      });

      if (input.eventId) {
        const eventId = parseEventIdParam(input.eventId);

        await assertEventAccess({
          authStore: stores.authStore,
          eventId,
          manager: context.get("manager"),
        });
      }

      const slug = await createEventSlugSuggestion(stores.eventStore, {
        exceptEventId: input.eventId,
        title: input.title,
      });

      return context.json({
        slug,
      });
    },
  );

  routes.post("/events", requireManagerAuth({ authStore, config }), async (context) => {
    const store = requireEventStore(eventStore);
    const manager = context.get("manager");
    const input = await parseJsonBody(context, eventCreateRequestSchema);
    await assertEventSlugAvailable(store, input.slug);
    const { publicAccessCode, ...eventInput } = input;
    const event = await store.createEvent(manager.user.id, {
      ...eventInput,
      ...(publicAccessCode
        ? {
            publicAccessCodeHash: hashPublicAccessCode(
              publicAccessCode,
              config.INVITE_TOKEN_SECRET,
            ),
          }
        : {}),
    });

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

  routes.get(
    "/events/:eventId/publish-readiness",
    requireManagerAuth({ authStore, config }),
    async (context) => {
      const stores = requireManagerStores({ authStore, eventStore });
      const eventId = parseEventIdParam(context.req.param("eventId"));
      await assertEventAccess({
        authStore: stores.authStore,
        eventId,
        manager: context.get("manager"),
      });
      const readiness = await stores.eventStore.getPublishingReadiness(eventId);

      if (!readiness) {
        throw new ApiHttpError("NOT_FOUND", "Event not found");
      }

      return context.json({ readiness });
    },
  );

  routes.get(
    "/events/:eventId/summary",
    requireManagerAuth({ authStore, config }),
    async (context) => {
      const stores = requireManagerDashboardStores({ authStore, dashboardDataStore });
      const eventId = parseEventIdParam(context.req.param("eventId"));
      await assertEventAccess({
        authStore: stores.authStore,
        eventId,
        manager: context.get("manager"),
      });
      const summary = await stores.dashboardDataStore.getEventSummary(eventId);

      return context.json({
        summary,
      });
    },
  );

  routes.get(
    "/events/:eventId/activity",
    requireManagerAuth({ authStore, config }),
    async (context) => {
      const stores = requireManagerDashboardStores({ authStore, dashboardDataStore });
      const eventId = parseEventIdParam(context.req.param("eventId"));
      await assertEventAccess({
        authStore: stores.authStore,
        eventId,
        manager: context.get("manager"),
      });
      const activity = await stores.dashboardDataStore.listActivity(eventId);

      return context.json({
        activity,
      });
    },
  );

  routes.get(
    "/events/:eventId/notifications",
    requireManagerAuth({ authStore, config }),
    async (context) => {
      const stores = requireManagerDashboardStores({ authStore, dashboardDataStore });
      const eventId = parseEventIdParam(context.req.param("eventId"));
      const manager = context.get("manager");
      await assertEventAccess({
        authStore: stores.authStore,
        eventId,
        manager,
      });
      const notifications = await stores.dashboardDataStore.listNotifications(
        eventId,
        manager.user.id,
      );

      return context.json({
        notifications,
      });
    },
  );

  routes.post(
    "/events/:eventId/notifications/read-all",
    requireManagerAuth({ authStore, config }),
    async (context) => {
      const stores = requireManagerDashboardStores({ authStore, dashboardDataStore });
      const eventId = parseEventIdParam(context.req.param("eventId"));
      const manager = context.get("manager");
      await assertEventAccess({
        authStore: stores.authStore,
        eventId,
        manager,
      });
      const updatedCount = await stores.dashboardDataStore.markAllNotificationsRead(
        eventId,
        manager.user.id,
      );

      return context.json({ updatedCount });
    },
  );

  routes.patch(
    "/events/:eventId/notifications/:notificationId/read",
    requireManagerAuth({ authStore, config }),
    async (context) => {
      const stores = requireManagerDashboardStores({ authStore, dashboardDataStore });
      const { eventId, notificationId } = parseEventAndNotificationIdParams({
        eventId: context.req.param("eventId"),
        notificationId: context.req.param("notificationId"),
      });
      const manager = context.get("manager");
      await assertEventAccess({
        authStore: stores.authStore,
        eventId,
        manager,
      });
      const notification = await stores.dashboardDataStore.markNotificationRead(
        eventId,
        notificationId,
        manager.user.id,
      );

      if (!notification) {
        throw new ApiHttpError("NOT_FOUND", "Notification not found");
      }

      return context.json({ notification });
    },
  );

  routes.delete(
    "/events/:eventId/notifications/:notificationId",
    requireManagerAuth({ authStore, config }),
    async (context) => {
      const stores = requireManagerDashboardStores({ authStore, dashboardDataStore });
      const { eventId, notificationId } = parseEventAndNotificationIdParams({
        eventId: context.req.param("eventId"),
        notificationId: context.req.param("notificationId"),
      });
      const manager = context.get("manager");
      await assertEventAccess({
        authStore: stores.authStore,
        eventId,
        manager,
      });
      const dismissed = await stores.dashboardDataStore.dismissNotification(
        eventId,
        notificationId,
        manager.user.id,
      );

      if (!dismissed) {
        throw new ApiHttpError("NOT_FOUND", "Notification not found");
      }

      return context.json({ dismissed: true as const });
    },
  );

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
    if (input.slug) {
      await assertEventSlugAvailable(stores.eventStore, input.slug, { exceptEventId: eventId });
    }
    const { publicAccessCode, ...eventInput } = input;
    const event = await stores.eventStore.updateEvent(eventId, {
      ...eventInput,
      ...(publicAccessCode !== undefined
        ? {
            publicAccessCodeHash: publicAccessCode
              ? hashPublicAccessCode(publicAccessCode, config.INVITE_TOKEN_SECRET)
              : null,
          }
        : {}),
    });

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
    const manager = context.get("manager");
    await assertEventAccess({
      authStore: stores.authStore,
      eventId,
      includeDeleted: true,
      manager,
      minimumRole: "owner",
    });
    const input = await parseJsonBody(context, eventDeletionRequestSchema);
    const event = await stores.eventStore.deleteEvent(
      eventId,
      manager.user.id,
      input.confirmationTitle,
    );

    if (!event) {
      throw new ApiHttpError("NOT_FOUND", "Event not found");
    }

    return context.json({
      event,
    });
  });

  routes.post(
    "/events/:eventId/restore",
    requireManagerAuth({ authStore, config }),
    async (context) => {
      const stores = requireManagerStores({ authStore, eventStore });
      const eventId = parseEventIdParam(context.req.param("eventId"));
      const manager = context.get("manager");
      await assertEventAccess({
        authStore: stores.authStore,
        eventId,
        includeDeleted: true,
        manager,
        minimumRole: "owner",
      });
      const result = await stores.eventStore.restoreEvent(eventId, manager.user.id);

      if (!result) {
        throw new ApiHttpError("NOT_FOUND", "Event not found");
      }

      if (result === "not_deleted") {
        throw new ApiHttpError("CONFLICT", "Event is not deleted");
      }

      if (result === "expired") {
        throw new ApiHttpError("CONFLICT", "Event restoration window has expired");
      }

      return context.json({ event: result });
    },
  );

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

      const validationResults = input.sections.map((section) =>
        section.enabled === false
          ? { ok: true as const, section }
          : validateThemeSections(theme.id, [section])[0]!,
      );
      const invalidSectionFields = validationResults.flatMap((result, index) =>
        result.ok
          ? []
          : result.issues.map((message) => ({
              message,
              path: ["sections", index],
            })),
      );
      const invalidBlueprintFields = validateEventTypeSections({
        eventStatus: "draft",
        eventType: state.eventType,
        sections: input.sections,
      }).map((issue) => ({
        message: issue.message,
        path: issue.path,
      }));

      if (invalidSectionFields.length > 0 || invalidBlueprintFields.length > 0) {
        throw new ApiHttpError("VALIDATION_ERROR", "Invalid event sections", {
          fields: [...invalidSectionFields, ...invalidBlueprintFields],
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
      const event = await stores.eventStore.getEvent(eventId);
      if (!event) throw new ApiHttpError("NOT_FOUND", "Event not found");
      const guestGroups = (await stores.guestGroupStore.listGuestGroups(eventId)).map((group) => {
        const token = group.inviteTokenEncrypted
          ? decryptInviteToken(group.inviteTokenEncrypted, config.INVITE_TOKEN_SECRET)
          : undefined;
        const { inviteTokenEncrypted: _encrypted, ...apiGroup } = group;
        return {
          ...apiGroup,
          ...(token
            ? {
                inviteLink: buildGuestInviteLink({
                  baseUrl: config.PUBLIC_APP_BASE_URL,
                  eventSlug: event.slug,
                  token,
                }),
              }
            : {}),
        };
      });

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

const createRsvpRateLimitMiddleware = (config: ApiEnv): MiddlewareHandler<ApiBindings> => {
  const attempts = new Map<string, RateLimitEntry>();

  return async (context, next) => {
    const now = Date.now();
    const key = createRsvpRateLimitKey(context, config.INVITE_TOKEN_SECRET);
    const current = attempts.get(key);
    const entry =
      current && current.resetAt > now
        ? current
        : {
            count: 0,
            resetAt: now + rsvpRateLimitWindowMs,
          };

    entry.count += 1;
    attempts.set(key, entry);

    if (attempts.size > 1000) {
      pruneExpiredRateLimitEntries(attempts, now);
    }

    context.header("X-RateLimit-Limit", String(rsvpRateLimitMaxAttempts));
    context.header(
      "X-RateLimit-Remaining",
      String(Math.max(0, rsvpRateLimitMaxAttempts - entry.count)),
    );
    context.header("X-RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));

    if (entry.count > rsvpRateLimitMaxAttempts) {
      context.header("Retry-After", String(Math.max(1, Math.ceil((entry.resetAt - now) / 1000))));
      throw new ApiHttpError("RATE_LIMITED", "Too many RSVP attempts. Please try again shortly.");
    }

    await next();
  };
};

const createRsvpRateLimitKey = (context: Context<ApiBindings>, secret: string) => {
  const eventSlug = context.req.param("eventSlug") || "unknown-event";
  const guestToken = context.req.param("guestToken") || "unknown-token";
  const clientFingerprint =
    context.req.header("cf-connecting-ip") ??
    context.req.header("x-real-ip") ??
    context.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown-client";

  return createHmac("sha256", secret)
    .update(`${clientFingerprint}:${eventSlug}:${guestToken}`)
    .digest("hex");
};

const hashPublicAccessCode = (accessCode: string, secret: string) =>
  createHmac("sha256", secret).update(`public-event-access:${accessCode}`).digest("hex");

const pruneExpiredRateLimitEntries = (attempts: Map<string, RateLimitEntry>, now: number) => {
  for (const [key, entry] of attempts) {
    if (entry.resetAt <= now) {
      attempts.delete(key);
    }
  }
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

const requireDashboardDataStore = (dashboardDataStore: DashboardDataStore | undefined) => {
  if (!dashboardDataStore) {
    throw new ApiHttpError("INTERNAL_ERROR", "Dashboard data store is not configured");
  }

  return dashboardDataStore;
};

const requireManagerDashboardStores = ({
  authStore,
  dashboardDataStore,
}: {
  authStore: AuthStore | undefined;
  dashboardDataStore: DashboardDataStore | undefined;
}) => {
  if (!authStore) {
    throw new ApiHttpError("INTERNAL_ERROR", "Auth store is not configured");
  }

  return {
    authStore,
    dashboardDataStore: requireDashboardDataStore(dashboardDataStore),
  };
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

  if (!result.success || !isUuid(result.data.eventId)) {
    throw new ApiHttpError("VALIDATION_ERROR", "Invalid event ID", {
      fields: result.success
        ? [
            {
              message: "Must be a valid UUID",
              path: ["eventId"],
            },
          ]
        : zodIssuesToFieldErrors(result.error.issues),
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

  if (!result.success || !isUuid(result.data.eventId) || !isUuid(result.data.groupId)) {
    throw new ApiHttpError("VALIDATION_ERROR", "Invalid guest group ID", {
      fields: result.success
        ? [
            ...(isUuid(result.data.eventId)
              ? []
              : [
                  {
                    message: "Must be a valid UUID",
                    path: ["eventId"],
                  },
                ]),
            ...(isUuid(result.data.groupId)
              ? []
              : [
                  {
                    message: "Must be a valid UUID",
                    path: ["groupId"],
                  },
                ]),
          ]
        : zodIssuesToFieldErrors(result.error.issues),
    });
  }

  return result.data;
};

const parseEventAndNotificationIdParams = ({
  eventId,
  notificationId,
}: {
  eventId: string | undefined;
  notificationId: string | undefined;
}) => {
  const result = byEventAndNotificationIdParamsSchema.safeParse({
    eventId,
    notificationId,
  });

  if (!result.success || !isUuid(result.data.eventId) || !isUuid(result.data.notificationId)) {
    throw new ApiHttpError("VALIDATION_ERROR", "Invalid notification ID", {
      fields: result.success
        ? [
            ...(isUuid(result.data.eventId)
              ? []
              : [
                  {
                    message: "Must be a valid UUID",
                    path: ["eventId"],
                  },
                ]),
            ...(isUuid(result.data.notificationId)
              ? []
              : [
                  {
                    message: "Must be a valid UUID",
                    path: ["notificationId"],
                  },
                ]),
          ]
        : zodIssuesToFieldErrors(result.error.issues),
    });
  }

  return result.data;
};

const parseEventSlugSuggestionQuery = ({
  eventId,
  title,
}: {
  eventId: string | undefined;
  title: string | undefined;
}) => {
  const result = eventSlugSuggestionRequestSchema.safeParse({
    eventId,
    title,
  });

  if (!result.success) {
    throw new ApiHttpError("VALIDATION_ERROR", "Invalid slug suggestion query", {
      fields: zodIssuesToFieldErrors(result.error.issues),
    });
  }

  return result.data;
};

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

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

const assertEventSlugAvailable = async (
  eventStore: EventStore,
  slug: string,
  options?: { exceptEventId?: string },
) => {
  if (await eventStore.isEventSlugAvailable(slug, options)) {
    return;
  }

  throw new ApiHttpError("CONFLICT", "Event slug is already in use", {
    fields: [
      {
        message: "Choose another public event slug",
        path: ["slug"],
      },
    ],
  });
};

const createEventSlugSuggestion = async (
  eventStore: EventStore,
  {
    exceptEventId,
    title,
  }: {
    exceptEventId?: string;
    title: string;
  },
) => {
  try {
    return await suggestPublicSlug({
      isAvailable: (candidate) =>
        eventStore.isEventSlugAvailable(candidate, {
          exceptEventId,
        }),
      title,
    });
  } catch {
    throw new ApiHttpError("CONFLICT", "Unable to suggest an available event slug", {
      fields: [
        {
          message: "Try a more specific event title or enter a custom slug",
          path: ["title"],
        },
      ],
    });
  }
};

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

  if (rejection.reason === "guest_names_disabled") {
    throw new ApiHttpError("VALIDATION_ERROR", "Guest names are disabled for this event", {
      fields: [
        {
          message: "Do not submit guest names for this event",
          path: ["guestNames"],
        },
      ],
    });
  }

  if (rejection.reason === "guest_names_required") {
    throw new ApiHttpError("VALIDATION_ERROR", "Guest names are required for every attendee", {
      fields: [
        {
          message: "Enter a name for every attendee",
          path: ["guestNames"],
        },
      ],
    });
  }

  if (rejection.reason === "message_disabled") {
    throw new ApiHttpError("VALIDATION_ERROR", "Guest messages are disabled for this event", {
      fields: [
        {
          message: "Do not submit a guest message for this event",
          path: ["message"],
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
  const compatibility = evaluateThemeCompatibility({
    eventType,
    mode: themeMode,
    theme,
  });

  if (compatibility.issues.length > 0) {
    const hasUnsupportedMode = compatibility.issues.some(
      (issue) => issue.code === "unsupported_mode",
    );

    throw new ApiHttpError(
      "VALIDATION_ERROR",
      hasUnsupportedMode
        ? "Theme does not support this mode"
        : "Theme does not support this event type",
      {
        fields: compatibility.issues.map((issue) => ({
          message: issue.message,
          path: issue.path,
        })),
      },
    );
  }
};

const toInviteTokenRecord = ({
  inviteCode,
  inviteTokenEncrypted,
  inviteTokenHash,
}: InviteTokenRecord): InviteTokenRecord => ({
  inviteCode,
  inviteTokenEncrypted,
  inviteTokenHash,
});

const toPublicEventResponse = (publicEvent: PublicEventRecord) => {
  const theme = publicEvent.selectedThemeId ? getTheme(publicEvent.selectedThemeId) : undefined;
  const { id: _internalEventId, ...event } = publicEvent.event;

  return {
    event,
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
  rsvpFields: publicGuestInvite.rsvpFields,
});
