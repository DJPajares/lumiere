// @vitest-environment jsdom

import type { ActivityEvent, Event } from "@lumiere/types";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DashboardAuthProvider,
  type DashboardApiClient,
  type DashboardAuthContextValue,
} from "../../../../auth/dashboard-auth-provider";
import { ActivityWorkspace } from "./activity-workspace";

describe("ActivityWorkspace", () => {
  afterEach(() => {
    cleanup();
    window.history.replaceState({}, "", "/events/evt_123/activity");
  });

  it("shows the activity empty state", async () => {
    renderWithAuth(
      createApiClientStub({
        listEventActivity: vi.fn(async () => ({ activity: [] })),
      }),
    );

    expect(await screen.findByText("No activity yet")).toBeTruthy();
    expect(screen.getByText(/Activity will appear after managers publish changes/)).toBeTruthy();
  });

  it("renders chronological activity with useful metadata", async () => {
    const listEventActivity = vi.fn<DashboardApiClient["listEventActivity"]>(async () => ({
      activity: [rsvpActivity, openedActivity],
    }));

    renderWithAuth(createApiClientStub({ listEventActivity }));

    expect(await screen.findByText("Activity for Spring Dinner")).toBeTruthy();
    expect(screen.getByText("RSVP submitted by Tan Family")).toBeTruthy();
    expect(screen.getByText("Tan Family responded attending for 2 pax.")).toBeTruthy();
    expect(screen.getByText("Lee Family opened their invite")).toBeTruthy();
    expect(screen.getByText("Related guest group: Lee Family.")).toBeTruthy();
    expect(listEventActivity).toHaveBeenCalledWith("evt_123");
  });
});

function renderWithAuth(apiClient: Partial<DashboardApiClient>) {
  return render(
    <DashboardAuthProvider value={createAuthValue(apiClient)}>
      <ActivityWorkspace eventId="evt_123" />
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
    signUp: async () => ({ ok: true, requiresEmailConfirmation: false }),
    status: "authenticated",
    updateProfile: async () => ({ ok: true }),
    user: {
      email: "manager@example.com",
    } as DashboardAuthContextValue["user"],
  };
}

function createApiClientStub(
  overrides: Partial<DashboardApiClient> = {},
): Partial<DashboardApiClient> {
  return {
    getEvent: vi.fn(async () => ({ access: ownerAccess, event: dashboardEvent })),
    listEventActivity: vi.fn(async () => ({ activity: [rsvpActivity, declinedActivity] })),
    ...overrides,
  };
}

const dashboardEvent: Event = {
  createdAt: "2030-01-01T00:00:00.000Z",
  eventType: "dinner",
  id: "evt_123",
  ownerUserId: "user_123",
  publicSettings: {},
  rsvpSettings: {
    collectGuestMessage: true,
    collectGuestNames: true,
  },
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

const ownerAccess = {
  eventId: "evt_123",
  role: "owner" as const,
  userId: "user_123",
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
