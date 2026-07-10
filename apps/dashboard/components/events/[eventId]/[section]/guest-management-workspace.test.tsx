// @vitest-environment jsdom

import type { Event, GuestGroup } from "@lumiere/types";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DashboardAuthProvider,
  type DashboardApiClient,
  type DashboardAuthContextValue,
} from "../../../../auth/dashboard-auth-provider";
import { GuestManagementWorkspace } from "./guest-management-workspace";

describe("GuestManagementWorkspace", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: undefined,
    });
  });

  it("loads guest groups across dashboard states", async () => {
    const guestGroups: GuestGroup[] = [
      guestGroup,
      {
        ...guestGroup,
        id: "guest_2",
        inviteCode: "opened-code",
        label: "Lee Family",
        status: "opened",
      },
      {
        ...guestGroup,
        id: "guest_3",
        inviteCode: "responded-code",
        label: "Mina and Alex",
        status: "responded",
      },
      {
        ...guestGroup,
        id: "guest_4",
        inviteCode: "disabled-code",
        label: "Old Vendor List",
        status: "disabled",
      },
    ];

    renderWithAuth(
      createApiClientStub({
        listGuestGroups: vi.fn(async () => ({
          guestGroups,
        })),
      }),
    );

    expect(screen.getByLabelText("Loading guest groups")).toBeTruthy();
    expect(await screen.findByText("Manage invites for Spring Dinner")).toBeTruthy();
    expect(screen.getByText("Tan Family")).toBeTruthy();
    expect(screen.getByText("Lee Family")).toBeTruthy();
    expect(screen.getByText("Mina and Alex")).toBeTruthy();
    expect(screen.getByText("Old Vendor List")).toBeTruthy();
    expect(screen.getAllByText("Pending").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Opened").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Responded").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Disabled").length).toBeGreaterThan(0);
  });

  it("validates label and max pax before creating", async () => {
    const user = userEvent.setup();
    const createGuestGroup = vi.fn<DashboardApiClient["createGuestGroup"]>();

    renderWithAuth(
      createApiClientStub({
        createGuestGroup,
        listGuestGroups: vi.fn(async () => ({ guestGroups: [] })),
      }),
    );

    await screen.findByText("No guest groups yet");
    await user.clear(screen.getByLabelText("Max pax"));
    await user.type(screen.getByLabelText("Max pax"), "0");
    await user.click(screen.getByRole("button", { name: "Create guest group" }));

    expect(createGuestGroup).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Group label").getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByLabelText("Max pax").getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByLabelText("Group label").getAttribute("aria-describedby")).toBe(
      "guest-group-label-error",
    );
    expect(screen.getByLabelText("Max pax").getAttribute("aria-describedby")).toBe(
      "guest-max-pax-error",
    );
  });

  it("creates a guest group and copies the fresh invite link", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn(async () => undefined);
    const inviteLink = "https://invite.lumiere.test/e/spring-dinner/g/fresh-token";
    const createdGuestGroup = {
      ...guestGroup,
      id: "guest_created",
      inviteCode: "created-code",
      label: "New Table",
    };
    const createGuestGroup = vi.fn<DashboardApiClient["createGuestGroup"]>(async () => ({
      guestGroup: createdGuestGroup,
      inviteLink,
    }));

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText,
      },
    });

    renderWithAuth(
      createApiClientStub({
        createGuestGroup,
        listGuestGroups: vi.fn(async () => ({ guestGroups: [] })),
      }),
    );

    await screen.findByText("No guest groups yet");
    await user.type(screen.getByLabelText("Group label"), "New Table");
    await user.click(screen.getByRole("button", { name: "Create guest group" }));

    await waitFor(() => expect(createGuestGroup).toHaveBeenCalledTimes(1));
    expect(await screen.findByDisplayValue(inviteLink)).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Copy link" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(inviteLink));
    expect(await screen.findByText("New Table invite link copied.")).toBeTruthy();
  });

  it("confirms before regenerating an invite link", async () => {
    const user = userEvent.setup();
    const inviteLink = "https://invite.lumiere.test/e/spring-dinner/g/reissued-token";
    const regenerateGuestGroupInvite = vi.fn<DashboardApiClient["regenerateGuestGroupInvite"]>(
      async () => ({
        guestGroup: {
          ...guestGroup,
          inviteCode: "reissued-code",
        },
        inviteLink,
      }),
    );

    renderWithAuth(
      createApiClientStub({
        listGuestGroups: vi.fn(async () => ({ guestGroups: [guestGroup] })),
        regenerateGuestGroupInvite,
      }),
    );

    await screen.findByText("Tan Family");
    await user.click(screen.getByRole("button", { name: "Regenerate link" }));

    expect(regenerateGuestGroupInvite).not.toHaveBeenCalled();
    expect(screen.getByText("Regenerate this invite link?")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Confirm regenerate" }));

    await waitFor(() =>
      expect(regenerateGuestGroupInvite).toHaveBeenCalledWith("evt_123", "guest_1"),
    );
    expect(await screen.findByDisplayValue(inviteLink)).toBeTruthy();
  });

  it("disables guest groups instead of deleting them", async () => {
    const user = userEvent.setup();
    const disableGuestGroup = vi.fn<DashboardApiClient["disableGuestGroup"]>(async () => ({
      guestGroup: {
        ...guestGroup,
        status: "disabled",
      },
    }));

    renderWithAuth(
      createApiClientStub({
        disableGuestGroup,
        listGuestGroups: vi.fn(async () => ({ guestGroups: [guestGroup] })),
      }),
    );

    await screen.findByText("Tan Family");
    await user.click(screen.getByRole("button", { name: "Disable" }));

    expect(disableGuestGroup).not.toHaveBeenCalled();
    expect(screen.getByText("Disable this guest group?")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Confirm disable" }));

    await waitFor(() => expect(disableGuestGroup).toHaveBeenCalledWith("evt_123", "guest_1"));
    expect(await screen.findByText(/Existing invite access is blocked/)).toBeTruthy();
    expect(screen.getAllByText("Disabled").length).toBeGreaterThan(0);
  });
});

function renderWithAuth(apiClient: Partial<DashboardApiClient>) {
  return render(
    <DashboardAuthProvider value={createAuthValue(apiClient)}>
      <GuestManagementWorkspace eventId="evt_123" />
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

function createApiClientStub(
  overrides: Partial<DashboardApiClient> = {},
): Partial<DashboardApiClient> {
  return {
    createGuestGroup: vi.fn(),
    disableGuestGroup: vi.fn(),
    getEvent: vi.fn(async () => ({ event: dashboardEvent })),
    listGuestGroups: vi.fn(async () => ({ guestGroups: [guestGroup] })),
    regenerateGuestGroupInvite: vi.fn(),
    updateGuestGroup: vi.fn(),
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

const guestGroup: GuestGroup = {
  contactEmail: "tan@example.com",
  contactName: "Mina Tan",
  createdAt: "2030-01-01T00:00:00.000Z",
  eventId: "evt_123",
  id: "guest_1",
  inviteCode: "tan-code",
  label: "Tan Family",
  maxPax: 4,
  notes: "Seat near family.",
  status: "pending",
  updatedAt: "2030-01-01T00:00:00.000Z",
};
