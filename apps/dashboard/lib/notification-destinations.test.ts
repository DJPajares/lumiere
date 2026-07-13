import type { Notification } from "@lumiere/types";
import { describe, expect, it } from "vitest";

import { getNotificationDestination } from "./notification-destinations";

const baseNotification: Notification = {
  createdAt: "2026-07-10T09:30:00.000Z",
  eventId: "event-42",
  id: "notification-1",
  message: "A notification message.",
  metadata: {},
  notificationType: "system",
  title: "System update",
  userId: "manager-1",
};

describe("notification destinations", () => {
  it("maps RSVP notifications to the responses workspace with safe entity context", () => {
    expect(
      getNotificationDestination({
        ...baseNotification,
        metadata: {
          arbitraryUrl: "https://attacker.example/redirect",
          guestGroupId: "guest-group-1",
          responseId: "response-1",
        },
        notificationType: "rsvp_updated",
      }),
    ).toEqual({
      href: "/events/event-42/responses?guestGroupId=guest-group-1&responseId=response-1",
      label: "Open responses",
    });
  });

  it("maps invite-opened and system notifications to fixed dashboard routes", () => {
    expect(
      getNotificationDestination({
        ...baseNotification,
        metadata: { guestGroupId: "guest-group-2" },
        notificationType: "guest_opened_invite",
      }),
    ).toEqual({
      href: "/events/event-42/guests?guestGroupId=guest-group-2",
      label: "Open guests",
    });
    expect(getNotificationDestination(baseNotification)).toEqual({
      href: "/events/event-42",
      label: "Open event overview",
    });
  });
});
