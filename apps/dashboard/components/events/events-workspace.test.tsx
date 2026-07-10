// @vitest-environment jsdom

import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DashboardAuthProvider,
  type DashboardAuthContextValue,
  type DashboardApiClient,
} from "../../auth/dashboard-auth-provider";
import type { Event } from "@lumiere/types";
import { eventLocalDateTimeToIso, formatEventTime } from "../ui/event-date-time-picker";
import { EventsWorkspace } from "./events-workspace";

const routerPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: routerPush,
  }),
}));

describe("EventsWorkspace", () => {
  afterEach(() => {
    cleanup();
    routerPush.mockClear();
  });

  it("renders the empty state after loading manager events", async () => {
    renderWithAuth({
      listEvents: vi.fn(async () => ({ events: [] })),
    });

    expect(screen.getByLabelText("Loading events")).toBeTruthy();
    expect(await screen.findByText("Create your first event")).toBeTruthy();
    expect(screen.getByText(/Add the event details first/)).toBeTruthy();
  });

  it("shows validation errors near required create fields", async () => {
    const user = userEvent.setup();
    renderWithAuth({
      listEvents: vi.fn(async () => ({ events: [] })),
    });

    await screen.findByText("Create your first event");
    await user.click(screen.getByRole("button", { name: "Create event" }));

    expect(await screen.findByText("Event title is required.")).toBeTruthy();
    expect(screen.getByText("Choose the event start date and time.")).toBeTruthy();
    expect(
      screen.getByText("Check the highlighted fields before creating the event."),
    ).toBeTruthy();
  });

  it("shows direct workspace links for existing events", async () => {
    renderWithAuth({
      listEvents: vi.fn(async () => ({ events: [springDinnerEvent] })),
    });

    expect(await screen.findByText("Spring Dinner")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Open workspace" }).getAttribute("href")).toBe(
      "/events/evt_123",
    );
    expect(screen.getByRole("button", { name: "Edit" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Theme" }).getAttribute("href")).toBe(
      "/events/evt_123/theme",
    );
    expect(screen.getByRole("link", { name: "Activity" }).getAttribute("href")).toBe(
      "/events/evt_123/activity",
    );
  });

  it("creates an event and navigates to the event workspace", async () => {
    const user = userEvent.setup();
    const createEvent = vi.fn<DashboardApiClient["createEvent"]>(async () => ({
      event: springDinnerEvent,
    }));

    renderWithAuth({
      createEvent,
      listEvents: vi.fn(async () => ({ events: [] })),
    });

    await screen.findByText("Create your first event");
    await user.type(screen.getByLabelText("Event title"), "Spring Dinner");
    await user.click(screen.getByLabelText("Event type"));
    await user.click(await screen.findByRole("option", { name: "Dinner" }));
    await user.clear(screen.getByLabelText("Timezone"));
    await user.type(screen.getByLabelText("Timezone"), "Singapore");
    await user.click(await screen.findByRole("option", { name: "Asia/Singapore" }));
    const selectedDate = toDateValue(new Date());
    await user.click(screen.getByLabelText("Starts date"));
    const todayButton = [...document.querySelectorAll<HTMLButtonElement>("[data-day]")].find(
      (button) => button.dataset.day === new Date().toLocaleDateString(),
    );
    expect(todayButton).toBeDefined();
    await user.click(todayButton as HTMLButtonElement);
    await user.click(screen.getByLabelText("Starts time"));
    await user.click(await screen.findByRole("option", { name: formatEventTime("18:30") }));
    await user.type(screen.getByLabelText("Venue name"), "Glass Hall");
    await user.type(screen.getByLabelText("Venue address"), "12 Orchard Road");
    await user.click(screen.getByRole("button", { name: "Create event" }));

    await waitFor(() => expect(createEvent).toHaveBeenCalledTimes(1));
    expect(createEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "dinner",
        slug: "spring-dinner",
        timezone: "Asia/Singapore",
        title: "Spring Dinner",
        venueAddress: "12 Orchard Road",
        venueName: "Glass Hall",
      }),
    );
    const createdInput = createEvent.mock.calls[0]?.[0];

    expect(createdInput).toBeDefined();
    expect(createdInput?.startsAt).toBe(
      eventLocalDateTimeToIso(`${selectedDate}T18:30`, "Asia/Singapore"),
    );

    await waitFor(() => expect(routerPush).toHaveBeenCalledWith("/events/evt_123"));
  });

  it("opens event editing from the list and validates required fields", async () => {
    const user = userEvent.setup();
    const updateEvent = vi.fn<DashboardApiClient["updateEvent"]>(async () => ({
      event: springDinnerEvent,
    }));

    renderWithAuth({
      listEvents: vi.fn(async () => ({ events: [springDinnerEvent] })),
      updateEvent,
    });

    await screen.findByText("Spring Dinner");
    await user.click(screen.getByRole("button", { name: "Edit" }));

    const editPanel = within(screen.getByLabelText("Edit Spring Dinner"));
    await user.clear(editPanel.getByLabelText("Event title"));
    await user.click(editPanel.getByRole("button", { name: "Save event" }));

    expect(await editPanel.findByText("Event title is required.")).toBeTruthy();
    expect(updateEvent).not.toHaveBeenCalled();
  });

  it("saves list edits and updates the visible event card without reloading", async () => {
    const user = userEvent.setup();
    const updatedEvent: Event = {
      ...springDinnerEvent,
      eventType: "private_event",
      status: "published",
      title: "Summer Dinner",
      updatedAt: "2030-01-01T01:00:00.000Z",
    };
    const updateEvent = vi.fn<DashboardApiClient["updateEvent"]>(async () => ({
      event: updatedEvent,
    }));

    renderWithAuth({
      listEvents: vi.fn(async () => ({ events: [springDinnerEvent] })),
      updateEvent,
    });

    await screen.findByText("Spring Dinner");
    await user.click(screen.getByRole("button", { name: "Edit" }));

    const editPanel = within(screen.getByLabelText("Edit Spring Dinner"));
    await user.clear(editPanel.getByLabelText("Event title"));
    await user.type(editPanel.getByLabelText("Event title"), "Summer Dinner");
    editPanel.getByLabelText("Event type").focus();
    await user.keyboard("{ArrowDown}");
    await user.click(await screen.findByRole("option", { name: "Private event" }));
    editPanel.getByLabelText("Publish status").focus();
    await user.keyboard("{ArrowDown}");
    await user.click(await screen.findByRole("option", { name: "Published" }));
    await user.click(editPanel.getByRole("button", { name: "Save event" }));

    await waitFor(() => expect(updateEvent).toHaveBeenCalledTimes(1));
    expect(updateEvent).toHaveBeenCalledWith(
      "evt_123",
      expect.objectContaining({
        eventType: "private_event",
        status: "published",
        title: "Summer Dinner",
      }),
    );
    expect(await screen.findByText("Event basics saved.")).toBeTruthy();
    expect(screen.getAllByText("Summer Dinner").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Published").length).toBeGreaterThan(0);
  });
});

const springDinnerEvent: Event = {
  createdAt: "2030-01-01T00:00:00.000Z",
  eventType: "dinner",
  id: "evt_123",
  ownerUserId: "user_123",
  publicSettings: {},
  rsvpSettings: {},
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

function renderWithAuth(apiClient: Partial<DashboardApiClient>) {
  return render(
    <DashboardAuthProvider value={createAuthValue(apiClient)}>
      <EventsWorkspace />
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

function toDateValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
