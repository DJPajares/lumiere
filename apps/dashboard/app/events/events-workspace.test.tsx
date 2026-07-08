// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DashboardAuthProvider,
  type DashboardAuthContextValue,
  type DashboardApiClient,
} from "../auth/dashboard-auth-provider";
import type { Event } from "@lumiere/types";
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

  it("creates an event and navigates to the event workspace", async () => {
    const user = userEvent.setup();
    const createdEvent: Event = {
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
    const createEvent = vi.fn<DashboardApiClient["createEvent"]>(async () => ({
      event: createdEvent,
    }));

    renderWithAuth({
      createEvent,
      listEvents: vi.fn(async () => ({ events: [] })),
    });

    await screen.findByText("Create your first event");
    await user.type(screen.getByLabelText("Event title"), "Spring Dinner");
    await user.selectOptions(screen.getByLabelText("Event type"), "dinner");
    await user.clear(screen.getByLabelText("Timezone"));
    await user.type(screen.getByLabelText("Timezone"), "Asia/Singapore");
    await user.type(screen.getByLabelText("Starts"), "2030-06-01T18:30");
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
    expect(createdInput?.startsAt).toMatch(/2030-06-01T/);

    await waitFor(() => expect(routerPush).toHaveBeenCalledWith("/events/evt_123"));
  });
});

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
    user: {
      email: "manager@example.com",
    } as DashboardAuthContextValue["user"],
  };
}
