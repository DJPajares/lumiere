import {
  activityEventsResponseSchema,
  apiErrorSchema,
  collaboratorInvitationAcceptanceResponseSchema,
  collaboratorInvitationInboxResponseSchema,
  collaboratorInvitationResponseSchema,
  collaboratorRemovalResponseSchema,
  collaboratorRoleUpdateResponseSchema,
  eventCollaborationResponseSchema,
  eventResponseSchema,
  managedEventResponseSchema,
  eventPublishingReadinessResponseSchema,
  eventSectionsResponseSchema,
  eventSlugSuggestionResponseSchema,
  eventSummaryResponseSchema,
  eventThemeResponseSchema,
  eventsListResponseSchema,
  guestGroupInviteResponseSchema,
  guestGroupResponseSchema,
  guestGroupsResponseSchema,
  notificationDismissResponseSchema,
  notificationResponseSchema,
  notificationsMarkAllReadResponseSchema,
  notificationsResponseSchema,
  publicEventResponseSchema,
  publicGuestInviteResponseSchema,
  rsvpResponsesResponseSchema,
  rsvpSubmissionResponseSchema,
  themeResponseSchema,
  themesResponseSchema,
  type ActivityEventsResponse,
  type ApiError,
  type CollaboratorInvitationAcceptanceResponse,
  type CollaboratorInvitationInboxResponse,
  type CollaboratorInvitationRequest,
  type CollaboratorInvitationResponse,
  type CollaboratorRemovalResponse,
  type CollaboratorRoleUpdateRequest,
  type CollaboratorRoleUpdateResponse,
  type EventCollaborationResponse,
  type EventCreateRequest,
  type EventDeletionRequest,
  type EventResponse,
  type ManagedEventResponse,
  type EventPublishingReadinessResponse,
  type EventSectionsResponse,
  type EventSectionsUpdateRequest,
  type EventSlugSuggestionRequest,
  type EventSlugSuggestionResponse,
  type EventSummaryResponse,
  type EventThemeResponse,
  type EventThemeUpdateRequest,
  type EventUpdateRequest,
  type EventsListResponse,
  type GuestGroupInviteResponse,
  type GuestGroupMutationRequest,
  type GuestGroupResponse,
  type GuestGroupsResponse,
  type NotificationDismissResponse,
  type NotificationResponse,
  type NotificationsMarkAllReadResponse,
  type NotificationsResponse,
  type PublicEventResponse,
  type PublicGuestInviteResponse,
  type RsvpResponsesResponse,
  type RsvpSubmissionRequest,
  type RsvpSubmissionResponse,
  type ThemeResponse,
  type ThemesResponse,
} from "@lumiere/types";

type ResponseSchema<TValue> = {
  parse(value: unknown): TValue;
};

export type ApiClientFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export type ApiClientAuthTokenProvider = string | (() => Promise<string | null> | string | null);

export type ApiClientOptions = {
  authToken?: ApiClientAuthTokenProvider;
  baseUrl: string;
  fetch?: ApiClientFetch;
  headers?: HeadersInit;
};

export type QueryValue = boolean | number | string | null | undefined;
export type QueryParams = Record<string, QueryValue | QueryValue[]>;

type RequestOptions<TBody = unknown> = {
  auth?: boolean;
  body?: TBody;
  method?: "DELETE" | "GET" | "PATCH" | "POST" | "PUT";
  query?: QueryParams;
};

export class ApiClientError extends Error {
  readonly apiError: ApiError;
  readonly status: number;

  constructor(status: number, apiError: ApiError) {
    super(apiError.error.message);
    this.name = "ApiClientError";
    this.apiError = apiError;
    this.status = status;
  }
}

export type LumiereApiClient = ReturnType<typeof createApiClient>;

export const createApiClient = ({
  authToken,
  baseUrl,
  fetch: fetchImplementation = globalThis.fetch?.bind(globalThis),
  headers: defaultHeaders,
}: ApiClientOptions) => {
  if (!fetchImplementation) {
    throw new Error("A fetch implementation is required");
  }

  const request = async <TResponse, TBody = unknown>(
    path: string,
    schema: ResponseSchema<TResponse>,
    options: RequestOptions<TBody> = {},
  ): Promise<TResponse> => {
    const headers = new Headers(defaultHeaders);

    if (options.body !== undefined) {
      headers.set("content-type", "application/json");
    }

    if (options.auth !== false) {
      const token = await resolveAuthToken(authToken);

      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
    }

    const response = await fetchImplementation(buildUrl(baseUrl, path, options.query), {
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      headers,
      method: options.method ?? "GET",
    });
    const json = await readJson(response);

    if (!response.ok) {
      throw new ApiClientError(response.status, toApiError(json, response));
    }

    try {
      return schema.parse(json);
    } catch {
      throw new ApiClientError(
        response.status,
        createClientError("INTERNAL_ERROR", "Invalid API response", response),
      );
    }
  };

  return {
    acceptCollaboratorInvitation: (
      invitationId: string,
    ): Promise<CollaboratorInvitationAcceptanceResponse> =>
      request(
        `/collaborator-invitations/${encodePathSegment(invitationId)}/accept`,
        collaboratorInvitationAcceptanceResponseSchema,
        {
          method: "POST",
        },
      ),
    deleteEvent: (eventId: string, input: EventDeletionRequest): Promise<EventResponse> =>
      request(`/events/${encodePathSegment(eventId)}`, eventResponseSchema, {
        body: input,
        method: "DELETE",
      }),
    createEvent: (input: EventCreateRequest): Promise<EventResponse> =>
      request("/events", eventResponseSchema, {
        body: input,
        method: "POST",
      }),
    createGuestGroup: (
      eventId: string,
      input: GuestGroupMutationRequest,
    ): Promise<GuestGroupInviteResponse> =>
      request(
        `/events/${encodePathSegment(eventId)}/guest-groups`,
        guestGroupInviteResponseSchema,
        {
          body: input,
          method: "POST",
        },
      ),
    declineCollaboratorInvitation: (
      invitationId: string,
    ): Promise<CollaboratorInvitationResponse> =>
      request(
        `/collaborator-invitations/${encodePathSegment(invitationId)}/decline`,
        collaboratorInvitationResponseSchema,
        {
          method: "POST",
        },
      ),
    disableGuestGroup: (eventId: string, groupId: string): Promise<GuestGroupResponse> =>
      request(
        `/events/${encodePathSegment(eventId)}/guest-groups/${encodePathSegment(groupId)}`,
        guestGroupResponseSchema,
        {
          method: "DELETE",
        },
      ),
    getEvent: (eventId: string): Promise<ManagedEventResponse> =>
      request(`/events/${encodePathSegment(eventId)}`, managedEventResponseSchema),
    getEventPublishingReadiness: (eventId: string): Promise<EventPublishingReadinessResponse> =>
      request(
        `/events/${encodePathSegment(eventId)}/publish-readiness`,
        eventPublishingReadinessResponseSchema,
      ),
    getEventSummary: (eventId: string): Promise<EventSummaryResponse> =>
      request(`/events/${encodePathSegment(eventId)}/summary`, eventSummaryResponseSchema),
    getEventTheme: (eventId: string): Promise<EventThemeResponse> =>
      request(`/events/${encodePathSegment(eventId)}/theme`, eventThemeResponseSchema),
    getPublicEvent: (eventSlug: string, accessCode?: string): Promise<PublicEventResponse> =>
      request(`/public/events/${encodePathSegment(eventSlug)}`, publicEventResponseSchema, {
        auth: false,
        query: { accessCode },
      }),
    getPublicGuestInvite: (
      eventSlug: string,
      guestToken: string,
    ): Promise<PublicGuestInviteResponse> =>
      request(
        `/public/events/${encodePathSegment(eventSlug)}/guest/${encodePathSegment(guestToken)}`,
        publicGuestInviteResponseSchema,
        {
          auth: false,
        },
      ),
    inviteEventCollaborator: (
      eventId: string,
      input: CollaboratorInvitationRequest,
    ): Promise<CollaboratorInvitationResponse> =>
      request(
        `/events/${encodePathSegment(eventId)}/collaborator-invitations`,
        collaboratorInvitationResponseSchema,
        {
          body: input,
          method: "POST",
        },
      ),
    publishEvent: (eventId: string, expectedUpdatedAt: string): Promise<EventResponse> =>
      request(`/events/${encodePathSegment(eventId)}`, eventResponseSchema, {
        body: { expectedUpdatedAt, status: "published" },
        method: "PATCH",
      }),
    getTheme: (themeId: string): Promise<ThemeResponse> =>
      request(`/themes/${encodePathSegment(themeId)}`, themeResponseSchema, {
        auth: false,
      }),
    listEventActivity: (eventId: string, query?: QueryParams): Promise<ActivityEventsResponse> =>
      request(`/events/${encodePathSegment(eventId)}/activity`, activityEventsResponseSchema, {
        query,
      }),
    listEventCollaboration: (eventId: string): Promise<EventCollaborationResponse> =>
      request(
        `/events/${encodePathSegment(eventId)}/collaboration`,
        eventCollaborationResponseSchema,
      ),
    listEventNotifications: (
      eventId: string,
      query?: QueryParams,
    ): Promise<NotificationsResponse> =>
      request(`/events/${encodePathSegment(eventId)}/notifications`, notificationsResponseSchema, {
        query,
      }),
    listEventResponses: (eventId: string): Promise<RsvpResponsesResponse> =>
      request(`/events/${encodePathSegment(eventId)}/responses`, rsvpResponsesResponseSchema),
    markAllEventNotificationsRead: (eventId: string): Promise<NotificationsMarkAllReadResponse> =>
      request(
        `/events/${encodePathSegment(eventId)}/notifications/read-all`,
        notificationsMarkAllReadResponseSchema,
        {
          method: "POST",
        },
      ),
    markEventNotificationRead: (
      eventId: string,
      notificationId: string,
    ): Promise<NotificationResponse> =>
      request(
        `/events/${encodePathSegment(eventId)}/notifications/${encodePathSegment(notificationId)}/read`,
        notificationResponseSchema,
        {
          method: "PATCH",
        },
      ),
    listEventSections: (eventId: string): Promise<EventSectionsResponse> =>
      request(`/events/${encodePathSegment(eventId)}/sections`, eventSectionsResponseSchema),
    listEvents: (): Promise<EventsListResponse> => request("/events", eventsListResponseSchema),
    listDeletedEvents: (): Promise<EventsListResponse> =>
      request("/events/trash", eventsListResponseSchema),
    listPendingCollaboratorInvitations: (): Promise<CollaboratorInvitationInboxResponse> =>
      request("/collaborator-invitations", collaboratorInvitationInboxResponseSchema),
    listGuestGroups: (eventId: string): Promise<GuestGroupsResponse> =>
      request(`/events/${encodePathSegment(eventId)}/guest-groups`, guestGroupsResponseSchema),
    listThemes: (): Promise<ThemesResponse> =>
      request("/themes", themesResponseSchema, {
        auth: false,
      }),
    dismissEventNotification: (
      eventId: string,
      notificationId: string,
    ): Promise<NotificationDismissResponse> =>
      request(
        `/events/${encodePathSegment(eventId)}/notifications/${encodePathSegment(notificationId)}`,
        notificationDismissResponseSchema,
        {
          method: "DELETE",
        },
      ),
    regenerateGuestGroupInvite: (
      eventId: string,
      groupId: string,
    ): Promise<GuestGroupInviteResponse> =>
      request(
        `/events/${encodePathSegment(eventId)}/guest-groups/${encodePathSegment(groupId)}/regenerate-link`,
        guestGroupInviteResponseSchema,
        {
          method: "POST",
        },
      ),
    removeEventCollaborator: (
      eventId: string,
      collaboratorUserId: string,
    ): Promise<CollaboratorRemovalResponse> =>
      request(
        `/events/${encodePathSegment(eventId)}/collaborators/${encodePathSegment(
          collaboratorUserId,
        )}`,
        collaboratorRemovalResponseSchema,
        {
          method: "DELETE",
        },
      ),
    resendCollaboratorInvitation: (
      eventId: string,
      invitationId: string,
    ): Promise<CollaboratorInvitationResponse> =>
      request(
        `/events/${encodePathSegment(eventId)}/collaborator-invitations/${encodePathSegment(
          invitationId,
        )}/resend`,
        collaboratorInvitationResponseSchema,
        {
          method: "POST",
        },
      ),
    restoreEvent: (eventId: string): Promise<EventResponse> =>
      request(`/events/${encodePathSegment(eventId)}/restore`, eventResponseSchema, {
        method: "POST",
      }),
    revokeCollaboratorInvitation: (
      eventId: string,
      invitationId: string,
    ): Promise<CollaboratorInvitationResponse> =>
      request(
        `/events/${encodePathSegment(eventId)}/collaborator-invitations/${encodePathSegment(
          invitationId,
        )}/revoke`,
        collaboratorInvitationResponseSchema,
        {
          method: "POST",
        },
      ),
    submitRsvp: (
      eventSlug: string,
      guestToken: string,
      input: RsvpSubmissionRequest,
    ): Promise<RsvpSubmissionResponse> =>
      request(
        `/public/events/${encodePathSegment(eventSlug)}/guest/${encodePathSegment(guestToken)}/rsvp`,
        rsvpSubmissionResponseSchema,
        {
          auth: false,
          body: input,
          method: "POST",
        },
      ),
    suggestEventSlug: (input: EventSlugSuggestionRequest): Promise<EventSlugSuggestionResponse> =>
      request("/events/slug-suggestion", eventSlugSuggestionResponseSchema, {
        query: input,
      }),
    unpublishEvent: (eventId: string, expectedUpdatedAt: string): Promise<EventResponse> =>
      request(`/events/${encodePathSegment(eventId)}`, eventResponseSchema, {
        body: { expectedUpdatedAt, status: "draft" },
        method: "PATCH",
      }),
    updateEvent: (eventId: string, input: EventUpdateRequest): Promise<EventResponse> =>
      request(`/events/${encodePathSegment(eventId)}`, eventResponseSchema, {
        body: input,
        method: "PATCH",
      }),
    updateEventCollaboratorRole: (
      eventId: string,
      collaboratorUserId: string,
      input: CollaboratorRoleUpdateRequest,
    ): Promise<CollaboratorRoleUpdateResponse> =>
      request(
        `/events/${encodePathSegment(eventId)}/collaborators/${encodePathSegment(
          collaboratorUserId,
        )}`,
        collaboratorRoleUpdateResponseSchema,
        {
          body: input,
          method: "PATCH",
        },
      ),
    updateEventSections: (
      eventId: string,
      input: EventSectionsUpdateRequest,
    ): Promise<EventSectionsResponse> =>
      request(`/events/${encodePathSegment(eventId)}/sections`, eventSectionsResponseSchema, {
        body: input,
        method: "PUT",
      }),
    updateEventTheme: (
      eventId: string,
      input: EventThemeUpdateRequest,
    ): Promise<EventThemeResponse> =>
      request(`/events/${encodePathSegment(eventId)}/theme`, eventThemeResponseSchema, {
        body: input,
        method: "PUT",
      }),
    updateGuestGroup: (
      eventId: string,
      groupId: string,
      input: GuestGroupMutationRequest,
    ): Promise<GuestGroupResponse> =>
      request(
        `/events/${encodePathSegment(eventId)}/guest-groups/${encodePathSegment(groupId)}`,
        guestGroupResponseSchema,
        {
          body: input,
          method: "PATCH",
        },
      ),
  };
};

const resolveAuthToken = async (authToken: ApiClientAuthTokenProvider | undefined) =>
  typeof authToken === "function" ? await authToken() : authToken;

const buildUrl = (baseUrl: string, path: string, query?: QueryParams) => {
  const url = new URL(path.replace(/^\/+/, ""), normalizeBaseUrl(baseUrl));

  for (const [key, value] of Object.entries(query ?? {})) {
    const values = Array.isArray(value) ? value : [value];

    for (const item of values) {
      if (item !== null && item !== undefined) {
        url.searchParams.append(key, String(item));
      }
    }
  }

  return url.toString();
};

const normalizeBaseUrl = (baseUrl: string) => `${baseUrl.replace(/\/+$/, "")}/`;

const encodePathSegment = (value: string) => encodeURIComponent(value);

const readJson = async (response: Response): Promise<unknown> => {
  const text = await response.text();

  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return undefined;
  }
};

const toApiError = (value: unknown, response: Response): ApiError => {
  const result = apiErrorSchema.safeParse(value);

  if (result.success) {
    return result.data;
  }

  return createClientError("INTERNAL_ERROR", response.statusText || "API request failed", response);
};

const createClientError = (
  code: ApiError["error"]["code"],
  message: string,
  response: Response,
): ApiError => ({
  error: {
    code,
    message,
    requestId: response.headers.get("x-request-id") || "unknown",
  },
});
