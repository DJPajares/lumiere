import {
  activityEventsResponseSchema,
  apiErrorSchema,
  eventResponseSchema,
  eventPublishingReadinessResponseSchema,
  eventSectionsResponseSchema,
  eventSlugSuggestionResponseSchema,
  eventSummaryResponseSchema,
  eventThemeResponseSchema,
  eventsListResponseSchema,
  guestGroupInviteResponseSchema,
  guestGroupResponseSchema,
  guestGroupsResponseSchema,
  notificationsResponseSchema,
  publicEventResponseSchema,
  publicGuestInviteResponseSchema,
  rsvpSubmissionResponseSchema,
  themeResponseSchema,
  themesResponseSchema,
  type ActivityEventsResponse,
  type ApiError,
  type EventCreateRequest,
  type EventResponse,
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
  type NotificationsResponse,
  type PublicEventResponse,
  type PublicGuestInviteResponse,
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
    archiveEvent: (eventId: string): Promise<EventResponse> =>
      request(`/events/${encodePathSegment(eventId)}`, eventResponseSchema, {
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
    disableGuestGroup: (eventId: string, groupId: string): Promise<GuestGroupResponse> =>
      request(
        `/events/${encodePathSegment(eventId)}/guest-groups/${encodePathSegment(groupId)}`,
        guestGroupResponseSchema,
        {
          method: "DELETE",
        },
      ),
    getEvent: (eventId: string): Promise<EventResponse> =>
      request(`/events/${encodePathSegment(eventId)}`, eventResponseSchema),
    getEventPublishingReadiness: (eventId: string): Promise<EventPublishingReadinessResponse> =>
      request(
        `/events/${encodePathSegment(eventId)}/publish-readiness`,
        eventPublishingReadinessResponseSchema,
      ),
    getEventSummary: (eventId: string): Promise<EventSummaryResponse> =>
      request(`/events/${encodePathSegment(eventId)}/summary`, eventSummaryResponseSchema),
    getEventTheme: (eventId: string): Promise<EventThemeResponse> =>
      request(`/events/${encodePathSegment(eventId)}/theme`, eventThemeResponseSchema),
    getPublicEvent: (eventSlug: string): Promise<PublicEventResponse> =>
      request(`/public/events/${encodePathSegment(eventSlug)}`, publicEventResponseSchema, {
        auth: false,
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
    getTheme: (themeId: string): Promise<ThemeResponse> =>
      request(`/themes/${encodePathSegment(themeId)}`, themeResponseSchema, {
        auth: false,
      }),
    listEventActivity: (eventId: string, query?: QueryParams): Promise<ActivityEventsResponse> =>
      request(`/events/${encodePathSegment(eventId)}/activity`, activityEventsResponseSchema, {
        query,
      }),
    listEventNotifications: (
      eventId: string,
      query?: QueryParams,
    ): Promise<NotificationsResponse> =>
      request(`/events/${encodePathSegment(eventId)}/notifications`, notificationsResponseSchema, {
        query,
      }),
    listEventSections: (eventId: string): Promise<EventSectionsResponse> =>
      request(`/events/${encodePathSegment(eventId)}/sections`, eventSectionsResponseSchema),
    listEvents: (): Promise<EventsListResponse> => request("/events", eventsListResponseSchema),
    listGuestGroups: (eventId: string): Promise<GuestGroupsResponse> =>
      request(`/events/${encodePathSegment(eventId)}/guest-groups`, guestGroupsResponseSchema),
    listThemes: (): Promise<ThemesResponse> =>
      request("/themes", themesResponseSchema, {
        auth: false,
      }),
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
    updateEvent: (eventId: string, input: EventUpdateRequest): Promise<EventResponse> =>
      request(`/events/${encodePathSegment(eventId)}`, eventResponseSchema, {
        body: input,
        method: "PATCH",
      }),
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
