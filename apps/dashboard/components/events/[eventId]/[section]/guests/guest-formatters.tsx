import { Badge } from "@lumiere/dashboard-ui/components/badge";
import {
  isInviteAccessExpired,
  resolveEffectiveInviteAccessExpiry,
  type Event,
  type GuestGroup,
  type GuestGroupStatus,
  type GuestInviteShareChannel,
} from "@lumiere/types";

import type { GuestDeadline, GuestInviteDeliveryStage, GuestRsvpState } from "./guest-row-models";

export function formatInviteDeliveryStage(stage: GuestInviteDeliveryStage) {
  if (stage === "not_sent") return "Not sent";
  return stage === "sent" ? "Sent" : "Opened";
}

export function formatRsvpState(rsvp: GuestRsvpState) {
  if (rsvp === "attending") return "Attending";
  if (rsvp === "not_attending") return "Not attending";
  return rsvp === "maybe" ? "Maybe" : "Awaiting";
}

export function InviteStageBadge({ stage }: { stage: GuestInviteDeliveryStage }) {
  return (
    <Badge variant={stage === "opened" ? "default" : stage === "sent" ? "secondary" : "outline"}>
      {formatInviteDeliveryStage(stage)}
    </Badge>
  );
}

export function RsvpBadge({ rsvp }: { rsvp: GuestRsvpState }) {
  return (
    <Badge
      variant={
        rsvp === "attending"
          ? "default"
          : rsvp === "not_attending"
            ? "destructive"
            : rsvp === "maybe"
              ? "secondary"
              : "outline"
      }
    >
      {formatRsvpState(rsvp)}
    </Badge>
  );
}

/**
 * A deadline only earns row space when the manager can still act on it: already past,
 * or close enough to matter.
 */
export function isDeadlineNoteworthy(deadline: GuestDeadline | null) {
  if (!deadline) return false;
  if (deadline.expired) return true;

  const daysRemaining = (Date.parse(deadline.isoDate) - Date.now()) / 86_400_000;

  return daysRemaining <= 7;
}

export function formatDeadlineChip(deadline: GuestDeadline, timezone: string) {
  const formatted = formatAccessExpiry(deadline.isoDate, timezone);

  return deadline.expired ? `Expired ${formatted}` : `Closes ${formatted}`;
}

export function formatGuestDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatAccessExpiry(value: string, timezone: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone,
  }).format(new Date(value));
}

export function formatStatus(status: GuestGroupStatus) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatShareChannel(channel: GuestInviteShareChannel) {
  if (channel === "sms") return "SMS";
  if (channel === "whatsapp") return "WhatsApp";
  return channel.charAt(0).toUpperCase() + channel.slice(1);
}

export function describeGuestAccessExpiry(event: Event, group: GuestGroup) {
  const effectiveExpiry = resolveEffectiveInviteAccessExpiry({
    eventAccessExpiresAt: event.accessExpiresAt ?? null,
    guestAccessExpiresAt: group.accessExpiresAt ?? null,
  });

  if (!effectiveExpiry) {
    return "No access deadline";
  }

  const source = !group.accessExpiresAt
    ? "Inherits event deadline"
    : Date.parse(group.accessExpiresAt) === Date.parse(effectiveExpiry)
      ? "Guest deadline"
      : "Event deadline";
  const formattedExpiry = formatAccessExpiry(effectiveExpiry, event.timezone);
  return isInviteAccessExpired(effectiveExpiry)
    ? `${source} expired: ${formattedExpiry}. Extend access before sharing.`
    : `${source}: ${formattedExpiry}`;
}

export function describeGuestTrackingDates(group: GuestGroup) {
  const sentAt = group.lastSentAt ?? group.firstSentAt;
  const openedAt = group.lastOpenedAt ?? group.firstOpenedAt;
  const sent = sentAt
    ? `Sent ${formatGuestDate(sentAt)}${group.lastShareChannel ? ` via ${formatShareChannel(group.lastShareChannel)}` : ""}`
    : "Not sent";
  const opened = openedAt ? `Opened ${formatGuestDate(openedAt)}` : "Not opened";

  return `${sent} · ${opened}`;
}

export function isGuestShareUnavailable(event: Event, group: GuestGroup) {
  const effectiveExpiry = resolveEffectiveInviteAccessExpiry({
    eventAccessExpiresAt: event.accessExpiresAt ?? null,
    guestAccessExpiresAt: group.accessExpiresAt ?? null,
  });

  return (
    group.status === "disabled" ||
    Boolean(effectiveExpiry && isInviteAccessExpired(effectiveExpiry))
  );
}
