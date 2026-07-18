CREATE TABLE "lumiere"."guest_group_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guest_group_id" uuid NOT NULL,
	"name" varchar(160) NOT NULL,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lumiere"."guest_group_members" ADD CONSTRAINT "guest_group_members_guest_group_id_guest_groups_id_fk" FOREIGN KEY ("guest_group_id") REFERENCES "lumiere"."guest_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "guest_group_members_group_sort_unique" ON "lumiere"."guest_group_members" USING btree ("guest_group_id","sort_order");--> statement-breakpoint
CREATE INDEX "guest_group_members_group_id_idx" ON "lumiere"."guest_group_members" USING btree ("guest_group_id");