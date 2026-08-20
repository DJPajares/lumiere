// @vitest-environment jsdom

import type { Event, EventSummary, GuestGroup, RsvpResponse } from "@lumiere/types";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DashboardAuthProvider,
  type DashboardApiClient,
  type DashboardAuthContextValue,
} from "../../../../../auth/dashboard-auth-provider";
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
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: undefined,
    });
  });

  it("filters by searchable guest data, RSVP status, and sort direction while updating the URL", async () => {
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
        listEventResponses: vi.fn(async () => ({
          responses: [
            createRsvpResponse({ guestGroupId: "guest_mina", guestNames: ["Alex Tan"] }),
            createRsvpResponse({
              attendeeCount: 0,
              guestGroupId: "guest_lee",
              responseStatus: "not_attending",
            }),
          ],
        })),
        listGuestGroups: vi.fn(async () => ({ guestGroups })),
      }),
    );

    await screen.findByText("Tan Family");
    await user.type(screen.getByLabelText("Search guests and groups"), "mina");

    expect(screen.getByText("Tan Family")).toBeTruthy();
    expect(screen.getByText("Mina and Alex")).toBeTruthy();
    expect(screen.queryByText("Lee Family")).toBeNull();
    expect(screen.getByText("Filtered results")).toBeTruthy();
    expect(window.location.search).toBe("?q=mina");

    await user.click(screen.getByRole("button", { name: /^Filters/ }));
    await user.click(await screen.findByLabelText("RSVP status"));
    await user.click(await screen.findByRole("option", { name: "Attending" }));

    expect(screen.queryByText("Tan Family")).toBeNull();
    expect(screen.getByText("Mina and Alex")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Clear filters" })).toBeNull();
    const filteredSummary = screen.getByRole("region", { name: "Filtered guest summary" });
    expect(within(filteredSummary).getByText("Total guests")).toBeTruthy();
    expect(within(filteredSummary).getByText("3")).toBeTruthy();
    expect(window.location.search).toBe("?q=mina&rsvp=attending");

    await user.click(screen.getByRole("button", { name: /^Filters/ }));
    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    await user.keyboard("{Escape}");

    await user.click(screen.getByRole("button", { name: /^Sort by/ }));
    await user.click(await screen.findByRole("menuitemradio", { name: "Name" }));
    await user.click(await screen.findByRole("menuitemradio", { name: "Ascending" }));
    await user.keyboard("{Escape}");

    const guestList = within(screen.getByRole("region", { name: "Guest list" }));
    expect(
      guestList.getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent),
    ).toEqual(["Lee Family", "Mina and Alex", "Tan Family"]);
    expect(window.location.search).toBe("?sort=name&direction=asc");
  });

  it("restores URL filters and exposes an accessible no-results clear state", async () => {
    const user = userEvent.setup();
    window.history.replaceState(
      {},
      "",
      "/events/evt_123/guests?q=unknown&rsvp=attending&sort=name&direction=asc",
    );

    renderWithAuth(createApiClientStub());

    await screen.findByText("No guest groups match these filters");
    expect((screen.getByLabelText("Search guests and groups") as HTMLInputElement).value).toBe(
      "unknown",
    );
    const noResults = screen.getByRole("status", { name: "Guest list results" });
    expect(within(noResults).getByRole("button", { name: "Clear filters" })).toBeTruthy();

    await user.click(within(noResults).getByRole("button", { name: "Clear filters" }));

    expect(await screen.findByText("Tan Family")).toBeTruthy();
    expect(window.location.search).toBe("");
  });

  it("downloads CSV and XLSX data with current filters for view-only managers", async () => {
    const user = userEvent.setup();
    const downloadGuestData = vi.fn<DashboardApiClient["downloadGuestData"]>(
      async (_eventId, input) => ({
        blob: new Blob(["guest export"], {
          type:
            input.format === "csv"
              ? "text/csv"
              : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        filename: `spring-dinner-guest-data-2030-01-01.${input.format}`,
      }),
    );
    const createObjectURL = vi.fn(() => "blob:guest-export");
    const revokeObjectURL = vi.fn();
    const clickDownload = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);
    Object.defineProperties(URL, {
      createObjectURL: { configurable: true, value: createObjectURL },
      revokeObjectURL: { configurable: true, value: revokeObjectURL },
    });
    window.history.replaceState({}, "", "/events/evt_123/guests?q=tan&invite=opened&sort=name");

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
    await user.click(screen.getByRole("button", { name: "Guest list options" }));
    await user.click(await screen.findByRole("menuitem", { name: "Export guest data" }));

    expect(screen.getByRole("heading", { name: "Export guest data" })).toBeTruthy();
    expect(
      screen
        .getByRole("button", { name: "Current search, invite status, and invited by filters" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    await user.click(screen.getByRole("button", { name: "Download CSV" }));

    await waitFor(() =>
      expect(downloadGuestData).toHaveBeenCalledWith("evt_123", {
        format: "csv",
        invitedBy: undefined,
        q: "tan",
        scope: "filtered",
        tracking: "opened",
      }),
    );
    expect(clickDownload).toHaveBeenCalledOnce();
    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:guest-export");
    expect(
      await screen.findByText("spring-dinner-guest-data-2030-01-01.csv is ready."),
    ).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Guest list options" }));
    await user.click(await screen.findByRole("menuitem", { name: "Export guest data" }));
    await user.click(screen.getByRole("button", { name: "XLSX" }));
    await user.click(screen.getByRole("button", { name: "Download XLSX" }));

    await waitFor(() =>
      expect(downloadGuestData).toHaveBeenLastCalledWith("evt_123", {
        format: "xlsx",
        invitedBy: undefined,
        q: "tan",
        scope: "filtered",
        tracking: "opened",
      }),
    );
    expect(clickDownload).toHaveBeenCalledTimes(2);
    expect(
      await screen.findByText("spring-dinner-guest-data-2030-01-01.xlsx is ready."),
    ).toBeTruthy();
  });

  it("defaults to the groups table and persists the all-guests preference", async () => {
    const user = userEvent.setup();
    const matchMedia = mockDesktopViewport();

    renderWithAuth(
      createApiClientStub({
        listGuestGroups: vi.fn(async () => ({
          guestGroups: [
            {
              ...guestGroup,
              invitedBy: "Mother of the bride",
              members: [
                { id: "member_tan", name: "Mina Tan", sortOrder: 0 },
                { id: "member_alex", name: "Alex Tan", sortOrder: 1 },
              ],
              status: "responded" as const,
            },
          ],
        })),
        listEventResponses: vi.fn(async () => ({
          responses: [
            createRsvpResponse({
              attendeeCount: 1,
              guestNames: ["Mina Tan"],
            }),
          ],
        })),
      }),
    );

    await screen.findByText("Tan Family");
    await waitFor(() => expect(matchMedia).toHaveBeenCalledWith("(min-width: 1024px)"));

    const groupTable = await screen.findByRole("table", {
      name: /Guest groups with invite status/,
    });
    expect(screen.getByRole("button", { name: "Groups" }).getAttribute("aria-pressed")).toBe(
      "true",
    );
    expect(within(groupTable).getByRole("columnheader", { name: "Group" })).toBeTruthy();
    expect(within(groupTable).getByRole("columnheader", { name: "Invited by" })).toBeTruthy();
    expect(within(groupTable).getByRole("columnheader", { name: "Invite" })).toBeTruthy();
    expect(within(groupTable).getByRole("columnheader", { name: "RSVP" })).toBeTruthy();
    expect(within(groupTable).getByText("Mother of the bride")).toBeTruthy();
    expect(screen.getByRole("button", { name: "More actions for Tan Family" })).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "All guests" }));

    expect(window.location.search).toBe("?view=guests");
    const guestTable = await screen.findByRole("table", { name: /Every guest with their group/ });
    expect(within(guestTable).getByRole("columnheader", { name: "Name" })).toBeTruthy();
    expect(within(guestTable).getByRole("cell", { name: "Mina Tan" })).toBeTruthy();
    expect(within(guestTable).getByRole("cell", { name: "Alex Tan" })).toBeTruthy();
    expect(within(guestTable).getByText("Not attending")).toBeTruthy();

    cleanup();
    renderWithAuth(createApiClientStub());
    expect(await screen.findByRole("table", { name: /Every guest with their group/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: "All guests" }).getAttribute("aria-pressed")).toBe(
      "true",
    );

    await user.click(screen.getByRole("button", { name: "Groups" }));
    expect(window.location.search).toBe("");
    expect(
      await screen.findByRole("table", { name: /Guest groups with invite status/ }),
    ).toBeTruthy();
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
    expect(await screen.findByRole("heading", { name: "Guests" })).toBeTruthy();
    expect(screen.getByText("Tan Family")).toBeTruthy();
    expect(screen.getByText("Lee Family")).toBeTruthy();
    expect(screen.getByText("Mina and Alex")).toBeTruthy();
    expect(screen.getByText("Old Vendor List")).toBeTruthy();
    // Invite delivery and RSVP are now separate axes, so each row shows one badge of each.
    expect(screen.getAllByText("Awaiting").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Opened").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Not sent").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Disabled").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Mina Tan · 4 guests")).toHaveLength(4);
    expect(screen.getAllByRole("button", { name: /More actions for/ })).toHaveLength(4);
  });

  // Moved from the removed Responses page: resetting an invite link leaves the RSVP row
  // behind, and that stale response must never read as the group's current answer.
  it("uses the current manager status when an older RSVP record remains", async () => {
    const user = userEvent.setup();

    renderWithAuth(
      createApiClientStub({
        listEventResponses: vi.fn(async () => ({
          responses: [
            createRsvpResponse({
              guestGroupId: "guest_1",
              guestNames: ["Mina Tan"],
              message: "We will be there.",
            }),
          ],
        })),
        listGuestGroups: vi.fn(async () => ({
          guestGroups: [{ ...guestGroup, status: "pending" as const }],
        })),
      }),
    );

    await screen.findByText("Tan Family");
    expect(screen.getAllByText("Awaiting").length).toBeGreaterThan(0);
    expect(screen.queryByText("We will be there.")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Show details for Tan Family" }));

    expect(
      await screen.findByText(/An earlier RSVP was cleared when this invite link was reset/),
    ).toBeTruthy();
    expect(screen.queryByText("We will be there.")).toBeNull();
  });

  it("shows RSVP detail for a responded group, including per-person answers", async () => {
    const user = userEvent.setup();

    renderWithAuth(
      createApiClientStub({
        listEventResponses: vi.fn(async () => ({
          responses: [
            createRsvpResponse({
              attendeeCount: 2,
              guestGroupId: "guest_1",
              guestNames: ["Mina Tan", "Jo Visitor"],
              message: "Cannot wait.",
            }),
          ],
        })),
        listGuestGroups: vi.fn(async () => ({
          guestGroups: [
            {
              ...guestGroup,
              members: [{ id: "member_tan", name: "Mina Tan", sortOrder: 0 }],
              status: "responded" as const,
            },
          ],
        })),
      }),
    );

    await screen.findByText("Tan Family");
    expect(screen.getAllByText("Attending").length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: "Show details for Tan Family" }));

    expect(await screen.findByText("Attending · 2 of 4 pax")).toBeTruthy();
    expect(screen.getByText("Cannot wait.")).toBeTruthy();
    // A name that is not on the guest list is still shown, and flagged as such.
    expect(screen.getByText("Jo Visitor")).toBeTruthy();
    expect(screen.getByText(/1 named member · 1 name not on the guest list/)).toBeTruthy();
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
    await user.clear(screen.getByLabelText("Party size"));
    await user.type(screen.getByLabelText("Party size"), "0");
    await user.click(screen.getByRole("button", { name: "Create guest group" }));

    expect(createGuestGroup).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Group label").getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByLabelText("Party size").getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByLabelText("Group label").getAttribute("aria-describedby")).toBe(
      "guest-group-label-error",
    );
    expect(screen.getByLabelText("Party size").getAttribute("aria-describedby")).toBe(
      "guest-party-size-error",
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
        accessExpiresAt: null,
        members: [{ name: "Mina Tan" }, { name: "Alex Tan" }],
      }),
    );
    // Share is the primary invitation action; the raw URL sits behind row details.
    await user.click(await screen.findByRole("button", { name: "Share invite for New Table" }));
    await user.click(await screen.findByRole("menuitem", { name: "Copy link" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(inviteLink));
    expect(await screen.findByText("New Table invite link copied.")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Show details for New Table" }));
    expect(await screen.findByDisplayValue(inviteLink)).toBeTruthy();
  });

  it("opens active invite links from the overflow menu", async () => {
    const user = userEvent.setup();
    const inviteLink = "https://invite.lumiere.test/e/spring-dinner/g/active-token";
    const openWindow = vi.spyOn(window, "open").mockImplementation(() => ({}) as Window);

    renderWithAuth(
      createApiClientStub({
        listGuestGroups: vi.fn(async () => ({ guestGroups: [{ ...guestGroup, inviteLink }] })),
      }),
    );

    await screen.findByText("Tan Family");
    await user.click(screen.getByRole("button", { name: "More actions for Tan Family" }));
    await user.click(await screen.findByRole("menuitem", { name: "Open invite" }));

    expect(openWindow).toHaveBeenCalledWith(inviteLink, "_blank", "noopener,noreferrer");
    expect(await screen.findByText("Tan Family invite link opened.")).toBeTruthy();
  });

  it("shares active invite links through the device share sheet and records the handoff", async () => {
    const user = userEvent.setup();
    const inviteLink = "https://invite.lumiere.test/e/spring-dinner/g/private-token";
    const share = vi.fn(async () => undefined);
    const markedGroup: GuestGroup = {
      ...guestGroup,
      firstSentAt: "2030-01-02T00:00:00.000Z",
      lastSentAt: "2030-01-02T00:00:00.000Z",
      lastShareChannel: "other",
      sendCount: 1,
    };
    const markGuestGroupSent = vi.fn<DashboardApiClient["markGuestGroupSent"]>(async () => ({
      guestGroup: markedGroup,
    }));
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: share,
    });

    renderWithAuth(
      createApiClientStub({
        listGuestGroups: vi.fn(async () => ({ guestGroups: [{ ...guestGroup, inviteLink }] })),
        markGuestGroupSent,
      }),
    );

    await screen.findByText("Tan Family");
    await user.click(screen.getByRole("button", { name: "Share invite for Tan Family" }));
    await user.click(await screen.findByRole("menuitem", { name: "Share from device" }));

    expect(share).toHaveBeenCalledWith({
      text: "Hi Tan Family, you’re invited to Spring Dinner! RSVP using your private invitation link.",
      url: inviteLink,
    });
    await waitFor(() =>
      expect(markGuestGroupSent).toHaveBeenCalledWith("evt_123", "guest_1", {
        shareChannel: "other",
      }),
    );
    expect(
      await screen.findByText(/share handoff recorded\. Delivery is not verified/),
    ).toBeTruthy();
  });

  it("uses encoded email and WhatsApp destinations with a personalized message", async () => {
    const user = userEvent.setup();
    const inviteLink = "https://invite.lumiere.test/e/spring-dinner/g/private-token?source=guest";
    const openWindow = vi.spyOn(window, "open").mockImplementation(() => ({}) as Window);
    const markGuestGroupSent = vi.fn<DashboardApiClient["markGuestGroupSent"]>(async () => ({
      guestGroup,
    }));
    const subject = "You’re invited to Spring Dinner";
    const text = `Hi Tan Family, you’re invited to Spring Dinner! RSVP using your private invitation link: ${inviteLink}`;

    renderWithAuth(
      createApiClientStub({
        listGuestGroups: vi.fn(async () => ({ guestGroups: [{ ...guestGroup, inviteLink }] })),
        markGuestGroupSent,
      }),
    );

    await screen.findByText("Tan Family");
    await user.click(screen.getByRole("button", { name: "Share invite for Tan Family" }));
    await user.click(await screen.findByRole("menuitem", { name: "Email" }));

    expect(openWindow).toHaveBeenCalledWith(
      `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
    await waitFor(() =>
      expect(markGuestGroupSent).toHaveBeenLastCalledWith("evt_123", "guest_1", {
        shareChannel: "email",
      }),
    );

    await user.click(screen.getByRole("button", { name: "Share invite for Tan Family" }));
    await user.click(await screen.findByRole("menuitem", { name: "WhatsApp" }));

    expect(openWindow).toHaveBeenLastCalledWith(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
    await waitFor(() =>
      expect(markGuestGroupSent).toHaveBeenLastCalledWith("evt_123", "guest_1", {
        shareChannel: "whatsapp",
      }),
    );
  });

  it("does not record cancelled or popup-blocked share attempts", async () => {
    const user = userEvent.setup();
    const inviteLink = "https://invite.lumiere.test/e/spring-dinner/g/private-token";
    const markGuestGroupSent = vi.fn<DashboardApiClient["markGuestGroupSent"]>();
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: vi.fn(async () => {
        throw new DOMException("Cancelled", "AbortError");
      }),
    });
    vi.spyOn(window, "open").mockImplementation(() => null);

    renderWithAuth(
      createApiClientStub({
        listGuestGroups: vi.fn(async () => ({ guestGroups: [{ ...guestGroup, inviteLink }] })),
        markGuestGroupSent,
      }),
    );

    await screen.findByText("Tan Family");
    await user.click(screen.getByRole("button", { name: "Share invite for Tan Family" }));
    await user.click(await screen.findByRole("menuitem", { name: "Share from device" }));
    expect(await screen.findByText(/Share cancelled/)).toBeTruthy();
    expect(markGuestGroupSent).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Share invite for Tan Family" }));
    await user.click(await screen.findByRole("menuitem", { name: "WhatsApp" }));
    expect(await screen.findByText(/WhatsApp composer could not open/)).toBeTruthy();
    expect(markGuestGroupSent).not.toHaveBeenCalled();
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

    // Neither group can be shared, so neither exposes a share action on the row.
    expect(screen.queryByRole("button", { name: /^Share invite for/ })).toBeNull();

    await user.click(screen.getByRole("button", { name: "Show details for Legacy Family" }));
    expect(await screen.findByText(/Full URL unavailable for this older invite/)).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Show details for Disabled Family" }));
    expect(await screen.findByText("Invite access is disabled for this group.")).toBeTruthy();

    // "Open invite" stays out of the overflow menu when there is nothing to open.
    await user.click(screen.getByRole("button", { name: "More actions for Legacy Family" }));
    expect(screen.queryByRole("menuitem", { name: "Open invite" })).toBeNull();
  });

  it("resets a responded legacy group to pending while preserving its invite link", async () => {
    const user = userEvent.setup();
    const inviteLink = "https://invite.lumiere.test/e/spring-dinner/g/existing-token";
    const respondedGroup: GuestGroup = {
      ...guestGroup,
      inviteLink,
      lastOpenedAt: "2030-01-02T00:00:00.000Z",
      status: "responded" as const,
    };
    const updatedGroup: GuestGroup = {
      ...respondedGroup,
      maxPax: 5,
      members: [
        { id: "member_1", name: "Mina Tan", sortOrder: 0 },
        { id: "member_2", name: "Alex Tan", sortOrder: 1 },
        { id: "member_3", name: "Jamie Tan", sortOrder: 2 },
        { id: "member_4", name: "Nora Tan", sortOrder: 3 },
        { id: "member_5", name: "Sam Tan", sortOrder: 4 },
      ],
      notes: "Seat near the stage.",
      status: "pending",
    };
    const updateGuestGroup = vi.fn<DashboardApiClient["updateGuestGroup"]>(async () => ({
      guestGroup: updatedGroup,
    }));

    renderWithAuth(
      createApiClientStub({
        listGuestGroups: vi.fn(async () => ({ guestGroups: [respondedGroup] })),
        updateGuestGroup,
      }),
    );

    await screen.findByText("Tan Family");
    await openRowMenuItem(user, "Tan Family", "Edit group");
    expect(await screen.findByRole("dialog", { name: "Edit Tan Family" })).toBeTruthy();
    expect(screen.queryByLabelText("Guest names / contact (legacy)")).toBeNull();
    expect((screen.getByLabelText("Member 1") as HTMLInputElement).value).toBe("Mina Tan");

    await user.clear(screen.getByLabelText("Party size"));
    await user.type(screen.getByLabelText("Party size"), "5");
    await user.type(screen.getByLabelText("Member 2"), "Alex Tan");
    await user.type(screen.getByLabelText("Member 3"), "Jamie Tan");
    await user.type(screen.getByLabelText("Member 4"), "Nora Tan");
    await user.type(screen.getByLabelText("Member 5"), "Sam Tan");
    await user.clear(screen.getByLabelText("Notes"));
    await user.type(screen.getByLabelText("Notes"), "Seat near the stage.");
    await user.click(screen.getByLabelText("Invite status"));
    await user.click(await screen.findByRole("option", { name: "Pending" }));
    await user.click(screen.getByRole("button", { name: "Save guest group" }));

    await waitFor(() =>
      expect(updateGuestGroup).toHaveBeenCalledWith(
        "evt_123",
        "guest_1",
        expect.objectContaining({
          accessExpiresAt: guestGroup.accessExpiresAt,
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
          status: "pending",
        }),
      ),
    );
    expect(await screen.findByText("Tan Family updated.")).toBeTruthy();
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    // Resetting to pending clears the RSVP without touching the existing invite link.
    expect(screen.getAllByText("Awaiting").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Share invite for Tan Family" })).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Show details for Tan Family" }));
    expect(await screen.findByDisplayValue(inviteLink)).toBeTruthy();
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

    await screen.findByText("Tan Family");
    expect(screen.getByText("Mina Tan, Alex Tan")).toBeTruthy();
    await openRowMenuItem(user, "Tan Family", "Edit group");
    await screen.findByRole("dialog", { name: "Edit Tan Family" });

    expect(screen.queryByRole("button", { name: "Add member" })).toBeNull();
    expect(screen.queryByRole("button", { name: /Move .* (up|down)/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /Remove/ })).toBeNull();

    await user.clear(screen.getByLabelText("Party size"));
    await user.type(screen.getByLabelText("Party size"), "4");
    // Commit before looking up Member 3: it doesn't exist until the resize lands.
    await user.tab();
    await user.type(screen.getByLabelText("Member 3"), "Jamie Tan");
    await user.type(screen.getByLabelText("Member 4"), "Nora Tan");

    await user.clear(screen.getByLabelText("Party size"));
    await user.type(screen.getByLabelText("Party size"), "3");
    // The number field commits on blur/Enter rather than every keystroke, so move
    // focus away to trigger the commit before checking the resized member fields.
    await user.tab();
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
    await openRowMenuItem(user, "Tan Family", "Reset invite link");

    expect(regenerateGuestGroupInvite).not.toHaveBeenCalled();
    const confirm = await screen.findByRole("alertdialog");
    expect(within(confirm).getByText("Reset this invite link?")).toBeTruthy();

    await user.click(within(confirm).getByRole("button", { name: "Reset link" }));

    await waitFor(() =>
      expect(regenerateGuestGroupInvite).toHaveBeenCalledWith("evt_123", "guest_1"),
    );
    await user.click(await screen.findByRole("button", { name: "Show details for Tan Family" }));
    expect(await screen.findByDisplayValue(inviteLink)).toBeTruthy();
  });

  it("records a manager-confirmed share separately from guest status", async () => {
    const user = userEvent.setup();
    const markedGroup: GuestGroup = {
      ...guestGroup,
      firstSentAt: "2030-01-02T00:00:00.000Z",
      lastSentAt: "2030-01-02T00:00:00.000Z",
      lastShareChannel: "whatsapp",
      sendCount: 1,
    };
    const markGuestGroupSent = vi.fn<DashboardApiClient["markGuestGroupSent"]>(async () => ({
      guestGroup: markedGroup,
    }));

    renderWithAuth(createApiClientStub({ markGuestGroupSent }));

    await screen.findByText("Tan Family");
    await user.click(screen.getByRole("button", { name: "More actions for Tan Family" }));
    await user.click(await screen.findByRole("menuitem", { name: "Mark sent" }));
    const dialog = await screen.findByRole("dialog", { name: "Record share for Tan Family" });
    expect(within(dialog).getByText(/not a delivery or read receipt/i)).toBeTruthy();
    await user.click(within(dialog).getByLabelText("Share channel"));
    await user.click(await screen.findByRole("option", { name: "WhatsApp" }));
    await user.click(within(dialog).getByRole("button", { name: "Mark sent" }));

    await waitFor(() =>
      expect(markGuestGroupSent).toHaveBeenCalledWith("evt_123", "guest_1", {
        shareChannel: "whatsapp",
      }),
    );
    expect(await screen.findByText(/Delivery is not verified/)).toBeTruthy();
    expect(screen.getAllByText("Awaiting RSVP").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Sent").length).toBeGreaterThan(0);
  });

  it("disables guest groups instead of deleting them", async () => {
    const user = userEvent.setup();
    const inviteLink = "https://invite.lumiere.test/e/spring-dinner/g/stable-token";
    const updateGuestGroup = vi.fn<DashboardApiClient["updateGuestGroup"]>(
      async (_eventId, _groupId, input) => ({
        guestGroup: {
          ...guestGroup,
          status: input.status === "disabled" ? "disabled" : "pending",
        },
      }),
    );

    renderWithAuth(
      createApiClientStub({
        listGuestGroups: vi.fn(async () => ({
          guestGroups: [{ ...guestGroup, inviteLink }],
        })),
        updateGuestGroup,
      }),
    );

    await screen.findByText("Tan Family");
    await openRowMenuItem(user, "Tan Family", "Disable invite");

    expect(updateGuestGroup).not.toHaveBeenCalled();
    const confirm = await screen.findByRole("alertdialog");
    expect(within(confirm).getByText("Disable this guest group?")).toBeTruthy();

    await user.click(within(confirm).getByRole("button", { name: "Disable invite" }));

    await waitFor(() =>
      expect(updateGuestGroup).toHaveBeenCalledWith(
        "evt_123",
        "guest_1",
        expect.objectContaining({ status: "disabled" }),
      ),
    );
    expect(await screen.findByText(/Existing invite access is blocked/)).toBeTruthy();
    expect(screen.getAllByText("Disabled").length).toBeGreaterThan(0);

    await openRowMenuItem(user, "Tan Family", "Re-enable invite");

    await waitFor(() => expect(updateGuestGroup).toHaveBeenCalledTimes(2));
    expect(updateGuestGroup.mock.calls[1]?.[2]).toMatchObject({ status: "pending" });

    await user.click(await screen.findByRole("button", { name: "Show details for Tan Family" }));
    expect(await screen.findByDisplayValue(inviteLink)).toBeTruthy();
  });
});

/** Row actions now live behind the row's ••• menu rather than inline buttons. */
async function openRowMenuItem(
  user: ReturnType<typeof userEvent.setup>,
  groupLabel: string,
  item: string,
) {
  await user.click(screen.getByRole("button", { name: `More actions for ${groupLabel}` }));
  await user.click(await screen.findByRole("menuitem", { name: item }));
}

function mockDesktopViewport() {
  const matchMedia = vi.fn().mockImplementation(() => ({
    addEventListener: vi.fn(),
    matches: true,
    removeEventListener: vi.fn(),
  }));

  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: matchMedia,
  });

  return matchMedia;
}

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
    getEventSummary: vi.fn(async () => ({ summary: emptyEventSummary })),
    listEventResponses: vi.fn(async () => ({ responses: [] })),
    listGuestGroups: vi.fn(async () => ({ guestGroups: [guestGroup] })),
    markGuestGroupSent: vi.fn(),
    regenerateGuestGroupInvite: vi.fn(),
    updateGuestGroup: vi.fn(),
    ...overrides,
  };
}

function createRsvpResponse(overrides: Partial<RsvpResponse> = {}): RsvpResponse {
  return {
    answers: [],
    attendeeCount: 2,
    eventId: "evt_123",
    guestGroupId: "guest_1",
    guestNames: [],
    id: `response_${overrides.guestGroupId ?? "guest_1"}`,
    responseStatus: "attending",
    submittedAt: "2030-02-01T00:00:00.000Z",
    updatedAt: "2030-02-01T00:00:00.000Z",
    ...overrides,
  };
}

const emptyEventSummary: EventSummary = {
  attending: { groups: 0, pax: 0 },
  maybe: { groups: 0, pax: 0 },
  notAttending: { groups: 0, pax: 0 },
  pending: { groups: 0, pax: 0 },
  totalGroups: 0,
  totalInvitedPax: 0,
  totalRespondedPax: 0,
};

const dashboardEvent: Event = {
  accessExpiresAt: "2030-06-01T15:30:00.000Z",
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
  accessExpiresAt: "2030-05-31T15:30:00.000Z",
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
