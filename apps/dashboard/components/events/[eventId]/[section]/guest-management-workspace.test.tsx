// @vitest-environment jsdom

import type { Event, GuestGroup } from "@lumiere/types";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
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
    window.history.replaceState({}, "", "/events/evt_123/guests");
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: undefined,
    });
  });

  it("filters by searchable guest data, status, and sort direction while updating the URL", async () => {
    const user = userEvent.setup();
    const guestGroups: GuestGroup[] = [
      {
        ...guestGroup,
        contactEmail: "tan@example.com",
        createdAt: "2030-01-01T00:00:00.000Z",
        id: "guest_tan",
        label: "Tan Family",
        members: [{ id: "member_tan", name: "Mina Tan", sortOrder: 0 }],
      },
      {
        ...guestGroup,
        contactEmail: "lee@example.com",
        contactName: "Jordan Lee",
        createdAt: "2030-03-01T00:00:00.000Z",
        id: "guest_lee",
        label: "Lee Family",
        maxPax: 2,
        status: "responded",
      },
      {
        ...guestGroup,
        contactEmail: "mina@example.com",
        contactName: "Alex Tan",
        createdAt: "2030-02-01T00:00:00.000Z",
        id: "guest_mina",
        label: "Mina and Alex",
        maxPax: 3,
        members: [{ id: "member_mina", name: "Alex Tan", sortOrder: 0 }],
        status: "responded",
      },
    ];

    renderWithAuth(
      createApiClientStub({
        listGuestGroups: vi.fn(async () => ({ guestGroups })),
      }),
    );

    await screen.findByText("Tan Family");
    await user.type(screen.getByLabelText("Search guest groups"), "mina");

    expect(screen.getByText("Tan Family")).toBeTruthy();
    expect(screen.getByText("Mina and Alex")).toBeTruthy();
    expect(screen.queryByText("Lee Family")).toBeNull();
    expect(window.location.search).toBe("?q=mina");

    await user.click(screen.getByLabelText("Status filter"));
    await user.click(await screen.findByRole("option", { name: "Responded" }));
    expect(screen.queryByText("Tan Family")).toBeNull();
    expect(window.location.search).toBe("?q=mina&status=responded");

    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    await user.click(screen.getByLabelText("Sort by"));
    await user.click(await screen.findByRole("option", { name: "Max pax" }));
    await user.click(screen.getByLabelText("Sort direction"));
    await user.click(await screen.findByRole("option", { name: "Oldest / lowest first" }));

    const groupResults = within(screen.getByRole("region", { name: "Guest groups" }));
    expect(
      groupResults.getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent),
    ).toEqual(["Lee Family", "Mina and Alex", "Tan Family"]);
    expect(window.location.search).toBe("?sort=maxPax&direction=asc");
  });

  it("restores URL filters and exposes an accessible no-results clear state", async () => {
    const user = userEvent.setup();
    window.history.replaceState(
      {},
      "",
      "/events/evt_123/guests?q=unknown&status=responded&sort=maxPax&direction=asc",
    );

    renderWithAuth(createApiClientStub());

    await screen.findByText("No guest groups match these filters");
    expect((screen.getByLabelText("Search guest groups") as HTMLInputElement).value).toBe(
      "unknown",
    );
    const noResults = screen.getByRole("status", { name: "Guest group results" });
    expect(within(noResults).getByRole("button", { name: "Clear filters" })).toBeTruthy();

    await user.click(within(noResults).getByRole("button", { name: "Clear filters" }));

    expect(await screen.findByText("Tan Family")).toBeTruthy();
    expect(window.location.search).toBe("");
  });

  it("downloads the current search and status filters for view-only managers", async () => {
    const user = userEvent.setup();
    const downloadGuestData = vi.fn(async () => ({
      blob: new Blob(["guest export"], { type: "text/csv" }),
      filename: "spring-dinner-guest-data-2030-01-01.csv",
    }));
    const createObjectURL = vi.fn(() => "blob:guest-export");
    const revokeObjectURL = vi.fn();
    const clickDownload = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);
    Object.defineProperties(URL, {
      createObjectURL: { configurable: true, value: createObjectURL },
      revokeObjectURL: { configurable: true, value: revokeObjectURL },
    });
    window.history.replaceState(
      {},
      "",
      "/events/evt_123/guests?q=tan&status=responded&sort=maxPax",
    );

    renderWithAuth(
      createApiClientStub({
        downloadGuestData,
        getEvent: vi.fn(async () => ({
          access: { ...ownerAccess, role: "viewer" as const },
          event: dashboardEvent,
        })),
        listGuestGroups: vi.fn(async () => ({
          guestGroups: [{ ...guestGroup, status: "responded" as const }],
        })),
      }),
    );

    await screen.findByText("Tan Family");
    expect(screen.queryByRole("button", { name: "New guest group" })).toBeNull();
    await user.click(screen.getByRole("button", { name: "Export" }));

    expect(screen.getByRole("heading", { name: "Export guest data" })).toBeTruthy();
    expect(
      screen
        .getByRole("button", { name: "Current search and status filters (1)" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    await user.click(screen.getByRole("button", { name: "Download CSV" }));

    await waitFor(() =>
      expect(downloadGuestData).toHaveBeenCalledWith("evt_123", {
        format: "csv",
        q: "tan",
        scope: "filtered",
        status: "responded",
      }),
    );
    expect(clickDownload).toHaveBeenCalledOnce();
    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:guest-export");
    expect(
      await screen.findByText("spring-dinner-guest-data-2030-01-01.csv is ready."),
    ).toBeTruthy();
  });

  it("switches between detail cards and a URL-persisted compact list with shared actions", async () => {
    const user = userEvent.setup();

    renderWithAuth(createApiClientStub());

    await screen.findByText("Tan Family");
    expect(screen.getByRole("button", { name: "Compact list view" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Edit Tan Family" })).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Compact list view" }));

    expect(window.location.search).toBe("?view=list");
    expect(screen.getAllByText("Last opened").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Edit Tan Family" })).toBeTruthy();
    expect(screen.getByText("tan-code")).toBeTruthy();

    cleanup();
    renderWithAuth(createApiClientStub());
    expect((await screen.findAllByText("Last opened")).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Compact list view" })).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Card view" }));
    expect(window.location.search).toBe("");
    expect(screen.queryByText("Last opened")).toBeNull();
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
    await user.click(screen.getByRole("button", { name: "New guest group" }));
    expect(await screen.findByRole("dialog", { name: "Create guest group" })).toBeTruthy();
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
    await user.click(screen.getByRole("button", { name: "New guest group" }));
    await screen.findByRole("dialog", { name: "Create guest group" });
    await user.type(screen.getByLabelText("Group label"), "New Table");
    await user.type(screen.getByLabelText("Member 1"), "Mina Tan");
    await user.type(screen.getByLabelText("Member 2"), "Alex Tan");
    await user.click(screen.getByRole("button", { name: "Create guest group" }));

    await waitFor(() => expect(createGuestGroup).toHaveBeenCalledTimes(1));
    expect(createGuestGroup).toHaveBeenCalledWith(
      "evt_123",
      expect.objectContaining({
        members: [{ name: "Mina Tan" }, { name: "Alex Tan" }],
      }),
    );
    expect(await screen.findByDisplayValue(inviteLink)).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Copy link" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(inviteLink));
    expect(await screen.findByText("New Table invite link copied.")).toBeTruthy();
  });

  it("opens active invite links safely from cards and the compact list", async () => {
    const user = userEvent.setup();
    const inviteLink = "https://invite.lumiere.test/e/spring-dinner/g/active-token";
    const openWindow = vi.spyOn(window, "open").mockImplementation(() => ({}) as Window);

    renderWithAuth(
      createApiClientStub({
        listGuestGroups: vi.fn(async () => ({ guestGroups: [{ ...guestGroup, inviteLink }] })),
      }),
    );

    await screen.findByText("Tan Family");
    await user.click(screen.getByRole("button", { name: "Open link" }));
    expect(openWindow).toHaveBeenCalledWith(inviteLink, "_blank", "noopener,noreferrer");
    expect(await screen.findByText("Tan Family invite link opened.")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Compact list view" }));
    await user.click(screen.getByRole("button", { name: "Open link" }));
    expect(openWindow).toHaveBeenCalledTimes(2);
  });

  it("keeps open unavailable for disabled and legacy guest groups", async () => {
    const user = userEvent.setup();
    const legacyGroup: GuestGroup = {
      ...guestGroup,
      id: "guest_legacy",
      label: "Legacy Family",
    };
    const disabledGroup: GuestGroup = {
      ...guestGroup,
      id: "guest_disabled",
      inviteLink: "https://invite.lumiere.test/e/spring-dinner/g/disabled-token",
      label: "Disabled Family",
      status: "disabled",
    };

    renderWithAuth(
      createApiClientStub({
        listGuestGroups: vi.fn(async () => ({ guestGroups: [legacyGroup, disabledGroup] })),
      }),
    );

    await screen.findByText("Legacy Family");
    expect(screen.queryByRole("button", { name: "Open link" })).toBeNull();
    expect(screen.getByText(/Full URL unavailable for this older invite/)).toBeTruthy();
    expect(screen.getByText("Invite access is disabled for this group.")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Compact list view" }));
    expect(screen.queryByRole("button", { name: "Open link" })).toBeNull();
    expect(screen.getByText(/Full URL unavailable\. Regenerate this group/)).toBeTruthy();
  });

  it("migrates a legacy contact into automatic member fields while editing", async () => {
    const user = userEvent.setup();
    const updatedGroup: GuestGroup = {
      ...guestGroup,
      maxPax: 5,
      members: [
        { id: "member_1", name: "Mina Tan", sortOrder: 0 },
        { id: "member_2", name: "Alex Tan", sortOrder: 1 },
        { id: "member_3", name: "Jamie Tan", sortOrder: 2 },
        { id: "member_4", name: "Nora Tan", sortOrder: 3 },
        { id: "member_5", name: "Sam Tan", sortOrder: 4 },
      ],
      notes: "Seat near the stage.",
      status: "opened",
    };
    const updateGuestGroup = vi.fn<DashboardApiClient["updateGuestGroup"]>(async () => ({
      guestGroup: updatedGroup,
    }));

    renderWithAuth(
      createApiClientStub({
        listGuestGroups: vi.fn(async () => ({ guestGroups: [guestGroup] })),
        updateGuestGroup,
      }),
    );

    await screen.findByText("Tan Family");
    const editTrigger = screen.getByRole("button", { name: "Edit Tan Family" });
    await user.click(editTrigger);
    expect(await screen.findByRole("dialog", { name: "Edit Tan Family" })).toBeTruthy();
    expect(screen.queryByLabelText("Guest names / contact (legacy)")).toBeNull();
    expect((screen.getByLabelText("Member 1") as HTMLInputElement).value).toBe("Mina Tan");

    await user.clear(screen.getByLabelText("Max pax"));
    await user.type(screen.getByLabelText("Max pax"), "5");
    await user.type(screen.getByLabelText("Member 2"), "Alex Tan");
    await user.type(screen.getByLabelText("Member 3"), "Jamie Tan");
    await user.type(screen.getByLabelText("Member 4"), "Nora Tan");
    await user.type(screen.getByLabelText("Member 5"), "Sam Tan");
    await user.clear(screen.getByLabelText("Notes"));
    await user.type(screen.getByLabelText("Notes"), "Seat near the stage.");
    await user.click(screen.getByLabelText("Invite status"));
    await user.click(await screen.findByRole("option", { name: "Opened" }));
    await user.click(screen.getByRole("button", { name: "Save guest group" }));

    await waitFor(() =>
      expect(updateGuestGroup).toHaveBeenCalledWith(
        "evt_123",
        "guest_1",
        expect.objectContaining({
          contactName: "Mina Tan",
          maxPax: 5,
          members: [
            { name: "Mina Tan" },
            { name: "Alex Tan" },
            { name: "Jamie Tan" },
            { name: "Nora Tan" },
            { name: "Sam Tan" },
          ],
          notes: "Seat near the stage.",
          status: "opened",
        }),
      ),
    );
    expect(await screen.findByText("Tan Family updated.")).toBeTruthy();
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(document.activeElement).toBe(editTrigger);
  });

  it("automatically matches member fields to max pax without manual controls", async () => {
    const user = userEvent.setup();
    const updateGuestGroup = vi.fn<DashboardApiClient["updateGuestGroup"]>(async () => ({
      guestGroup: {
        ...guestGroup,
        members: [
          { id: "member_1", name: "Mina Tan", sortOrder: 0 },
          { id: "member_2", name: "Alex Tan", sortOrder: 1 },
          { id: "member_3", name: "Jamie Tan", sortOrder: 2 },
        ],
        maxPax: 3,
      },
    }));
    const structuredGroup: GuestGroup = {
      ...guestGroup,
      maxPax: 2,
      members: [
        { id: "member_1", name: "Mina Tan", sortOrder: 0 },
        { id: "member_2", name: "Alex Tan", sortOrder: 1 },
      ],
    };

    renderWithAuth(
      createApiClientStub({
        listGuestGroups: vi.fn(async () => ({ guestGroups: [structuredGroup] })),
        updateGuestGroup,
      }),
    );

    await screen.findByText("Mina Tan · Alex Tan");
    await user.click(screen.getByRole("button", { name: "Edit Tan Family" }));
    await screen.findByRole("dialog", { name: "Edit Tan Family" });

    expect(screen.queryByRole("button", { name: "Add member" })).toBeNull();
    expect(screen.queryByRole("button", { name: /Move .* (up|down)/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /Remove/ })).toBeNull();

    await user.clear(screen.getByLabelText("Max pax"));
    await user.type(screen.getByLabelText("Max pax"), "4");
    await user.type(screen.getByLabelText("Member 3"), "Jamie Tan");
    await user.type(screen.getByLabelText("Member 4"), "Nora Tan");

    await user.clear(screen.getByLabelText("Max pax"));
    await user.type(screen.getByLabelText("Max pax"), "3");
    expect(screen.queryByLabelText("Member 4")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Save guest group" }));

    await waitFor(() =>
      expect(updateGuestGroup).toHaveBeenCalledWith(
        "evt_123",
        "guest_1",
        expect.objectContaining({
          members: [
            { id: "member_1", name: "Mina Tan" },
            { id: "member_2", name: "Alex Tan" },
            { name: "Jamie Tan" },
          ],
          maxPax: 3,
        }),
      ),
    );
  });

  it("shows inline validation for blank and duplicate member rows", async () => {
    const user = userEvent.setup();
    const createGuestGroup = vi.fn<DashboardApiClient["createGuestGroup"]>();

    renderWithAuth(
      createApiClientStub({
        createGuestGroup,
        listGuestGroups: vi.fn(async () => ({ guestGroups: [] })),
      }),
    );

    await screen.findByText("No guest groups yet");
    await user.click(screen.getByRole("button", { name: "New guest group" }));
    await screen.findByRole("dialog", { name: "Create guest group" });
    await user.type(screen.getByLabelText("Group label"), "Family table");
    await user.type(screen.getByLabelText("Member 1"), "Mina Tan");
    await user.type(screen.getByLabelText("Member 2"), " mina tan ");
    await user.click(screen.getByRole("button", { name: "Create guest group" }));

    expect(createGuestGroup).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Member 2").getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByText("Member name duplicates row 1")).toBeTruthy();
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
    createGuestGroup: vi.fn(),
    disableGuestGroup: vi.fn(),
    downloadGuestData: vi.fn(),
    getEvent: vi.fn(async () => ({ access: ownerAccess, event: dashboardEvent })),
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
