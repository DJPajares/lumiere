"use client";

import { Badge } from "@lumiere/dashboard-ui/components/badge";
import { Button } from "@lumiere/dashboard-ui/components/button";
import { Skeleton } from "@lumiere/dashboard-ui/components/skeleton";
import {
  eventDeletionRetentionDays,
  isInviteAccessExpired,
  type Event,
  type ManagerRole,
} from "@lumiere/types";
import { useCallback, useEffect, useState } from "react";

import { useDashboardAuth } from "../../../../auth/dashboard-auth-provider";
import { EventTabs } from "../../../placeholder-panels";
import { AmbientAudioSettingsPanel } from "./ambient-audio-settings-panel";
import { CollaboratorAccessPanel } from "./collaborator-access-panel";
import { EventBasicsModal } from "../../event-basics-modal";
import { EventDeletionModal } from "../../event-deletion-modal";
import {
  EventDateTimeField,
  eventIsoToLocalDateTime,
  eventLocalDateTimeToIso,
  isCompleteEventLocalDateTime,
} from "../../../ui/event-date-time-picker";
import {
  formatDateTime,
  formatEventType,
  formatStatus,
  toFriendlyApiMessage,
} from "../../event-basics-form";

type SettingsState =
  | { accessRole: ManagerRole; error: null; event: Event; status: "ready" }
  | { error: string | null; event: null; status: "error" | "loading" };

export function EventSettingsWorkspace({ eventId }: { eventId: string }) {
  const { apiClient } = useDashboardAuth();
  const [state, setState] = useState<SettingsState>({
    error: null,
    event: null,
    status: "loading",
  });
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [accessExpiry, setAccessExpiry] = useState("");
  const [accessExpiryError, setAccessExpiryError] = useState<string>();
  const [accessExpiryNotice, setAccessExpiryNotice] = useState<string>();
  const [savingAccessExpiry, setSavingAccessExpiry] = useState(false);

  const loadEvent = useCallback(async () => {
    if (!apiClient) {
      setState({
        error: "Dashboard API is not configured.",
        event: null,
        status: "error",
      });
      return;
    }

    setState({ error: null, event: null, status: "loading" });

    try {
      const response = await apiClient.getEvent(eventId);
      setState({
        accessRole: response.access.role,
        error: null,
        event: response.event,
        status: "ready",
      });
    } catch (error) {
      setState({ error: toFriendlyApiMessage(error), event: null, status: "error" });
    }
  }, [apiClient, eventId]);

  useEffect(() => {
    void loadEvent();
  }, [loadEvent]);

  useEffect(() => {
    if (state.status === "ready") {
      setAccessExpiry(
        eventIsoToLocalDateTime(state.event.accessExpiresAt ?? undefined, state.event.timezone),
      );
    }
  }, [state]);

  if (state.status === "loading") {
    return (
      <div className="grid gap-5">
        <EventTabs active="settings" eventId={eventId} />
        <SettingsLoading />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <section
        className="grid justify-items-start gap-3 rounded-[var(--radius-lg)] border border-destructive/50 bg-destructive/10 p-5 text-destructive"
        role="alert"
      >
        <h2 className="text-lg font-semibold">Unable to load event settings</h2>
        <p className="text-sm">{state.error}</p>
        <Button className="min-h-10" onClick={() => void loadEvent()} variant="outline">
          Try again
        </Button>
      </section>
    );
  }

  if (state.status !== "ready" || !state.event) {
    return null;
  }

  const event = state.event;
  const canEdit = state.accessRole !== "viewer";
  const isOwner = state.accessRole === "owner";
  const savedAccessExpiry = event.accessExpiresAt ?? null;
  const selectedAccessExpiry = accessExpiry
    ? eventLocalDateTimeToIso(accessExpiry, event.timezone)
    : null;
  const accessExpiryChanged = selectedAccessExpiry !== savedAccessExpiry;
  const selectedExpiryIsPast = Boolean(
    selectedAccessExpiry && isInviteAccessExpired(selectedAccessExpiry),
  );

  const saveAccessExpiry = async () => {
    if (!apiClient) {
      setAccessExpiryError("Dashboard API is not configured.");
      return;
    }

    if (accessExpiry && !isCompleteEventLocalDateTime(accessExpiry)) {
      setAccessExpiryError("Choose both a date and time, or leave the deadline blank.");
      return;
    }

    if (accessExpiry && !selectedAccessExpiry) {
      setAccessExpiryError("Choose a valid date and time in the event timezone.");
      return;
    }

    setSavingAccessExpiry(true);
    setAccessExpiryError(undefined);
    setAccessExpiryNotice(undefined);

    try {
      const response = await apiClient.updateEvent(event.id, {
        accessExpiresAt: selectedAccessExpiry,
      });
      setState({
        accessRole: state.accessRole,
        error: null,
        event: response.event,
        status: "ready",
      });
      setAccessExpiryNotice(
        selectedAccessExpiry
          ? "Invitation access deadline saved."
          : "Invitation access deadline removed.",
      );
    } catch (error) {
      setAccessExpiryError(toFriendlyApiMessage(error));
    } finally {
      setSavingAccessExpiry(false);
    }
  };

  return (
    <>
      <section className="grid gap-5 rounded-[var(--radius-lg)] border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">Event settings</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">{event.title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Public identity, schedule, and venue are bounded details. Publishing readiness and the
              live invitation state are managed from the event overview.
            </p>
          </div>
          <Badge variant={event.status === "published" ? "default" : "secondary"}>
            {formatStatus(event.status)}
          </Badge>
        </div>

        <dl className="grid gap-3 text-sm md:grid-cols-3">
          <MetadataItem label="Public slug" value={`/e/${event.slug}`} />
          <MetadataItem label="Type" value={formatEventType(event.eventType)} />
          <MetadataItem label="Starts" value={formatDateTime(event.startsAt, event.timezone)} />
        </dl>

        {canEdit ? (
          <Button className="min-h-10 w-fit" onClick={() => setEditOpen(true)}>
            Edit event details
          </Button>
        ) : (
          <Badge className="w-fit" variant="outline">
            View-only access
          </Badge>
        )}
      </section>

      <AmbientAudioSettingsPanel
        accessRole={state.accessRole}
        apiClient={apiClient}
        event={event}
        onSaved={(savedEvent) =>
          setState({
            accessRole: state.accessRole,
            error: null,
            event: savedEvent,
            status: "ready",
          })
        }
      />

      <section className="grid gap-5 rounded-[var(--radius-lg)] border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">Invitation access</p>
            <h2 className="mt-2 text-lg font-semibold">Set an access deadline</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              This optional deadline closes the public invitation, every private guest link, and
              RSVP submissions. It is separate from the event end time.
            </p>
          </div>
          <Badge
            className="w-fit"
            variant={
              savedAccessExpiry && isInviteAccessExpired(savedAccessExpiry)
                ? "destructive"
                : "outline"
            }
          >
            {savedAccessExpiry
              ? isInviteAccessExpired(savedAccessExpiry)
                ? "Access expired"
                : "Deadline active"
              : "No deadline"}
          </Badge>
        </div>

        <EventDateTimeField
          description="After this moment, visitors see an expired-invitation page and can no longer RSVP."
          disabled={!canEdit || savingAccessExpiry}
          error={accessExpiryError}
          id="event-access-expiry"
          label="Access expires optional"
          onValueChange={(value) => {
            setAccessExpiry(value);
            setAccessExpiryError(undefined);
            setAccessExpiryNotice(undefined);
          }}
          timezone={event.timezone}
          value={accessExpiry}
        />

        {selectedExpiryIsPast ? (
          <p
            className="rounded-[var(--radius-md)] border border-destructive/35 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            Saving this time will expire invitation access immediately. If you mean to pause the
            entire invitation instead, use the publishing controls on Overview.
          </p>
        ) : null}

        {accessExpiryNotice ? (
          <p className="text-sm text-muted-foreground" role="status">
            {accessExpiryNotice}
          </p>
        ) : null}

        {canEdit ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {event.endsAt ? (
              <Button
                className="min-h-10"
                disabled={savingAccessExpiry}
                onClick={() => {
                  setAccessExpiry(eventIsoToLocalDateTime(event.endsAt, event.timezone));
                  setAccessExpiryError(undefined);
                  setAccessExpiryNotice(undefined);
                }}
                type="button"
                variant="outline"
              >
                Use event end time
              </Button>
            ) : null}
            <Button
              className="min-h-10 sm:ml-auto"
              disabled={!accessExpiryChanged || savingAccessExpiry}
              onClick={() => void saveAccessExpiry()}
              type="button"
            >
              {savingAccessExpiry ? "Saving..." : "Save access deadline"}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Editors and owners can change this deadline.
          </p>
        )}
      </section>

      <CollaboratorAccessPanel
        accessRole={state.accessRole}
        eventId={eventId}
        eventTitle={event.title}
      />

      {isOwner ? (
        <section className="grid gap-4 rounded-[var(--radius-lg)] border border-destructive/30 bg-card p-5 shadow-sm sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-6">
          <div>
            <p className="text-sm font-semibold text-destructive">Danger zone</p>
            <h2 className="mt-2 text-lg font-semibold">Delete this event</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              Public and guest access stops immediately. The event remains recoverable from Home for{" "}
              {eventDeletionRetentionDays} days.
            </p>
          </div>
          <Button className="min-h-10" onClick={() => setDeleteOpen(true)} variant="destructive">
            Delete event
          </Button>
        </section>
      ) : null}

      <EventBasicsModal
        event={event}
        onOpenChange={setEditOpen}
        onSaved={(savedEvent) =>
          setState({
            accessRole: state.accessRole,
            error: null,
            event: savedEvent,
            status: "ready",
          })
        }
        open={editOpen}
      />
      {isOwner ? (
        <EventDeletionModal
          event={event}
          onDeleted={() => {
            window.location.assign("/");
          }}
          onOpenChange={setDeleteOpen}
          open={deleteOpen}
        />
      ) : null}
    </>
  );
}

function SettingsLoading() {
  return (
    <div aria-label="Loading event settings" aria-live="polite" className="grid gap-4">
      <Skeleton className="h-48 rounded-[var(--radius-lg)] motion-reduce:animate-none" />
    </div>
  );
}

function MetadataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] bg-muted/60 p-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}
