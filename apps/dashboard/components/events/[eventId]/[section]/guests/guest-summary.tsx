import type { EventSummary } from "@lumiere/types";

import type { GuestListMode } from "./guest-filters";
import { buildGuestRows, type GuestGroupRow, type GuestRow } from "./guest-row-models";

type NotAttendingBreakdown = {
  declinedGroups: number;
  namedGuests: number;
  unfilledSeats: number;
};

export function GuestSummary({
  allGroupRows,
  filteredGroupRows,
  filteredGuestRows,
  isFiltered,
  mode,
  summary,
}: {
  allGroupRows: GuestGroupRow[];
  filteredGroupRows: GuestGroupRow[];
  filteredGuestRows: GuestRow[];
  isFiltered: boolean;
  mode: GuestListMode;
  summary: EventSummary | null;
}) {
  const visibleSummary = isFiltered
    ? mode === "groups"
      ? buildGroupSummary(filteredGroupRows)
      : buildGuestSummary(filteredGuestRows)
    : (summary ?? buildGroupSummary(allGroupRows));
  const inviteStats =
    mode === "groups"
      ? buildGroupInviteStats(isFiltered ? filteredGroupRows : allGroupRows)
      : buildGuestInviteStats(isFiltered ? filteredGuestRows : buildGuestRows(allGroupRows));
  const notAttending =
    mode === "groups"
      ? buildGroupNotAttendingBreakdown(isFiltered ? filteredGroupRows : allGroupRows)
      : buildGuestNotAttendingBreakdown(
          isFiltered ? filteredGuestRows : buildGuestRows(allGroupRows),
          allGroupRows,
        );
  const groupNoun = isFiltered ? "matching group" : "group";
  const notSentCount = inviteStats.total - inviteStats.sent;

  const metrics = [
    {
      detail: `across ${formatCount(visibleSummary.totalGroups, groupNoun)}`,
      label: "Total guests",
      value: visibleSummary.totalInvitedPax,
    },
    {
      detail: notSentCount > 0 ? `${notSentCount} not sent yet` : "All invites shared",
      label: "Invites sent",
      unit: `of ${formatCount(inviteStats.total, groupNoun)}`,
      value: inviteStats.sent,
    },
    {
      detail: formatCount(visibleSummary.pending.groups, groupNoun),
      label: "Awaiting RSVP",
      value: visibleSummary.pending.pax,
    },
    {
      detail: formatCount(visibleSummary.attending.groups, groupNoun),
      label: "Attending",
      value: visibleSummary.attending.pax,
    },
    {
      detail: formatCount(visibleSummary.maybe.groups, groupNoun),
      label: "Maybe",
      value: visibleSummary.maybe.pax,
    },
    {
      detail: formatNotAttendingBreakdown(notAttending),
      label: "Not attending",
      value: visibleSummary.notAttending.pax,
    },
  ];

  return (
    <section
      aria-label={isFiltered ? "Filtered guest summary" : "Guest summary"}
      className="rounded-[var(--radius-lg)] border border-border bg-card"
    >
      {isFiltered ? (
        <p className="px-4 pt-3 text-xs font-medium text-muted-foreground sm:px-5">
          Filtered results
        </p>
      ) : null}
      <dl className="grid divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-6">
        {metrics.map((metric) => (
          <div className="grid content-start gap-1 p-4 sm:p-5" key={metric.label}>
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {metric.label}
            </dt>
            <dd className="flex items-baseline gap-1.5">
              <span className="text-2xl font-semibold tabular-nums">{metric.value}</span>
              {metric.unit ? (
                <span className="text-sm text-muted-foreground">{metric.unit}</span>
              ) : null}
            </dd>
            <p className="text-xs leading-5 text-muted-foreground">{metric.detail}</p>
          </div>
        ))}
      </dl>
    </section>
  );
}

function buildGroupSummary(rows: GuestGroupRow[]): EventSummary {
  const summary = createEmptySummary();

  for (const row of rows) {
    if (row.group.status === "disabled") continue;

    const { maxPax } = row.group;
    summary.totalGroups += 1;
    summary.totalInvitedPax += maxPax;

    if (row.rsvp === "awaiting") {
      summary.pending.groups += 1;
      summary.pending.pax += maxPax;
      continue;
    }

    if (row.rsvp === "attending") {
      const attendeeCount = row.response?.attendeeCount ?? 0;
      summary.attending.groups += 1;
      summary.attending.pax += attendeeCount;
      summary.notAttending.pax += Math.max(maxPax - attendeeCount, 0);
      summary.totalRespondedPax += attendeeCount;
      continue;
    }

    if (row.rsvp === "maybe") {
      const attendeeCount = row.response?.attendeeCount ?? 0;
      summary.maybe.groups += 1;
      summary.maybe.pax += attendeeCount;
      summary.totalRespondedPax += attendeeCount;
      continue;
    }

    summary.notAttending.groups += 1;
    summary.notAttending.pax += maxPax;
  }

  return summary;
}

function buildGuestSummary(rows: GuestRow[]): EventSummary {
  const summary = createEmptySummary();
  const groupIds = new Set<string>();
  const groupsByRsvp = {
    attending: new Set<string>(),
    awaiting: new Set<string>(),
    maybe: new Set<string>(),
    not_attending: new Set<string>(),
  };

  for (const row of rows) {
    if (row.isDisabled) continue;

    const seats = row.unnamedSeats + 1;
    groupIds.add(row.groupId);
    summary.totalInvitedPax += seats;

    if (row.rsvp === "awaiting") {
      groupsByRsvp.awaiting.add(row.groupId);
      summary.pending.pax += seats;
      continue;
    }

    if (row.rsvp === "attending") {
      groupsByRsvp.attending.add(row.groupId);
      summary.attending.pax += seats;
      summary.totalRespondedPax += seats;
      continue;
    }

    if (row.rsvp === "maybe") {
      groupsByRsvp.maybe.add(row.groupId);
      summary.maybe.pax += seats;
      summary.totalRespondedPax += seats;
      continue;
    }

    groupsByRsvp.not_attending.add(row.groupId);
    summary.notAttending.pax += seats;
  }

  summary.totalGroups = groupIds.size;
  summary.pending.groups = groupsByRsvp.awaiting.size;
  summary.attending.groups = groupsByRsvp.attending.size;
  summary.maybe.groups = groupsByRsvp.maybe.size;
  summary.notAttending.groups = groupsByRsvp.not_attending.size;

  return summary;
}

function createEmptySummary(): EventSummary {
  return {
    attending: { groups: 0, pax: 0 },
    maybe: { groups: 0, pax: 0 },
    notAttending: { groups: 0, pax: 0 },
    pending: { groups: 0, pax: 0 },
    totalGroups: 0,
    totalInvitedPax: 0,
    totalRespondedPax: 0,
  };
}

function buildGroupInviteStats(rows: GuestGroupRow[]) {
  const activeRows = rows.filter((row) => row.group.status !== "disabled");

  return {
    sent: activeRows.filter((row) => row.delivery !== "not_sent").length,
    total: activeRows.length,
  };
}

function buildGuestInviteStats(rows: GuestRow[]) {
  const activeRows = rows.filter((row) => !row.isDisabled);
  const visibleGroupIds = new Set(activeRows.map((row) => row.groupId));
  const sentGroupIds = new Set(
    activeRows.filter((row) => row.delivery !== "not_sent").map((row) => row.groupId),
  );

  return {
    sent: sentGroupIds.size,
    total: visibleGroupIds.size,
  };
}

function buildGroupNotAttendingBreakdown(rows: GuestGroupRow[]): NotAttendingBreakdown {
  const breakdown: NotAttendingBreakdown = {
    declinedGroups: 0,
    namedGuests: 0,
    unfilledSeats: 0,
  };

  for (const row of rows) {
    if (row.group.status === "disabled") continue;

    if (row.rsvp === "not_attending") {
      breakdown.declinedGroups += 1;
      continue;
    }

    if (row.rsvp !== "attending" || !row.response) continue;

    const remainingSeats = Math.max(row.group.maxPax - row.response.attendeeCount, 0);
    const namedAttendeeCount = row.attendees.filter(
      (attendee) => attendee.kind === "named_member",
    ).length;
    const namedGuestsNotAttending = Math.min(
      remainingSeats,
      Math.max(row.memberNames.length - namedAttendeeCount, 0),
    );

    breakdown.namedGuests += namedGuestsNotAttending;
    breakdown.unfilledSeats += remainingSeats - namedGuestsNotAttending;
  }

  return breakdown;
}

function buildGuestNotAttendingBreakdown(
  rows: GuestRow[],
  allGroupRows: GuestGroupRow[],
): NotAttendingBreakdown {
  const groupRowsById = new Map(allGroupRows.map((row) => [row.group.id, row] as const));
  const declinedGroupIds = new Set<string>();
  let namedGuests = 0;
  let unfilledSeats = 0;

  for (const row of rows) {
    if (row.isDisabled || row.rsvp !== "not_attending") continue;

    const groupRow = groupRowsById.get(row.groupId);
    if (groupRow?.rsvp === "not_attending") {
      declinedGroupIds.add(row.groupId);
    } else if (row.source === "member") {
      namedGuests += row.unnamedSeats + 1;
    } else {
      unfilledSeats += row.unnamedSeats + 1;
    }
  }

  return {
    declinedGroups: declinedGroupIds.size,
    namedGuests,
    unfilledSeats,
  };
}

function formatNotAttendingBreakdown({
  declinedGroups,
  namedGuests,
  unfilledSeats,
}: NotAttendingBreakdown) {
  const details = [
    declinedGroups > 0 ? `${formatCount(declinedGroups, "group")} declined` : null,
    namedGuests > 0 ? `${formatCount(namedGuests, "named guest")} not attending` : null,
    unfilledSeats > 0 ? `${formatCount(unfilledSeats, "seat")} unfilled` : null,
  ].filter(Boolean);

  return details.length > 0 ? details.join(" · ") : "No declines yet";
}

function formatCount(value: number, noun: string) {
  return `${value} ${noun}${value === 1 ? "" : "s"}`;
}
