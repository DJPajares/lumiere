SET search_path TO "lumiere", "public";--> statement-breakpoint
ALTER TABLE "events" RENAME COLUMN "slug" TO "public_slug";--> statement-breakpoint
DROP INDEX "events_slug_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "events_public_slug_unique" ON "events" USING btree ("public_slug");
