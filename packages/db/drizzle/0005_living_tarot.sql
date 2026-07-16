SET search_path TO "lumiere", "public";--> statement-breakpoint
ALTER TABLE "event_publications" ALTER COLUMN "rsvp_settings_json" SET DEFAULT '{"collectGuestMessage": true, "collectGuestNames": true}'::jsonb;--> statement-breakpoint
ALTER TABLE "event_rsvp_settings" ALTER COLUMN "settings_json" SET DEFAULT '{"collectGuestMessage": true, "collectGuestNames": true}'::jsonb;--> statement-breakpoint
UPDATE "event_rsvp_settings"
SET "settings_json" = '{"collectGuestMessage": true, "collectGuestNames": true}'::jsonb || "settings_json"
WHERE NOT (
	"settings_json" ? 'collectGuestMessage'
	AND "settings_json" ? 'collectGuestNames'
);--> statement-breakpoint
UPDATE "event_publications"
SET "rsvp_settings_json" = '{"collectGuestMessage": true, "collectGuestNames": true}'::jsonb || "rsvp_settings_json"
WHERE NOT (
	"rsvp_settings_json" ? 'collectGuestMessage'
	AND "rsvp_settings_json" ? 'collectGuestNames'
);
