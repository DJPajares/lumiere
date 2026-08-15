import type { GuestGroupStatus, GuestInviteTrackingStage } from "@lumiere/types";

import type {
  GuestGroupRow,
  GuestInviteDeliveryStage,
  GuestRow,
  GuestRsvpState,
} from "./guest-row-models";

export type GuestSortKey = "group" | "invitedBy" | "name" | "recent";
export type GuestSortDirection = "asc" | "desc";
export type GuestListMode = "groups" | "guests";

export type GuestListFilters = {
  direction: GuestSortDirection;
  invite: GuestInviteDeliveryStage | "all";
  invitedBy: string;
  query: string;
  rsvp: GuestRsvpState | "all";
  sort: GuestSortKey;
};

/** Filter value for groups with no "Invited by" recorded. */
export const unassignedInvitedBy = "none";

/** Still the source of truth for the Invite status select inside the edit form. */
export const guestStatuses: GuestGroupStatus[] = [
  "pending",
  "opened",
  "responded",
  "declined",
  "disabled",
];

export const defaultGuestListFilters: GuestListFilters = {
  direction: "desc",
  invite: "all",
  invitedBy: "all",
  query: "",
  rsvp: "all",
  sort: "recent",
};

export const guestInviteFilterOptions: Array<{
  label: string;
  value: GuestInviteDeliveryStage | "all";
}> = [
  { label: "Any invite status", value: "all" },
  { label: "Not sent", value: "not_sent" },
  { label: "Sent", value: "sent" },
  { label: "Opened", value: "opened" },
];

export const guestRsvpFilterOptions: Array<{ label: string; value: GuestRsvpState | "all" }> = [
  { label: "Any RSVP", value: "all" },
  { label: "Awaiting", value: "awaiting" },
  { label: "Attending", value: "attending" },
  { label: "Not attending", value: "not_attending" },
  { label: "Maybe", value: "maybe" },
];

/** Sort options for the Groups view — there's only one "name" here, the group's own. */
export const guestSortOptions: Array<{ label: string; value: GuestSortKey }> = [
  { label: "Recently updated", value: "recent" },
  { label: "Name", value: "name" },
  { label: "Invited by", value: "invitedBy" },
];

/**
 * Sort options for the All guests view. "Name" here is the individual guest, so
 * "Group name" is offered as a distinct option — sorting a flat guest list by their
 * household is the more common ask in that view.
 */
export const allGuestsSortOptions: Array<{ label: string; value: GuestSortKey }> = [
  { label: "Recently updated", value: "recent" },
  { label: "Guest name", value: "name" },
  { label: "Group name", value: "group" },
  { label: "Invited by", value: "invitedBy" },
];

export function getGuestSortOptions(mode: GuestListMode) {
  return mode === "guests" ? allGuestsSortOptions : guestSortOptions;
}

export const guestSortDirectionOptions = [
  { label: "Descending", value: "desc" },
  { label: "Ascending", value: "asc" },
] as const;

export function readGuestListFilters(): GuestListFilters {
  if (typeof window === "undefined") {
    return defaultGuestListFilters;
  }

  const params = new URLSearchParams(window.location.search);
  const inviteParam = params.get("invite");
  const rsvpParam = params.get("rsvp");
  const sortParam = params.get("sort");
  const invitedByParam = params.get("by")?.trim();

  return {
    direction: params.get("direction") === "asc" ? "asc" : defaultGuestListFilters.direction,
    invite: isInviteDeliveryStage(inviteParam) ? inviteParam : defaultGuestListFilters.invite,
    invitedBy: invitedByParam || defaultGuestListFilters.invitedBy,
    query: params.get("q") ?? "",
    rsvp: isGuestRsvpState(rsvpParam) ? rsvpParam : defaultGuestListFilters.rsvp,
    sort: isGuestSortKey(sortParam) ? sortParam : defaultGuestListFilters.sort,
  };
}

export function writeGuestListFilters(filters: GuestListFilters) {
  if (typeof window === "undefined") {
    return;
  }

  const params = new URLSearchParams(window.location.search);

  for (const key of ["q", "by", "invite", "rsvp", "sort", "direction"]) {
    params.delete(key);
  }

  const query = filters.query.trim();

  if (query) {
    params.set("q", query);
  }
  if (filters.invitedBy !== defaultGuestListFilters.invitedBy) {
    params.set("by", filters.invitedBy);
  }
  if (filters.invite !== defaultGuestListFilters.invite) {
    params.set("invite", filters.invite);
  }
  if (filters.rsvp !== defaultGuestListFilters.rsvp) {
    params.set("rsvp", filters.rsvp);
  }
  if (filters.sort !== defaultGuestListFilters.sort) {
    params.set("sort", filters.sort);
  }
  if (filters.direction !== defaultGuestListFilters.direction) {
    params.set("direction", filters.direction);
  }

  replaceUrlQuery(params);
}

export function readGuestListMode(): GuestListMode {
  if (typeof window === "undefined") {
    return "groups";
  }

  return new URLSearchParams(window.location.search).get("view") === "guests" ? "guests" : "groups";
}

export function writeGuestListMode(mode: GuestListMode) {
  if (typeof window === "undefined") {
    return;
  }

  const params = new URLSearchParams(window.location.search);

  if (mode === "groups") {
    params.delete("view");
  } else {
    params.set("view", "guests");
  }

  replaceUrlQuery(params);
}

export function areGuestListFiltersDefault(filters: GuestListFilters) {
  return (
    filters.query.trim() === defaultGuestListFilters.query &&
    filters.invite === defaultGuestListFilters.invite &&
    filters.invitedBy === defaultGuestListFilters.invitedBy &&
    filters.rsvp === defaultGuestListFilters.rsvp &&
    filters.sort === defaultGuestListFilters.sort &&
    filters.direction === defaultGuestListFilters.direction
  );
}

/** Counts only the advanced filters, so the toolbar badge matches what the popover holds. */
export function countActiveAdvancedFilters(filters: GuestListFilters) {
  return [
    filters.invite !== defaultGuestListFilters.invite,
    filters.invitedBy !== defaultGuestListFilters.invitedBy,
    filters.rsvp !== defaultGuestListFilters.rsvp,
  ].filter(Boolean).length;
}

/**
 * The export endpoint filters server-side and has no RSVP dimension, so a filtered
 * export can only honour search, invite stage, and invited by.
 */
export function hasExportableFilters(filters: GuestListFilters) {
  return (
    Boolean(filters.query.trim()) ||
    filters.invite !== defaultGuestListFilters.invite ||
    filters.invitedBy !== defaultGuestListFilters.invitedBy
  );
}

/** The delivery stages map onto a clean subset of the server's tracking stages. */
export function toExportTrackingStage(
  invite: GuestListFilters["invite"],
): GuestInviteTrackingStage | undefined {
  return invite === "all" ? undefined : invite;
}

export function filterAndSortGuestGroupRows(rows: GuestGroupRow[], filters: GuestListFilters) {
  const query = filters.query.trim().toLocaleLowerCase();

  const filtered = rows.filter((row) => {
    if (!matchesInvite(row.delivery, filters.invite)) return false;
    if (!matchesRsvp(row.rsvp, filters.rsvp)) return false;
    if (!matchesInvitedBy(row.invitedBy, filters.invitedBy)) return false;
    if (!query) return true;

    return [
      row.group.label,
      row.group.contactName,
      row.group.contactEmail,
      row.invitedBy,
      row.group.inviteCode,
      ...row.memberNames,
    ]
      .filter(Boolean)
      .join("\n")
      .toLocaleLowerCase()
      .includes(query);
  });

  return [...filtered].sort((left, right) => {
    const primary = compareGroupRows(left, right, filters.sort);
    const ordered = filters.direction === "asc" ? primary : -primary;

    return ordered || compareText(left.group.label, right.group.label);
  });
}

export function filterAndSortGuestRows(rows: GuestRow[], filters: GuestListFilters) {
  const query = filters.query.trim().toLocaleLowerCase();

  const filtered = rows.filter((row) => {
    if (!matchesInvite(row.delivery, filters.invite)) return false;
    if (!matchesRsvp(row.rsvp, filters.rsvp)) return false;
    if (!matchesInvitedBy(row.invitedBy, filters.invitedBy)) return false;
    if (!query) return true;

    return [row.name, row.groupLabel, row.invitedBy]
      .filter(Boolean)
      .join("\n")
      .toLocaleLowerCase()
      .includes(query);
  });

  return [...filtered].sort((left, right) => {
    const primary = compareGuestRows(left, right, filters.sort);
    const ordered = filters.direction === "asc" ? primary : -primary;

    return ordered || compareText(left.name, right.name) || compareText(left.id, right.id);
  });
}

function compareGroupRows(left: GuestGroupRow, right: GuestGroupRow, sort: GuestSortKey) {
  switch (sort) {
    case "name":
    case "group":
      return compareText(left.group.label, right.group.label);
    case "invitedBy":
      return compareNullableText(left.invitedBy, right.invitedBy);
    case "recent":
    default:
      return Date.parse(left.group.updatedAt) - Date.parse(right.group.updatedAt);
  }
}

function compareGuestRows(left: GuestRow, right: GuestRow, sort: GuestSortKey) {
  switch (sort) {
    case "group":
      return compareText(left.groupLabel, right.groupLabel);
    case "invitedBy":
      return compareNullableText(left.invitedBy, right.invitedBy);
    case "recent":
      return Date.parse(left.updatedAt) - Date.parse(right.updatedAt);
    case "name":
    default:
      return compareText(left.name, right.name);
  }
}

function matchesInvite(delivery: GuestInviteDeliveryStage, filter: GuestListFilters["invite"]) {
  return filter === "all" || delivery === filter;
}

function matchesRsvp(rsvp: GuestRsvpState, filter: GuestListFilters["rsvp"]) {
  return filter === "all" || rsvp === filter;
}

function matchesInvitedBy(invitedBy: string | null, filter: string) {
  if (filter === "all") return true;
  if (filter === unassignedInvitedBy) return !invitedBy;

  return invitedBy === filter;
}

export function compareText(left: string, right: string) {
  return left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" });
}

/** Null values always sort last, regardless of direction. */
function compareNullableText(left: string | null, right: string | null) {
  if (!left && !right) return 0;
  if (!left) return 1;
  if (!right) return -1;

  return compareText(left, right);
}

function isInviteDeliveryStage(value: string | null): value is GuestInviteDeliveryStage {
  return value === "not_sent" || value === "opened" || value === "sent";
}

function isGuestRsvpState(value: string | null): value is GuestRsvpState {
  return (
    value === "attending" || value === "awaiting" || value === "maybe" || value === "not_attending"
  );
}

function isGuestSortKey(value: string | null): value is GuestSortKey {
  return value === "group" || value === "invitedBy" || value === "name" || value === "recent";
}

function replaceUrlQuery(params: URLSearchParams) {
  const queryString = params.toString();
  const nextUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ""}${window.location.hash}`;
  window.history.replaceState(window.history.state, "", nextUrl);
}
