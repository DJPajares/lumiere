import type { Database } from "@lumiere/db";
import { activityEvents, guestGroups, notifications, rsvpResponses } from "@lumiere/db";
import type { ActivityEvent, EventSummary, Notification } from "@lumiere/types";
import { and, desc, eq } from "drizzle-orm";

import { toIsoDateTime } from "./serialization";

type GuestGroupSummaryRow = Pick<typeof guestGroups.$inferSelect, "id" | "maxPax" | "status">;
type RsvpSummaryRow = Pick<
  typeof rsvpResponses.$inferSelect,
  "attendeeCount" | "guestGroupId" | "responseStatus"
>;
type ActivityEventRow = typeof activityEvents.$inferSelect;
type NotificationRow = typeof notifications.$inferSelect;

export type DashboardDataStore = {
  getEventSummary(eventId: string): Promise<EventSummary>;
  listActivity(eventId: string): Promise<ActivityEvent[]>;
  listNotifications(eventId: string, userId: string): Promise<Notification[]>;
};

export const createDrizzleDashboardDataStore = (db: Database): DashboardDataStore => ({
  async getEventSummary(eventId) {
    const [groups, responses] = await Promise.all([
      db
        .select({
          id: guestGroups.id,
          maxPax: guestGroups.maxPax,
          status: guestGroups.status,
        })
        .from(guestGroups)
        .where(eq(guestGroups.eventId, eventId)),
      db
        .select({
          attendeeCount: rsvpResponses.attendeeCount,
          guestGroupId: rsvpResponses.guestGroupId,
          responseStatus: rsvpResponses.responseStatus,
        })
        .from(rsvpResponses)
        .where(eq(rsvpResponses.eventId, eventId)),
    ]);

    return buildEventSummary(groups, responses);
  },

  async listActivity(eventId) {
    const rows = await db
      .select()
      .from(activityEvents)
      .where(eq(activityEvents.eventId, eventId))
      .orderBy(desc(activityEvents.createdAt))
      .limit(20);

    return rows.map(toApiActivityEvent);
  },

  async listNotifications(eventId, userId) {
    const rows = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.eventId, eventId), eq(notifications.userId, userId)))
      .orderBy(desc(notifications.createdAt))
      .limit(20);

    return rows.map(toApiNotification);
  },
});

export const buildEventSummary = (
  groups: GuestGroupSummaryRow[],
  responses: RsvpSummaryRow[],
): EventSummary => {
  const activeGroups = groups.filter((group) => group.status !== "disabled");
  const responsesByGroupId = new Map(
    responses.map((response) => [response.guestGroupId, response] as const),
  );
  const summary: EventSummary = {
    attending: {
      groups: 0,
      pax: 0,
    },
    notAttending: {
      groups: 0,
      pax: 0,
    },
    maybe: {
      groups: 0,
      pax: 0,
    },
    pending: {
      groups: 0,
      pax: 0,
    },
    totalGroups: activeGroups.length,
    totalInvitedPax: activeGroups.reduce((total, group) => total + group.maxPax, 0),
    totalRespondedPax: 0,
  };

  for (const group of activeGroups) {
    const response = responsesByGroupId.get(group.id);

    if (!response) {
      summary.pending.groups += 1;
      summary.pending.pax += group.maxPax;
      continue;
    }

    if (response.responseStatus === "attending") {
      summary.attending.groups += 1;
      summary.attending.pax += response.attendeeCount;
    } else if (response.responseStatus === "not_attending") {
      summary.notAttending.groups += 1;
      summary.notAttending.pax += response.attendeeCount;
    } else {
      summary.maybe.groups += 1;
      summary.maybe.pax += response.attendeeCount;
    }

    summary.totalRespondedPax += response.attendeeCount;
  }

  return summary;
};

export const toApiActivityEvent = (activity: ActivityEventRow): ActivityEvent => ({
  actorId: activity.actorId ?? undefined,
  actorType: activity.actorType,
  activityType: activity.activityType,
  createdAt: toIsoDateTime(activity.createdAt),
  eventId: activity.eventId,
  id: activity.id,
  metadata: activity.metadataJson as ActivityEvent["metadata"],
});

export const toApiNotification = (notification: NotificationRow): Notification => ({
  createdAt: toIsoDateTime(notification.createdAt),
  eventId: notification.eventId,
  id: notification.id,
  message: notification.message,
  metadata: notification.metadataJson as Notification["metadata"],
  notificationType: notification.notificationType,
  readAt: notification.readAt ? toIsoDateTime(notification.readAt) : undefined,
  title: notification.title,
  userId: notification.userId,
});
