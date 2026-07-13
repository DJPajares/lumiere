"use client";

import { Badge } from "@lumiere/dashboard-ui/components/badge";
import { Button, buttonVariants } from "@lumiere/dashboard-ui/components/button";
import { Skeleton } from "@lumiere/dashboard-ui/components/skeleton";
import { toast } from "@lumiere/dashboard-ui/components/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@lumiere/dashboard-ui/components/tabs";
import { cn } from "@lumiere/dashboard-ui/lib/utils";
import type { ActivityEvent, Event, EventSummary } from "@lumiere/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useDashboardAuth } from "../auth/dashboard-auth-provider";
import { EventBasicsModal } from "./events/event-basics-modal";
import {
  formatDateTime,
  formatEventType,
  formatStatus,
  toFriendlyApiMessage,
} from "./events/event-basics-form";

type EventInsight = {
  activity: ActivityEvent[] | null;
  event: Event;
  failures: Array<"activity" | "summary">;
  summary: EventSummary | null;
};

type ManagerOverviewData = {
  deletedEvents: Event[];
  events: Event[];
  insights: EventInsight[];
};

type ManagerOverviewState =
  | { data: null; error: null; status: "loading" }
  | { data: null; error: string; status: "error" }
  | { data: ManagerOverviewData; error: null; status: "ready" };

const initialState: ManagerOverviewState = {
  data: null,
  error: null,
  status: "loading",
};

export function ManagerOverviewWorkspace() {
  const router = useRouter();
  const { apiClient } = useDashboardAuth();
  const [state, setState] = useState<ManagerOverviewState>(initialState);
  const requestRevision = useRef(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [restoringEventId, setRestoringEventId] = useState<string | null>(null);

  const loadOverview = useCallback(async () => {
    const revision = requestRevision.current + 1;
    requestRevision.current = revision;

    if (!apiClient) {
      setState({
        data: null,
        error: "Dashboard API is not configured.",
        status: "error",
      });
      return;
    }

    setState(initialState);

    try {
      const [{ events }, { events: deletedEvents }] = await Promise.all([
        apiClient.listEvents(),
        apiClient.listDeletedEvents(),
      ]);

      if (revision !== requestRevision.current) {
        return;
      }

      const insights = await Promise.all(
        events.map(async (event): Promise<EventInsight> => {
          const [summaryResult, activityResult] = await Promise.allSettled([
            apiClient.getEventSummary(event.id),
            apiClient.listEventActivity(event.id),
          ]);
          const failures: EventInsight["failures"] = [];

          if (summaryResult.status === "rejected") {
            failures.push("summary");
          }

          if (activityResult.status === "rejected") {
            failures.push("activity");
          }

          return {
            activity: activityResult.status === "fulfilled" ? activityResult.value.activity : null,
            event,
            failures,
            summary: summaryResult.status === "fulfilled" ? summaryResult.value.summary : null,
          };
        }),
      );

      if (revision !== requestRevision.current) {
        return;
      }

      setState({
        data: { deletedEvents, events, insights },
        error: null,
        status: "ready",
      });
    } catch (error) {
      if (revision !== requestRevision.current) {
        return;
      }

      setState({
        data: null,
        error: toFriendlyApiMessage(error),
        status: "error",
      });
    }
  }, [apiClient]);

  const restoreEvent = async (event: Event) => {
    if (!apiClient) {
      toast.error("Dashboard API is not configured.");
      return;
    }

    setRestoringEventId(event.id);

    try {
      await apiClient.restoreEvent(event.id);
      toast.success(`${event.title} was restored as a draft.`);
      await loadOverview();
    } catch (error) {
      toast.error(toFriendlyApiMessage(error));
    } finally {
      setRestoringEventId(null);
    }
  };

  useEffect(() => {
    void loadOverview();

    return () => {
      requestRevision.current += 1;
    };
  }, [loadOverview]);

  if (state.status === "loading") {
    return <ManagerOverviewLoading />;
  }

  if (state.status === "error") {
    return <ManagerOverviewError error={state.error} onRetry={() => void loadOverview()} />;
  }

  if (state.data.events.length === 0) {
    return (
      <>
        <div className="grid gap-5">
          <ManagerOverviewEmpty
            onCreate={() => {
              setEditingEvent(null);
              setModalOpen(true);
            }}
          />
          <DeletedEvents
            events={state.data.deletedEvents}
            onRestore={(event) => void restoreEvent(event)}
            restoringEventId={restoringEventId}
          />
        </div>
        <EventBasicsModal
          event={editingEvent}
          onOpenChange={setModalOpen}
          onSaved={(event) => router.push(`/events/${event.id}`)}
          open={modalOpen}
        />
      </>
    );
  }

  return (
    <>
      <ManagerOverviewContent
        data={state.data}
        onCreate={() => {
          setEditingEvent(null);
          setModalOpen(true);
        }}
        onEdit={(event) => {
          setEditingEvent(event);
          setModalOpen(true);
        }}
        onRefresh={() => void loadOverview()}
        onRestore={(event) => void restoreEvent(event)}
        restoringEventId={restoringEventId}
      />
      <EventBasicsModal
        event={editingEvent}
        onOpenChange={setModalOpen}
        onSaved={(event) => {
          if (editingEvent) {
            setState((current) =>
              current.status === "ready"
                ? {
                    ...current,
                    data: {
                      deletedEvents: current.data.deletedEvents,
                      events: current.data.events.map((item) =>
                        item.id === event.id ? event : item,
                      ),
                      insights: current.data.insights.map((insight) =>
                        insight.event.id === event.id ? { ...insight, event } : insight,
                      ),
                    },
                  }
                : current,
            );
          } else {
            router.push(`/events/${event.id}`);
          }
        }}
        open={modalOpen}
      />
    </>
  );
}

function ManagerOverviewContent({
  data,
  onCreate,
  onEdit,
  onRefresh,
  onRestore,
  restoringEventId,
}: {
  data: ManagerOverviewData;
  onCreate: () => void;
  onEdit: (event: Event) => void;
  onRefresh: () => void;
  onRestore: (event: Event) => void;
  restoringEventId: string | null;
}) {
  const now = new Date();
  const overview = useMemo(() => buildManagerOverview(data, now), [data, now]);
  const partialFailureCount = data.insights.reduce(
    (count, insight) => count + insight.failures.length,
    0,
  );

  return (
    <div className="grid gap-5">
      <section className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col gap-4 border-b border-border bg-[color-mix(in_srgb,var(--primary)_6%,var(--card))] p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
          <div className="max-w-2xl">
            <Badge variant="secondary">Manager overview</Badge>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">
              {data.events.length === 1
                ? "One event in motion"
                : `${data.events.length} events in motion`}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Track publishing, guest responses, and the next moments that need attention across
              your event portfolio.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button className="min-h-10" onClick={onRefresh} variant="outline">
              Refresh overview
            </Button>
            <Button className="min-h-10" onClick={onCreate}>
              Create event
            </Button>
          </div>
        </div>

        <dl
          aria-label="Manager metrics"
          className="grid divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4"
        >
          {overview.metrics.map((metric) => (
            <div className="grid gap-1 px-5 py-4 sm:px-6" key={metric.label}>
              <dt className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                {metric.label}
              </dt>
              <dd className="text-2xl font-semibold tracking-tight">{metric.value}</dd>
              <p className="text-xs leading-5 text-muted-foreground">{metric.detail}</p>
            </div>
          ))}
        </dl>
      </section>

      {partialFailureCount > 0 ? (
        <section
          className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-warning/50 bg-warning/10 p-4 text-sm sm:flex-row sm:items-center sm:justify-between"
          role="status"
        >
          <div>
            <h2 className="font-semibold">Some event analytics could not be loaded</h2>
            <p className="mt-1 leading-6 text-muted-foreground">
              Event links and available totals remain usable. Missing RSVP or activity details are
              shown as unavailable.
            </p>
          </div>
          <Button className="min-h-10" onClick={onRefresh} size="sm" variant="outline">
            Retry analytics
          </Button>
        </section>
      ) : null}

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(20rem,0.75fr)]">
        <div className="grid gap-5">
          <UpcomingMilestones milestones={overview.milestones} />
          <ManagedEvents events={data.events} now={now} onEdit={onEdit} />
        </div>
        <div className="grid gap-5">
          <PendingActions actions={overview.pendingActions} />
          <RecentActivity activity={overview.recentActivity} />
        </div>
      </div>

      <DeletedEvents
        events={data.deletedEvents}
        onRestore={onRestore}
        restoringEventId={restoringEventId}
      />
    </div>
  );
}

function DeletedEvents({
  events,
  onRestore,
  restoringEventId,
}: {
  events: Event[];
  onRestore: (event: Event) => void;
  restoringEventId: string | null;
}) {
  if (events.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[var(--radius-lg)] border border-border bg-card p-5 text-card-foreground shadow-sm sm:p-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Recently deleted</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Deleted events keep their guest data, settings, activity, and media references during the
          restoration window. Restored events return as drafts.
        </p>
      </div>

      <ul className="mt-4 divide-y divide-border">
        {events.map((event) => {
          const restoring = restoringEventId === event.id;
          const restorable = event.purgeAfter ? Date.parse(event.purgeAfter) > Date.now() : false;

          return (
            <li
              className="grid gap-3 py-4 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
              key={event.id}
            >
              <div className="min-w-0">
                <h3 className="truncate font-semibold">{event.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {restorable && event.purgeAfter
                    ? `Restore by ${formatDateTime(event.purgeAfter)}`
                    : "Restoration window expired"}
                </p>
              </div>
              <Button
                className="min-h-10"
                disabled={!restorable || restoringEventId !== null}
                onClick={() => onRestore(event)}
                size="sm"
                variant="outline"
              >
                {restoring ? "Restoring event" : "Restore as draft"}
              </Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function UpcomingMilestones({ milestones }: { milestones: Event[] }) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-border bg-card p-5 text-card-foreground shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Upcoming milestones</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            The next event dates across your manager account.
          </p>
        </div>
      </div>

      {milestones.length === 0 ? (
        <div className="mt-5 rounded-[var(--radius-md)] bg-muted/60 p-4">
          <h3 className="font-semibold">No upcoming event dates</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Add or update an event date to place it in this timeline.
          </p>
        </div>
      ) : (
        <ol className="mt-5 grid gap-1">
          {milestones.map((event, index) => (
            <li className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-3" key={event.id}>
              <div className="grid justify-items-center" aria-hidden="true">
                <span className="mt-2 size-2 rounded-full bg-primary" />
                {index < milestones.length - 1 ? <span className="w-px flex-1 bg-border" /> : null}
              </div>
              <div className="min-w-0 pb-5">
                <Link
                  className="font-semibold outline-none hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50"
                  href={`/events/${event.id}`}
                >
                  {event.title}
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatDateTime(event.startsAt, event.timezone)}
                </p>
              </div>
              <Badge className="mt-0.5" variant="outline">
                {formatStatus(event.status)}
              </Badge>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function ManagedEvents({
  events,
  now,
  onEdit,
}: {
  events: Event[];
  now: Date;
  onEdit: (event: Event) => void;
}) {
  const allEvents = [...events]
    .sort((first, second) => Date.parse(second.updatedAt) - Date.parse(first.updatedAt))
    .slice(0, 5);
  const upcomingEvents = events
    .filter((event) => event.status !== "archived" && Date.parse(event.startsAt) >= now.getTime())
    .sort((first, second) => Date.parse(first.startsAt) - Date.parse(second.startsAt))
    .slice(0, 5);
  const draftEvents = events
    .filter((event) => event.status === "draft")
    .sort((first, second) => Date.parse(second.updatedAt) - Date.parse(first.updatedAt))
    .slice(0, 5);

  return (
    <section className="rounded-[var(--radius-lg)] border border-border bg-card p-5 text-card-foreground shadow-sm sm:p-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Managed events</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Open a workspace or narrow the list to the events that need attention.
        </p>
      </div>

      <Tabs className="mt-4" defaultValue="all">
        <TabsList
          aria-label="Filter managed events"
          className="group-data-horizontal/tabs:h-10"
          variant="line"
        >
          <TabsTrigger className="min-h-9" value="all">
            Recent
          </TabsTrigger>
          <TabsTrigger className="min-h-9" value="upcoming">
            Upcoming
          </TabsTrigger>
          <TabsTrigger className="min-h-9" value="drafts">
            Drafts
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <ManagerEventRows events={allEvents} onEdit={onEdit} />
        </TabsContent>
        <TabsContent value="upcoming">
          <ManagerEventRows
            emptyMessage="No upcoming events."
            events={upcomingEvents}
            onEdit={onEdit}
          />
        </TabsContent>
        <TabsContent value="drafts">
          <ManagerEventRows emptyMessage="No draft events." events={draftEvents} onEdit={onEdit} />
        </TabsContent>
      </Tabs>
    </section>
  );
}

function ManagerEventRows({
  emptyMessage = "No managed events.",
  events,
  onEdit,
}: {
  emptyMessage?: string;
  events: Event[];
  onEdit: (event: Event) => void;
}) {
  if (events.length === 0) {
    return <p className="rounded-[var(--radius-md)] bg-muted/60 p-4 text-sm">{emptyMessage}</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {events.map((event) => (
        <li
          className="grid gap-3 py-4 first:pt-2 last:pb-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
          key={event.id}
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate font-semibold">{event.title}</h3>
              <Badge variant={statusBadgeVariant(event.status)}>{formatStatus(event.status)}</Badge>
            </div>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {formatEventType(event.eventType)} · {formatDateTime(event.startsAt, event.timezone)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Link
              className={cn(buttonVariants({ size: "sm", variant: "outline" }), "min-h-10")}
              href={`/events/${event.id}`}
            >
              Open {event.title}
            </Link>
            <Button
              aria-label={`Edit ${event.title}`}
              className="min-h-10"
              onClick={() => onEdit(event)}
              size="sm"
              variant="ghost"
            >
              Edit event
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}

type PendingAction = {
  detail: string;
  eventId: string;
  key: string;
  title: string;
};

function PendingActions({ actions }: { actions: PendingAction[] }) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-border bg-card p-5 text-card-foreground shadow-sm">
      <h2 className="text-xl font-semibold tracking-tight">Pending actions</h2>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        Publishing and RSVP work worth checking next.
      </p>

      {actions.length === 0 ? (
        <div className="mt-4 rounded-[var(--radius-md)] bg-success/10 p-4">
          <h3 className="font-semibold">No urgent setup actions</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Your known event and RSVP states are in good order.
          </p>
        </div>
      ) : (
        <ul className="mt-4 grid gap-3">
          {actions.map((action) => (
            <li className="rounded-[var(--radius-md)] bg-muted/60 p-4" key={action.key}>
              <Link
                className="font-semibold outline-none hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50"
                href={`/events/${action.eventId}`}
              >
                {action.title}
              </Link>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{action.detail}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

type ManagerActivity = ActivityEvent & { eventTitle: string };

function RecentActivity({ activity }: { activity: ManagerActivity[] }) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-border bg-card p-5 text-card-foreground shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Recent activity</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Latest guest and manager updates.
          </p>
        </div>
      </div>

      {activity.length === 0 ? (
        <p className="mt-4 rounded-[var(--radius-md)] bg-muted/60 p-4 text-sm leading-6 text-muted-foreground">
          No activity is available yet. Guest opens, RSVP submissions, and manager changes will
          appear here.
        </p>
      ) : (
        <ol className="mt-4 grid gap-4">
          {activity.map((item) => (
            <li className="grid grid-cols-[auto_minmax(0,1fr)] gap-3" key={item.id}>
              <span aria-hidden="true" className="mt-2 size-2 rounded-full bg-primary" />
              <div className="min-w-0">
                <p className="font-semibold">{formatActivityTitle(item)}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.eventTitle} · {formatDateTime(item.createdAt)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function ManagerOverviewEmpty({ onCreate }: { onCreate: () => void }) {
  return (
    <section className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card text-card-foreground shadow-sm">
      <div className="grid gap-5 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:items-center">
        <div>
          <Badge variant="secondary">First event</Badge>
          <h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-tight">
            Create your first Lumiere event
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            Start with the public details, then shape the invitation, guest groups, and RSVP flow
            from one event workspace.
          </p>
          <Button className="mt-5 min-h-10" onClick={onCreate}>
            Create event
          </Button>
        </div>
        <ol className="grid gap-3 rounded-[var(--radius-lg)] bg-muted/60 p-5">
          {[
            ["1", "Add the event details", "Set its name, date, venue, and public URL."],
            ["2", "Choose the invitation", "Pick a compatible theme and arrange the content."],
            ["3", "Invite and track guests", "Create guest groups and monitor RSVP movement."],
          ].map(([step, title, detail]) => (
            <li className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3" key={step}>
              <span className="flex size-8 items-center justify-center rounded-full bg-background text-sm font-semibold text-primary">
                {step}
              </span>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function ManagerOverviewLoading() {
  return (
    <div aria-label="Loading manager overview" aria-live="polite" className="grid gap-5">
      <section className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card">
        <div className="grid gap-4 border-b border-border p-6 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div className="grid gap-3">
            <Skeleton className="h-5 w-32 motion-reduce:animate-none" />
            <Skeleton className="h-8 w-72 max-w-full motion-reduce:animate-none" />
            <Skeleton className="h-4 w-full max-w-xl motion-reduce:animate-none" />
          </div>
          <Skeleton className="h-9 w-36 motion-reduce:animate-none" />
        </div>
        <div className="grid sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div className="grid gap-3 border-b border-border p-5 sm:border-r" key={item}>
              <Skeleton className="h-3 w-24 motion-reduce:animate-none" />
              <Skeleton className="h-8 w-16 motion-reduce:animate-none" />
              <Skeleton className="h-3 w-32 motion-reduce:animate-none" />
            </div>
          ))}
        </div>
      </section>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(20rem,0.75fr)]">
        <Skeleton className="h-80 rounded-[var(--radius-lg)] motion-reduce:animate-none" />
        <Skeleton className="h-80 rounded-[var(--radius-lg)] motion-reduce:animate-none" />
      </div>
    </div>
  );
}

function ManagerOverviewError({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <section
      className="grid justify-items-start gap-4 rounded-[var(--radius-lg)] border border-destructive/50 bg-destructive/10 p-5 text-sm sm:p-6"
      role="alert"
    >
      <div>
        <h2 className="text-lg font-semibold">Unable to load the manager overview</h2>
        <p className="mt-2 leading-6 text-muted-foreground">{error}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button className="min-h-10" onClick={onRetry} variant="outline">
          Try again
        </Button>
      </div>
    </section>
  );
}

function buildManagerOverview(data: ManagerOverviewData, now: Date) {
  const summaries = data.insights.flatMap((insight) => (insight.summary ? [insight.summary] : []));
  const loadedActivity = data.insights.flatMap((insight) => insight.activity ?? []);
  const published = data.events.filter((event) => event.status === "published").length;
  const drafts = data.events.filter((event) => event.status === "draft").length;
  const confirmedPax = summaries.reduce((count, summary) => count + summary.attending.pax, 0);
  const totalGroups = summaries.reduce((count, summary) => count + summary.totalGroups, 0);
  const respondedGroups = summaries.reduce(
    (count, summary) =>
      count + summary.attending.groups + summary.notAttending.groups + summary.maybe.groups,
    0,
  );
  const responseCoverage = totalGroups > 0 ? Math.round((respondedGroups / totalGroups) * 100) : 0;
  const milestones = data.events
    .filter((event) => event.status !== "archived" && Date.parse(event.startsAt) >= now.getTime())
    .sort((first, second) => Date.parse(first.startsAt) - Date.parse(second.startsAt))
    .slice(0, 4);
  const pendingActions: PendingAction[] = [];

  for (const insight of data.insights) {
    if (insight.event.status === "draft") {
      pendingActions.push({
        detail: "Review its content, theme, and guest readiness before publishing.",
        eventId: insight.event.id,
        key: `${insight.event.id}-draft`,
        title: `Finish ${insight.event.title}`,
      });
    }

    if (insight.summary && insight.summary.pending.groups > 0) {
      pendingActions.push({
        detail: `${insight.summary.pending.groups} guest ${insight.summary.pending.groups === 1 ? "group is" : "groups are"} still waiting to respond.`,
        eventId: insight.event.id,
        key: `${insight.event.id}-pending-rsvp`,
        title: `Check pending RSVPs for ${insight.event.title}`,
      });
    }
  }

  const eventTitles = new Map(data.events.map((event) => [event.id, event.title]));
  const recentActivity = loadedActivity
    .map((activity) => ({
      ...activity,
      eventTitle: eventTitles.get(activity.eventId) ?? "Managed event",
    }))
    .sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt))
    .slice(0, 5);

  return {
    metrics: [
      {
        detail: `${published} published · ${drafts} draft`,
        label: "Managed events",
        value: String(data.events.length),
      },
      {
        detail: summaries.length > 0 ? "Across available RSVP summaries" : "RSVP data unavailable",
        label: "Confirmed guests",
        value: summaries.length > 0 ? String(confirmedPax) : "—",
      },
      {
        detail:
          summaries.length > 0
            ? `${respondedGroups} of ${totalGroups} guest groups`
            : "RSVP data unavailable",
        label: "Response coverage",
        value: summaries.length > 0 ? `${responseCoverage}%` : "—",
      },
      {
        detail: data.insights.some((insight) => insight.activity !== null)
          ? "Across available activity feeds"
          : "Activity data unavailable",
        label: "Recent updates",
        value: data.insights.some((insight) => insight.activity !== null)
          ? String(loadedActivity.length)
          : "—",
      },
    ],
    milestones,
    pendingActions: pendingActions.slice(0, 5),
    recentActivity,
  };
}

function statusBadgeVariant(status: Event["status"]): "default" | "outline" | "secondary" {
  if (status === "published") {
    return "default";
  }

  return status === "draft" ? "secondary" : "outline";
}

function formatActivityTitle(activity: ActivityEvent) {
  const metadataTitle = activity.metadata.title;

  if (typeof metadataTitle === "string" && metadataTitle.trim()) {
    return metadataTitle.trim();
  }

  const labels: Record<ActivityEvent["activityType"], string> = {
    event_created: "Event created",
    event_deleted: "Event deleted",
    event_published: "Event published",
    event_restored: "Event restored",
    guest_group_created: "Guest group created",
    guest_invite_opened: "Guest invite opened",
    notification_created: "Notification created",
    rsvp_submitted: "RSVP submitted",
    rsvp_updated: "RSVP updated",
    section_updated: "Section updated",
    theme_updated: "Theme updated",
  };

  return labels[activity.activityType];
}
