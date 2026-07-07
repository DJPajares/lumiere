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
} from "@lumiere/types";
import { getTableColumns, getTableName } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import {
  activityActorTypeEnum,
  activityEvents,
  activityTypeEnum,
  eventAssets,
  eventManagers,
  events,
  eventSections,
  eventStatusEnum,
  eventTypeEnum,
  guestGroups,
  guestGroupStatusEnum,
  managerRoleEnum,
  notifications,
  notificationTypeEnum,
  rsvpResponses,
  rsvpStatusEnum,
  schemaIndexNames,
  sectionTypeEnum,
  sectionVisibilityEnum,
  themeModeEnum,
  themeRegistrySnapshots,
  users,
} from "./schema";

describe("database schema", () => {
  it("contains the MVP table set from the product data model", () => {
    expect(
      [
        users,
        events,
        eventManagers,
        eventSections,
        eventAssets,
        guestGroups,
        rsvpResponses,
        activityEvents,
        notifications,
        themeRegistrySnapshots,
      ].map((table) => getTableName(table)),
    ).toEqual([
      "users",
      "events",
      "event_managers",
      "event_sections",
      "event_assets",
      "guest_groups",
      "rsvp_responses",
      "activity_events",
      "notifications",
      "theme_registry_snapshots",
    ]);
  });

  it("keeps Drizzle enums aligned with shared domain contracts", () => {
    expect(eventStatusEnum.enumValues).toEqual(eventStatusSchema.options);
    expect(eventTypeEnum.enumValues).toEqual(eventTypeSchema.options);
    expect(themeModeEnum.enumValues).toEqual(themeModeSchema.options);
    expect(sectionVisibilityEnum.enumValues).toEqual(sectionVisibilitySchema.options);
    expect(rsvpStatusEnum.enumValues).toEqual(rsvpStatusSchema.options);
    expect(managerRoleEnum.enumValues).toEqual(managerRoleSchema.options);
    expect(guestGroupStatusEnum.enumValues).toEqual(guestGroupStatusSchema.options);
    expect(activityActorTypeEnum.enumValues).toEqual(activityActorTypeSchema.options);
    expect(activityTypeEnum.enumValues).toEqual(activityTypeSchema.options);
    expect(notificationTypeEnum.enumValues).toEqual(notificationTypeSchema.options);
    expect(sectionTypeEnum.enumValues).toEqual(sectionTypeSchema.options);
  });

  it("stores invite token hashes, not raw invite tokens", () => {
    const guestGroupColumns = getTableColumns(guestGroups);

    expect(guestGroupColumns).toHaveProperty("inviteTokenHash");
    expect(guestGroupColumns).not.toHaveProperty("inviteToken");
  });

  it("documents critical query indexes used by API lookups", () => {
    expect(schemaIndexNames).toMatchObject({
      eventsSlug: "events_slug_unique",
      eventsOwnerUserId: "events_owner_user_id_idx",
      guestGroupsInviteTokenHash: "guest_groups_invite_token_hash_unique",
      rsvpResponsesGuestGroup: "rsvp_responses_guest_group_unique",
      activityEventsEventCreatedAt: "activity_events_event_created_at_idx",
    });
  });
});
