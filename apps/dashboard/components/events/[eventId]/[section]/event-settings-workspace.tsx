"use client";

import { Badge } from "@lumiere/dashboard-ui/components/badge";
import { Button } from "@lumiere/dashboard-ui/components/button";
import { FieldDescription, FieldLegend, FieldSet } from "@lumiere/dashboard-ui/components/field";
import { Skeleton } from "@lumiere/dashboard-ui/components/skeleton";
import { toast } from "@lumiere/dashboard-ui/components/sonner";
import type { Event } from "@lumiere/types";
import { useCallback, useEffect, useState, type FormEvent } from "react";

import { useDashboardAuth } from "../../../../auth/dashboard-auth-provider";
import { EventTabs } from "../../../placeholder-panels";
import { EventBasicsModal } from "../../event-basics-modal";
import {
  formatDateTime,
  formatEventType,
  formatStatus,
  toFriendlyApiMessage,
} from "../../event-basics-form";
import { DashboardSwitch } from "../../../ui/dashboard-fields";

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

      <RsvpResponseFieldSettings
        event={event}
        onSaved={(savedEvent) => setState({ error: null, event: savedEvent, status: "ready" })}
      />

      <EventBasicsModal
        event={event}
        onOpenChange={setEditOpen}
        onSaved={(savedEvent) => setState({ error: null, event: savedEvent, status: "ready" })}
        open={editOpen}
      />
    </>
  );
}

function RsvpResponseFieldSettings({
  event,
  onSaved,
}: {
  event: Event;
  onSaved: (event: Event) => void;
}) {
  const { apiClient } = useDashboardAuth();
  const [collectGuestNames, setCollectGuestNames] = useState(event.rsvpSettings.collectGuestNames);
  const [collectGuestMessage, setCollectGuestMessage] = useState(
    event.rsvpSettings.collectGuestMessage,
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const dirty =
    collectGuestNames !== event.rsvpSettings.collectGuestNames ||
    collectGuestMessage !== event.rsvpSettings.collectGuestMessage;

  const submit = async (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault();

    if (!apiClient || !dirty) {
      if (!apiClient) {
        setError("Dashboard API is not configured.");
      }
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      const response = await apiClient.updateEvent(event.id, {
        rsvpSettings: {
          collectGuestMessage,
          collectGuestNames,
        },
      });

      onSaved(response.event);
      toast.success("RSVP response fields saved.");
    } catch (saveError) {
      setError(toFriendlyApiMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="grid gap-5 rounded-[var(--radius-lg)] border border-border bg-card p-5 shadow-sm sm:p-6">
      <div>
        <p className="text-sm font-semibold text-primary">RSVP configuration</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight">Guest response fields</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Choose which details guests provide with their attendance reply. Attendance and guest
          count remain available for every RSVP.
        </p>
      </div>

      <form className="grid gap-5" onSubmit={submit}>
        <FieldSet disabled={isSaving}>
          <FieldLegend variant="label">Optional response details</FieldLegend>
          <FieldDescription>
            Guest names are required for each attendee when enabled. The message is always optional.
          </FieldDescription>
          <div className="grid gap-3 sm:grid-cols-2">
            <DashboardSwitch
              checked={collectGuestNames}
              description="Ask for one name per attending guest."
              disabled={isSaving}
              id={`rsvp-guest-names-${event.id}`}
              label="Collect guest names"
              onCheckedChange={setCollectGuestNames}
            />
            <DashboardSwitch
              checked={collectGuestMessage}
              description="Let guests add an optional note for the host."
              disabled={isSaving}
              id={`rsvp-guest-message-${event.id}`}
              label="Collect a guest message"
              onCheckedChange={setCollectGuestMessage}
            />
          </div>
        </FieldSet>

        <p className="text-sm leading-6 text-muted-foreground">
          Turning a field off hides it from future guest replies. Previously submitted names and
          messages stay retained and remain visible in manager response records.
        </p>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <Button className="min-h-10 w-fit" disabled={isSaving || !dirty} type="submit">
          {isSaving ? "Saving RSVP fields..." : "Save RSVP fields"}
        </Button>
      </form>
    </section>
  );
}

function SettingsLoading() {
  return (
    <div aria-label="Loading event settings" aria-live="polite" className="grid gap-4">
      <Skeleton className="h-48 rounded-[var(--radius-lg)] motion-reduce:animate-none" />
      <Skeleton className="h-24 rounded-[var(--radius-lg)] motion-reduce:animate-none" />
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
