SET search_path TO "lumiere", "public";--> statement-breakpoint
ALTER TABLE "guest_groups" ADD COLUMN "invite_token_encrypted" text;
