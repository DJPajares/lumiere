import {
  activityActorTypeSchema,
  activityTypeSchema,
  collaboratorInvitationStatusSchema,
  eventStatusSchema,
  eventTypeSchema,
  guestGroupStatusSchema,
  guestInviteShareChannelSchema,
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
  collaboratorInvitationStatusEnum,
  collaboratorInvitations,
  eventAssets,
  eventManagers,
  eventPublications,
  eventRsvpSettings,
  eventSectionContents,
  events,
  eventSections,
  eventSlugAliases,
  eventStatusEnum,
  eventTypeEnum,
  eventThemeSettings,
  guestGroups,
  guestGroupMembers,
  guestGroupStatusEnum,
  guestInviteShareChannelEnum,
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
        collaboratorInvitations,
        eventThemeSettings,
        eventRsvpSettings,
        eventSections,
        eventSectionContents,
        eventSlugAliases,
        eventPublications,
        eventAssets,
        guestGroups,
        guestGroupMembers,
        rsvpResponses,
        activityEvents,
        notifications,
        themeRegistrySnapshots,
      ].map((table) => getTableName(table)),
    ).toEqual([
      "users",
      "events",
      "event_managers",
      "collaborator_invitations",
      "event_theme_settings",
      "event_rsvp_settings",
      "event_sections",
      "event_section_contents",
      "event_slug_aliases",
      "event_publications",
      "event_assets",
      "guest_groups",
      "guest_group_members",
      "rsvp_responses",
      "activity_events",
      "notifications",
      "theme_registry_snapshots",
    ]);
  });

  it("separates manager-editable settings and content from event basics", () => {
    const eventColumns = getTableColumns(events);
    const themeColumns = getTableColumns(eventThemeSettings);
    const rsvpColumns = getTableColumns(eventRsvpSettings);
    const sectionColumns = getTableColumns(eventSections);
    const contentColumns = getTableColumns(eventSectionContents);
    const guestGroupColumns = getTableColumns(guestGroups);
    const guestGroupMemberColumns = getTableColumns(guestGroupMembers);
    const collaboratorInvitationColumns = getTableColumns(collaboratorInvitations);

    expect(eventColumns).not.toHaveProperty("selectedThemeId");
    expect(eventColumns).not.toHaveProperty("rsvpSettingsJson");
    expect(eventColumns).toMatchObject({
      accessExpiresAt: expect.anything(),
      deletedAt: expect.anything(),
      deletedByUserId: expect.anything(),
      purgeAfter: expect.anything(),
    });
    expect(themeColumns).toHaveProperty("selectedThemeId");
    expect(guestGroupColumns).toHaveProperty("accessExpiresAt");
    expect(rsvpColumns).toHaveProperty("settingsJson");
    expect(sectionColumns).toMatchObject({
      enabled: expect.anything(),
      visibility: expect.anything(),
    });
    expect(sectionColumns).not.toHaveProperty("contentJson");
    expect(contentColumns).toHaveProperty("contentJson");
    expect(guestGroupColumns).toMatchObject({
      firstOpenedAt: expect.anything(),
      firstSentAt: expect.anything(),
      lastOpenedAt: expect.anything(),
      lastSentAt: expect.anything(),
      lastShareChannel: expect.anything(),
      maxPax: expect.anything(),
      sendCount: expect.anything(),
      status: expect.anything(),
    });
    expect(guestGroupMemberColumns).toMatchObject({
      guestGroupId: expect.anything(),
      name: expect.anything(),
      sortOrder: expect.anything(),
    });
    expect(collaboratorInvitationColumns).toMatchObject({
      email: expect.anything(),
      expiresAt: expect.anything(),
      invitedByUserId: expect.anything(),
      lastSentAt: expect.anything(),
      role: expect.anything(),
      status: expect.anything(),
    });
    expect(getTableColumns(eventPublications)).toHaveProperty("sectionsJson");
  });

  it("keeps Drizzle enums aligned with shared domain contracts", () => {
    expect(eventStatusEnum.enumValues).toEqual(eventStatusSchema.options);
    expect(eventTypeEnum.enumValues).toEqual(eventTypeSchema.options);
    expect(themeModeEnum.enumValues).toEqual(themeModeSchema.options);
    expect(sectionVisibilityEnum.enumValues).toEqual(sectionVisibilitySchema.options);
    expect(rsvpStatusEnum.enumValues).toEqual(rsvpStatusSchema.options);
    expect(managerRoleEnum.enumValues).toEqual(managerRoleSchema.options);
    expect(collaboratorInvitationStatusEnum.enumValues).toEqual(
      collaboratorInvitationStatusSchema.options,
    );
    expect(guestGroupStatusEnum.enumValues).toEqual(guestGroupStatusSchema.options);
    expect(guestInviteShareChannelEnum.enumValues).toEqual(guestInviteShareChannelSchema.options);
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
      eventsPublicSlug: "events_public_slug_unique",
      eventSlugAliasesSlug: "event_slug_aliases_slug_unique",
      eventsOwnerDeletedAt: "events_owner_deleted_at_idx",
      eventsOwnerUserId: "events_owner_user_id_idx",
      collaboratorInvitationsPendingEmail: "collaborator_invitations_pending_email_unique",
      guestGroupsInviteTokenHash: "guest_groups_invite_token_hash_unique",
      guestGroupMembersGroupId: "guest_group_members_group_id_idx",
      guestGroupMembersGroupSort: "guest_group_members_group_sort_unique",
      rsvpResponsesGuestGroup: "rsvp_responses_guest_group_unique",
      activityEventsEventCreatedAt: "activity_events_event_created_at_idx",
    });
  });
});
