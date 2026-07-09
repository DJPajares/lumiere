// @vitest-environment jsdom

import type { ActivityEvent, Event, EventSummary } from "@lumiere/types";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DashboardAuthProvider,
  type DashboardApiClient,
  type DashboardAuthContextValue,
} from "../../../auth/dashboard-auth-provider";
import { EventOverviewWorkspace } from "./event-overview-workspace";

describe("EventOverviewWorkspace", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders event metadata and response summary cards", async () => {
    const submittedActivity: ActivityEvent = {
      ...activityEvent,
      activityType: "rsvp_submitted",
      metadata: {
        title: "RSVP submitted by Tan family",
      },
    };

    renderWithAuth({
      getEvent: vi.fn(async () => ({ event: overviewEvent })),
      getEventSummary: vi.fn(async () => ({ summary: overviewSummary })),
      listEventActivity: vi.fn(async () => ({
        activity: [submittedActivity],
      })),
    });

    expect(screen.getByLabelText("Loading event overview")).toBeTruthy();
    expect(await screen.findByText("Spring Dinner")).toBeTruthy();
    expect(screen.getByText("Dinner · Jun 1, 2030, 6:30 PM")).toBeTruthy();
    expect(screen.getByText("Attending")).toBeTruthy();
    expect(screen.getByText("12 pax")).toBeTruthy();
    expect(screen.getByText("Not attending")).toBeTruthy();
    expect(screen.getByText("2 pax")).toBeTruthy();
    expect(screen.getAllByText("Maybe")).toHaveLength(2);
    expect(screen.getByText("4 pax")).toBeTruthy();
    expect(screen.getAllByText("Pending")).toHaveLength(2);
    expect(screen.getByText("6 pax")).toBeTruthy();
    expect(screen.getByText("Total invited")).toBeTruthy();
    expect(screen.getAllByText("24 pax")).toHaveLength(2);
    expect(screen.getByText("RSVP submitted by Tan family")).toBeTruthy();
  });

  it("renders an empty activity state", async () => {
    renderWithAuth({
      getEvent: vi.fn(async () => ({ event: overviewEvent })),
      getEventSummary: vi.fn(async () => ({ summary: overviewSummary })),
      listEventActivity: vi.fn(async () => ({ activity: [] })),
    });

    expect(await screen.findByText("No activity yet")).toBeTruthy();
    expect(screen.getByText(/Activity will appear after managers publish changes/)).toBeTruthy();
  });
});

function renderWithAuth(apiClient: Partial<DashboardApiClient>) {
  return render(
    <DashboardAuthProvider value={createAuthValue(apiClient)}>
      <EventOverviewWorkspace eventId="evt_123" />
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

const overviewEvent: Event = {
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

const overviewSummary: EventSummary = {
  attending: {
    groups: 5,
    pax: 12,
  },
  maybe: {
    groups: 1,
    pax: 4,
  },
  notAttending: {
    groups: 1,
    pax: 2,
  },
  pending: {
    groups: 3,
    pax: 6,
  },
  totalGroups: 10,
  totalInvitedPax: 24,
  totalRespondedPax: 18,
};

const activityEvent: ActivityEvent = {
  actorId: "guest_123",
  actorType: "guest",
  activityType: "rsvp_submitted",
  createdAt: "2030-05-01T12:00:00.000Z",
  eventId: "evt_123",
  id: "act_123",
  metadata: {},
};
