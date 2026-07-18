// @vitest-environment jsdom

import { ApiClientError } from "@lumiere/api-client";
import type { ActivityEvent, Event, EventPublishingReadiness, EventSummary } from "@lumiere/types";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
    const user = userEvent.setup();
    const submittedActivity: ActivityEvent = {
      ...activityEvent,
      activityType: "rsvp_submitted",
      metadata: {
        title: "RSVP submitted by Tan family",
      },
    };

    const unpublishEvent = vi.fn(async () => ({
      event: { ...overviewEvent, status: "draft" as const, updatedAt: "2030-01-02T00:00:00.000Z" },
    }));

    renderWithAuth({
      getEvent: vi.fn(async () => ({ access: ownerAccess, event: overviewEvent })),
      getEventPublishingReadiness: vi.fn(async () => ({ readiness: readyReadiness })),
      getEventSummary: vi.fn(async () => ({ summary: overviewSummary })),
      listEventActivity: vi.fn(async () => ({
        activity: [submittedActivity],
      })),
      unpublishEvent,
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
    expect(screen.getByText("10 groups")).toBeTruthy();
    expect(screen.getByText("Maximum attendance")).toBeTruthy();
    expect(screen.getByText("24 pax")).toBeTruthy();
    expect(screen.getAllByText("Recent activity")).toHaveLength(2);
    expect(screen.getByText("1 updates")).toBeTruthy();
    expect(screen.getByText("RSVP submitted by Tan family")).toBeTruthy();
    expect(screen.getByText("Your invitation is live")).toBeTruthy();
    expect(screen.getByText(/Saved event, theme, and section changes update/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Copy link" })).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "Open invite" })[0]?.getAttribute("href")).toBe(
      readyReadiness.publicUrl,
    );

    await user.click(screen.getByRole("button", { name: "Unpublish event" }));
    const unpublishDialog = within(
      await screen.findByRole("alertdialog", { name: "Unpublish this invitation?" }),
    );

    expect(unpublishDialog.getByText(/Public and guest links will stop working/)).toBeTruthy();
    await user.click(unpublishDialog.getByRole("button", { name: "Unpublish event" }));

    expect(unpublishEvent).toHaveBeenCalledWith("evt_123", readyReadiness.eventUpdatedAt);
    expect(await screen.findByRole("button", { name: "Publish event" })).toBeTruthy();
  });

  it("renders an empty activity state", async () => {
    const blocker = {
      code: "theme.selection",
      destination: "theme" as const,
      message: "Select a valid theme before publishing",
      path: ["selectedThemeId"],
    };

    renderWithAuth({
      getEvent: vi.fn(async () => ({ access: ownerAccess, event: draftEvent })),
      getEventPublishingReadiness: vi.fn(async () => ({
        readiness: {
          ...readyReadiness,
          blockers: [blocker],
          issues: [{ message: blocker.message, path: blocker.path }],
          ready: false,
          status: "draft" as const,
          theme: undefined,
        },
      })),
      getEventSummary: vi.fn(async () => ({ summary: overviewSummary })),
      listEventActivity: vi.fn(async () => ({ activity: [] })),
    });

    expect(await screen.findByText("No activity yet")).toBeTruthy();
    expect(screen.getByText(/Activity will appear after managers publish changes/)).toBeTruthy();
    expect(screen.getByText("Finish the blockers before publishing")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Fix in Theme" }).getAttribute("href")).toBe(
      "/events/evt_123/theme",
    );
    expect(screen.getByRole("button", { name: "Preview invitation" }).getAttribute("href")).toBe(
      "/events/evt_123/content",
    );
    expect(
      (screen.getByRole("button", { name: "Publish event" }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  it("opens bounded event details from the event workspace", async () => {
    const user = userEvent.setup();
    const publishedEvent = {
      ...draftEvent,
      status: "published" as const,
      updatedAt: "2030-01-02T00:00:00.000Z",
    };
    const publishEvent = vi
      .fn<DashboardApiClient["publishEvent"]>()
      .mockRejectedValueOnce(
        new ApiClientError(409, {
          error: {
            code: "CONFLICT",
            message: "Event changed since publishing readiness was checked",
            requestId: "publish-conflict-request",
          },
        }),
      )
      .mockResolvedValueOnce({ event: publishedEvent });

    renderWithAuth({
      getEvent: vi.fn(async () => ({ access: ownerAccess, event: draftEvent })),
      getEventPublishingReadiness: vi.fn(async () => ({ readiness: readyReadiness })),
      getEventSummary: vi.fn(async () => ({ summary: overviewSummary })),
      listEventActivity: vi.fn(async () => ({ activity: [] })),
      publishEvent,
    });

    await screen.findByText("Spring Dinner");
    await user.click(screen.getByRole("button", { name: "Edit event" }));
    expect(await screen.findByRole("dialog", { name: "Edit Spring Dinner" })).toBeTruthy();
    await user.keyboard("{Escape}");

    await user.click(screen.getByRole("button", { name: "Publish event" }));
    const publishDialog = within(
      await screen.findByRole("dialog", { name: "Publish this invitation?" }),
    );

    expect(publishDialog.getByText(readyReadiness.publicUrl)).toBeTruthy();
    expect(publishDialog.getByText("Open for guest responses")).toBeTruthy();
    expect(publishDialog.getByText("Premium · System")).toBeTruthy();

    await user.click(publishDialog.getByRole("button", { name: "Publish event" }));
    expect((await publishDialog.findByRole("alert")).textContent).toContain(
      "This event changed after readiness was checked",
    );

    await user.click(publishDialog.getByRole("button", { name: "Publish event" }));

    expect(publishEvent).toHaveBeenCalledTimes(2);
    expect(await screen.findByText("Your invitation is live")).toBeTruthy();
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
    signUp: async () => ({ ok: true, requiresEmailConfirmation: false }),
    status: "authenticated",
    updateProfile: async () => ({ ok: true }),
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

const draftEvent: Event = {
  ...overviewEvent,
  status: "draft",
};

const ownerAccess = {
  eventId: "evt_123",
  role: "owner" as const,
  userId: "user_123",
};

const readyReadiness: EventPublishingReadiness = {
  blockers: [],
  eventUpdatedAt: overviewEvent.updatedAt,
  issues: [],
  publicUrl: "https://invite.example.test/e/spring-dinner",
  ready: true,
  rsvpStatus: "open",
  status: "published",
  theme: {
    id: "premium",
    mode: "system",
    name: "Premium",
  },
  updatePolicy: "immediate",
  warnings: [],
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
