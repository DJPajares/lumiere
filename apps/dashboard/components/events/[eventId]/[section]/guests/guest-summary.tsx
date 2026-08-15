import type { EventSummary } from "@lumiere/types";

import type { GuestGroupRow } from "./guest-row-models";

/**
 * Whole-event numbers, never filter-aware: this strip answers "how is my event doing",
 * which must not move while the manager types in the search box. The filter-aware count
 * lives next to the list instead.
 *
 * Pax figures come straight from the API summary so this page can never disagree with
 * the Overview page — including the rule that unfilled seats in an attending group
 * count as not attending.
 */
export function GuestSummary({
  groupRows,
  summary,
}: {
  groupRows: GuestGroupRow[];
  summary: EventSummary | null;
}) {
  const activeRows = groupRows.filter((row) => row.group.status !== "disabled");
  const sentCount = activeRows.filter((row) => row.delivery !== "not_sent").length;
  const notSentCount = activeRows.length - sentCount;

  // The summary lumps declined seats and unfilled seats into one pax figure. Splitting
  // them needs the per-group max pax, which only the local rows carry.
  const declinedGroups = summary?.notAttending.groups ?? 0;
  const declinedSeats = activeRows
    .filter((row) => row.rsvp === "not_attending")
    .reduce((total, row) => total + row.group.maxPax, 0);
  const unfilledSeats = Math.max((summary?.notAttending.pax ?? 0) - declinedSeats, 0);

  const totalGroups = summary?.totalGroups ?? activeRows.length;
  const totalGuests =
    summary?.totalInvitedPax ?? activeRows.reduce((total, row) => total + row.group.maxPax, 0);

  const metrics = [
    {
      detail: `across ${formatCount(totalGroups, "group")}`,
      label: "Total guests",
      value: totalGuests,
    },
    {
      detail: notSentCount > 0 ? `${notSentCount} not sent yet` : "All invites shared",
      label: "Invites sent",
      // Invites are per-group, not per-guest — the unit line says so explicitly.
      unit: `of ${formatCount(activeRows.length, "group")}`,
      value: sentCount,
    },
    {
      detail: formatCount(summary?.pending.groups ?? 0, "group"),
      label: "Awaiting RSVP",
      value: summary?.pending.pax ?? 0,
    },
    {
      detail: describeAttending(summary),
      label: "Attending",
      value: summary?.attending.pax ?? 0,
    },
    {
      detail:
        declinedGroups > 0 || unfilledSeats > 0
          ? `${declinedGroups} declined · ${unfilledSeats} seats unfilled`
          : "No declines yet",
      label: "Not attending",
      value: summary?.notAttending.pax ?? 0,
    },
  ];

  return (
    <section
      aria-label="Guest summary"
      className="rounded-[var(--radius-lg)] border border-border bg-card"
    >
      <dl className="grid divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-5">
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

/**
 * Maybe responses get no tile of their own, but they must not disappear into "Awaiting" —
 * they ride along here so the numbers stay honest.
 */
function describeAttending(summary: EventSummary | null) {
  const attendingGroups = formatCount(summary?.attending.groups ?? 0, "group");

  return summary && summary.maybe.groups > 0
    ? `${attendingGroups} · ${summary.maybe.pax} maybe`
    : attendingGroups;
}

function formatCount(value: number, noun: string) {
  return `${value} ${noun}${value === 1 ? "" : "s"}`;
}
