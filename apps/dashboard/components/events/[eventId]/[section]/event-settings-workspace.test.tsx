// @vitest-environment jsdom

import type { CollaboratorInvitation, Event, EventCollaborator } from "@lumiere/types";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
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
      getEvent: vi.fn(async () => ({ access: ownerAccess, event: settingsEvent })),
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
      getEvent: vi.fn(async () => ({ access: ownerAccess, event: settingsEvent })),
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

  it("lets owners invite, change, and remove collaborators from settings", async () => {
    const user = userEvent.setup();
    const inviteEventCollaborator = vi.fn<DashboardApiClient["inviteEventCollaborator"]>(
      async () => ({
        invitation: {
          ...pendingInvitation,
          email: "viewer@example.com",
          role: "viewer",
        },
      }),
    );
    const updateEventCollaboratorRole = vi.fn<DashboardApiClient["updateEventCollaboratorRole"]>(
      async () => ({
        collaborator: {
          ...editorCollaborator,
          role: "viewer",
        },
      }),
    );
    const removeEventCollaborator = vi.fn<DashboardApiClient["removeEventCollaborator"]>(
      async () => ({ removed: true }),
    );

    renderWithAuth({
      getEvent: vi.fn(async () => ({ access: ownerAccess, event: settingsEvent })),
      inviteEventCollaborator,
      listEventCollaboration: vi.fn(async () => ({
        collaborators: [ownerCollaborator, editorCollaborator],
        invitations: [pendingInvitation],
      })),
      removeEventCollaborator,
      updateEventCollaboratorRole,
    });

    expect(await screen.findByText("editor@example.com")).toBeTruthy();
    expect(screen.getByText("Event administrator")).toBeTruthy();
    expect(screen.getByText("pending@example.com")).toBeTruthy();

    screen.getByLabelText("Role for editor@example.com").focus();
    await user.keyboard("{ArrowDown}");
    await user.click(screen.getByRole("option", { name: "Viewer" }));
    const roleDialog = await screen.findByRole("alertdialog", {
      name: "Change collaborator role?",
    });
    expect(updateEventCollaboratorRole).not.toHaveBeenCalled();
    await user.click(within(roleDialog).getByRole("button", { name: "Change role" }));
    await waitFor(() =>
      expect(updateEventCollaboratorRole).toHaveBeenCalledWith(
        "evt_123",
        editorCollaborator.userId,
        { role: "viewer" },
      ),
    );

    await user.click(screen.getByRole("button", { name: "Invite collaborator" }));
    expect(await screen.findByRole("dialog", { name: "Invite collaborator" })).toBeTruthy();
    await user.type(screen.getByLabelText("Email address"), "viewer@example.com");
    screen.getByLabelText("Access role").focus();
    await user.keyboard("{ArrowDown}");
    await user.click(screen.getByRole("option", { name: "Viewer" }));
    await user.click(screen.getByRole("button", { name: "Create invitation" }));
    await waitFor(() =>
      expect(inviteEventCollaborator).toHaveBeenCalledWith("evt_123", {
        email: "viewer@example.com",
        role: "viewer",
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: "Remove editor@example.com from Spring Dinner",
      }),
    );
    expect(
      await screen.findByRole("alertdialog", { name: "Remove collaborator access?" }),
    ).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Remove access" }));
    await waitFor(() =>
      expect(removeEventCollaborator).toHaveBeenCalledWith("evt_123", editorCollaborator.userId),
    );
  });

  it("keeps collaborator and destructive controls owner-only", async () => {
    const listEventCollaboration = vi.fn<DashboardApiClient["listEventCollaboration"]>();

    renderWithAuth({
      getEvent: vi.fn(async () => ({
        access: { ...ownerAccess, role: "viewer" as const },
        event: settingsEvent,
      })),
      listEventCollaboration,
    });

    expect(await screen.findByText("Viewer access")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Edit event details" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Invite collaborator" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Delete event" })).toBeNull();
    expect(listEventCollaboration).not.toHaveBeenCalled();
  });
});

function renderWithAuth(apiClient: Partial<DashboardApiClient>) {
  const client = {
    listEventCollaboration: vi.fn(async () => ({
      collaborators: [ownerCollaborator],
      invitations: [],
    })),
    ...apiClient,
  };

  return render(
    <DashboardAuthProvider value={createAuthValue(client)}>
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
    signUp: async () => ({ ok: true, requiresEmailConfirmation: false }),
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

const ownerAccess = {
  eventId: "evt_123",
  role: "owner" as const,
  userId: "user_123",
};

const ownerCollaborator: EventCollaborator = {
  createdAt: "2030-01-01T00:00:00.000Z",
  displayName: "Olivia Owner",
  email: "owner@example.com",
  eventId: "evt_123",
  id: "manager_owner",
  role: "owner",
  userId: "user_123",
};

const editorCollaborator: EventCollaborator = {
  createdAt: "2030-01-02T00:00:00.000Z",
  displayName: "Eli Editor",
  email: "editor@example.com",
  eventId: "evt_123",
  id: "manager_editor",
  role: "editor",
  userId: "user_editor",
};

const pendingInvitation: CollaboratorInvitation = {
  createdAt: "2030-01-03T00:00:00.000Z",
  email: "pending@example.com",
  eventId: "evt_123",
  expiresAt: "2030-01-10T00:00:00.000Z",
  id: "invite_pending",
  invitedByUserId: "user_123",
  lastSentAt: "2030-01-03T00:00:00.000Z",
  role: "editor",
  sendCount: 1,
  status: "pending",
  updatedAt: "2030-01-03T00:00:00.000Z",
};
