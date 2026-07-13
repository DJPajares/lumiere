import type { Notification } from "@lumiere/types";

export type NotificationDestination = {
  href: string;
  label: string;
};

export function getNotificationDestination(notification: Notification): NotificationDestination {
  const eventPath = `/events/${encodeURIComponent(notification.eventId)}`;
  const guestGroupId = readMetadataId(notification.metadata.guestGroupId);
  const responseId = readMetadataId(notification.metadata.responseId);

  switch (notification.notificationType) {
    case "rsvp_submitted":
    case "rsvp_updated":
      return {
        href: appendQuery(eventPath + "/responses", {
          guestGroupId,
          responseId,
        }),
        label: "Open responses",
      };
    case "guest_opened_invite":
      return {
        href: appendQuery(eventPath + "/guests", {
          guestGroupId,
        }),
        label: "Open guests",
      };
    case "system":
      return {
        href: eventPath,
        label: "Open event overview",
      };
  }
}

function appendQuery(path: string, values: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(values)) {
    if (value) {
      searchParams.set(key, value);
    }
  }

  const query = searchParams.toString();

  return query ? `${path}?${query}` : path;
}

function readMetadataId(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
