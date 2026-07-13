"use client";

import { Badge } from "@lumiere/dashboard-ui/components/badge";
import { Button } from "@lumiere/dashboard-ui/components/button";
import { Skeleton } from "@lumiere/dashboard-ui/components/skeleton";
import { eventDeletionRetentionDays, type Event } from "@lumiere/types";
import { useCallback, useEffect, useState } from "react";

import { useDashboardAuth } from "../../../../auth/dashboard-auth-provider";
import { EventTabs } from "../../../placeholder-panels";
import { EventBasicsModal } from "../../event-basics-modal";
import { EventDeletionModal } from "../../event-deletion-modal";
import {
  formatDateTime,
  formatEventType,
  formatStatus,
  toFriendlyApiMessage,
} from "../../event-basics-form";

type SettingsState =
  | { error: null; event: Event; status: "ready" }
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
      setState({ error: null, event: response.event, status: "ready" });
    } catch (error) {
      setState({ error: toFriendlyApiMessage(error), event: null, status: "error" });
    }
  }, [apiClient, eventId]);

  useEffect(() => {
    void loadEvent();
  }, [loadEvent]);

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

  return (
    <>
      <section className="grid gap-5 rounded-[var(--radius-lg)] border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">Event settings</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">{event.title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Public identity, schedule, venue, and publish state are bounded details that can be
              updated without leaving this workspace.
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

        <Button className="min-h-10 w-fit" onClick={() => setEditOpen(true)}>
          Edit event details
        </Button>
      </section>

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

      <EventBasicsModal
        event={event}
        onOpenChange={setEditOpen}
        onSaved={(savedEvent) => setState({ error: null, event: savedEvent, status: "ready" })}
        open={editOpen}
      />
      <EventDeletionModal
        event={event}
        onDeleted={() => {
          window.location.assign("/");
        }}
        onOpenChange={setDeleteOpen}
        open={deleteOpen}
      />
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
