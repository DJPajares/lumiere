CREATE EXTENSION IF NOT EXISTS "pgcrypto";--> statement-breakpoint
CREATE TYPE "public"."activity_actor_type" AS ENUM('manager', 'guest', 'system');--> statement-breakpoint
CREATE TYPE "public"."activity_type" AS ENUM('event_created', 'event_published', 'section_updated', 'theme_updated', 'guest_group_created', 'guest_invite_opened', 'rsvp_submitted', 'rsvp_updated', 'notification_created');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('wedding', 'birthday', 'kids_party', 'holiday', 'dinner', 'launch', 'private_event', 'other');--> statement-breakpoint
CREATE TYPE "public"."guest_group_status" AS ENUM('pending', 'opened', 'responded', 'declined', 'disabled');--> statement-breakpoint
CREATE TYPE "public"."manager_role" AS ENUM('owner', 'editor', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('rsvp_submitted', 'rsvp_updated', 'guest_opened_invite', 'system');--> statement-breakpoint
CREATE TYPE "public"."rsvp_status" AS ENUM('attending', 'not_attending', 'maybe');--> statement-breakpoint
CREATE TYPE "public"."section_type" AS ENUM('introduction', 'profile', 'date', 'story', 'details', 'entourage', 'dress_code', 'location', 'gallery', 'rsvp', 'outro', 'custom');--> statement-breakpoint
CREATE TYPE "public"."section_visibility" AS ENUM('public', 'guest_only', 'hidden');--> statement-breakpoint
CREATE TYPE "public"."theme_mode" AS ENUM('light', 'dark', 'system', 'toggleable');--> statement-breakpoint
CREATE TABLE "activity_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"actor_type" "activity_actor_type" NOT NULL,
	"actor_id" uuid,
	"activity_type" "activity_type" NOT NULL,
	"metadata_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"asset_type" varchar(80) NOT NULL,
	"url" text NOT NULL,
	"alt_text" varchar(500),
	"metadata_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_managers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "manager_role" DEFAULT 'viewer' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"section_type" "section_type" NOT NULL,
	"section_key" varchar(120) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"visibility" "section_visibility" DEFAULT 'public' NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"content_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"settings_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"slug" varchar(120) NOT NULL,
	"title" varchar(160) NOT NULL,
	"event_type" "event_type" NOT NULL,
	"status" "event_status" DEFAULT 'draft' NOT NULL,
	"timezone" varchar(80) NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone,
	"venue_name" varchar(160),
	"venue_address" varchar(500),
	"selected_theme_id" varchar(120),
	"theme_mode" "theme_mode" DEFAULT 'system' NOT NULL,
	"theme_config_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"public_settings_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"rsvp_settings_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guest_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"label" varchar(160) NOT NULL,
	"contact_name" varchar(160),
	"contact_email" varchar(320),
	"max_pax" integer DEFAULT 1 NOT NULL,
	"invite_token_hash" text NOT NULL,
	"invite_code" varchar(120) NOT NULL,
	"status" "guest_group_status" DEFAULT 'pending' NOT NULL,
	"notes" text,
	"last_opened_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"notification_type" "notification_type" NOT NULL,
	"title" varchar(160) NOT NULL,
	"message" varchar(1000) NOT NULL,
	"read_at" timestamp with time zone,
	"metadata_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rsvp_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"guest_group_id" uuid NOT NULL,
	"response_status" "rsvp_status" NOT NULL,
	"attendee_count" integer DEFAULT 0 NOT NULL,
	"guest_names_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"answers_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"message" text,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "theme_registry_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"theme_id" varchar(120) NOT NULL,
	"version" varchar(40) NOT NULL,
	"metadata_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supabase_user_id" text NOT NULL,
	"email" text NOT NULL,
	"display_name" varchar(160),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_assets" ADD CONSTRAINT "event_assets_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_managers" ADD CONSTRAINT "event_managers_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_managers" ADD CONSTRAINT "event_managers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_sections" ADD CONSTRAINT "event_sections_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guest_groups" ADD CONSTRAINT "guest_groups_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rsvp_responses" ADD CONSTRAINT "rsvp_responses_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rsvp_responses" ADD CONSTRAINT "rsvp_responses_guest_group_id_guest_groups_id_fk" FOREIGN KEY ("guest_group_id") REFERENCES "public"."guest_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "theme_registry_snapshots" ADD CONSTRAINT "theme_registry_snapshots_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activity_events_event_created_at_idx" ON "activity_events" USING btree ("event_id","created_at");--> statement-breakpoint
CREATE INDEX "activity_events_event_type_idx" ON "activity_events" USING btree ("event_id","activity_type");--> statement-breakpoint
CREATE INDEX "event_assets_event_type_idx" ON "event_assets" USING btree ("event_id","asset_type");--> statement-breakpoint
CREATE UNIQUE INDEX "event_managers_event_user_unique" ON "event_managers" USING btree ("event_id","user_id");--> statement-breakpoint
CREATE INDEX "event_managers_event_id_idx" ON "event_managers" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "event_managers_user_id_idx" ON "event_managers" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "event_sections_event_key_unique" ON "event_sections" USING btree ("event_id","section_key");--> statement-breakpoint
CREATE INDEX "event_sections_event_sort_idx" ON "event_sections" USING btree ("event_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "events_slug_unique" ON "events" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "events_owner_user_id_idx" ON "events" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "events_status_starts_at_idx" ON "events" USING btree ("status","starts_at");--> statement-breakpoint
CREATE UNIQUE INDEX "guest_groups_invite_token_hash_unique" ON "guest_groups" USING btree ("invite_token_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "guest_groups_invite_code_unique" ON "guest_groups" USING btree ("invite_code");--> statement-breakpoint
CREATE INDEX "guest_groups_event_id_idx" ON "guest_groups" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "guest_groups_event_status_idx" ON "guest_groups" USING btree ("event_id","status");--> statement-breakpoint
CREATE INDEX "notifications_user_read_idx" ON "notifications" USING btree ("user_id","read_at");--> statement-breakpoint
CREATE INDEX "notifications_event_created_at_idx" ON "notifications" USING btree ("event_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "rsvp_responses_guest_group_unique" ON "rsvp_responses" USING btree ("guest_group_id");--> statement-breakpoint
CREATE INDEX "rsvp_responses_event_status_idx" ON "rsvp_responses" USING btree ("event_id","response_status");--> statement-breakpoint
CREATE INDEX "rsvp_responses_guest_group_id_idx" ON "rsvp_responses" USING btree ("guest_group_id");--> statement-breakpoint
CREATE INDEX "theme_registry_snapshots_event_theme_idx" ON "theme_registry_snapshots" USING btree ("event_id","theme_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_supabase_user_id_unique" ON "users" USING btree ("supabase_user_id");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");
