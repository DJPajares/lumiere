// @vitest-environment jsdom

import type { Event } from "@lumiere/types";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DashboardAuthProvider,
  type DashboardApiClient,
  type DashboardAuthContextValue,
} from "../../../../auth/dashboard-auth-provider";
import { EventSettingsWorkspace } from "./event-settings-workspace";

describe("EventSettingsWorkspace", () => {
  afterEach(() => {
    cleanup();
  });

  it("loads event basics and saves workspace edits", async () => {
    const user = userEvent.setup();
    const updatedEvent: Event = {
      ...settingsEvent,
      eventType: "dinner",
      status: "published",
      title: "Summer Dinner",
      updatedAt: "2030-01-01T01:00:00.000Z",
    };
    const updateEvent = vi.fn<DashboardApiClient["updateEvent"]>(async (_eventId, input) => ({
      event: input.rsvpSettings
        ? {
            ...updatedEvent,
            rsvpSettings: {
              ...updatedEvent.rsvpSettings,
              collectGuestMessage:
                input.rsvpSettings.collectGuestMessage ??
                updatedEvent.rsvpSettings.collectGuestMessage,
              collectGuestNames:
                input.rsvpSettings.collectGuestNames ?? updatedEvent.rsvpSettings.collectGuestNames,
            },
          }
        : updatedEvent,
    }));

    renderWithAuth({
      getEvent: vi.fn(async () => ({ event: settingsEvent })),
      updateEvent,
    });

    expect(screen.getByLabelText("Loading event settings")).toBeTruthy();
    expect(await screen.findByText("Event settings")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Edit event details" }));
    expect(await screen.findByRole("dialog", { name: "Edit Spring Dinner" })).toBeTruthy();

    await user.clear(screen.getByLabelText("Event title"));
    await user.type(screen.getByLabelText("Event title"), "Summer Dinner");
    screen.getByLabelText("Event type").focus();
    await user.keyboard("{ArrowDown}");
    await user.click(screen.getByRole("option", { name: "Dinner" }));
    screen.getByLabelText("Publish status").focus();
    await user.keyboard("{ArrowDown}");
    await user.click(screen.getByRole("option", { name: "Published" }));
    await user.click(screen.getByRole("button", { name: "Save event" }));

    await waitFor(() => expect(updateEvent).toHaveBeenCalledTimes(1));
    expect(updateEvent).toHaveBeenCalledWith(
      "evt_123",
      expect.objectContaining({
        eventType: "dinner",
        status: "published",
        title: "Summer Dinner",
      }),
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(screen.getAllByText("Summer Dinner").length).toBeGreaterThan(0);

    await user.click(screen.getByRole("switch", { name: /Collect a guest message/ }));
    await user.click(screen.getByRole("button", { name: "Save RSVP fields" }));

    await waitFor(() => expect(updateEvent).toHaveBeenCalledTimes(2));
    expect(updateEvent).toHaveBeenLastCalledWith("evt_123", {
      rsvpSettings: {
        collectGuestMessage: false,
        collectGuestNames: true,
      },
    });
    expect(screen.getByText(/Previously submitted names and messages stay retained/)).toBeTruthy();
  });

  it("keeps edits visible when saving settings fails", async () => {
    const user = userEvent.setup();

    renderWithAuth({
      getEvent: vi.fn(async () => ({ event: settingsEvent })),
      updateEvent: vi.fn(async () => {
        throw new Error("Unable to save event settings.");
      }),
    });

    await screen.findByText("Event settings");
    await user.click(screen.getByRole("button", { name: "Edit event details" }));
    await screen.findByRole("dialog", { name: "Edit Spring Dinner" });
    await user.clear(screen.getByLabelText("Event title"));
    await user.type(screen.getByLabelText("Event title"), "Summer Dinner");
    await user.click(screen.getByRole("button", { name: "Save event" }));

    expect(await screen.findByText("Unable to save event settings.")).toBeTruthy();
    expect(screen.getByDisplayValue("Summer Dinner")).toBeTruthy();
    expect(screen.getByText("Unsaved changes")).toBeTruthy();
  });
});

function renderWithAuth(apiClient: Partial<DashboardApiClient>) {
  return render(
    <DashboardAuthProvider value={createAuthValue(apiClient)}>
      <EventSettingsWorkspace eventId="evt_123" />
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
    updateProfile: async () => ({ ok: true }),
    user: {
      email: "manager@example.com",
    } as DashboardAuthContextValue["user"],
  };
}

const settingsEvent: Event = {
  createdAt: "2030-01-01T00:00:00.000Z",
  eventType: "private_event",
  id: "evt_123",
  ownerUserId: "user_123",
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
  updatedAt: "2030-01-01T00:00:00.000Z",
  venueAddress: "12 Orchard Road",
  venueName: "Glass Hall",
};
