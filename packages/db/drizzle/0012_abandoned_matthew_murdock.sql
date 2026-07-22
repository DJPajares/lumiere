CREATE TYPE "lumiere"."guest_invite_share_channel" AS ENUM('email', 'sms', 'whatsapp', 'messenger', 'other');--> statement-breakpoint
ALTER TYPE "lumiere"."activity_type" ADD VALUE 'guest_invite_sent' BEFORE 'guest_data_exported';--> statement-breakpoint
ALTER TABLE "lumiere"."guest_groups" ADD COLUMN "first_sent_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "lumiere"."guest_groups" ADD COLUMN "last_sent_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "lumiere"."guest_groups" ADD COLUMN "send_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "lumiere"."guest_groups" ADD COLUMN "last_share_channel" "lumiere"."guest_invite_share_channel";--> statement-breakpoint
ALTER TABLE "lumiere"."guest_groups" ADD COLUMN "first_opened_at" timestamp with time zone;