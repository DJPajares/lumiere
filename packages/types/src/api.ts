import { z } from "zod";

import {
  eventCreateSchema,
  eventSchema,
  eventSectionSchema,
  eventSectionsUpdateSchema,
  eventThemeUpdateSchema,
  eventUpdateSchema,
  guestGroupMutationSchema,
  guestGroupSchema,
  rsvpResponseSchema,
  rsvpSubmissionSchema,
  themeSchema,
} from "./domain";
import { idSchema, nonEmptyStringSchema } from "./primitives";

export const apiErrorCodeSchema = z.enum([
  "BAD_REQUEST",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "VALIDATION_ERROR",
  "RATE_LIMITED",
  "INTERNAL_ERROR",
]);
export type ApiErrorCode = z.infer<typeof apiErrorCodeSchema>;

export const apiFieldErrorSchema = z.object({
  path: z.array(z.union([z.string(), z.number()])),
  message: nonEmptyStringSchema,
});
export type ApiFieldError = z.infer<typeof apiFieldErrorSchema>;

export const apiErrorSchema = z.object({
  error: z.object({
    code: apiErrorCodeSchema,
    message: nonEmptyStringSchema,
    requestId: nonEmptyStringSchema,
    fields: z.array(apiFieldErrorSchema).optional(),
  }),
});
export type ApiError = z.infer<typeof apiErrorSchema>;

export const eventCreateRequestSchema = eventCreateSchema;
export type EventCreateRequest = z.input<typeof eventCreateRequestSchema>;

export const eventCreateResponseSchema = z.object({
  event: eventSchema,
});
export type EventCreateResponse = z.infer<typeof eventCreateResponseSchema>;

export const eventUpdateRequestSchema = eventUpdateSchema;
export type EventUpdateRequest = z.input<typeof eventUpdateRequestSchema>;

export const eventResponseSchema = z.object({
  event: eventSchema,
});
export type EventResponse = z.infer<typeof eventResponseSchema>;

export const eventsListResponseSchema = z.object({
  events: z.array(eventSchema),
});
export type EventsListResponse = z.infer<typeof eventsListResponseSchema>;

export const eventSectionsUpdateRequestSchema = eventSectionsUpdateSchema;
export type EventSectionsUpdateRequest = z.input<typeof eventSectionsUpdateRequestSchema>;

export const eventSectionsResponseSchema = z.object({
  sections: z.array(eventSectionSchema),
});
export type EventSectionsResponse = z.infer<typeof eventSectionsResponseSchema>;

export const eventThemeUpdateRequestSchema = eventThemeUpdateSchema;
export type EventThemeUpdateRequest = z.input<typeof eventThemeUpdateRequestSchema>;

export const themeResponseSchema = z.object({
  theme: themeSchema,
});
export type ThemeResponse = z.infer<typeof themeResponseSchema>;

export const themesResponseSchema = z.object({
  themes: z.array(themeSchema),
});
export type ThemesResponse = z.infer<typeof themesResponseSchema>;

export const eventThemeResponseSchema = z.object({
  selectedThemeId: themeSchema.shape.id.optional(),
  theme: themeSchema.optional(),
  themeConfig: eventSchema.shape.themeConfig,
  themeMode: eventSchema.shape.themeMode,
});
export type EventThemeResponse = z.infer<typeof eventThemeResponseSchema>;

export const guestGroupMutationRequestSchema = guestGroupMutationSchema;
export type GuestGroupMutationRequest = z.input<typeof guestGroupMutationRequestSchema>;

export const guestGroupResponseSchema = z.object({
  guestGroup: guestGroupSchema,
});
export type GuestGroupResponse = z.infer<typeof guestGroupResponseSchema>;

export const guestGroupsResponseSchema = z.object({
  guestGroups: z.array(guestGroupSchema),
});
export type GuestGroupsResponse = z.infer<typeof guestGroupsResponseSchema>;

export const guestGroupInviteResponseSchema = guestGroupResponseSchema.extend({
  inviteLink: nonEmptyStringSchema.url(),
});
export type GuestGroupInviteResponse = z.infer<typeof guestGroupInviteResponseSchema>;

export const rsvpSubmissionRequestSchema = rsvpSubmissionSchema;
export type RsvpSubmissionRequest = z.input<typeof rsvpSubmissionRequestSchema>;

export const rsvpSubmissionResponseSchema = z.object({
  response: rsvpResponseSchema,
});
export type RsvpSubmissionResponse = z.infer<typeof rsvpSubmissionResponseSchema>;

export const byEventIdParamsSchema = z.object({
  eventId: idSchema,
});
export type ByEventIdParams = z.infer<typeof byEventIdParamsSchema>;

export const byEventAndGuestGroupIdParamsSchema = byEventIdParamsSchema.extend({
  groupId: idSchema,
});
export type ByEventAndGuestGroupIdParams = z.infer<typeof byEventAndGuestGroupIdParamsSchema>;

export const publicEventParamsSchema = z.object({
  eventSlug: nonEmptyStringSchema,
});
export type PublicEventParams = z.infer<typeof publicEventParamsSchema>;

export const guestInviteParamsSchema = publicEventParamsSchema.extend({
  guestToken: nonEmptyStringSchema.min(16),
});
export type GuestInviteParams = z.infer<typeof guestInviteParamsSchema>;
