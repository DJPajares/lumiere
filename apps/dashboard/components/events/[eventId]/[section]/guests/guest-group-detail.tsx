import { Badge } from "@lumiere/dashboard-ui/components/badge";
import { Button } from "@lumiere/dashboard-ui/components/button";
import { Input } from "@lumiere/dashboard-ui/components/input";
import type { Event, GuestGroup } from "@lumiere/types";

import {
  describeGuestAccessExpiry,
  describeGuestTrackingDates,
  formatGuestDate,
  formatRsvpState,
} from "./guest-formatters";
import type { GuestGroupRow } from "./guest-row-models";

/**
 * Everything a manager does not need while scanning: per-person answers, the RSVP
 * message, the raw invite link, tracking dates, contact details, and notes.
 */
export function GuestGroupDetail({
  event,
  inviteLink,
  onCopy,
  row,
}: {
  event: Event;
  inviteLink?: string;
  onCopy: (group: GuestGroup) => void;
  row: GuestGroupRow;
}) {
  const { group } = row;
  const namedAttendees = row.attendees.filter((attendee) => attendee.kind === "named_member");
  const legacyAttendees = row.attendees.filter((attendee) => attendee.kind === "legacy");

  return (
    <div className="grid gap-4 rounded-[var(--radius-md)] bg-muted/40 p-4 text-sm md:grid-cols-2">
      <div className="grid content-start gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          RSVP
        </h4>
        <p className="font-medium">
          {formatRsvpState(row.rsvp)}
          {row.response ? ` · ${row.response.attendeeCount} of ${group.maxPax} pax` : ""}
        </p>

        {row.hasClearedResponse ? (
          <p className="text-muted-foreground">
            An earlier RSVP was cleared when this invite link was reset. The guest needs to respond
            again.
          </p>
        ) : null}

        {row.responseUnavailable ? (
          <p className="text-muted-foreground">Saved response details are unavailable.</p>
        ) : null}

        {row.attendees.length > 0 ? (
          <div className="grid gap-1.5">
            <ul className="flex flex-wrap gap-1.5">
              {row.attendees.map((attendee) => (
                <li key={`${attendee.kind}-${attendee.name}`}>
                  <Badge variant={attendee.kind === "named_member" ? "secondary" : "outline"}>
                    {attendee.name}
                  </Badge>
                </li>
              ))}
            </ul>
            {legacyAttendees.length > 0 ? (
              <p className="text-xs text-muted-foreground">
                {namedAttendees.length} named {namedAttendees.length === 1 ? "member" : "members"} ·{" "}
                {legacyAttendees.length} name{legacyAttendees.length === 1 ? "" : "s"} not on the
                guest list
              </p>
            ) : null}
          </div>
        ) : null}

        {row.rsvpMessage ? (
          <blockquote className="border-l-2 border-border pl-3 leading-6 text-muted-foreground">
            {row.rsvpMessage}
          </blockquote>
        ) : null}

        {row.response ? (
          <p className="text-xs text-muted-foreground">
            Submitted {formatGuestDate(row.response.submittedAt)}
          </p>
        ) : null}
      </div>

      <div className="grid content-start gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Invite
        </h4>
        <p className="text-muted-foreground">{describeGuestTrackingDates(group)}</p>
        <p className="text-muted-foreground">{describeGuestAccessExpiry(event, group)}</p>

        {inviteLink && !row.shareBlocked ? (
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <Input
              aria-label={`${group.label} invite link`}
              className="h-9 font-mono text-xs"
              readOnly
              value={inviteLink}
            />
            <Button onClick={() => onCopy(group)} size="sm" type="button" variant="outline">
              Copy link
            </Button>
          </div>
        ) : (
          <InviteLinkUnavailable row={row} />
        )}

        {group.contactName || group.contactEmail ? (
          <p className="text-muted-foreground">
            {[group.contactName, group.contactEmail].filter(Boolean).join(" · ")}
          </p>
        ) : null}

        {group.notes ? <p className="leading-6 text-muted-foreground">{group.notes}</p> : null}
      </div>
    </div>
  );
}

function InviteLinkUnavailable({ row }: { row: GuestGroupRow }) {
  const { group } = row;

  if (group.status === "disabled") {
    return <p className="text-muted-foreground">Invite access is disabled for this group.</p>;
  }

  if (row.deadline?.expired) {
    return (
      <p className="text-muted-foreground">
        Invite access has expired for this group. Extend access before sharing this private link.
      </p>
    );
  }

  return (
    <p className="text-muted-foreground">
      Full URL unavailable for this older invite. Reset the invite link once to create a copyable
      shareable link. Invite code:{" "}
      <span className="font-mono text-foreground">{group.inviteCode}</span>
    </p>
  );
}
