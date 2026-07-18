ALTER TYPE "lumiere"."activity_type" ADD VALUE 'collaborator_removed' BEFORE 'event_deleted';--> statement-breakpoint
ALTER TYPE "lumiere"."activity_type" ADD VALUE 'collaborator_role_changed' BEFORE 'event_deleted';
