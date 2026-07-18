// @vitest-environment jsdom

import type { ActivityEvent, Event, EventSummary, GuestGroup, RsvpResponse } from "@lumiere/types";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DashboardAuthProvider,
  type DashboardApiClient,
  type DashboardAuthContextValue,
} from "../../../../auth/dashboard-auth-provider";
import { ResponsesActivityWorkspace } from "./responses-activity-workspace";

describe("ResponsesActivityWorkspace", () => {
  afterEach(() => {
    cleanup();
    window.history.replaceState({}, "", "/events/evt_123/responses");
  });

  it("lists response rows and filters by RSVP state", async () => {
    const user = userEvent.setup();

    renderWithAuth(createApiClientStub(), "responses");

    expect(screen.getByLabelText("Loading responses")).toBeTruthy();
    expect(await screen.findByText("Track RSVPs for Spring Dinner")).toBeTruthy();
    expect(screen.getByText("Tan Family")).toBeTruthy();
    expect(screen.getByText("Tan Family submitted an RSVP for Spring Dinner.")).toBeTruthy();
    expect(screen.getByText("2 pax")).toBeTruthy();
    expect(screen.getByText("Mina Tan, Alex Tan")).toBeTruthy();
    expect(screen.getByText("2 named members")).toBeTruthy();
    expect(screen.getByText("Auntie Joy")).toBeTruthy();
    expect(screen.getByText("1 legacy RSVP name")).toBeTruthy();
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

  it("switches between URL-persisted detailed and grouped views without refetching", async () => {
    const user = userEvent.setup();
    const getEventSummary = vi.fn(async () => ({ summary: eventSummary }));
    const listEventResponses = vi.fn(async () => ({
      responses: [tanResponse, declinedResponse, maybeResponse],
    }));
    const listGuestGroups = vi.fn(async () => ({
      guestGroups: [tanGroup, leeGroup, maybeGroup, pendingGroup, disabledGroup],
    }));
    window.history.replaceState({}, "", "/events/evt_123/responses?source=dashboard&view=grouped");

    renderWithAuth(
      createApiClientStub({
        getEventSummary,
        listEventResponses,
        listGuestGroups,
      }),
      "responses",
    );

    const grouped = await screen.findByLabelText("Responses grouped by status");
    const attendingGroup = within(grouped).getByRole("region", { name: "Attending" });
    const declinedGroup = within(grouped).getByRole("region", { name: "Not attending" });
    const maybeGroupRegion = within(grouped).getByRole("region", { name: "Maybe" });
    const pendingGroupRegion = within(grouped).getByRole("region", { name: "Pending" });

    expect(within(attendingGroup).getByText("1 group")).toBeTruthy();
    expect(within(declinedGroup).getByText("1 group")).toBeTruthy();
    expect(within(maybeGroupRegion).getByText("1 group")).toBeTruthy();
    expect(within(pendingGroupRegion).getByText("1 group")).toBeTruthy();
    expect(within(grouped).getByRole("region", { name: "Disabled" })).toBeTruthy();
    expect(within(attendingGroup).getByText("Mina Tan, Alex Tan")).toBeTruthy();
    expect(within(attendingGroup).getByText("2 named members")).toBeTruthy();
    expect(within(grouped).getByText("Auntie Joy")).toBeTruthy();
    expect(within(maybeGroupRegion).getByText("1 legacy RSVP name")).toBeTruthy();
    expect(window.location.search).toBe("?source=dashboard&view=grouped");

    await user.click(screen.getByRole("button", { name: "Detailed" }));

    expect(screen.queryByLabelText("Responses grouped by status")).toBeNull();
    expect(window.location.search).toBe("?source=dashboard");

    await user.click(screen.getByRole("button", { name: "Grouped" }));

    expect(await screen.findByLabelText("Responses grouped by status")).toBeTruthy();
    expect(window.location.search).toBe("?source=dashboard&view=grouped");
    expect(getEventSummary).toHaveBeenCalledOnce();
    expect(listEventResponses).toHaveBeenCalledOnce();
    expect(listGuestGroups).toHaveBeenCalledOnce();

    await user.click(screen.getByRole("button", { name: "Not attending" }));
    const filteredGrouped = screen.getByLabelText("Responses grouped by status");
    expect(within(filteredGrouped).getByRole("region", { name: "Not attending" })).toBeTruthy();
    expect(within(filteredGrouped).queryByRole("region", { name: "Attending" })).toBeNull();
    expect(within(filteredGrouped).getByText("Sorry to miss it.")).toBeTruthy();
  });

  it("shows response and activity empty states", async () => {
    renderWithAuth(
      createApiClientStub({
        listEventActivity: vi.fn(async () => ({ activity: [] })),
        listEventResponses: vi.fn(async () => ({ responses: [] })),
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
        listEventResponses: vi.fn(async () => ({ responses: [] })),
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
    getEventSummary: vi.fn(async () => ({ summary: eventSummary })),
    getEvent: vi.fn(async () => ({ access: ownerAccess, event: dashboardEvent })),
    listEventActivity: vi.fn(async () => ({ activity: [rsvpActivity, declinedActivity] })),
    listEventResponses: vi.fn(async () => ({
      responses: [tanResponse, declinedResponse, maybeResponse],
    })),
    listGuestGroups: vi.fn(async () => ({
      guestGroups: [tanGroup, leeGroup, maybeGroup, pendingGroup, disabledGroup],
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

const tanGroup: GuestGroup = {
  contactEmail: "tan@example.com",
  contactName: "Mina Tan",
  createdAt: "2030-01-01T00:00:00.000Z",
  eventId: "evt_123",
  id: "guest_tan",
  inviteCode: "tan-code",
  label: "Tan Family",
  maxPax: 4,
  members: [
    { id: "member_mina", name: "Mina Tan", sortOrder: 0 },
    { id: "member_alex", name: "Alex Tan", sortOrder: 1 },
  ],
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

const maybeGroup: GuestGroup = {
  ...tanGroup,
  contactName: "Auntie Joy",
  id: "guest_maybe",
  inviteCode: "maybe-code",
  label: "Joy and Family",
  maxPax: 2,
  members: [],
  status: "responded",
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

const tanResponse: RsvpResponse = {
  answers: [],
  attendeeCount: 2,
  eventId: "evt_123",
  guestGroupId: "guest_tan",
  guestNames: ["Mina Tan", "Alex Tan"],
  id: "response_tan",
  message: "Tan Family submitted an RSVP for Spring Dinner.",
  responseStatus: "attending",
  submittedAt: "2030-05-01T12:00:00.000Z",
  updatedAt: "2030-05-01T12:00:00.000Z",
};

const declinedResponse: RsvpResponse = {
  ...tanResponse,
  attendeeCount: 0,
  guestGroupId: "guest_lee",
  guestNames: [],
  id: "response_lee",
  message: "Sorry to miss it.",
  responseStatus: "not_attending",
  submittedAt: "2030-05-02T12:00:00.000Z",
  updatedAt: "2030-05-02T12:00:00.000Z",
};

const maybeResponse: RsvpResponse = {
  ...tanResponse,
  attendeeCount: 1,
  guestGroupId: "guest_maybe",
  guestNames: ["Auntie Joy"],
  id: "response_maybe",
  message: "We may be able to join.",
  responseStatus: "maybe",
  submittedAt: "2030-05-03T12:00:00.000Z",
  updatedAt: "2030-05-03T12:00:00.000Z",
};

const eventSummary: EventSummary = {
  attending: { groups: 1, pax: 2 },
  maybe: { groups: 1, pax: 1 },
  notAttending: { groups: 1, pax: 0 },
  pending: { groups: 1, pax: 5 },
  totalGroups: 4,
  totalInvitedPax: 13,
  totalRespondedPax: 3,
};
