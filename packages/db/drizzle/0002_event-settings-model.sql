CREATE TABLE "event_publications" (
	"event_id" uuid PRIMARY KEY NOT NULL,
	"selected_theme_id" varchar(120) NOT NULL,
	"theme_mode" "theme_mode" NOT NULL,
	"theme_config_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"public_settings_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"rsvp_settings_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"sections_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_rsvp_settings" (
	"event_id" uuid PRIMARY KEY NOT NULL,
	"settings_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_section_contents" (
	"event_section_id" uuid PRIMARY KEY NOT NULL,
	"content_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_theme_settings" (
	"event_id" uuid PRIMARY KEY NOT NULL,
	"selected_theme_id" varchar(120),
	"theme_mode" "theme_mode" DEFAULT 'system' NOT NULL,
	"config_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "event_publications" ADD CONSTRAINT "event_publications_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_rsvp_settings" ADD CONSTRAINT "event_rsvp_settings_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_section_contents" ADD CONSTRAINT "event_section_contents_event_section_id_event_sections_id_fk" FOREIGN KEY ("event_section_id") REFERENCES "public"."event_sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_theme_settings" ADD CONSTRAINT "event_theme_settings_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
INSERT INTO "event_theme_settings" (
	"event_id",
	"selected_theme_id",
	"theme_mode",
	"config_json",
	"updated_at"
)
SELECT
	"id",
	"selected_theme_id",
	"theme_mode",
	"theme_config_json",
	"updated_at"
FROM "events";--> statement-breakpoint
INSERT INTO "event_rsvp_settings" ("event_id", "settings_json", "updated_at")
SELECT "id", "rsvp_settings_json", "updated_at"
FROM "events";--> statement-breakpoint
INSERT INTO "event_section_contents" ("event_section_id", "content_json", "updated_at")
SELECT "id", "content_json", "updated_at"
FROM "event_sections";--> statement-breakpoint
INSERT INTO "event_publications" (
	"event_id",
	"selected_theme_id",
	"theme_mode",
	"theme_config_json",
	"public_settings_json",
	"rsvp_settings_json",
	"sections_json",
	"published_at"
)
SELECT
	e."id",
	e."selected_theme_id",
	e."theme_mode",
	e."theme_config_json",
	e."public_settings_json",
	e."rsvp_settings_json",
	COALESCE(
		(
			SELECT jsonb_agg(
				jsonb_build_object(
					'id', es."id",
					'eventId', es."event_id",
					'sectionType', es."section_type",
					'sectionKey', es."section_key",
					'sortOrder', es."sort_order",
					'visibility', es."visibility",
					'enabled', es."enabled",
					'content', es."content_json",
					'settings', es."settings_json",
					'createdAt', es."created_at",
					'updatedAt', es."updated_at"
				)
				ORDER BY es."sort_order", es."created_at"
			)
			FROM "event_sections" es
			WHERE es."event_id" = e."id"
				AND es."enabled" = true
				AND es."visibility" <> 'hidden'
		),
		'[]'::jsonb
	),
	e."updated_at"
FROM "events" e
WHERE e."status" = 'published'
	AND e."selected_theme_id" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "event_sections" DROP COLUMN "content_json";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "selected_theme_id";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "theme_mode";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "theme_config_json";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "rsvp_settings_json";
