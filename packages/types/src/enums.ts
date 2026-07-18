import { z } from "zod";

export const eventStatusSchema = z.enum(["draft", "published", "archived"]);
export type EventStatus = z.infer<typeof eventStatusSchema>;

export const eventTypeSchema = z.enum([
  "wedding",
  "birthday",
  "kids_party",
  "holiday",
  "dinner",
  "launch",
  "private_event",
  "other",
]);
export type EventType = z.infer<typeof eventTypeSchema>;

export const themeModeSchema = z.enum(["light", "dark", "system", "toggleable"]);
export type ThemeMode = z.infer<typeof themeModeSchema>;

export const sectionVisibilitySchema = z.enum(["public", "guest_only", "hidden"]);
export type SectionVisibility = z.infer<typeof sectionVisibilitySchema>;

export const rsvpStatusSchema = z.enum(["attending", "not_attending", "maybe"]);
export type RsvpStatus = z.infer<typeof rsvpStatusSchema>;

export const managerRoleSchema = z.enum(["owner", "editor", "viewer"]);
export type ManagerRole = z.infer<typeof managerRoleSchema>;

export const collaboratorRoleSchema = z.enum(["editor", "viewer"]);
export type CollaboratorRole = z.infer<typeof collaboratorRoleSchema>;

export const collaboratorInvitationStatusSchema = z.enum([
  "pending",
  "accepted",
  "declined",
  "revoked",
  "expired",
]);
export type CollaboratorInvitationStatus = z.infer<typeof collaboratorInvitationStatusSchema>;

export const guestGroupStatusSchema = z.enum([
  "pending",
  "opened",
  "responded",
  "declined",
  "disabled",
]);
export type GuestGroupStatus = z.infer<typeof guestGroupStatusSchema>;

export const activityActorTypeSchema = z.enum(["manager", "guest", "system"]);
export type ActivityActorType = z.infer<typeof activityActorTypeSchema>;

export const activityTypeSchema = z.enum([
  "event_created",
  "collaborator_removed",
  "collaborator_role_changed",
  "event_deleted",
  "event_published",
  "event_restored",
  "section_updated",
  "theme_updated",
  "guest_group_created",
  "guest_invite_opened",
  "rsvp_submitted",
  "rsvp_updated",
  "notification_created",
]);
export type ActivityType = z.infer<typeof activityTypeSchema>;

export const notificationTypeSchema = z.enum([
  "rsvp_submitted",
  "rsvp_updated",
  "guest_opened_invite",
  "system",
]);
export type NotificationType = z.infer<typeof notificationTypeSchema>;

export const sectionTypeSchema = z.enum([
  "introduction",
  "profile",
  "date",
  "story",
  "details",
  "entourage",
  "dress_code",
  "location",
  "gallery",
  "rsvp",
  "outro",
  "custom",
]);
export type SectionType = z.infer<typeof sectionTypeSchema>;
