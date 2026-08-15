"use client";

import { ApiClientError } from "@lumiere/api-client";
import { Badge } from "@lumiere/dashboard-ui/components/badge";
import { Button } from "@lumiere/dashboard-ui/components/button";
import { Skeleton } from "@lumiere/dashboard-ui/components/skeleton";
import type { ActivityEvent, Event, JsonValue, RsvpStatus } from "@lumiere/types";
import { useCallback, useEffect, useState } from "react";

import { useDashboardAuth } from "../../../../auth/dashboard-auth-provider";
import { EventTabs } from "../../../placeholder-panels";

type ActivityWorkspaceData = {
  activity: ActivityEvent[];
  event: Event;
};

type ActivityWorkspaceState =
  | {
      data: ActivityWorkspaceData;
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

export function ActivityWorkspace({ eventId }: { eventId: string }) {
  const { apiClient } = useDashboardAuth();
  const [state, setState] = useState<ActivityWorkspaceState>({
    data: null,
    error: null,
    isRefreshing: false,
    status: "loading",
  });

  const loadWorkspace = useCallback(
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
        const [eventResponse, activityResponse] = await Promise.all([
          apiClient.getEvent(eventId),
          apiClient.listEventActivity(eventId),
        ]);

        setState({
          data: {
            activity: activityResponse.activity,
            event: eventResponse.event,
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
    void loadWorkspace();
  }, [loadWorkspace]);

  useEffect(() => {
    const refreshOnFocus = () => {
      if (document.visibilityState === "visible") {
        void loadWorkspace({ refreshing: true });
      }
    };

    window.addEventListener("focus", refreshOnFocus);
    document.addEventListener("visibilitychange", refreshOnFocus);

    return () => {
      window.removeEventListener("focus", refreshOnFocus);
      document.removeEventListener("visibilitychange", refreshOnFocus);
    };
  }, [loadWorkspace]);

  if (state.status === "loading") {
    return (
      <div className="grid gap-5">
        <EventTabs active="activity" eventId={eventId} />
        <WorkspaceLoading label="Loading activity" />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="grid gap-5">
        <EventTabs active="activity" eventId={eventId} />
        <section
          className="grid gap-3 rounded-[var(--radius-lg)] border border-[var(--error)] bg-[color-mix(in_srgb,var(--error)_10%,var(--surface))] p-5 text-[var(--error)]"
          role="alert"
        >
          <h2 className="text-lg font-semibold">Unable to load activity</h2>
          <p className="text-sm">{state.error}</p>
          <Button
            className="w-fit"
            onClick={() => void loadWorkspace()}
            size="lg"
            type="button"
            variant="outline"
          >
            Try again
          </Button>
        </section>
      </div>
    );
  }

  if (state.status !== "ready") {
    return null;
  }

  const readyState = state;

  return (
    <div className="grid gap-5">
      <EventTabs active="activity" eventId={eventId} />

      <section className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
              Activity
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Activity for {readyState.data.event.title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
              Review chronological guest and manager events with the metadata needed for quick
              diagnosis.
            </p>
          </div>
          <Button
            disabled={readyState.isRefreshing}
            onClick={() => void loadWorkspace({ refreshing: true })}
            size="lg"
            type="button"
            variant="outline"
          >
            {readyState.isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </section>

      <ActivityView activity={readyState.data.activity} />
    </div>
  );
}

function ActivityView({ activity }: { activity: ActivityEvent[] }) {
  return (
    <section className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Chronological activity</h2>
        <p className="mt-1 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_70%,transparent)]">
          Guest opens, RSVP submissions, updates, and manager changes appear newest first.
        </p>
      </div>

      {activity.length === 0 ? (
        <EmptyState
          title="No activity yet"
          body="Activity will appear after managers publish changes, guests open invites, or RSVP responses are submitted."
        />
      ) : (
        <ol className="grid gap-3">
          {activity.map((item) => (
            <li
              className="grid gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] p-4"
              key={item.id}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-semibold">{formatActivityTitle(item)}</p>
                  <p className="mt-1 text-sm text-[color-mix(in_srgb,var(--foreground)_68%,transparent)]">
                    {formatActor(item.actorType)} · {formatDateTime(item.createdAt)}
                  </p>
                </div>
                <ActivityTypeBadge activityType={item.activityType} />
              </div>
              <p className="text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
                {formatActivityDetail(item)}
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function WorkspaceLoading({ label }: { label: string }) {
  return (
    <section
      aria-label={label}
      className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5"
    >
      <Skeleton className="h-5 w-44" />
      <Skeleton className="h-8 w-80 max-w-full" />
      <div className="grid gap-3">
        {[0, 1, 2].map((item) => (
          <Skeleton className="h-20" key={item} />
        ))}
      </div>
    </section>
  );
}

function EmptyState({ body, title }: { body: string; title: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[color-mix(in_srgb,var(--surface-muted)_50%,var(--surface))] p-5">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
        {body}
      </p>
    </div>
  );
}

function ActivityTypeBadge({ activityType }: { activityType: ActivityEvent["activityType"] }) {
  return <Badge variant="outline">{activityType.replaceAll("_", " ")}</Badge>;
}

function readStringMetadata(metadata: Record<string, JsonValue>, key: string) {
  const value = metadata[key];
  return typeof value === "string" ? value : undefined;
}

function readNumberMetadata(metadata: Record<string, JsonValue> | undefined, key: string) {
  const value = metadata?.[key];
  return typeof value === "number" ? value : null;
}

function readRsvpStatusMetadata(
  metadata: Record<string, JsonValue>,
  key: string,
): RsvpStatus | undefined {
  const value = readStringMetadata(metadata, key);
  return value === "attending" || value === "not_attending" || value === "maybe"
    ? value
    : undefined;
}

function formatActivityTitle(activity: ActivityEvent) {
  const guestGroupLabel = readStringMetadata(activity.metadata, "guestGroupLabel");
  const collaboratorEmail = readStringMetadata(activity.metadata, "collaboratorEmail");

  if (activity.activityType === "collaborator_removed") {
    return collaboratorEmail ? `${collaboratorEmail} was removed` : "Collaborator was removed";
  }

  if (activity.activityType === "collaborator_role_changed") {
    const role = readStringMetadata(activity.metadata, "role");
    return collaboratorEmail && role
      ? `${collaboratorEmail} is now a ${role}`
      : "Collaborator role changed";
  }

  if (activity.activityType === "rsvp_submitted") {
    return guestGroupLabel ? `RSVP submitted by ${guestGroupLabel}` : "RSVP submitted";
  }

  if (activity.activityType === "rsvp_updated") {
    return guestGroupLabel ? `RSVP updated by ${guestGroupLabel}` : "RSVP updated";
  }

  if (activity.activityType === "guest_invite_opened") {
    return guestGroupLabel ? `${guestGroupLabel} opened their invite` : "Guest invite opened";
  }

  if (activity.activityType === "guest_data_exported") {
    return "Guest data exported";
  }

  return activity.activityType.replaceAll("_", " ");
}

function formatActivityDetail(activity: ActivityEvent) {
  const responseStatus = readRsvpStatusMetadata(activity.metadata, "responseStatus");
  const attendeeCount = readNumberMetadata(activity.metadata, "attendeeCount");
  const guestGroupLabel = readStringMetadata(activity.metadata, "guestGroupLabel");

  if (activity.activityType === "guest_data_exported") {
    const rowCount = readNumberMetadata(activity.metadata, "rowCount");
    const format = readStringMetadata(activity.metadata, "format")?.toUpperCase();

    return `${format ?? "Guest"} export prepared${rowCount === null ? "" : ` with ${rowCount} row${rowCount === 1 ? "" : "s"}`}.`;
  }

  if (responseStatus) {
    return `${guestGroupLabel ?? "Guest group"} responded ${formatRsvpStatus(responseStatus).toLowerCase()}${attendeeCount === null ? "" : ` for ${attendeeCount} pax`}.`;
  }

  return guestGroupLabel
    ? `Related guest group: ${guestGroupLabel}.`
    : "No additional metadata was captured for this event.";
}

function formatActor(actorType: ActivityEvent["actorType"]) {
  return actorType.charAt(0).toUpperCase() + actorType.slice(1);
}

function formatRsvpStatus(status: RsvpStatus) {
  if (status === "not_attending") {
    return "Not attending";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function toFriendlyApiMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.apiError.error.message;
  }

  return error instanceof Error ? error.message : "Unable to load dashboard activity.";
}
