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
  type EventSection,
  type RsvpAnswer,
} from "@lumiere/types";
import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

type JsonObject = Record<string, unknown>;

const jsonObjectDefault = sql`'{}'::jsonb`;
const jsonArrayDefault = sql`'[]'::jsonb`;
const rsvpSettingsDefault = sql`'{"collectGuestMessage": true, "collectGuestNames": true}'::jsonb`;

const pgEnumValues = <TValue extends string>(values: readonly TValue[]) =>
  values as [TValue, ...TValue[]];

const createdAtColumn = () =>
  timestamp("created_at", { mode: "string", withTimezone: true }).notNull().defaultNow();

const updatedAtColumn = () =>
  timestamp("updated_at", { mode: "string", withTimezone: true }).notNull().defaultNow();

export const eventStatusEnum = pgEnum("event_status", pgEnumValues(eventStatusSchema.options));
export const eventTypeEnum = pgEnum("event_type", pgEnumValues(eventTypeSchema.options));
export const themeModeEnum = pgEnum("theme_mode", pgEnumValues(themeModeSchema.options));
export const sectionVisibilityEnum = pgEnum(
  "section_visibility",
  pgEnumValues(sectionVisibilitySchema.options),
);
export const rsvpStatusEnum = pgEnum("rsvp_status", pgEnumValues(rsvpStatusSchema.options));
export const managerRoleEnum = pgEnum("manager_role", pgEnumValues(managerRoleSchema.options));
export const guestGroupStatusEnum = pgEnum(
  "guest_group_status",
  pgEnumValues(guestGroupStatusSchema.options),
);
export const activityActorTypeEnum = pgEnum(
  "activity_actor_type",
  pgEnumValues(activityActorTypeSchema.options),
);
export const activityTypeEnum = pgEnum("activity_type", pgEnumValues(activityTypeSchema.options));
export const notificationTypeEnum = pgEnum(
  "notification_type",
  pgEnumValues(notificationTypeSchema.options),
);
export const sectionTypeEnum = pgEnum("section_type", pgEnumValues(sectionTypeSchema.options));

export const schemaIndexNames = {
  usersSupabaseUserId: "users_supabase_user_id_unique",
  usersEmail: "users_email_idx",
  eventsPublicSlug: "events_public_slug_unique",
  eventSlugAliasesSlug: "event_slug_aliases_slug_unique",
  eventSlugAliasesEventId: "event_slug_aliases_event_id_idx",
  eventsOwnerUserId: "events_owner_user_id_idx",
  eventsStatusStartsAt: "events_status_starts_at_idx",
  eventManagersEventUser: "event_managers_event_user_unique",
  eventManagersEventId: "event_managers_event_id_idx",
  eventManagersUserId: "event_managers_user_id_idx",
  eventSectionsEventKey: "event_sections_event_key_unique",
  eventSectionsEventSort: "event_sections_event_sort_idx",
  eventAssetsEventType: "event_assets_event_type_idx",
  guestGroupsInviteTokenHash: "guest_groups_invite_token_hash_unique",
  guestGroupsInviteCode: "guest_groups_invite_code_unique",
  guestGroupsEventId: "guest_groups_event_id_idx",
  guestGroupsEventStatus: "guest_groups_event_status_idx",
  rsvpResponsesGuestGroup: "rsvp_responses_guest_group_unique",
  rsvpResponsesEventStatus: "rsvp_responses_event_status_idx",
  rsvpResponsesGuestGroupId: "rsvp_responses_guest_group_id_idx",
  activityEventsEventCreatedAt: "activity_events_event_created_at_idx",
  activityEventsEventType: "activity_events_event_type_idx",
  notificationsUserRead: "notifications_user_read_idx",
  notificationsEventCreatedAt: "notifications_event_created_at_idx",
  themeRegistrySnapshotsEventTheme: "theme_registry_snapshots_event_theme_idx",
} as const;

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    supabaseUserId: text("supabase_user_id").notNull(),
    email: text("email").notNull(),
    displayName: varchar("display_name", { length: 160 }),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex(schemaIndexNames.usersSupabaseUserId).on(table.supabaseUserId),
    index(schemaIndexNames.usersEmail).on(table.email),
  ],
);

export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerUserId: uuid("owner_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    publicSlug: varchar("public_slug", { length: 80 }).notNull(),
    publicAccessCodeHash: text("public_access_code_hash"),
    title: varchar("title", { length: 160 }).notNull(),
    eventType: eventTypeEnum("event_type").notNull(),
    status: eventStatusEnum("status").notNull().default("draft"),
    timezone: varchar("timezone", { length: 80 }).notNull(),
    startsAt: timestamp("starts_at", { mode: "string", withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { mode: "string", withTimezone: true }),
    venueName: varchar("venue_name", { length: 160 }),
    venueAddress: varchar("venue_address", { length: 500 }),
    publicSettingsJson: jsonb("public_settings_json")
      .$type<JsonObject>()
      .notNull()
      .default(jsonObjectDefault),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex(schemaIndexNames.eventsPublicSlug).on(table.publicSlug),
    index(schemaIndexNames.eventsOwnerUserId).on(table.ownerUserId),
    index(schemaIndexNames.eventsStatusStartsAt).on(table.status, table.startsAt),
  ],
);

export const eventSlugAliases = pgTable(
  "event_slug_aliases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    slug: varchar("slug", { length: 80 }).notNull(),
    createdAt: createdAtColumn(),
  },
  (table) => [
    uniqueIndex(schemaIndexNames.eventSlugAliasesSlug).on(table.slug),
    index(schemaIndexNames.eventSlugAliasesEventId).on(table.eventId),
  ],
);

export const eventThemeSettings = pgTable("event_theme_settings", {
  eventId: uuid("event_id")
    .primaryKey()
    .references(() => events.id, { onDelete: "cascade" }),
  selectedThemeId: varchar("selected_theme_id", { length: 120 }),
  themeMode: themeModeEnum("theme_mode").notNull().default("system"),
  configJson: jsonb("config_json").$type<JsonObject>().notNull().default(jsonObjectDefault),
  updatedAt: updatedAtColumn(),
});

export const eventRsvpSettings = pgTable("event_rsvp_settings", {
  eventId: uuid("event_id")
    .primaryKey()
    .references(() => events.id, { onDelete: "cascade" }),
  settingsJson: jsonb("settings_json").$type<JsonObject>().notNull().default(rsvpSettingsDefault),
  updatedAt: updatedAtColumn(),
});

export const eventManagers = pgTable(
  "event_managers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: managerRoleEnum("role").notNull().default("viewer"),
    createdAt: createdAtColumn(),
  },
  (table) => [
    uniqueIndex(schemaIndexNames.eventManagersEventUser).on(table.eventId, table.userId),
    index(schemaIndexNames.eventManagersEventId).on(table.eventId),
    index(schemaIndexNames.eventManagersUserId).on(table.userId),
  ],
);

export const eventSections = pgTable(
  "event_sections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    sectionType: sectionTypeEnum("section_type").notNull(),
    sectionKey: varchar("section_key", { length: 120 }).notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    visibility: sectionVisibilityEnum("visibility").notNull().default("public"),
    enabled: boolean("enabled").notNull().default(true),
    settingsJson: jsonb("settings_json").$type<JsonObject>().notNull().default(jsonObjectDefault),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex(schemaIndexNames.eventSectionsEventKey).on(table.eventId, table.sectionKey),
    index(schemaIndexNames.eventSectionsEventSort).on(table.eventId, table.sortOrder),
  ],
);

export const eventSectionContents = pgTable("event_section_contents", {
  eventSectionId: uuid("event_section_id")
    .primaryKey()
    .references(() => eventSections.id, { onDelete: "cascade" }),
  contentJson: jsonb("content_json").$type<JsonObject>().notNull().default(jsonObjectDefault),
  updatedAt: updatedAtColumn(),
});

export const eventPublications = pgTable("event_publications", {
  eventId: uuid("event_id")
    .primaryKey()
    .references(() => events.id, { onDelete: "cascade" }),
  selectedThemeId: varchar("selected_theme_id", { length: 120 }).notNull(),
  themeMode: themeModeEnum("theme_mode").notNull(),
  themeConfigJson: jsonb("theme_config_json")
    .$type<JsonObject>()
    .notNull()
    .default(jsonObjectDefault),
  publicSettingsJson: jsonb("public_settings_json")
    .$type<JsonObject>()
    .notNull()
    .default(jsonObjectDefault),
  rsvpSettingsJson: jsonb("rsvp_settings_json")
    .$type<JsonObject>()
    .notNull()
    .default(rsvpSettingsDefault),
  sectionsJson: jsonb("sections_json").$type<EventSection[]>().notNull().default(jsonArrayDefault),
  publishedAt: timestamp("published_at", { mode: "string", withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const eventAssets = pgTable(
  "event_assets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    assetType: varchar("asset_type", { length: 80 }).notNull(),
    url: text("url").notNull(),
    altText: varchar("alt_text", { length: 500 }),
    metadataJson: jsonb("metadata_json").$type<JsonObject>().notNull().default(jsonObjectDefault),
    createdAt: createdAtColumn(),
  },
  (table) => [index(schemaIndexNames.eventAssetsEventType).on(table.eventId, table.assetType)],
);

export const guestGroups = pgTable(
  "guest_groups",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    label: varchar("label", { length: 160 }).notNull(),
    contactName: varchar("contact_name", { length: 160 }),
    contactEmail: varchar("contact_email", { length: 320 }),
    maxPax: integer("max_pax").notNull().default(1),
    inviteTokenHash: text("invite_token_hash").notNull(),
    inviteTokenEncrypted: text("invite_token_encrypted"),
    inviteCode: varchar("invite_code", { length: 120 }).notNull(),
    status: guestGroupStatusEnum("status").notNull().default("pending"),
    notes: text("notes"),
    lastOpenedAt: timestamp("last_opened_at", { mode: "string", withTimezone: true }),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex(schemaIndexNames.guestGroupsInviteTokenHash).on(table.inviteTokenHash),
    uniqueIndex(schemaIndexNames.guestGroupsInviteCode).on(table.inviteCode),
    index(schemaIndexNames.guestGroupsEventId).on(table.eventId),
    index(schemaIndexNames.guestGroupsEventStatus).on(table.eventId, table.status),
  ],
);

export const rsvpResponses = pgTable(
  "rsvp_responses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    guestGroupId: uuid("guest_group_id")
      .notNull()
      .references(() => guestGroups.id, { onDelete: "cascade" }),
    responseStatus: rsvpStatusEnum("response_status").notNull(),
    attendeeCount: integer("attendee_count").notNull().default(0),
    guestNamesJson: jsonb("guest_names_json").$type<string[]>().notNull().default(jsonArrayDefault),
    answersJson: jsonb("answers_json").$type<RsvpAnswer[]>().notNull().default(jsonArrayDefault),
    message: text("message"),
    submittedAt: timestamp("submitted_at", { mode: "string", withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex(schemaIndexNames.rsvpResponsesGuestGroup).on(table.guestGroupId),
    index(schemaIndexNames.rsvpResponsesEventStatus).on(table.eventId, table.responseStatus),
    index(schemaIndexNames.rsvpResponsesGuestGroupId).on(table.guestGroupId),
  ],
);

export const activityEvents = pgTable(
  "activity_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    actorType: activityActorTypeEnum("actor_type").notNull(),
    actorId: uuid("actor_id"),
    activityType: activityTypeEnum("activity_type").notNull(),
    metadataJson: jsonb("metadata_json").$type<JsonObject>().notNull().default(jsonObjectDefault),
    createdAt: createdAtColumn(),
  },
  (table) => [
    index(schemaIndexNames.activityEventsEventCreatedAt).on(table.eventId, table.createdAt),
    index(schemaIndexNames.activityEventsEventType).on(table.eventId, table.activityType),
  ],
);

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    notificationType: notificationTypeEnum("notification_type").notNull(),
    title: varchar("title", { length: 160 }).notNull(),
    message: varchar("message", { length: 1000 }).notNull(),
    readAt: timestamp("read_at", { mode: "string", withTimezone: true }),
    metadataJson: jsonb("metadata_json").$type<JsonObject>().notNull().default(jsonObjectDefault),
    createdAt: createdAtColumn(),
  },
  (table) => [
    index(schemaIndexNames.notificationsUserRead).on(table.userId, table.readAt),
    index(schemaIndexNames.notificationsEventCreatedAt).on(table.eventId, table.createdAt),
  ],
);

export const themeRegistrySnapshots = pgTable(
  "theme_registry_snapshots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    themeId: varchar("theme_id", { length: 120 }).notNull(),
    version: varchar("version", { length: 40 }).notNull(),
    metadataJson: jsonb("metadata_json").$type<JsonObject>().notNull().default(jsonObjectDefault),
    createdAt: createdAtColumn(),
  },
  (table) => [
    index(schemaIndexNames.themeRegistrySnapshotsEventTheme).on(table.eventId, table.themeId),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  ownedEvents: many(events),
  managerMemberships: many(eventManagers),
  notifications: many(notifications),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  owner: one(users, {
    fields: [events.ownerUserId],
    references: [users.id],
  }),
  managers: many(eventManagers),
  sections: many(eventSections),
  assets: many(eventAssets),
  guestGroups: many(guestGroups),
  rsvpResponses: many(rsvpResponses),
  activityEvents: many(activityEvents),
  notifications: many(notifications),
  themeRegistrySnapshots: many(themeRegistrySnapshots),
  themeSettings: one(eventThemeSettings),
  rsvpSettings: one(eventRsvpSettings),
  publication: one(eventPublications),
  slugAliases: many(eventSlugAliases),
}));

export const eventSlugAliasesRelations = relations(eventSlugAliases, ({ one }) => ({
  event: one(events, {
    fields: [eventSlugAliases.eventId],
    references: [events.id],
  }),
}));

export const eventThemeSettingsRelations = relations(eventThemeSettings, ({ one }) => ({
  event: one(events, {
    fields: [eventThemeSettings.eventId],
    references: [events.id],
  }),
}));

export const eventRsvpSettingsRelations = relations(eventRsvpSettings, ({ one }) => ({
  event: one(events, {
    fields: [eventRsvpSettings.eventId],
    references: [events.id],
  }),
}));

export const eventPublicationsRelations = relations(eventPublications, ({ one }) => ({
  event: one(events, {
    fields: [eventPublications.eventId],
    references: [events.id],
  }),
}));

export const eventManagersRelations = relations(eventManagers, ({ one }) => ({
  event: one(events, {
    fields: [eventManagers.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [eventManagers.userId],
    references: [users.id],
  }),
}));

export const eventSectionsRelations = relations(eventSections, ({ one }) => ({
  event: one(events, {
    fields: [eventSections.eventId],
    references: [events.id],
  }),
  content: one(eventSectionContents),
}));

export const eventSectionContentsRelations = relations(eventSectionContents, ({ one }) => ({
  section: one(eventSections, {
    fields: [eventSectionContents.eventSectionId],
    references: [eventSections.id],
  }),
}));

export const eventAssetsRelations = relations(eventAssets, ({ one }) => ({
  event: one(events, {
    fields: [eventAssets.eventId],
    references: [events.id],
  }),
}));

export const guestGroupsRelations = relations(guestGroups, ({ one, many }) => ({
  event: one(events, {
    fields: [guestGroups.eventId],
    references: [events.id],
  }),
  rsvpResponses: many(rsvpResponses),
}));

export const rsvpResponsesRelations = relations(rsvpResponses, ({ one }) => ({
  event: one(events, {
    fields: [rsvpResponses.eventId],
    references: [events.id],
  }),
  guestGroup: one(guestGroups, {
    fields: [rsvpResponses.guestGroupId],
    references: [guestGroups.id],
  }),
}));

export const activityEventsRelations = relations(activityEvents, ({ one }) => ({
  event: one(events, {
    fields: [activityEvents.eventId],
    references: [events.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  event: one(events, {
    fields: [notifications.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const themeRegistrySnapshotsRelations = relations(themeRegistrySnapshots, ({ one }) => ({
  event: one(events, {
    fields: [themeRegistrySnapshots.eventId],
    references: [events.id],
  }),
}));

export const schema = {
  activityEvents,
  activityEventsRelations,
  activityActorTypeEnum,
  activityTypeEnum,
  eventAssets,
  eventAssetsRelations,
  eventManagers,
  eventManagersRelations,
  eventPublications,
  eventPublicationsRelations,
  eventRsvpSettings,
  eventRsvpSettingsRelations,
  eventSectionContents,
  eventSectionContentsRelations,
  events,
  eventsRelations,
  eventSections,
  eventSectionsRelations,
  eventSlugAliases,
  eventSlugAliasesRelations,
  eventStatusEnum,
  eventThemeSettings,
  eventThemeSettingsRelations,
  eventTypeEnum,
  guestGroups,
  guestGroupsRelations,
  guestGroupStatusEnum,
  managerRoleEnum,
  notifications,
  notificationsRelations,
  notificationTypeEnum,
  rsvpResponses,
  rsvpResponsesRelations,
  rsvpStatusEnum,
  sectionTypeEnum,
  sectionVisibilityEnum,
  themeModeEnum,
  themeRegistrySnapshots,
  themeRegistrySnapshotsRelations,
  users,
  usersRelations,
};
