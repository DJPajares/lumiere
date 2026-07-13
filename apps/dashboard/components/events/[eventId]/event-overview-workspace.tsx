"use client";

import { ApiClientError } from "@lumiere/api-client";
import { Button } from "@lumiere/dashboard-ui/components/button";
import type { ActivityEvent, Event, EventSummary } from "@lumiere/types";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useDashboardAuth } from "../../../auth/dashboard-auth-provider";
import { EventTabs } from "../../placeholder-panels";
import { EventBasicsModal } from "../event-basics-modal";

type OverviewData = {
  activity: ActivityEvent[];
  event: Event;
  summary: EventSummary;
};

type OverviewState =
  | {
      data: OverviewData;
      error: null;
      isRefreshing: boolean;
      status: "ready";
    }
  | {
      data: null;
      error: string | null;
      isRefreshing: false;
      status: "error" | "loading";
    };

export function EventOverviewWorkspace({ eventId }: { eventId: string }) {
  const { apiClient } = useDashboardAuth();
  const [state, setState] = useState<OverviewState>({
    data: null,
    error: null,
    isRefreshing: false,
    status: "loading",
  });
  const [editOpen, setEditOpen] = useState(false);

  const loadOverview = useCallback(
    async ({ refreshing = false }: { refreshing?: boolean } = {}) => {
      if (!apiClient) {
        setState({
          data: null,
          error: "Dashboard API is not configured.",
          isRefreshing: false,
          status: "error",
        });
        return;
      }

      setState((current) =>
        current.status === "ready" && refreshing
          ? {
              ...current,
              isRefreshing: true,
            }
          : {
              data: null,
              error: null,
              isRefreshing: false,
              status: "loading",
            },
      );

      try {
        const [eventResponse, summaryResponse, activityResponse] = await Promise.all([
          apiClient.getEvent(eventId),
          apiClient.getEventSummary(eventId),
          apiClient.listEventActivity(eventId),
        ]);

        setState({
          data: {
            activity: activityResponse.activity,
            event: eventResponse.event,
            summary: summaryResponse.summary,
          },
          error: null,
          isRefreshing: false,
          status: "ready",
        });
      } catch (error) {
        setState({
          data: null,
          error: toFriendlyApiMessage(error),
          isRefreshing: false,
          status: "error",
        });
      }
    },
    [apiClient, eventId],
  );

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  useEffect(() => {
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") {
        void loadOverview({ refreshing: true });
      }
    };

    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [loadOverview]);

  if (state.status === "loading") {
    return (
      <div className="grid gap-5">
        <EventTabs eventId={eventId} />
        <OverviewLoading />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="grid gap-5">
        <EventTabs eventId={eventId} />
        <section
          className="grid gap-3 rounded-[var(--radius-lg)] border border-[var(--error)] bg-[color-mix(in_srgb,var(--error)_10%,var(--surface))] p-5 text-[var(--error)]"
          role="alert"
        >
          <h2 className="text-lg font-semibold">Unable to load event overview</h2>
          <p className="text-sm">{state.error}</p>
          <button
            className="inline-flex min-h-10 w-fit items-center justify-center rounded-[var(--radius-md)] border border-[var(--error)] px-4 text-sm font-semibold transition hover:bg-[color-mix(in_srgb,var(--error)_12%,transparent)] focus:outline-none focus:ring-2 focus:ring-[var(--error)]"
            onClick={() => void loadOverview()}
            type="button"
          >
            Try again
          </button>
        </section>
      </div>
    );
  }

  const overviewData = state.data;

  if (!overviewData) {
    return null;
  }

  return (
    <>
      <EventOverviewContent
        activity={overviewData.activity}
        event={overviewData.event}
        isRefreshing={state.isRefreshing}
        onEdit={() => setEditOpen(true)}
        onRefresh={() => void loadOverview({ refreshing: true })}
        summary={overviewData.summary}
      />
      <EventBasicsModal
        event={overviewData.event}
        onOpenChange={setEditOpen}
        onSaved={(savedEvent) =>
          setState((current) =>
            current.status === "ready"
              ? {
                  ...current,
                  data: { ...current.data, event: savedEvent },
                }
              : current,
          )
        }
        open={editOpen}
      />
    </>
  );
}

function EventOverviewContent({
  activity,
  event,
  isRefreshing,
  onEdit,
  onRefresh,
  summary,
}: OverviewData & {
  isRefreshing: boolean;
  onEdit: () => void;
  onRefresh: () => void;
}) {
  const summaryCards = useMemo(() => getSummaryCards(summary, activity), [activity, summary]);

  return (
    <div className="grid gap-5">
      <EventTabs eventId={event.id} />

      <section className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
              {formatStatus(event.status)}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">{event.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
              {formatEventType(event.eventType)} · {formatDateTime(event.startsAt, event.timezone)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={onEdit} size="lg" type="button">
              Edit event
            </Button>
            <Button
              disabled={isRefreshing}
              onClick={onRefresh}
              size="lg"
              type="button"
              variant="outline"
            >
              {isRefreshing ? "Refreshing..." : "Refresh data"}
            </Button>
          </div>
        </div>

        <dl className="grid gap-3 text-sm sm:grid-cols-3">
          <MetadataItem label="Public slug" value={`/e/${event.slug}`} />
          <MetadataItem label="Venue" value={event.venueName || "Venue not set"} />
          <MetadataItem label="Timezone" value={event.timezone} />
        </dl>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="RSVP summary">
        {summaryCards.map((card) => (
          <article
            className="grid gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5"
            key={card.label}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-[color-mix(in_srgb,var(--foreground)_68%,transparent)]">
                {card.label}
              </p>
              <span className={card.badgeClassName}>{card.badge}</span>
            </div>
            <p className="text-3xl font-semibold">{card.value}</p>
            <p className="rounded-[var(--radius-sm)] bg-[var(--surface-muted)] px-3 py-2 text-sm">
              {card.detail}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Recent activity</h2>
          <p className="mt-1 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_70%,transparent)]">
            RSVP and manager actions appear here in chronological order.
          </p>
        </div>
        <ActivityList activity={activity} />
      </section>
    </div>
  );
}

function ActivityList({ activity }: { activity: ActivityEvent[] }) {
  if (activity.length === 0) {
    return (
      <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[color-mix(in_srgb,var(--surface-muted)_48%,var(--surface))] p-5">
        <h3 className="text-lg font-semibold">No activity yet</h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
          Activity will appear after managers publish changes, guests open invites, or RSVP
          responses are submitted.
        </p>
      </div>
    );
  }

  return (
    <ol className="grid gap-3">
      {activity.map((item) => (
        <li
          className="grid gap-2 rounded-[var(--radius-md)] border border-[var(--border)] p-4"
          key={item.id}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-semibold">{formatActivityTitle(item)}</p>
              <p className="mt-1 text-sm text-[color-mix(in_srgb,var(--foreground)_68%,transparent)]">
                {formatActor(item.actorType)} · {formatDateTime(item.createdAt)}
              </p>
            </div>
            <span className="inline-flex w-fit rounded-[var(--radius-sm)] bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[color-mix(in_srgb,var(--foreground)_68%,transparent)]">
              {formatActivityType(item.activityType)}
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
}

function OverviewLoading() {
  return (
    <div className="grid gap-5" aria-label="Loading event overview" aria-live="polite">
      <div className="h-36 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-muted)]" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <div
            className="h-32 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-muted)]"
            key={item}
          />
        ))}
      </div>
      <div className="h-44 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-muted)]" />
    </div>
  );
}

function MetadataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--surface-muted)] p-3">
      <dt className="text-[color-mix(in_srgb,var(--foreground)_62%,transparent)]">{label}</dt>
      <dd className="mt-1 break-words font-semibold">{value}</dd>
    </div>
  );
}

function getSummaryCards(summary: EventSummary, activity: ActivityEvent[]) {
  const latestActivity = activity[0];

  return [
    {
      badge: "Yes",
      badgeClassName: statusBadgeClassName("success"),
      detail: `${summary.attending.groups} groups confirmed`,
      label: "Attending",
      value: `${summary.attending.pax} pax`,
    },
    {
      badge: "No",
      badgeClassName: statusBadgeClassName("error"),
      detail: `${summary.notAttending.groups} groups declined`,
      label: "Not attending",
      value: `${summary.notAttending.pax} pax`,
    },
    {
      badge: "Maybe",
      badgeClassName: statusBadgeClassName("warning"),
      detail: `${summary.maybe.groups} groups tentative`,
      label: "Maybe",
      value: `${summary.maybe.pax} pax`,
    },
    {
      badge: "Pending",
      badgeClassName: statusBadgeClassName("neutral"),
      detail: `${summary.pending.groups} groups need a response`,
      label: "Pending",
      value: `${summary.pending.pax} pax`,
    },
    {
      badge: "Invited",
      badgeClassName: statusBadgeClassName("neutral"),
      detail: `${summary.totalInvitedPax} max pax across active guest groups`,
      label: "Total invited",
      value: `${summary.totalGroups} groups`,
    },
    {
      badge: "Max pax",
      badgeClassName: statusBadgeClassName("neutral"),
      detail: `${summary.totalRespondedPax} pax have submitted an RSVP count`,
      label: "Maximum attendance",
      value: `${summary.totalInvitedPax} pax`,
    },
    {
      badge: "Activity",
      badgeClassName: statusBadgeClassName("neutral"),
      detail: latestActivity
        ? `Latest: ${formatDateTime(latestActivity.createdAt)}`
        : "No manager or guest actions yet",
      label: "Recent activity",
      value: `${activity.length} updates`,
    },
  ];
}

function statusBadgeClassName(tone: "error" | "neutral" | "success" | "warning") {
  const base =
    "inline-flex rounded-[var(--radius-sm)] px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em]";

  if (tone === "success") {
    return `${base} bg-[color-mix(in_srgb,var(--success)_14%,var(--surface))] text-[var(--success)]`;
  }

  if (tone === "error") {
    return `${base} bg-[color-mix(in_srgb,var(--error)_12%,var(--surface))] text-[var(--error)]`;
  }

  if (tone === "warning") {
    return `${base} bg-[color-mix(in_srgb,var(--warning)_14%,var(--surface))] text-[var(--warning)]`;
  }

  return `${base} bg-[var(--surface-muted)] text-[color-mix(in_srgb,var(--foreground)_68%,transparent)]`;
}

function formatActivityTitle(activity: ActivityEvent) {
  const metadataTitle = readMetadataString(activity.metadata, "title");

  if (metadataTitle) {
    return metadataTitle;
  }

  switch (activity.activityType) {
    case "event_created":
      return "Event created";
    case "event_deleted":
      return "Event deleted";
    case "event_published":
      return "Event published";
    case "event_restored":
      return "Event restored";
    case "guest_group_created":
      return "Guest group created";
    case "guest_invite_opened":
      return "Guest invite opened";
    case "notification_created":
      return "Notification created";
    case "rsvp_submitted":
      return "RSVP submitted";
    case "rsvp_updated":
      return "RSVP updated";
    case "section_updated":
      return "Section updated";
    case "theme_updated":
      return "Theme updated";
  }
}

function readMetadataString(metadata: ActivityEvent["metadata"], key: string) {
  const value = metadata[key];

  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function formatActivityType(value: ActivityEvent["activityType"]) {
  return value.replaceAll("_", " ");
}

function formatActor(value: ActivityEvent["actorType"]) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatStatus(value: Event["status"]) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatEventType(value: Event["eventType"]) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDateTime(value: string, timeZone?: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(date);
}

function toFriendlyApiMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.apiError.error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to complete the dashboard request.";
}
