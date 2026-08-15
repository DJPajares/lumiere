import { Badge } from "@lumiere/dashboard-ui/components/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@lumiere/dashboard-ui/components/table";

import { InviteStageBadge, RsvpBadge } from "./guest-formatters";
import type { GuestRow } from "./guest-row-models";

export function AllGuestsTable({
  isDesktop,
  rows,
  unnamedSeats,
}: {
  isDesktop: boolean;
  rows: GuestRow[];
  unnamedSeats: number;
}) {
  if (!isDesktop) {
    return (
      <div className="grid gap-2">
        <ul className="grid gap-2">
          {rows.map((row) => (
            <li
              className="grid gap-2 rounded-[var(--radius-lg)] border border-border bg-card p-4"
              key={row.id}
            >
              <div>
                <p className="font-medium">
                  {row.name}
                  {row.unnamedSeats > 0 ? (
                    <span className="ml-1.5 text-sm font-normal text-muted-foreground">
                      +{row.unnamedSeats} unnamed
                    </span>
                  ) : null}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {row.groupLabel}
                  {row.invitedBy ? ` · invited by ${row.invitedBy}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <InviteStageBadge stage={row.delivery} />
                <RsvpBadge rsvp={row.rsvp} />
                {row.source === "legacy_rsvp_name" ? (
                  <Badge variant="outline">Not on guest list</Badge>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
        <UnnamedSeatsNote unnamedSeats={unnamedSeats} />
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card">
        <Table>
          <TableCaption className="sr-only">
            Every guest with their group, who invited them, invite status, and RSVP
          </TableCaption>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead scope="col">Name</TableHead>
              <TableHead scope="col">Group</TableHead>
              <TableHead scope="col">Invited by</TableHead>
              <TableHead scope="col">Invite status</TableHead>
              <TableHead scope="col">RSVP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="whitespace-normal font-medium">
                  {row.name}
                  {row.unnamedSeats > 0 ? (
                    <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                      +{row.unnamedSeats} unnamed
                    </span>
                  ) : null}
                  {row.source === "legacy_rsvp_name" ? (
                    <Badge className="ml-1.5" variant="outline">
                      Not on guest list
                    </Badge>
                  ) : null}
                </TableCell>
                <TableCell className="whitespace-normal text-muted-foreground">
                  {row.groupLabel}
                </TableCell>
                <TableCell className="whitespace-normal">
                  {row.invitedBy ?? <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell>
                  <InviteStageBadge stage={row.delivery} />
                </TableCell>
                <TableCell>
                  <RsvpBadge rsvp={row.rsvp} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <UnnamedSeatsNote unnamedSeats={unnamedSeats} />
    </div>
  );
}

/**
 * Groups with no named members contribute a single stand-in row rather than one
 * placeholder person per seat, so the remaining seats are reported here instead.
 */
function UnnamedSeatsNote({ unnamedSeats }: { unnamedSeats: number }) {
  if (unnamedSeats <= 0) {
    return null;
  }

  return (
    <p className="text-xs text-muted-foreground">
      {unnamedSeats} further {unnamedSeats === 1 ? "seat has" : "seats have"} no guest name yet. Add
      named members to a group to see everyone here.
    </p>
  );
}
