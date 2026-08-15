import { Badge } from "@lumiere/dashboard-ui/components/badge";
import { Button } from "@lumiere/dashboard-ui/components/button";
import { ChevronDownIcon } from "@lumiere/dashboard-ui/components/icons";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@lumiere/dashboard-ui/components/table";
import type { Event } from "@lumiere/types";
import { Fragment } from "react";

import { GuestGroupDetail } from "./guest-group-detail";
import {
  formatDeadlineChip,
  InviteStageBadge,
  isDeadlineNoteworthy,
  RsvpBadge,
} from "./guest-formatters";
import {
  GuestOverflowMenu,
  GuestShareMenu,
  type GuestRowActionHandlers,
} from "./guest-invite-actions";
import type { GuestGroupRow } from "./guest-row-models";

type GuestGroupListProps = {
  busyGroupId: string | null;
  canEdit: boolean;
  canShareFromDevice: boolean;
  event: Event;
  expandedGroupId: string | null;
  handlers: GuestRowActionHandlers;
  inviteLinks: Record<string, string>;
  isDesktop: boolean;
  onToggleExpanded: (groupId: string) => void;
  rows: GuestGroupRow[];
};

export function GuestGroupList(props: GuestGroupListProps) {
  return props.isDesktop ? <GuestGroupTable {...props} /> : <GuestGroupCards {...props} />;
}

function GuestGroupTable({
  busyGroupId,
  canEdit,
  canShareFromDevice,
  event,
  expandedGroupId,
  handlers,
  inviteLinks,
  onToggleExpanded,
  rows,
}: GuestGroupListProps) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card">
      <Table>
        <TableCaption className="sr-only">
          Guest groups with invite status, RSVP status, and actions
        </TableCaption>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead scope="col">Group</TableHead>
            <TableHead scope="col">Invited by</TableHead>
            <TableHead scope="col">Invite</TableHead>
            <TableHead scope="col">RSVP</TableHead>
            <TableHead className="text-right" scope="col">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const { group } = row;
            const expanded = expandedGroupId === group.id;
            const inviteLink = inviteLinks[group.id];
            const canUseInvite = Boolean(inviteLink) && !row.shareBlocked;

            return (
              <Fragment key={group.id}>
                <TableRow>
                  <TableCell className="max-w-72 whitespace-normal">
                    <p className="font-medium">{group.label}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {describeParty(row)}
                    </p>
                  </TableCell>
                  <TableCell className="whitespace-normal text-sm">
                    {row.invitedBy ?? <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <InviteStageBadge stage={row.delivery} />
                      {group.status === "disabled" ? (
                        <Badge variant="destructive">Disabled</Badge>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <RsvpBadge rsvp={row.rsvp} />
                      {isDeadlineNoteworthy(row.deadline) && row.deadline ? (
                        <span
                          className={
                            row.deadline.expired
                              ? "text-xs font-medium text-destructive"
                              : "text-xs text-muted-foreground"
                          }
                        >
                          {formatDeadlineChip(row.deadline, event.timezone)}
                        </span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1">
                      {canUseInvite ? (
                        <GuestShareMenu
                          canShareFromDevice={canShareFromDevice}
                          group={group}
                          handlers={handlers}
                        />
                      ) : null}
                      <GuestOverflowMenu
                        busy={busyGroupId === group.id}
                        canEdit={canEdit}
                        canUseInvite={canUseInvite}
                        group={group}
                        handlers={handlers}
                      />
                      <ExpandButton
                        expanded={expanded}
                        groupId={group.id}
                        label={group.label}
                        onToggle={onToggleExpanded}
                      />
                    </div>
                  </TableCell>
                </TableRow>
                {expanded ? (
                  <TableRow>
                    <TableCell className="whitespace-normal p-3" colSpan={5}>
                      <GuestGroupDetail
                        event={event}
                        inviteLink={inviteLink}
                        onCopy={handlers.onCopy}
                        row={row}
                      />
                    </TableCell>
                  </TableRow>
                ) : null}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function GuestGroupCards({
  busyGroupId,
  canEdit,
  canShareFromDevice,
  event,
  expandedGroupId,
  handlers,
  inviteLinks,
  onToggleExpanded,
  rows,
}: GuestGroupListProps) {
  return (
    <ul className="grid gap-3">
      {rows.map((row) => {
        const { group } = row;
        const expanded = expandedGroupId === group.id;
        const inviteLink = inviteLinks[group.id];
        const canUseInvite = Boolean(inviteLink) && !row.shareBlocked;

        return (
          <li
            className="grid gap-3 rounded-[var(--radius-lg)] border border-border bg-card p-4"
            key={group.id}
          >
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-medium">{group.label}</h3>
                <p className="mt-0.5 text-sm text-muted-foreground">{describeParty(row)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {canUseInvite ? (
                  <GuestShareMenu
                    canShareFromDevice={canShareFromDevice}
                    group={group}
                    handlers={handlers}
                  />
                ) : null}
                <GuestOverflowMenu
                  busy={busyGroupId === group.id}
                  canEdit={canEdit}
                  canUseInvite={canUseInvite}
                  group={group}
                  handlers={handlers}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <InviteStageBadge stage={row.delivery} />
              {group.status === "disabled" ? <Badge variant="destructive">Disabled</Badge> : null}
              <RsvpBadge rsvp={row.rsvp} />
              {row.invitedBy ? <Badge variant="outline">{row.invitedBy}</Badge> : null}
            </div>

            {isDeadlineNoteworthy(row.deadline) && row.deadline ? (
              <p
                className={
                  row.deadline.expired
                    ? "text-xs font-medium text-destructive"
                    : "text-xs text-muted-foreground"
                }
              >
                {formatDeadlineChip(row.deadline, event.timezone)}
              </p>
            ) : null}

            <ExpandButton
              expanded={expanded}
              groupId={group.id}
              label={group.label}
              onToggle={onToggleExpanded}
              showLabel
            />

            {expanded ? (
              <GuestGroupDetail
                event={event}
                inviteLink={inviteLink}
                onCopy={handlers.onCopy}
                row={row}
              />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function ExpandButton({
  expanded,
  groupId,
  label,
  onToggle,
  showLabel = false,
}: {
  expanded: boolean;
  groupId: string;
  label: string;
  onToggle: (groupId: string) => void;
  showLabel?: boolean;
}) {
  return (
    <Button
      aria-expanded={expanded}
      aria-label={expanded ? `Hide details for ${label}` : `Show details for ${label}`}
      className={showLabel ? "w-fit" : undefined}
      onClick={() => onToggle(groupId)}
      size={showLabel ? "sm" : "icon-sm"}
      type="button"
      variant="ghost"
    >
      {showLabel ? (expanded ? "Hide details" : "Details") : null}
      <ChevronDownIcon
        className={expanded ? "rotate-180 transition-transform" : "transition-transform"}
        data-icon={showLabel ? "inline-end" : undefined}
      />
    </Button>
  );
}

function describeParty(row: GuestGroupRow) {
  const { group } = row;

  if (row.memberNames.length > 0) {
    return row.memberNames.join(", ");
  }

  const seats = `${group.maxPax} ${group.maxPax === 1 ? "guest" : "guests"}`;

  return group.contactName ? `${group.contactName} · ${seats}` : seats;
}
