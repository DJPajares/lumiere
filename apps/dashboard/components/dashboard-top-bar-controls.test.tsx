// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Notification } from "@lumiere/types";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import {
  DashboardAuthProvider,
  type DashboardApiClient,
  type DashboardAuthContextValue,
} from "../auth/dashboard-auth-provider";
import { DashboardTopBarControls, getManagerIdentity } from "./dashboard-top-bar-controls";

const { routerPush, routerRefresh, routerReplace, toastError, toastSuccess } = vi.hoisted(() => ({
  routerPush: vi.fn(),
  routerRefresh: vi.fn(),
  routerReplace: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: routerPush,
    refresh: routerRefresh,
    replace: routerReplace,
  }),
}));

vi.mock("@lumiere/dashboard-ui/components/sonner", () => ({
  toast: {
    error: toastError,
    success: toastSuccess,
  },
}));

describe("DashboardTopBarControls", () => {
  beforeAll(() => {
    Element.prototype.scrollIntoView ??= vi.fn();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("derives deterministic avatar metadata and renders the fallback", async () => {
    const user = createUser({
      email: "marie.curie@example.test",
      user_metadata: {},
    });

    expect(getManagerIdentity(user)).toEqual({
      displayName: "Lumiere manager",
      email: "marie.curie@example.test",
      initials: "MC",
    });

    renderControls({ user });

    expect(screen.getByText("MC")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Open account menu for Lumiere manager" }),
    ).toBeTruthy();
  });

  it("uses the manager image metadata and exposes live account actions", async () => {
    const userEventController = userEvent.setup();
    const manager = createUser({
      email: "alicia@example.test",
      user_metadata: {
        avatar_url: "https://images.example.test/alicia.jpg",
        full_name: "Alicia Marie Tan",
      },
    });

    renderControls({ user: manager });

    expect(getManagerIdentity(manager)).toEqual({
      avatarUrl: "https://images.example.test/alicia.jpg",
      displayName: "Alicia Marie Tan",
      email: "alicia@example.test",
      initials: "AT",
    });

    const accountTrigger = screen.getByRole("button", {
      name: "Open account menu for Alicia Marie Tan",
    });
    accountTrigger.focus();
    fireEvent.mouseDown(accountTrigger);

    expect(await screen.findByText("alicia@example.test")).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: "Edit profile" }).getAttribute("href")).toBe(
      "/settings/profile",
    );
    expect(screen.getByRole("menuitem", { name: "Account settings" }).getAttribute("href")).toBe(
      "/settings",
    );

    await userEventController.keyboard("{Escape}");
    expect(document.activeElement).toBe(accountTrigger);
  });

  it("shows notification loading, unread count, and persistent dismissal", async () => {
    const userEventController = userEvent.setup();
    const request = createDeferred<{ notifications: Notification[] }>();
    const dismissEventNotification = vi.fn<DashboardApiClient["dismissEventNotification"]>(
      async () => ({ dismissed: true }),
    );
    const listEventNotifications = vi.fn<DashboardApiClient["listEventNotifications"]>(
      () => request.promise,
    );

    renderControls({ dismissEventNotification, eventId: "event-42", listEventNotifications });

    await userEventController.click(screen.getByRole("button", { name: "Notifications" }));
    expect(screen.getByLabelText("Loading notifications")).toBeTruthy();

    await act(async () => {
      request.resolve({ notifications: [unreadNotification, readNotification] });
      await request.promise;
    });

    const notificationTrigger = screen.getByRole("button", {
      name: "Notifications, 1 unread",
    });
    expect(notificationTrigger).toBeTruthy();
    expect(screen.getByText("New RSVP received")).toBeTruthy();
    expect(screen.getByText("Invite opened")).toBeTruthy();
    expect(screen.getAllByLabelText("Unread")).toHaveLength(1);
    expect(listEventNotifications).toHaveBeenCalledWith("event-42");

    await userEventController.click(
      screen.getByRole("button", { name: "Dismiss notification: New RSVP received" }),
    );

    expect(dismissEventNotification).toHaveBeenCalledWith("event-42", "notification-1");
    expect(screen.queryByText("New RSVP received")).toBeNull();
    expect(screen.getByRole("button", { name: "Notifications" })).toBeTruthy();

    await userEventController.keyboard("{Escape}");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Notifications" }));
  });

  it("marks an unread notification read before navigating to its safe destination", async () => {
    const userEventController = userEvent.setup();
    const markEventNotificationRead = vi.fn<DashboardApiClient["markEventNotificationRead"]>(
      async () => ({
        notification: {
          ...unreadNotification,
          readAt: "2026-07-10T09:31:00.000Z",
        },
      }),
    );

    renderControls({ eventId: "event-42", markEventNotificationRead });
    await userEventController.click(screen.getByRole("button", { name: "Notifications" }));
    await userEventController.click(
      screen.getByRole("button", { name: "Open notification: New RSVP received" }),
    );

    expect(markEventNotificationRead).toHaveBeenCalledWith("event-42", "notification-1");
    expect(routerPush).toHaveBeenCalledWith(
      "/events/event-42/responses?guestGroupId=guest-group-1&responseId=response-1",
    );
    expect(screen.getByRole("button", { name: "Notifications" })).toBeTruthy();
  });

  it("restores a dismissed notification when the mutation fails", async () => {
    const userEventController = userEvent.setup();
    const dismissEventNotification = vi
      .fn<DashboardApiClient["dismissEventNotification"]>()
      .mockRejectedValue(new Error("Notification service timed out."));
    const listEventNotifications = vi.fn<DashboardApiClient["listEventNotifications"]>(
      async () => ({
        notifications: [unreadNotification],
      }),
    );

    renderControls({ dismissEventNotification, eventId: "event-42", listEventNotifications });
    await userEventController.click(screen.getByRole("button", { name: "Notifications" }));
    await userEventController.click(
      screen.getByRole("button", { name: "Dismiss notification: New RSVP received" }),
    );

    expect(await screen.findByText("New RSVP received")).toBeTruthy();
    expect(toastError.mock.calls[0]?.[0]).toBe("Notification service timed out.");
  });

  it("marks all visible unread notifications read and updates the bell count", async () => {
    const userEventController = userEvent.setup();
    const markAllEventNotificationsRead = vi.fn<
      DashboardApiClient["markAllEventNotificationsRead"]
    >(async () => ({ updatedCount: 1 }));

    renderControls({ eventId: "event-42", markAllEventNotificationsRead });
    await userEventController.click(screen.getByRole("button", { name: "Notifications" }));
    await userEventController.click(screen.getByRole("button", { name: "Mark all read" }));

    expect(markAllEventNotificationsRead).toHaveBeenCalledWith("event-42");
    expect(screen.getByRole("button", { name: "Notifications" })).toBeTruthy();
  });

  it("shows notification failure and retries into the empty state", async () => {
    const userEventController = userEvent.setup();
    const listEventNotifications = vi
      .fn<DashboardApiClient["listEventNotifications"]>()
      .mockRejectedValueOnce(new Error("Notification service timed out."))
      .mockResolvedValueOnce({ notifications: [] });

    renderControls({ eventId: "event-42", listEventNotifications });

    await userEventController.click(screen.getByRole("button", { name: "Notifications" }));
    expect(await screen.findByText("Unable to load notifications")).toBeTruthy();
    expect(screen.getByText("Notification service timed out.")).toBeTruthy();

    await userEventController.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("You’re all caught up")).toBeTruthy();
    expect(listEventNotifications).toHaveBeenCalledTimes(2);
  });

  it("explains the notification empty state when no event is selected", async () => {
    const userEventController = userEvent.setup();
    const listEventNotifications = vi.fn<DashboardApiClient["listEventNotifications"]>();

    renderControls({ listEventNotifications });
    await userEventController.click(screen.getByRole("button", { name: "Notifications" }));

    expect(screen.getByText("No event selected")).toBeTruthy();
    expect(screen.getByText("Choose an event to view its manager notifications.")).toBeTruthy();
    expect(listEventNotifications).not.toHaveBeenCalled();
  });

  it("keeps the account menu open and reports sign-out failure", async () => {
    const userEventController = userEvent.setup();
    const signOut = vi.fn(async () => ({
      error: "Unable to reach Supabase Auth.",
      ok: false as const,
    }));

    renderControls({ signOut });
    await openAccountMenu();
    await userEventController.click(screen.getByRole("menuitem", { name: "Sign out" }));

    expect((await screen.findByRole("alert")).textContent).toContain(
      "Unable to reach Supabase Auth.",
    );
    expect(screen.getByRole("menuitem", { name: "Sign out" })).toBeTruthy();
    expect(toastError).toHaveBeenCalledWith("Unable to reach Supabase Auth.");
    expect(routerReplace).not.toHaveBeenCalled();
  });

  it("disables sign out while pending and redirects after success", async () => {
    const userEventController = userEvent.setup();
    const request = createDeferred<{ ok: true }>();
    const signOut = vi.fn(() => request.promise);

    renderControls({ signOut });
    await openAccountMenu();
    await userEventController.click(screen.getByRole("menuitem", { name: "Sign out" }));

    expect(
      screen.getByRole("menuitem", { name: "Signing out…" }).hasAttribute("data-disabled"),
    ).toBe(true);

    await act(async () => {
      request.resolve({ ok: true });
      await request.promise;
    });

    expect(toastSuccess).toHaveBeenCalledWith("Signed out successfully.");
    expect(routerReplace).toHaveBeenCalledWith("/login");
    expect(routerRefresh).toHaveBeenCalledTimes(1);
  });
});

async function openAccountMenu() {
  const accountTrigger = screen.getByRole("button", {
    name: "Open account menu for Alicia Tan",
  });

  accountTrigger.focus();
  fireEvent.mouseDown(accountTrigger);
  await screen.findByRole("menuitem", { name: "Sign out" });
}

function renderControls({
  dismissEventNotification = vi.fn(async () => ({ dismissed: true as const })),
  eventId,
  markAllEventNotificationsRead = vi.fn(async () => ({ updatedCount: 0 })),
  markEventNotificationRead = vi.fn(async () => ({ notification: unreadNotification })),
  listEventNotifications = vi.fn(async () => ({
    notifications: eventId ? [unreadNotification, readNotification] : [],
  })),
  signOut = vi.fn(async () => ({ ok: true as const })),
  user = createUser(),
}: {
  dismissEventNotification?: DashboardApiClient["dismissEventNotification"];
  eventId?: string;
  markAllEventNotificationsRead?: DashboardApiClient["markAllEventNotificationsRead"];
  markEventNotificationRead?: DashboardApiClient["markEventNotificationRead"];
  listEventNotifications?: DashboardApiClient["listEventNotifications"];
  signOut?: DashboardAuthContextValue["signOut"];
  user?: NonNullable<DashboardAuthContextValue["user"]>;
} = {}) {
  const apiClient = {
    dismissEventNotification,
    markAllEventNotificationsRead,
    markEventNotificationRead,
    listEventNotifications,
  } as DashboardApiClient;
  const value: DashboardAuthContextValue = {
    apiClient,
    errorMessage: null,
    getAccessToken: async () => "manager-token",
    session: {
      access_token: "manager-token",
      user,
    } as DashboardAuthContextValue["session"],
    signIn: async () => ({ ok: true }),
    signOut,
    status: "authenticated",
    updateProfile: async () => ({ ok: true }),
    user,
  };

  return render(
    <DashboardAuthProvider value={value}>
      <DashboardTopBarControls eventId={eventId} />
    </DashboardAuthProvider>,
  );
}

function createUser({
  email = "alicia@example.test",
  user_metadata = { full_name: "Alicia Tan" },
}: {
  email?: string;
  user_metadata?: Record<string, unknown>;
} = {}) {
  return {
    aud: "authenticated",
    created_at: "2026-07-10T00:00:00.000Z",
    email,
    id: "manager-1",
    role: "authenticated",
    updated_at: "2026-07-10T00:00:00.000Z",
    user_metadata,
  } as NonNullable<DashboardAuthContextValue["user"]>;
}

function createDeferred<TValue>() {
  let resolve!: (value: TValue) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<TValue>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, reject, resolve };
}

const unreadNotification: Notification = {
  createdAt: "2026-07-10T09:30:00.000Z",
  eventId: "event-42",
  id: "notification-1",
  message: "The Tan family is attending with three guests.",
  metadata: {
    guestGroupId: "guest-group-1",
    responseId: "response-1",
  },
  notificationType: "rsvp_submitted",
  title: "New RSVP received",
  userId: "manager-1",
};

const readNotification: Notification = {
  createdAt: "2026-07-09T08:00:00.000Z",
  eventId: "event-42",
  id: "notification-2",
  message: "The Lee family opened their invitation.",
  metadata: {},
  notificationType: "guest_opened_invite",
  readAt: "2026-07-09T09:00:00.000Z",
  title: "Invite opened",
  userId: "manager-1",
};
