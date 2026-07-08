// @vitest-environment jsdom

import type { ActivityEvent, Event, GuestGroup, Notification } from "@lumiere/types";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DashboardAuthProvider,
  type DashboardApiClient,
  type DashboardAuthContextValue,
} from "../../../auth/dashboard-auth-provider";
import { ResponsesActivityWorkspace } from "./responses-activity-workspace";

describe("ResponsesActivityWorkspace", () => {
  afterEach(() => {
    cleanup();
  });

  it("lists response rows and filters by RSVP state", async () => {
    const user = userEvent.setup();

    renderWithAuth(createApiClientStub(), "responses");

    expect(screen.getByLabelText("Loading responses")).toBeTruthy();
    expect(await screen.findByText("Track RSVPs for Spring Dinner")).toBeTruthy();
    expect(screen.getByText("Tan Family")).toBeTruthy();
    expect(screen.getByText("Tan Family submitted an RSVP for Spring Dinner.")).toBeTruthy();
    expect(screen.getByText("2 pax")).toBeTruthy();
    expect(screen.getByText("Pending Cousins")).toBeTruthy();
    expect(screen.getByText("Old Vendor List")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Attending" }));

    expect(screen.getByText("Tan Family")).toBeTruthy();
    expect(screen.queryByText("Lee Family")).toBeNull();
    expect(screen.queryByText("Pending Cousins")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Pending" }));

    expect(screen.getByText("Pending Cousins")).toBeTruthy();
    expect(screen.queryByText("Tan Family")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Disabled" }));

    expect(screen.getByText("Old Vendor List")).toBeTruthy();
    expect(screen.getByText("Invite access disabled.")).toBeTruthy();
  });

  it("shows response and activity empty states", async () => {
    renderWithAuth(
      createApiClientStub({
        listEventActivity: vi.fn(async () => ({ activity: [] })),
        listEventNotifications: vi.fn(async () => ({ notifications: [] })),
        listGuestGroups: vi.fn(async () => ({ guestGroups: [] })),
      }),
      "responses",
    );

    expect(await screen.findByText("No responses yet")).toBeTruthy();
    expect(
      screen.getByText(/Submitted RSVPs and pending guest groups will appear here/),
    ).toBeTruthy();

    cleanup();

    renderWithAuth(
      createApiClientStub({
        listEventActivity: vi.fn(async () => ({ activity: [] })),
        listEventNotifications: vi.fn(async () => ({ notifications: [] })),
        listGuestGroups: vi.fn(async () => ({ guestGroups: [] })),
      }),
      "activity",
    );

    expect(await screen.findByText("No activity yet")).toBeTruthy();
    expect(screen.getByText(/Activity will appear after managers publish changes/)).toBeTruthy();
  });

  it("renders chronological activity with useful metadata", async () => {
    const listEventActivity = vi.fn<DashboardApiClient["listEventActivity"]>(async () => ({
      activity: [rsvpActivity, openedActivity],
    }));

    renderWithAuth(
      createApiClientStub({
        listEventActivity,
      }),
      "activity",
    );

    expect(await screen.findByText("Activity for Spring Dinner")).toBeTruthy();
    expect(screen.getByText("RSVP submitted by Tan Family")).toBeTruthy();
    expect(screen.getByText("Tan Family responded attending for 2 pax.")).toBeTruthy();
    expect(screen.getByText("Lee Family opened their invite")).toBeTruthy();
    expect(screen.getByText("Related guest group: Lee Family.")).toBeTruthy();
    expect(listEventActivity).toHaveBeenCalledWith("evt_123");
  });
});

function renderWithAuth(apiClient: Partial<DashboardApiClient>, mode: "activity" | "responses") {
  return render(
    <DashboardAuthProvider value={createAuthValue(apiClient)}>
      <ResponsesActivityWorkspace eventId="evt_123" mode={mode} />
    </DashboardAuthProvider>,
  );
}

function createAuthValue(apiClient: Partial<DashboardApiClient>): DashboardAuthContextValue {
  return {
    apiClient: apiClient as DashboardApiClient,
    errorMessage: null,
    getAccessToken: async () => "manager-token",
    session: {
      access_token: "manager-token",
      user: {
        email: "manager@example.com",
      },
    } as DashboardAuthContextValue["session"],
    signIn: async () => ({ ok: true }),
    signOut: async () => ({ ok: true }),
    status: "authenticated",
    user: {
      email: "manager@example.com",
    } as DashboardAuthContextValue["user"],
  };
}

function createApiClientStub(
  overrides: Partial<DashboardApiClient> = {},
): Partial<DashboardApiClient> {
  return {
    getEvent: vi.fn(async () => ({ event: dashboardEvent })),
    listEventActivity: vi.fn(async () => ({ activity: [rsvpActivity, declinedActivity] })),
    listEventNotifications: vi.fn(async () => ({
      notifications: [rsvpNotification, declinedNotification],
    })),
    listGuestGroups: vi.fn(async () => ({
      guestGroups: [tanGroup, leeGroup, pendingGroup, disabledGroup],
    })),
    ...overrides,
  };
}

const dashboardEvent: Event = {
  createdAt: "2030-01-01T00:00:00.000Z",
  eventType: "dinner",
  id: "evt_123",
  ownerUserId: "user_123",
  publicSettings: {},
  rsvpSettings: {},
  slug: "spring-dinner",
  startsAt: "2030-06-01T10:30:00.000Z",
  status: "published",
  themeConfig: {},
  themeMode: "system",
  timezone: "Asia/Singapore",
  title: "Spring Dinner",
  updatedAt: "2030-01-01T00:00:00.000Z",
  venueAddress: "12 Orchard Road",
  venueName: "Glass Hall",
};

const tanGroup: GuestGroup = {
  contactEmail: "tan@example.com",
  contactName: "Mina Tan",
  createdAt: "2030-01-01T00:00:00.000Z",
  eventId: "evt_123",
  id: "guest_tan",
  inviteCode: "tan-code",
  label: "Tan Family",
  maxPax: 4,
  status: "responded",
  updatedAt: "2030-01-01T00:00:00.000Z",
};

const leeGroup: GuestGroup = {
  ...tanGroup,
  contactEmail: "lee@example.com",
  contactName: "Kai Lee",
  id: "guest_lee",
  inviteCode: "lee-code",
  label: "Lee Family",
  maxPax: 2,
  status: "declined",
};

const pendingGroup: GuestGroup = {
  ...tanGroup,
  id: "guest_pending",
  inviteCode: "pending-code",
  label: "Pending Cousins",
  maxPax: 5,
  status: "pending",
};

const disabledGroup: GuestGroup = {
  ...tanGroup,
  id: "guest_disabled",
  inviteCode: "disabled-code",
  label: "Old Vendor List",
  maxPax: 3,
  status: "disabled",
};

const rsvpActivity: ActivityEvent = {
  actorId: "guest_tan",
  actorType: "guest",
  activityType: "rsvp_submitted",
  createdAt: "2030-05-01T12:00:00.000Z",
  eventId: "evt_123",
  id: "activity_tan",
  metadata: {
    attendeeCount: 2,
    guestGroupId: "guest_tan",
    guestGroupLabel: "Tan Family",
    responseId: "response_tan",
    responseStatus: "attending",
  },
};

const declinedActivity: ActivityEvent = {
  actorId: "guest_lee",
  actorType: "guest",
  activityType: "rsvp_updated",
  createdAt: "2030-05-02T12:00:00.000Z",
  eventId: "evt_123",
  id: "activity_lee",
  metadata: {
    attendeeCount: 0,
    guestGroupId: "guest_lee",
    guestGroupLabel: "Lee Family",
    responseId: "response_lee",
    responseStatus: "not_attending",
  },
};

const openedActivity: ActivityEvent = {
  actorId: "guest_lee",
  actorType: "guest",
  activityType: "guest_invite_opened",
  createdAt: "2030-05-03T12:00:00.000Z",
  eventId: "evt_123",
  id: "activity_opened",
  metadata: {
    guestGroupId: "guest_lee",
    guestGroupLabel: "Lee Family",
  },
};

const rsvpNotification: Notification = {
  createdAt: "2030-05-01T12:00:00.000Z",
  eventId: "evt_123",
  id: "notification_tan",
  message: "Tan Family submitted an RSVP for Spring Dinner.",
  metadata: {
    attendeeCount: 2,
    guestGroupId: "guest_tan",
    guestGroupLabel: "Tan Family",
    responseId: "response_tan",
    responseStatus: "attending",
  },
  notificationType: "rsvp_submitted",
  title: "RSVP submitted",
  userId: "user_123",
};

const declinedNotification: Notification = {
  ...rsvpNotification,
  id: "notification_lee",
  message: "Lee Family updated an RSVP for Spring Dinner.",
  metadata: {
    attendeeCount: 0,
    guestGroupId: "guest_lee",
    guestGroupLabel: "Lee Family",
    responseId: "response_lee",
    responseStatus: "not_attending",
  },
  notificationType: "rsvp_updated",
  title: "RSVP updated",
};
