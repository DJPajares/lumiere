"use client";

import { Badge } from "@lumiere/dashboard-ui/components/badge";
import { Button } from "@lumiere/dashboard-ui/components/button";
import { Skeleton } from "@lumiere/dashboard-ui/components/skeleton";
import type { Event } from "@lumiere/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useDashboardAuth } from "../../auth/dashboard-auth-provider";
import { EventBasicsModal } from "./event-basics-modal";
import {
  formatDateTime,
  formatEventType,
  formatStatus,
  toFriendlyApiMessage,
} from "./event-basics-form";

export { createEventFromFormData, parseEventCreateForm } from "./event-basics-form";

export function EventsWorkspace() {
  const router = useRouter();
  const { apiClient } = useDashboardAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!apiClient) {
      setIsLoading(false);
      setLoadError("Dashboard API is not configured.");
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    apiClient
      .listEvents()
      .then(({ events }) => {
        if (!isMounted) {
          return;
        }

        setEvents(events);
        setIsLoading(false);
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return;
        }

        setLoadError(toFriendlyApiMessage(error));
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [apiClient]);

  const metrics = useMemo(() => getEventMetrics(events), [events]);
  const openCreate = () => {
    setEditingEvent(null);
    setModalOpen(true);
  };
  const openEdit = (event: Event) => {
    setEditingEvent(event);
    setModalOpen(true);
  };

  return (
    <div className="grid gap-5">
      <section
        aria-label="Event totals"
        className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card shadow-sm"
      >
        <dl className="grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {metrics.map((item) => (
            <div className="grid gap-1 p-5" key={item.label}>
              <dt className="text-sm text-muted-foreground">{item.label}</dt>
              <dd className="text-3xl font-semibold">{item.value}</dd>
              <p className="text-sm text-muted-foreground">{item.state}</p>
            </div>
          ))}
        </dl>
      </section>

      <section className="grid gap-4 rounded-[var(--radius-lg)] border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Manager events</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Open a workspace or update bounded event details without leaving the list.
            </p>
          </div>
          <Button className="min-h-10" onClick={openCreate}>
            Create event
          </Button>
        </div>

        <EventList
          events={events}
          isLoading={isLoading}
          loadError={loadError}
          onCreate={openCreate}
          onEdit={openEdit}
        />
      </section>

      <EventBasicsModal
        event={editingEvent}
        onOpenChange={setModalOpen}
        onSaved={(savedEvent) => {
          const existed = events.some((event) => event.id === savedEvent.id);

          setEvents((current) =>
            existed
              ? current.map((event) => (event.id === savedEvent.id ? savedEvent : event))
              : [savedEvent, ...current],
          );

          if (!existed) {
            router.push(`/events/${savedEvent.id}`);
          }
        }}
        open={modalOpen}
      />
    </div>
  );
}

function EventList({
  events,
  isLoading,
  loadError,
  onCreate,
  onEdit,
}: {
  events: Event[];
  isLoading: boolean;
  loadError: string | null;
  onCreate: () => void;
  onEdit: (event: Event) => void;
}) {
  if (isLoading) {
    return (
      <div aria-label="Loading events" aria-live="polite" className="grid gap-3">
        {[0, 1, 2].map((index) => (
          <Skeleton
            className="h-28 rounded-[var(--radius-md)] motion-reduce:animate-none"
            key={index}
          />
        ))}
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        className="rounded-[var(--radius-md)] border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive"
        role="alert"
      >
        {loadError}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="grid justify-items-start gap-3 rounded-[var(--radius-md)] border border-dashed border-border bg-muted/40 p-5">
        <h3 className="text-lg font-semibold">Create your first event</h3>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Add the public details first, then choose a theme, arrange content, and invite guests from
          the event workspace.
        </p>
        <Button className="min-h-10" onClick={onCreate}>
          Create event
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {events.map((event) => (
        <article
          className="grid gap-3 rounded-[var(--radius-md)] border border-border p-4 transition-colors hover:bg-muted/35"
          key={event.id}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                <Link
                  className="outline-none hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50"
                  href={`/events/${event.id}`}
                >
                  {event.title}
                </Link>
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                /e/{event.slug} · {formatEventType(event.eventType)}
              </p>
            </div>
            <Badge variant={statusBadgeVariant(event.status)}>{formatStatus(event.status)}</Badge>
          </div>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Date</dt>
              <dd className="mt-1 font-medium">{formatDateTime(event.startsAt, event.timezone)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Venue</dt>
              <dd className="mt-1 font-medium">{event.venueName || "Venue not set"}</dd>
            </div>
          </dl>
          <div className="flex flex-wrap gap-2 border-t border-border pt-3">
            <Button className="min-h-10" render={<Link href={`/events/${event.id}`} />} size="sm">
              Open workspace
            </Button>
            <Button
              aria-label={`Edit ${event.title}`}
              className="min-h-10"
              onClick={() => onEdit(event)}
              size="sm"
              variant="outline"
            >
              Edit event
            </Button>
            {eventQuickLinks.map((item) => (
              <Button
                className="min-h-10"
                key={item.href}
                render={<Link href={`/events/${event.id}/${item.href}`} />}
                size="sm"
                variant="ghost"
              >
                {item.label}
              </Button>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function getEventMetrics(events: Event[]) {
  const published = events.filter((event) => event.status === "published").length;
  const drafts = events.filter((event) => event.status === "draft").length;

  return [
    {
      label: "Total events",
      state: events.length === 0 ? "Ready for setup" : "Manager scope",
      value: String(events.length),
    },
    {
      label: "Published events",
      state: published === 0 ? "None live" : "Visible to guests",
      value: String(published),
    },
    {
      label: "Draft events",
      state: drafts === 0 ? "No drafts" : "Needs setup",
      value: String(drafts),
    },
  ];
}

function statusBadgeVariant(status: Event["status"]): "default" | "outline" | "secondary" {
  if (status === "published") {
    return "default";
  }

  return status === "draft" ? "secondary" : "outline";
}

const eventQuickLinks = [
  { href: "theme", label: "Theme" },
  { href: "content", label: "Content" },
  { href: "guests", label: "Guests" },
  { href: "activity", label: "Activity" },
] as const;
