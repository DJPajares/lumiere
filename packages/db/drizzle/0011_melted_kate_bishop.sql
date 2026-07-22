ALTER TYPE "lumiere"."activity_type" ADD VALUE 'event_access_expiry_changed' BEFORE 'event_published';--> statement-breakpoint
ALTER TYPE "lumiere"."activity_type" ADD VALUE 'guest_access_expiry_changed' BEFORE 'guest_data_exported';--> statement-breakpoint
ALTER TABLE "lumiere"."events" ADD COLUMN "access_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "lumiere"."guest_groups" ADD COLUMN "access_expires_at" timestamp with time zone;