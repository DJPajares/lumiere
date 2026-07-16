SET search_path TO "lumiere", "public";--> statement-breakpoint
CREATE TABLE "event_slug_aliases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"slug" varchar(80) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "public_access_code_hash" text;--> statement-breakpoint
ALTER TABLE "event_slug_aliases" ADD CONSTRAINT "event_slug_aliases_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "lumiere"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "event_slug_aliases_slug_unique" ON "event_slug_aliases" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "event_slug_aliases_event_id_idx" ON "event_slug_aliases" USING btree ("event_id");
