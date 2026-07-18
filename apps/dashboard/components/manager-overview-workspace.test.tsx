// @vitest-environment jsdom

import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import type {
  ActivityEvent,
  CollaboratorInvitationInboxItem,
  Event,
  EventSummary,
} from "@lumiere/types";
import { afterEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";

import {
  DashboardAuthProvider,
  type DashboardApiClient,
  type DashboardAuthContextValue,
} from "../auth/dashboard-auth-provider";
import { ManagerOverviewWorkspace } from "./manager-overview-workspace";

const routerPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPush }),
}));

describe("ManagerOverviewWorkspace", () => {
  afterEach(() => cleanup());

  it("loads consolidated data directly and keeps metrics hidden behind shape-matched loading", () => {
    const listRequest = createDeferred<{ events: Event[] }>();
    const listEvents = vi.fn(() => listRequest.promise);

    renderOverview({ listEvents });

    expect(screen.getByLabelText("Loading manager overview")).toBeTruthy();
    expect(screen.queryByLabelText("Manager metrics")).toBeNull();
    expect(listEvents).toHaveBeenCalledTimes(1);
  });

  it("shows an intentional first-run state without rendering the event form", async () => {
    renderOverview({
      listEvents: vi.fn(async () => ({ events: [] })),
    });

    expect(await screen.findByText("Create your first Lumiere event")).toBeTruthy();
    expect(screen.queryByLabelText("Event title")).toBeNull();
    expect(screen.getByRole("button", { name: "Create event" })).toBeTruthy();
  });

  it("shows pending event invitations and refreshes managed events after acceptance", async () => {
    const user = userEvent.setup();
    const acceptCollaboratorInvitation = vi.fn(async () => ({
      collaborator: {
        createdAt: "2030-01-02T00:00:00.000Z",
        email: "manager@example.com",
        eventId: springDinner.id,
        id: "membership-spring",
        role: "editor" as const,
        userId: "manager-1",
      },
      invitation: {
        ...springInvitation,
        respondedAt: "2030-01-02T00:00:00.000Z",
        respondedByUserId: "manager-1",
        status: "accepted" as const,
        updatedAt: "2030-01-02T00:00:00.000Z",
      },
    }));
    const listEvents = vi
      .fn<DashboardApiClient["listEvents"]>()
      .mockResolvedValueOnce({ events: [] })
      .mockResolvedValueOnce({ events: [springDinner] });
    const listPendingCollaboratorInvitations = vi
      .fn<DashboardApiClient["listPendingCollaboratorInvitations"]>()
      .mockResolvedValueOnce({ invitations: [springInvitation] })
      .mockResolvedValueOnce({ invitations: [] });

    renderOverview({
      acceptCollaboratorInvitation,
      getEventSummary: vi.fn(async () => ({ summary: springSummary })),
      listEventActivity: vi.fn(async () => ({ activity: [] })),
      listEvents,
      listPendingCollaboratorInvitations,
    });

    expect(await screen.findByRole("heading", { name: "Event invitations" })).toBeTruthy();
    expect(screen.getByText("Spring Dinner")).toBeTruthy();
    expect(screen.getByText("Editor")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Accept invitation to Spring Dinner" }));

    expect(await screen.findByRole("link", { name: "Open Spring Dinner" })).toBeTruthy();
    expect(acceptCollaboratorInvitation).toHaveBeenCalledWith(springInvitation.id);
    expect(listEvents).toHaveBeenCalledTimes(2);
  });

  it("removes a pending event invitation after it is declined", async () => {
    const user = userEvent.setup();
    const declineCollaboratorInvitation = vi.fn(async () => ({
      invitation: {
        ...springInvitation,
        respondedAt: "2030-01-02T00:00:00.000Z",
        respondedByUserId: "manager-1",
        status: "declined" as const,
        updatedAt: "2030-01-02T00:00:00.000Z",
      },
    }));
    const listPendingCollaboratorInvitations = vi
      .fn<DashboardApiClient["listPendingCollaboratorInvitations"]>()
      .mockResolvedValueOnce({ invitations: [springInvitation] })
      .mockResolvedValueOnce({ invitations: [] });

    renderOverview({
      declineCollaboratorInvitation,
      listEvents: vi.fn(async () => ({ events: [] })),
      listPendingCollaboratorInvitations,
    });

    await user.click(
      await screen.findByRole("button", { name: "Decline invitation to Spring Dinner" }),
    );

    await waitFor(() =>
      expect(screen.queryByRole("heading", { name: "Event invitations" })).toBeNull(),
    );
    expect(declineCollaboratorInvitation).toHaveBeenCalledWith(springInvitation.id);
  });

  it("combines multi-event status, RSVP movement, milestones, actions, and activity", async () => {
    const getEventSummary = vi.fn(async (eventId: string) => ({
      summary: eventId === springDinner.id ? springSummary : launchSummary,
    }));
    const listEventActivity = vi.fn(async (eventId: string) => ({
      activity: eventId === springDinner.id ? [springActivity] : [launchActivity],
    }));

    renderOverview({
      getEventSummary,
      listEventActivity,
      listEvents: vi.fn(async () => ({ events: [springDinner, autumnLaunch] })),
    });

    expect(await screen.findByText("2 events in motion")).toBeTruthy();
    const metrics = screen.getByLabelText("Manager metrics");

    expect(within(metrics).getByText("7")).toBeTruthy();
    expect(within(metrics).getByText("60%")).toBeTruthy();
    expect(screen.getByText("Upcoming milestones")).toBeTruthy();
    expect(screen.getByText("Check pending RSVPs for Spring Dinner")).toBeTruthy();
    expect(screen.getByText("RSVP received from the Tan family")).toBeTruthy();
    expect(screen.getByText("Autumn Launch published")).toBeTruthy();
    expect(getEventSummary).toHaveBeenCalledTimes(2);
    expect(listEventActivity).toHaveBeenCalledTimes(2);
  });

  it("keeps event entry points usable when one analytics request fails", async () => {
    const getEventSummary = vi.fn(async (eventId: string) => {
      if (eventId === springDinner.id) {
        throw new Error("Summary service timed out.");
      }

      return { summary: launchSummary };
    });

    renderOverview({
      getEventSummary,
      listEventActivity: vi.fn(async () => ({ activity: [] })),
      listEvents: vi.fn(async () => ({ events: [springDinner, autumnLaunch] })),
    });

    expect(await screen.findByText("Some event analytics could not be loaded")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Retry analytics" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Open Spring Dinner" }).getAttribute("href")).toBe(
      `/events/${springDinner.id}`,
    );
    expect(screen.getByRole("link", { name: "Open Autumn Launch" }).getAttribute("href")).toBe(
      `/events/${autumnLaunch.id}`,
    );
  });

  it("opens event creation in a modal and keeps stable workspace targets", async () => {
    const user = userEvent.setup();
    renderOverview({
      getEventSummary: vi.fn(async () => ({ summary: springSummary })),
      listEventActivity: vi.fn(async () => ({ activity: [] })),
      listEvents: vi.fn(async () => ({ events: [springDinner] })),
    });

    const createAction = await screen.findByRole("button", { name: "Create event" });
    const openAction = screen.getByRole("link", { name: "Open Spring Dinner" });

    expect(openAction.getAttribute("href")).toBe(`/events/${springDinner.id}`);
    await user.click(createAction);
    expect(await screen.findByRole("dialog", { name: "Create event" })).toBeTruthy();
    openAction.focus();
    expect(document.activeElement).toBe(openAction);
  });

  it("shows a retryable full error when the manager event list fails", async () => {
    const listEvents = vi
      .fn<DashboardApiClient["listEvents"]>()
      .mockRejectedValueOnce(new Error("Manager events are unavailable."))
      .mockResolvedValueOnce({ events: [] });

    renderOverview({ listEvents });

    expect(await screen.findByText("Unable to load the manager overview")).toBeTruthy();
    expect(screen.getByText("Manager events are unavailable.")).toBeTruthy();
    screen.getByRole("button", { name: "Try again" }).click();
    expect(await screen.findByText("Create your first Lumiere event")).toBeTruthy();
    await waitFor(() => expect(listEvents).toHaveBeenCalledTimes(2));
  });
});

function renderOverview(apiClient: Partial<DashboardApiClient>) {
  const authValue: DashboardAuthContextValue = {
    apiClient: {
      listDeletedEvents: async () => ({ events: [] }),
      listPendingCollaboratorInvitations: async () => ({ invitations: [] }),
      ...apiClient,
    } as DashboardApiClient,
    errorMessage: null,
    getAccessToken: async () => "manager-token",
    session: {
      access_token: "manager-token",
      user: { email: "manager@example.com" },
    } as DashboardAuthContextValue["session"],
    signIn: async () => ({ ok: true }),
    signOut: async () => ({ ok: true }),
    signUp: async () => ({ ok: true, requiresEmailConfirmation: false }),
    status: "authenticated",
    updateProfile: async () => ({ ok: true }),
    user: { email: "manager@example.com" } as DashboardAuthContextValue["user"],
  };

  return render(
    <DashboardAuthProvider value={authValue}>
      <ManagerOverviewWorkspace />
    </DashboardAuthProvider>,
  );
}

const springDinner: Event = {
  createdAt: "2030-01-01T00:00:00.000Z",
  endsAt: "2030-06-01T14:00:00.000Z",
  eventType: "dinner",
  id: "event-spring",
  ownerUserId: "manager-1",
  publicSettings: {},
  rsvpSettings: {
    collectGuestMessage: true,
    collectGuestNames: true,
  },
  slug: "spring-dinner",
  startsAt: "2030-06-01T10:30:00.000Z",
  status: "draft",
  themeConfig: {},
  themeMode: "system",
  timezone: "Asia/Singapore",
  title: "Spring Dinner",
  updatedAt: "2030-02-01T00:00:00.000Z",
  venueName: "Glass Hall",
};

const autumnLaunch: Event = {
  ...springDinner,
  createdAt: "2030-01-05T00:00:00.000Z",
  eventType: "launch",
  id: "event-autumn",
  slug: "autumn-launch",
  startsAt: "2030-09-12T08:00:00.000Z",
  status: "published",
  title: "Autumn Launch",
  updatedAt: "2030-03-01T00:00:00.000Z",
};

const springInvitation: CollaboratorInvitationInboxItem = {
  createdAt: "2030-01-01T00:00:00.000Z",
  email: "manager@example.com",
  eventId: springDinner.id,
  eventTitle: springDinner.title,
  expiresAt: "2030-01-08T00:00:00.000Z",
  id: "invitation-spring",
  invitedByDisplayName: "Ada Host",
  invitedByEmail: "host@example.com",
  invitedByUserId: "host-1",
  lastSentAt: "2030-01-01T00:00:00.000Z",
  role: "editor",
  sendCount: 1,
  status: "pending",
  updatedAt: "2030-01-01T00:00:00.000Z",
};

const springSummary: EventSummary = {
  attending: { groups: 2, pax: 4 },
  maybe: { groups: 0, pax: 0 },
  notAttending: { groups: 0, pax: 0 },
  pending: { groups: 1, pax: 2 },
  totalGroups: 3,
  totalInvitedPax: 6,
  totalRespondedPax: 4,
};

const launchSummary: EventSummary = {
  attending: { groups: 1, pax: 3 },
  maybe: { groups: 0, pax: 0 },
  notAttending: { groups: 0, pax: 0 },
  pending: { groups: 1, pax: 1 },
  totalGroups: 2,
  totalInvitedPax: 4,
  totalRespondedPax: 3,
};

const springActivity: ActivityEvent = {
  actorType: "guest",
  activityType: "rsvp_submitted",
  createdAt: "2030-04-02T10:00:00.000Z",
  eventId: springDinner.id,
  id: "activity-spring",
  metadata: { title: "RSVP received from the Tan family" },
};

const launchActivity: ActivityEvent = {
  actorType: "manager",
  activityType: "event_published",
  createdAt: "2030-04-04T10:00:00.000Z",
  eventId: autumnLaunch.id,
  id: "activity-launch",
  metadata: { title: "Autumn Launch published" },
};

function createDeferred<TValue>() {
  let resolve!: (value: TValue) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<TValue>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, reject, resolve };
}
