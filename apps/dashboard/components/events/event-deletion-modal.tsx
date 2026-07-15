"use client";

import { Button } from "@lumiere/dashboard-ui/components/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@lumiere/dashboard-ui/components/field";
import { Input } from "@lumiere/dashboard-ui/components/input";
import { toast } from "@lumiere/dashboard-ui/components/sonner";
import { eventDeletionRetentionDays, type Event } from "@lumiere/types";
import { useEffect, useState, type FormEvent } from "react";

import { useDashboardAuth } from "../../auth/dashboard-auth-provider";
import { ResponsiveModal } from "../ui/responsive-modal";
import { toFriendlyApiMessage } from "./event-basics-form";

type EventDeletionModalProps = {
  event: Event;
  onDeleted: (event: Event) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function EventDeletionModal({
  event,
  onDeleted,
  onOpenChange,
  open,
}: EventDeletionModalProps) {
  const { apiClient } = useDashboardAuth();
  const [confirmationTitle, setConfirmationTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const confirmed = confirmationTitle === event.title;

  const reset = () => {
    setConfirmationTitle("");
    setError(null);
    setIsDeleting(false);
  };

  useEffect(() => {
    if (open) {
      reset();
    }
  }, [event.id, open]);

  const submit = async (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault();

    if (!apiClient) {
      toast.error("Dashboard API is not configured.");
      setError("Dashboard API is not configured.");
      return;
    }

    if (!confirmed) {
      const message = `Type ${event.title} exactly to continue.`;
      setError(message);
      toast.error(message);
      return;
    }

    setError(null);
    setIsDeleting(true);

    try {
      const response = await apiClient.deleteEvent(event.id, {
        confirmationTitle,
      });

      onDeleted(response.event);
      onOpenChange(false);
      toast.success(`${event.title} was moved to Recently deleted.`);
    } catch (requestError) {
      const message = toFriendlyApiMessage(requestError);
      setError(message);
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ResponsiveModal
      contentClassName="sm:max-w-xl"
      description="Stop every public and guest interaction, then keep the event recoverable for a limited time."
      dirty={confirmationTitle.length > 0}
      onDiscard={reset}
      onOpenChange={onOpenChange}
      open={open}
      title={`Delete ${event.title}`}
    >
      {({ requestClose }) => (
        <form className="flex flex-col gap-5" onSubmit={submit}>
          <div className="flex flex-col gap-3 text-sm leading-6">
            <p>
              Deleting this event immediately removes it from manager lists and makes its public
              invitation, guest links, and RSVP submission unavailable.
            </p>
            <p className="text-muted-foreground">
              Guest groups, responses, activity, notifications, settings, and media references are
              retained for {eventDeletionRetentionDays} days. Restoring the event returns it as a
              draft so it cannot be republished accidentally.
            </p>
          </div>

          <FieldGroup>
            <Field data-invalid={Boolean(error)}>
              <FieldLabel htmlFor={`delete-event-${event.id}`}>
                Type <strong>{event.title}</strong> to confirm
              </FieldLabel>
              <Input
                aria-invalid={Boolean(error)}
                autoComplete="off"
                autoFocus
                disabled={isDeleting}
                id={`delete-event-${event.id}`}
                onChange={(inputEvent) => {
                  setConfirmationTitle(inputEvent.target.value);
                  setError(null);
                }}
                value={confirmationTitle}
              />
              <FieldDescription>This check is case-sensitive.</FieldDescription>
              <FieldError>{error}</FieldError>
            </Field>
          </FieldGroup>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button disabled={isDeleting} onClick={requestClose} type="button" variant="outline">
              Keep event
            </Button>
            <Button disabled={!confirmed || isDeleting} type="submit" variant="destructive">
              {isDeleting ? "Deleting event" : "Delete event"}
            </Button>
          </div>
        </form>
      )}
    </ResponsiveModal>
  );
}
