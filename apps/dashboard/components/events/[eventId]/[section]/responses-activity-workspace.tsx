"use client";

import { ApiClientError } from "@lumiere/api-client";
import { Badge } from "@lumiere/dashboard-ui/components/badge";
import { Button } from "@lumiere/dashboard-ui/components/button";
import { LayoutGridIcon, ListIcon } from "@lumiere/dashboard-ui/components/icons";
import { Skeleton } from "@lumiere/dashboard-ui/components/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@lumiere/dashboard-ui/components/toggle-group";
import type {
  ActivityEvent,
  Event,
  EventSummary,
  GuestGroup,
  GuestGroupStatus,
  JsonValue,
  RsvpResponse,
  RsvpStatus,
} from "@lumiere/types";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useDashboardAuth } from "../../../../auth/dashboard-auth-provider";
import { EventTabs } from "../../../placeholder-panels";

type WorkspaceMode = "activity" | "responses";
type ResponseViewMode = "detailed" | "grouped";

type ResponsesActivityData = {
  activity: ActivityEvent[];
  event: Event;
  guestGroups: GuestGroup[];
  responses: RsvpResponse[];
  summary: EventSummary | null;
};

type ResponsesActivityState =
  | {
      data: ResponsesActivityData;
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

type ResponseFilter = "all" | "attending" | "disabled" | "maybe" | "not_attending" | "pending";

type ResponseRow = {
  attendeeCount: number | null;
  guestGroup: GuestGroup;
  message: string;
  responseStatus: Exclude<ResponseFilter, "all"> | "responded";
  selectedAttendees: ResponseAttendee[];
  submittedAt: string | null;
};

type ResponseAttendee = {
  kind: "legacy" | "named_member";
  name: string;
};

const responseFilters: Array<{ label: string; value: ResponseFilter }> = [
  { label: "All", value: "all" },
  { label: "Attending", value: "attending" },
  { label: "Not attending", value: "not_attending" },
  { label: "Maybe", value: "maybe" },
  { label: "Pending", value: "pending" },
  { label: "Disabled", value: "disabled" },
];

const responseGroups: Array<{
  emptyLabel: string;
  label: string;
  value: Exclude<ResponseFilter, "all">;
}> = [
  { emptyLabel: "No attending responses.", label: "Attending", value: "attending" },
  {
    emptyLabel: "No guests have declined.",
    label: "Not attending",
    value: "not_attending",
  },
  { emptyLabel: "No maybe responses.", label: "Maybe", value: "maybe" },
  { emptyLabel: "No guest groups are waiting for a response.", label: "Pending", value: "pending" },
  { emptyLabel: "No guest groups are disabled.", label: "Disabled", value: "disabled" },
];

export function ResponsesActivityWorkspace({
  eventId,
  mode,
}: {
  eventId: string;
  mode: WorkspaceMode;
}) {
  const { apiClient } = useDashboardAuth();
  const [state, setState] = useState<ResponsesActivityState>({
    data: null,
    error: null,
    isRefreshing: false,
    status: "loading",
  });
  const [filter, setFilter] = useState<ResponseFilter>("all");
  const [responseViewMode, setResponseViewMode] = useState<ResponseViewMode>(() =>
    readResponseViewMode(),
  );

  useEffect(() => {
    if (mode !== "responses") {
      return;
    }

    const syncViewFromUrl = () => setResponseViewMode(readResponseViewMode());
    window.addEventListener("popstate", syncViewFromUrl);
    return () => window.removeEventListener("popstate", syncViewFromUrl);
  }, [mode]);

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
        const [
          eventResponse,
          guestGroupsResponse,
          activityResponse,
          responsesResponse,
          summaryResponse,
        ] = await Promise.all([
          apiClient.getEvent(eventId),
          mode === "responses"
            ? apiClient.listGuestGroups(eventId)
            : Promise.resolve({ guestGroups: [] }),
          mode === "activity"
            ? apiClient.listEventActivity(eventId)
            : Promise.resolve({ activity: [] }),
          mode === "responses"
            ? apiClient.listEventResponses(eventId)
            : Promise.resolve({ responses: [] }),
          mode === "responses"
            ? apiClient.getEventSummary(eventId)
            : Promise.resolve({ summary: null }),
        ]);

        setState({
          data: {
            activity: activityResponse.activity,
            event: eventResponse.event,
            guestGroups: guestGroupsResponse.guestGroups,
            responses: responsesResponse.responses,
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
    [apiClient, eventId, mode],
  );

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  if (state.status === "loading") {
    return (
      <div className="grid gap-5">
        <EventTabs active={mode} eventId={eventId} />
        <WorkspaceLoading label={`Loading ${mode}`} />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="grid gap-5">
        <EventTabs active={mode} eventId={eventId} />
        <section
          className="grid gap-3 rounded-[var(--radius-lg)] border border-[var(--error)] bg-[color-mix(in_srgb,var(--error)_10%,var(--surface))] p-5 text-[var(--error)]"
          role="alert"
        >
          <h2 className="text-lg font-semibold">Unable to load {mode}</h2>
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
      <EventTabs active={mode} eventId={eventId} />

      <section className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
              {mode === "responses" ? "RSVP responses" : "Activity"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              {mode === "responses"
                ? `Track RSVPs for ${readyState.data.event.title}`
                : `Activity for ${readyState.data.event.title}`}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
              {mode === "responses"
                ? "Review each guest group's RSVP status, selected attendees, pax count, message, and submitted time."
                : "Review chronological guest and manager events with the metadata needed for quick diagnosis."}
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

      {mode === "responses" ? (
        <ResponsesView
          filter={filter}
          guestGroups={readyState.data.guestGroups}
          onFilterChange={setFilter}
          onViewModeChange={(viewMode) => {
            setResponseViewMode(viewMode);
            writeResponseViewMode(viewMode);
          }}
          responses={readyState.data.responses}
          summary={readyState.data.summary}
          viewMode={responseViewMode}
        />
      ) : (
        <ActivityView activity={readyState.data.activity} />
      )}
    </div>
  );
}

function ResponsesView({
  filter,
  guestGroups,
  onFilterChange,
  onViewModeChange,
  responses,
  summary,
  viewMode,
}: {
  filter: ResponseFilter;
  guestGroups: GuestGroup[];
  onFilterChange: (filter: ResponseFilter) => void;
  onViewModeChange: (viewMode: ResponseViewMode) => void;
  responses: RsvpResponse[];
  summary: EventSummary | null;
  viewMode: ResponseViewMode;
}) {
  const rows = useMemo(
    () => buildResponseRows({ guestGroups, responses }),
    [guestGroups, responses],
  );
  const filteredRows =
    filter === "all" ? rows : rows.filter((row) => row.responseStatus === filter);

  return (
    <section className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Responses</h2>
          <p className="mt-1 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_70%,transparent)]">
            Submitted rows use the saved RSVP record, so attendee names remain available beyond the
            recent activity window.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <ToggleGroup
          aria-label="Response filters"
          className="w-full flex-wrap xl:w-fit"
          onValueChange={(value) => {
            const nextFilter = value[0];
            if (isResponseFilter(nextFilter)) {
              onFilterChange(nextFilter);
            }
          }}
          size="lg"
          value={[filter]}
          variant="outline"
        >
          {responseFilters.map((item) => (
            <ToggleGroupItem
              className="flex-1 sm:flex-none"
              key={item.value}
              type="button"
              value={item.value}
            >
              {item.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <ToggleGroup
          aria-label="Response view"
          className="w-full sm:w-fit"
          onValueChange={(value) => {
            const nextViewMode = value[0];
            if (nextViewMode === "detailed" || nextViewMode === "grouped") {
              onViewModeChange(nextViewMode);
            }
          }}
          size="lg"
          spacing={0}
          value={[viewMode]}
          variant="outline"
        >
          <ToggleGroupItem className="flex-1 sm:flex-none" type="button" value="detailed">
            <ListIcon data-icon="inline-start" />
            Detailed
          </ToggleGroupItem>
          <ToggleGroupItem className="flex-1 sm:flex-none" type="button" value="grouped">
            <LayoutGridIcon data-icon="inline-start" />
            Grouped
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No responses yet"
          body="Create guest groups and share invite links. Submitted RSVPs and pending guest groups will appear here."
        />
      ) : filteredRows.length === 0 ? (
        <EmptyState
          title="No responses match this filter"
          body="Try another response state to review the rest of the guest list."
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground" role="status">
            Showing {filteredRows.length} of {rows.length} guest groups.
          </p>
          {viewMode === "detailed" ? (
            <ResponseTable rows={filteredRows} />
          ) : (
            <GroupedResponses filter={filter} rows={filteredRows} summary={summary} />
          )}
        </>
      )}
    </section>
  );
}

function ResponseTable({ rows }: { rows: ResponseRow[] }) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)]">
      <div className="hidden grid-cols-[1.1fr_0.75fr_1.35fr_1fr_1.35fr] gap-3 border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm font-semibold lg:grid">
        <span>Guest group</span>
        <span>Status</span>
        <span>Attending guests</span>
        <span>Submitted</span>
        <span>Message</span>
      </div>
      <div className="grid divide-y divide-[var(--border)]">
        {rows.map((row) => (
          <article
            className="grid gap-3 px-4 py-4 text-sm lg:grid-cols-[1.1fr_0.75fr_1.35fr_1fr_1.35fr] lg:items-start"
            key={row.guestGroup.id}
          >
            <div>
              <p className="font-semibold">{row.guestGroup.label}</p>
              <p className="mt-1 text-[color-mix(in_srgb,var(--foreground)_66%,transparent)]">
                Max {row.guestGroup.maxPax} pax
              </p>
            </div>
            <div>
              <MobileLabel>Status</MobileLabel>
              <StatusBadge status={row.responseStatus} />
            </div>
            <div>
              <MobileLabel>Attending guests</MobileLabel>
              <AttendeeDetails
                attendeeCount={row.attendeeCount}
                attendees={row.selectedAttendees}
              />
            </div>
            <div>
              <MobileLabel>Submitted</MobileLabel>
              <span>{row.submittedAt ? formatDateTime(row.submittedAt) : "Not submitted"}</span>
            </div>
            <div>
              <MobileLabel>Message</MobileLabel>
              <p className="leading-6">{row.message}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function GroupedResponses({
  filter,
  rows,
  summary,
}: {
  filter: ResponseFilter;
  rows: ResponseRow[];
  summary: EventSummary | null;
}) {
  const visibleGroups =
    filter === "all" ? responseGroups : responseGroups.filter((group) => group.value === filter);

  return (
    <div
      aria-label="Responses grouped by status"
      className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3"
    >
      {visibleGroups.map((group) => {
        const groupRows = rows.filter((row) => responseGroupForRow(row) === group.value);
        const groupCount = responseGroupCount(group.value, groupRows.length, summary);

        return (
          <section
            aria-labelledby={`response-group-${group.value}`}
            className="grid gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] p-4"
            key={group.value}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold" id={`response-group-${group.value}`}>
                {group.label}
              </h3>
              <Badge variant="outline">
                {groupCount} {groupCount === 1 ? "group" : "groups"}
              </Badge>
            </div>

            {groupRows.length === 0 ? (
              <p className="text-sm leading-6 text-muted-foreground">{group.emptyLabel}</p>
            ) : (
              <div className="grid gap-3">
                {groupRows.map((row) => (
                  <ResponseCard key={row.guestGroup.id} row={row} />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function ResponseCard({ row }: { row: ResponseRow }) {
  return (
    <article className="grid gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold">{row.guestGroup.label}</h4>
          <p className="mt-1 text-muted-foreground">Maximum {row.guestGroup.maxPax} pax</p>
        </div>
        <StatusBadge status={row.responseStatus} />
      </div>

      <AttendeeDetails attendeeCount={row.attendeeCount} attendees={row.selectedAttendees} />

      <div>
        <p className="font-medium">Message</p>
        <p className="mt-1 leading-6 text-muted-foreground">{row.message}</p>
      </div>

      <p className="text-muted-foreground">
        {row.submittedAt ? `Submitted ${formatDateTime(row.submittedAt)}` : "Not submitted"}
      </p>
    </article>
  );
}

function AttendeeDetails({
  attendeeCount,
  attendees,
}: {
  attendeeCount: number | null;
  attendees: ResponseAttendee[];
}) {
  const legacyCount = attendees.filter((attendee) => attendee.kind === "legacy").length;
  const namedMemberCount = attendees.length - legacyCount;
  const attendeeSources = [
    namedMemberCount > 0
      ? `${namedMemberCount} named ${namedMemberCount === 1 ? "member" : "members"}`
      : null,
    legacyCount > 0 ? `${legacyCount} legacy RSVP ${legacyCount === 1 ? "name" : "names"}` : null,
  ].filter((value): value is string => Boolean(value));

  return (
    <div>
      <p>{attendeeCount === null ? "No attendee count" : `${attendeeCount} pax`}</p>
      {attendees.length > 0 ? (
        <>
          <p className="mt-1 leading-5 text-muted-foreground">
            {attendees.map((attendee) => attendee.name).join(", ")}
          </p>
          {attendeeSources.length > 0 ? (
            <p className="mt-1 text-xs text-muted-foreground">{attendeeSources.join(" · ")}</p>
          ) : null}
        </>
      ) : attendeeCount && attendeeCount > 0 ? (
        <p className="mt-1 text-muted-foreground">Names not collected</p>
      ) : null}
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

function buildResponseRows({
  guestGroups,
  responses,
}: {
  guestGroups: GuestGroup[];
  responses: RsvpResponse[];
}) {
  const responsesByGuestGroup = new Map(
    responses.map((response) => [response.guestGroupId, response] as const),
  );

  return guestGroups.map((group): ResponseRow => {
    const response = responsesByGuestGroup.get(group.id);

    if (group.status === "disabled") {
      return {
        attendeeCount: response?.attendeeCount ?? null,
        guestGroup: group,
        message: response?.message ?? "Invite access disabled.",
        responseStatus: "disabled",
        selectedAttendees: resolveResponseAttendees(group, response?.guestNames ?? []),
        submittedAt: response?.submittedAt ?? null,
      };
    }

    if (response) {
      return {
        attendeeCount: response.attendeeCount,
        guestGroup: group,
        message: response.message ?? "No message included.",
        responseStatus: response.responseStatus,
        selectedAttendees: resolveResponseAttendees(group, response.guestNames),
        submittedAt: response.submittedAt,
      };
    }

    if (group.status === "responded" || group.status === "declined") {
      return {
        attendeeCount: null,
        guestGroup: group,
        message: "Saved response details are unavailable.",
        responseStatus: "responded",
        selectedAttendees: [],
        submittedAt: null,
      };
    }

    return {
      attendeeCount: null,
      guestGroup: group,
      message: group.status === "opened" ? "Invite opened; waiting for RSVP." : "Waiting for RSVP.",
      responseStatus: "pending",
      selectedAttendees: [],
      submittedAt: null,
    };
  });
}

function resolveResponseAttendees(group: GuestGroup, names: string[]): ResponseAttendee[] {
  const namedMembers = new Set(
    (group.members ?? []).map((member) => normalizeAttendeeName(member.name)),
  );

  return names.map((name) => ({
    kind: namedMembers.has(normalizeAttendeeName(name)) ? "named_member" : "legacy",
    name,
  }));
}

function normalizeAttendeeName(name: string) {
  return name.trim().toLocaleLowerCase();
}

function responseGroupForRow(row: ResponseRow): Exclude<ResponseFilter, "all"> {
  return row.responseStatus === "responded" ? "pending" : row.responseStatus;
}

function responseGroupCount(
  group: Exclude<ResponseFilter, "all">,
  fallbackCount: number,
  summary: EventSummary | null,
) {
  if (!summary || group === "disabled") {
    return fallbackCount;
  }

  if (group === "not_attending") {
    return summary.notAttending.groups;
  }

  return summary[group].groups;
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

function StatusBadge({ status }: { status: ResponseRow["responseStatus"] }) {
  return (
    <Badge
      variant={
        status === "disabled"
          ? "destructive"
          : status === "attending"
            ? "default"
            : status === "maybe"
              ? "secondary"
              : "outline"
      }
    >
      {formatResponseStatus(status)}
    </Badge>
  );
}

function ActivityTypeBadge({ activityType }: { activityType: ActivityEvent["activityType"] }) {
  return <Badge variant="outline">{activityType.replaceAll("_", " ")}</Badge>;
}

function MobileLabel({ children }: { children: string }) {
  return (
    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent-strong)] lg:hidden">
      {children}
    </p>
  );
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
    return `${guestGroupLabel ?? "Guest group"} responded ${formatResponseStatus(responseStatus).toLowerCase()}${attendeeCount === null ? "" : ` for ${attendeeCount} pax`}.`;
  }

  return guestGroupLabel
    ? `Related guest group: ${guestGroupLabel}.`
    : "No additional metadata was captured for this event.";
}

function formatActor(actorType: ActivityEvent["actorType"]) {
  return actorType.charAt(0).toUpperCase() + actorType.slice(1);
}

function formatResponseStatus(status: ResponseRow["responseStatus"]) {
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

function isResponseFilter(value: string | undefined): value is ResponseFilter {
  return responseFilters.some((filter) => filter.value === value);
}

function readResponseViewMode(): ResponseViewMode {
  if (typeof window === "undefined") {
    return "detailed";
  }

  return new URLSearchParams(window.location.search).get("view") === "grouped"
    ? "grouped"
    : "detailed";
}

function writeResponseViewMode(viewMode: ResponseViewMode) {
  if (typeof window === "undefined") {
    return;
  }

  const params = new URLSearchParams(window.location.search);

  if (viewMode === "detailed") {
    params.delete("view");
  } else {
    params.set("view", viewMode);
  }

  const queryString = params.toString();
  const nextUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ""}${window.location.hash}`;
  window.history.replaceState(window.history.state, "", nextUrl);
}

function toFriendlyApiMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.apiError.error.message;
  }

  return error instanceof Error ? error.message : "Unable to load dashboard responses.";
}
