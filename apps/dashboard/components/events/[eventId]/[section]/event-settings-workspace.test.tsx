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
      title: "Summer Dinner",
      updatedAt: "2030-01-01T01:00:00.000Z",
    };
    const updateEvent = vi.fn<DashboardApiClient["updateEvent"]>(async () => ({
      event: updatedEvent,
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
    expect(screen.queryByLabelText("Publish status")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Save event" }));

    await waitFor(() => expect(updateEvent).toHaveBeenCalledTimes(1));
    expect(updateEvent).toHaveBeenCalledWith(
      "evt_123",
      expect.objectContaining({
        eventType: "dinner",
        title: "Summer Dinner",
      }),
    );
    expect(updateEvent.mock.calls[0]?.[1]).not.toHaveProperty("status");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(screen.getAllByText("Summer Dinner").length).toBeGreaterThan(0);

    expect(updateEvent).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Delete event" }));
    const deleteDialog = await screen.findByRole("dialog", { name: "Delete Summer Dinner" });
    const confirmation = screen.getByLabelText(/Type Summer Dinner to confirm/);
    const deleteAction = screen.getAllByRole("button", { name: "Delete event" }).at(-1) as
      HTMLButtonElement | undefined;

    expect(deleteDialog).toBeTruthy();
    expect(deleteDialog.textContent).toContain(
      "public invitation, guest links, and RSVP submission",
    );
    expect(deleteAction?.disabled).toBe(true);
    await user.type(confirmation, "summer dinner");
    expect(deleteAction?.disabled).toBe(true);
    await user.clear(confirmation);
    await user.type(confirmation, "Summer Dinner");
    expect(deleteAction?.disabled).toBe(false);
    await user.click(screen.getByRole("button", { name: "Keep event" }));
    expect(
      await screen.findByRole("alertdialog", { name: "Discard unsaved changes?" }),
    ).toBeTruthy();
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
