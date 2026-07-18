CREATE TYPE "lumiere"."collaborator_invitation_status" AS ENUM('pending', 'accepted', 'declined', 'revoked', 'expired');--> statement-breakpoint
CREATE TABLE "lumiere"."collaborator_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"email" varchar(320) NOT NULL,
	"role" "lumiere"."manager_role" NOT NULL,
	"status" "lumiere"."collaborator_invitation_status" DEFAULT 'pending' NOT NULL,
	"invited_by_user_id" uuid NOT NULL,
	"responded_by_user_id" uuid,
	"expires_at" timestamp with time zone NOT NULL,
	"last_sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"send_count" integer DEFAULT 1 NOT NULL,
	"responded_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "collaborator_invitations_role_check" CHECK ("lumiere"."collaborator_invitations"."role" in ('editor', 'viewer')),
	CONSTRAINT "collaborator_invitations_normalized_email_check" CHECK ("lumiere"."collaborator_invitations"."email" = lower(btrim("lumiere"."collaborator_invitations"."email"))),
	CONSTRAINT "collaborator_invitations_send_count_check" CHECK ("lumiere"."collaborator_invitations"."send_count" >= 1)
);
--> statement-breakpoint
ALTER TABLE "lumiere"."collaborator_invitations" ADD CONSTRAINT "collaborator_invitations_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "lumiere"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lumiere"."collaborator_invitations" ADD CONSTRAINT "collaborator_invitations_invited_by_user_id_users_id_fk" FOREIGN KEY ("invited_by_user_id") REFERENCES "lumiere"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lumiere"."collaborator_invitations" ADD CONSTRAINT "collaborator_invitations_responded_by_user_id_users_id_fk" FOREIGN KEY ("responded_by_user_id") REFERENCES "lumiere"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "collaborator_invitations_pending_email_unique" ON "lumiere"."collaborator_invitations" USING btree ("event_id","email") WHERE "lumiere"."collaborator_invitations"."status" = 'pending';--> statement-breakpoint
CREATE INDEX "collaborator_invitations_event_status_idx" ON "lumiere"."collaborator_invitations" USING btree ("event_id","status");--> statement-breakpoint
CREATE INDEX "collaborator_invitations_email_status_idx" ON "lumiere"."collaborator_invitations" USING btree ("email","status");--> statement-breakpoint
INSERT INTO "lumiere"."event_managers" ("event_id", "user_id", "role")
SELECT "id", "owner_user_id", 'owner'::"lumiere"."manager_role"
FROM "lumiere"."events"
ON CONFLICT ("event_id", "user_id")
DO UPDATE SET "role" = 'owner'::"lumiere"."manager_role";
