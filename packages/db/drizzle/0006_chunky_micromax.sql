SET search_path TO "lumiere", "public";--> statement-breakpoint
ALTER TYPE "lumiere"."activity_type" ADD VALUE 'event_deleted' BEFORE 'event_published';--> statement-breakpoint
ALTER TYPE "lumiere"."activity_type" ADD VALUE 'event_restored' BEFORE 'section_updated';--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "deleted_by_user_id" uuid;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "purge_after" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_deleted_by_user_id_users_id_fk" FOREIGN KEY ("deleted_by_user_id") REFERENCES "lumiere"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "events_owner_deleted_at_idx" ON "events" USING btree ("owner_user_id","deleted_at");
