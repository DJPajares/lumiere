import { z } from "zod";

import {
  activityActorTypeSchema,
  activityTypeSchema,
  eventStatusSchema,
  eventTypeSchema,
  guestGroupStatusSchema,
  managerRoleSchema,
  notificationTypeSchema,
  rsvpStatusSchema,
  sectionTypeSchema,
  sectionVisibilitySchema,
  themeModeSchema,
} from "./enums";
import {
  idSchema,
  isoDateTimeSchema,
  jsonObjectSchema,
  metadataSchema,
  nonEmptyStringSchema,
  optionalTextSchema,
  publicSlugSchema,
  slugSchema,
  timezoneSchema,
} from "./primitives";

export const eventSchema = z.object({
  id: idSchema,
  ownerUserId: idSchema,
  slug: publicSlugSchema,
  title: nonEmptyStringSchema.max(160),
  eventType: eventTypeSchema,
  status: eventStatusSchema,
  timezone: timezoneSchema,
  startsAt: isoDateTimeSchema,
  endsAt: isoDateTimeSchema.optional(),
  venueName: z.string().trim().max(160).optional(),
  venueAddress: z.string().trim().max(500).optional(),
  selectedThemeId: z.string().trim().max(120).optional(),
  themeMode: themeModeSchema,
  themeConfig: metadataSchema,
  publicSettings: metadataSchema,
  rsvpSettings: metadataSchema,
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});
export type Event = z.infer<typeof eventSchema>;

export const eventCreateSchema = z
  .object({
    slug: publicSlugSchema,
    title: nonEmptyStringSchema.max(160),
    eventType: eventTypeSchema,
    timezone: timezoneSchema,
    startsAt: isoDateTimeSchema,
    endsAt: isoDateTimeSchema.optional(),
    venueName: z.string().trim().max(160).optional(),
    venueAddress: z.string().trim().max(500).optional(),
    selectedThemeId: z.string().trim().max(120).optional(),
    themeMode: themeModeSchema.default("system"),
    publicSettings: metadataSchema,
    rsvpSettings: metadataSchema,
  })
  .superRefine((value, context) => {
    if (value.endsAt && Date.parse(value.endsAt) <= Date.parse(value.startsAt)) {
      context.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "Event end time must be after start time",
      });
    }
  });
export type EventCreateInput = z.input<typeof eventCreateSchema>;
export type EventCreate = z.output<typeof eventCreateSchema>;

export const eventUpdateSchema = z
  .object({
    slug: publicSlugSchema.optional(),
    title: nonEmptyStringSchema.max(160).optional(),
    eventType: eventTypeSchema.optional(),
    status: eventStatusSchema.optional(),
    timezone: timezoneSchema.optional(),
    startsAt: isoDateTimeSchema.optional(),
    endsAt: isoDateTimeSchema.nullable().optional(),
    venueName: z
      .string()
      .trim()
      .max(160)
      .optional()
      .transform((value) => (value === "" ? undefined : value)),
    venueAddress: z
      .string()
      .trim()
      .max(500)
      .optional()
      .transform((value) => (value === "" ? undefined : value)),
    selectedThemeId: z
      .string()
      .trim()
      .max(120)
      .optional()
      .transform((value) => (value === "" ? undefined : value)),
    themeMode: themeModeSchema.optional(),
    publicSettings: jsonObjectSchema.optional(),
    rsvpSettings: jsonObjectSchema.optional(),
  })
  .strict()
  .superRefine((value, context) => {
    if (Object.keys(value).length === 0) {
      context.addIssue({
        code: "custom",
        path: [],
        message: "At least one event field is required",
      });
    }

    if (value.endsAt && value.startsAt && Date.parse(value.endsAt) <= Date.parse(value.startsAt)) {
      context.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "Event end time must be after start time",
      });
    }
  });
export type EventUpdateInput = z.input<typeof eventUpdateSchema>;
export type EventUpdate = z.output<typeof eventUpdateSchema>;

export const eventManagerSchema = z.object({
  id: idSchema,
  eventId: idSchema,
  userId: idSchema,
  role: managerRoleSchema,
  createdAt: isoDateTimeSchema,
});
export type EventManager = z.infer<typeof eventManagerSchema>;

export const eventSectionSchema = z.object({
  id: idSchema,
  eventId: idSchema,
  sectionType: sectionTypeSchema,
  sectionKey: slugSchema,
  sortOrder: z.number().int().min(0),
  visibility: sectionVisibilitySchema,
  enabled: z.boolean(),
  content: jsonObjectSchema,
  settings: metadataSchema,
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});
export type EventSection = z.infer<typeof eventSectionSchema>;

export const eventSectionMutationSchema = z.object({
  id: idSchema.optional(),
  sectionType: sectionTypeSchema,
  sectionKey: slugSchema,
  sortOrder: z.number().int().min(0),
  visibility: sectionVisibilitySchema,
  enabled: z.boolean().default(true),
  content: jsonObjectSchema,
  settings: metadataSchema,
});
export type EventSectionMutationInput = z.input<typeof eventSectionMutationSchema>;
export type EventSectionMutation = z.output<typeof eventSectionMutationSchema>;

export const eventSectionsUpdateSchema = z
  .object({
    sections: z.array(eventSectionMutationSchema).max(40),
  })
  .superRefine((value, context) => {
    const keys = new Set<string>();

    value.sections.forEach((section, index) => {
      if (keys.has(section.sectionKey)) {
        context.addIssue({
          code: "custom",
          path: ["sections", index, "sectionKey"],
          message: "Section keys must be unique within an event",
        });
      }
      keys.add(section.sectionKey);
    });
  });
export type EventSectionsUpdateInput = z.input<typeof eventSectionsUpdateSchema>;
export type EventSectionsUpdate = z.output<typeof eventSectionsUpdateSchema>;

export const themeSchema = z.object({
  id: z.string().trim().min(1).max(120),
  name: nonEmptyStringSchema.max(120),
  eventTypes: z.array(eventTypeSchema).min(1),
  supportedModes: z.array(themeModeSchema).min(1),
  defaultMode: themeModeSchema,
  version: nonEmptyStringSchema.max(40),
  metadata: metadataSchema,
});
export type Theme = z.infer<typeof themeSchema>;

export const eventThemeUpdateSchema = z.object({
  selectedThemeId: themeSchema.shape.id,
  themeMode: themeModeSchema,
  themeConfig: metadataSchema,
});
export type EventThemeUpdateInput = z.input<typeof eventThemeUpdateSchema>;
export type EventThemeUpdate = z.output<typeof eventThemeUpdateSchema>;

export const guestGroupSchema = z.object({
  id: idSchema,
  eventId: idSchema,
  label: nonEmptyStringSchema.max(160),
  contactName: z.string().trim().max(160).optional(),
  contactEmail: z.string().trim().email().optional(),
  maxPax: z.number().int().min(1).max(50),
  inviteCode: z.string().trim().min(8).max(120),
  inviteLink: z.string().url().optional(),
  status: guestGroupStatusSchema,
  notes: z.string().trim().max(2000).optional(),
  lastOpenedAt: isoDateTimeSchema.optional(),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});
export type GuestGroup = z.infer<typeof guestGroupSchema>;

export const guestGroupMutationSchema = z.object({
  label: nonEmptyStringSchema.max(160),
  contactName: z.string().trim().max(160).optional(),
  contactEmail: z.string().trim().email().optional(),
  maxPax: z.number().int().min(1).max(50),
  status: guestGroupStatusSchema.optional(),
  notes: optionalTextSchema,
});
export type GuestGroupMutationInput = z.input<typeof guestGroupMutationSchema>;
export type GuestGroupMutation = z.output<typeof guestGroupMutationSchema>;

export const rsvpAnswerSchema = z.object({
  questionKey: slugSchema,
  value: z.union([z.string().max(1000), z.number(), z.boolean(), z.array(z.string().max(200))]),
});
export type RsvpAnswer = z.infer<typeof rsvpAnswerSchema>;

export const rsvpResponseSchema = z.object({
  id: idSchema,
  eventId: idSchema,
  guestGroupId: idSchema,
  responseStatus: rsvpStatusSchema,
  attendeeCount: z.number().int().min(0).max(50),
  guestNames: z.array(nonEmptyStringSchema.max(160)).max(50),
  answers: z.array(rsvpAnswerSchema).default([]),
  message: z.string().trim().max(2000).optional(),
  submittedAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});
export type RsvpResponse = z.infer<typeof rsvpResponseSchema>;

export const rsvpSubmissionSchema = z
  .object({
    responseStatus: rsvpStatusSchema,
    attendeeCount: z.number().int().min(0).max(50),
    guestNames: z.array(nonEmptyStringSchema.max(160)).max(50).default([]),
    answers: z.array(rsvpAnswerSchema).max(40).default([]),
    message: optionalTextSchema,
  })
  .superRefine((value, context) => {
    if (value.responseStatus === "attending" && value.attendeeCount < 1) {
      context.addIssue({
        code: "custom",
        path: ["attendeeCount"],
        message: "Attending RSVPs need at least one attendee",
      });
    }

    if (value.responseStatus === "not_attending" && value.attendeeCount !== 0) {
      context.addIssue({
        code: "custom",
        path: ["attendeeCount"],
        message: "Not attending RSVPs must use zero attendees",
      });
    }

    if (value.guestNames.length > value.attendeeCount) {
      context.addIssue({
        code: "custom",
        path: ["guestNames"],
        message: "Guest names cannot exceed attendee count",
      });
    }
  });
export type RsvpSubmissionInput = z.input<typeof rsvpSubmissionSchema>;
export type RsvpSubmission = z.output<typeof rsvpSubmissionSchema>;

export const activityEventSchema = z.object({
  id: idSchema,
  eventId: idSchema,
  actorType: activityActorTypeSchema,
  actorId: idSchema.optional(),
  activityType: activityTypeSchema,
  metadata: metadataSchema,
  createdAt: isoDateTimeSchema,
});
export type ActivityEvent = z.infer<typeof activityEventSchema>;

export const notificationSchema = z.object({
  id: idSchema,
  eventId: idSchema,
  userId: idSchema,
  notificationType: notificationTypeSchema,
  title: nonEmptyStringSchema.max(160),
  message: nonEmptyStringSchema.max(1000),
  readAt: isoDateTimeSchema.optional(),
  metadata: metadataSchema,
  createdAt: isoDateTimeSchema,
});
export type Notification = z.infer<typeof notificationSchema>;
