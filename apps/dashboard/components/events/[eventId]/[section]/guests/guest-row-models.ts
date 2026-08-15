import {
  isInviteAccessExpired,
  resolveEffectiveInviteAccessExpiry,
  type Event,
  type GuestGroup,
  type RsvpResponse,
} from "@lumiere/types";

/**
 * Invite delivery, deliberately independent of RSVP state.
 *
 * `resolveGuestInviteTrackingStage` in @lumiere/types folds a submitted RSVP into a
 * fourth "responded" stage, which is what made invite state and RSVP state appear
 * twice in every row. That helper is still the contract for the CSV export and the
 * server-side export filter, so it stays as-is; the dashboard uses this three-value
 * view instead.
 */
export type GuestInviteDeliveryStage = "not_sent" | "opened" | "sent";

export type GuestRsvpState = "attending" | "awaiting" | "maybe" | "not_attending";

export type GuestResponseAttendee = {
  kind: "legacy" | "named_member";
  name: string;
};

export type GuestDeadline = {
  expired: boolean;
  isoDate: string;
  /** Whether the effective deadline comes from this guest or is inherited from the event. */
  source: "event" | "guest";
};

export type GuestGroupRow = {
  attendees: GuestResponseAttendee[];
  deadline: GuestDeadline | null;
  delivery: GuestInviteDeliveryStage;
  group: GuestGroup;
  /** A stored RSVP exists but was detached when the invite link was regenerated. */
  hasClearedResponse: boolean;
  invitedBy: string | null;
  memberNames: string[];
  response: RsvpResponse | null;
  rsvp: GuestRsvpState;
  rsvpMessage: string | null;
  /** Saved RSVP details could not be loaded even though the group is marked responded. */
  responseUnavailable: boolean;
  shareBlocked: boolean;
};

export type GuestRowSource = "legacy_rsvp_name" | "member" | "unnamed";

export type GuestRow = {
  delivery: GuestInviteDeliveryStage;
  groupId: string;
  groupLabel: string;
  id: string;
  invitedBy: string | null;
  name: string;
  rsvp: GuestRsvpState;
  source: GuestRowSource;
  /** Additional seats this row stands in for, when a group has no named members. */
  unnamedSeats: number;
  /** The owning group's updatedAt, for "Recently updated" sorting. */
  updatedAt: string;
};

export function resolveInviteDeliveryStage(group: GuestGroup): GuestInviteDeliveryStage {
  // A guest cannot RSVP without opening the link, so treat a response as an open even
  // when the open timestamp is missing (older rows, or a manually set status).
  if (group.firstOpenedAt || group.lastOpenedAt) {
    return "opened";
  }

  if (group.status === "responded" || group.status === "declined") {
    return "opened";
  }

  if (group.firstSentAt || group.lastSentAt || (group.sendCount ?? 0) > 0) {
    return "sent";
  }

  return "not_sent";
}

export function resolveGuestDeadline(event: Event, group: GuestGroup): GuestDeadline | null {
  const effectiveExpiry = resolveEffectiveInviteAccessExpiry({
    eventAccessExpiresAt: event.accessExpiresAt ?? null,
    guestAccessExpiresAt: group.accessExpiresAt ?? null,
  });

  if (!effectiveExpiry) {
    return null;
  }

  return {
    expired: isInviteAccessExpired(effectiveExpiry),
    isoDate: effectiveExpiry,
    source:
      group.accessExpiresAt && Date.parse(group.accessExpiresAt) === Date.parse(effectiveExpiry)
        ? "guest"
        : "event",
  };
}

export function resolveResponseAttendees(
  group: GuestGroup,
  names: string[],
): GuestResponseAttendee[] {
  const namedMembers = new Set(
    (group.members ?? []).map((member) => normalizeAttendeeName(member.name)),
  );

  return names.map((name) => ({
    kind: namedMembers.has(normalizeAttendeeName(name)) ? "named_member" : "legacy",
    name,
  }));
}

export function normalizeAttendeeName(name: string) {
  return name.trim().toLocaleLowerCase();
}

export function buildGuestGroupRows({
  event,
  guestGroups,
  responses,
}: {
  event: Event;
  guestGroups: GuestGroup[];
  responses: RsvpResponse[];
}): GuestGroupRow[] {
  const responsesByGroupId = new Map(
    responses.map((response) => [response.guestGroupId, response] as const),
  );

  return guestGroups.map((group) => {
    const storedResponse = responsesByGroupId.get(group.id) ?? null;
    const deadline = resolveGuestDeadline(event, group);
    const base = {
      deadline,
      delivery: resolveInviteDeliveryStage(group),
      group,
      invitedBy: group.invitedBy ?? null,
      memberNames: (group.members ?? []).map((member) => member.name),
      shareBlocked: group.status === "disabled" || Boolean(deadline?.expired),
    };

    // Regenerating an invite link resets the group to `pending` but leaves the
    // rsvp_responses row in place. The stale response must not be shown as current.
    if (group.status === "pending" || group.status === "opened") {
      return {
        ...base,
        attendees: [],
        hasClearedResponse: Boolean(storedResponse),
        response: null,
        responseUnavailable: false,
        rsvp: "awaiting" as const,
        rsvpMessage: null,
      };
    }

    if (storedResponse) {
      return {
        ...base,
        attendees: resolveResponseAttendees(group, storedResponse.guestNames),
        hasClearedResponse: false,
        response: storedResponse,
        responseUnavailable: false,
        rsvp: storedResponse.responseStatus,
        rsvpMessage: storedResponse.message ?? null,
      };
    }

    // `declined` still tells us the outcome; `responded` alone does not say whether the
    // guest picked attending or maybe, so it stays awaiting with an explicit note.
    return {
      ...base,
      attendees: [],
      hasClearedResponse: false,
      response: null,
      responseUnavailable: group.status === "responded",
      rsvp: group.status === "declined" ? ("not_attending" as const) : ("awaiting" as const),
      rsvpMessage: null,
    };
  });
}

export function buildGuestRows(groupRows: GuestGroupRow[]): GuestRow[] {
  return groupRows.flatMap((row) => {
    const { group } = row;
    const attendingNames = new Set(
      row.rsvp === "attending"
        ? row.attendees.map((attendee) => normalizeAttendeeName(attendee.name))
        : [],
    );
    // An attending group that recorded no names means guest-name collection was off.
    // We cannot attribute the unfilled seats to anyone, so every member reads attending.
    const attributesAttendance = row.rsvp === "attending" && attendingNames.size > 0;

    const memberRows: GuestRow[] = (group.members ?? []).map((member) => ({
      delivery: row.delivery,
      groupId: group.id,
      groupLabel: group.label,
      id: `${group.id}:member:${member.id}`,
      invitedBy: row.invitedBy,
      name: member.name,
      rsvp: attributesAttendance
        ? attendingNames.has(normalizeAttendeeName(member.name))
          ? "attending"
          : "not_attending"
        : row.rsvp,
      source: "member" as const,
      unnamedSeats: 0,
      updatedAt: group.updatedAt,
    }));

    const legacyRows: GuestRow[] = row.attendees
      .filter((attendee) => attendee.kind === "legacy")
      .map((attendee, index) => ({
        delivery: row.delivery,
        groupId: group.id,
        groupLabel: group.label,
        id: `${group.id}:legacy:${index}`,
        invitedBy: row.invitedBy,
        name: attendee.name,
        rsvp: row.rsvp,
        source: "legacy_rsvp_name" as const,
        unnamedSeats: 0,
        updatedAt: group.updatedAt,
      }));

    if (memberRows.length > 0 || legacyRows.length > 0) {
      return [...memberRows, ...legacyRows];
    }

    // No names anywhere. One stand-in row keeps the group findable without inventing
    // placeholder people for each seat.
    return [
      {
        delivery: row.delivery,
        groupId: group.id,
        groupLabel: group.label,
        id: `${group.id}:unnamed`,
        invitedBy: row.invitedBy,
        name: group.contactName || group.label,
        rsvp: row.rsvp,
        source: "unnamed" as const,
        unnamedSeats: Math.max(group.maxPax - 1, 0),
        updatedAt: group.updatedAt,
      },
    ];
  });
}

export function collectInvitedByValues(guestGroups: GuestGroup[]) {
  const values = new Set<string>();

  for (const group of guestGroups) {
    const invitedBy = group.invitedBy?.trim();

    if (invitedBy) {
      values.add(invitedBy);
    }
  }

  return [...values].sort((left, right) =>
    left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" }),
  );
}

export function countUnnamedSeats(groupRows: GuestGroupRow[]) {
  return groupRows.reduce((total, row) => {
    const namedCount = row.group.members?.length ?? 0;
    return namedCount > 0 ? total : total + Math.max(row.group.maxPax - 1, 0);
  }, 0);
}
