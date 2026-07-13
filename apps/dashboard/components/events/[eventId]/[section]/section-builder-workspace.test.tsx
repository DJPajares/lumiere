// @vitest-environment jsdom

import type { Event, EventSection, JsonValue, Theme } from "@lumiere/types";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DashboardAuthProvider,
  type DashboardApiClient,
  type DashboardAuthContextValue,
} from "../../../../auth/dashboard-auth-provider";
import { SectionBuilderWorkspace } from "./section-builder-workspace";

describe("SectionBuilderWorkspace", () => {
  afterEach(() => {
    cleanup();
  });

  it("loads sections supported by the selected theme", async () => {
    renderWithAuth(createApiClientStub());

    expect(screen.getByLabelText("Loading sections")).toBeTruthy();
    expect(await screen.findByText("Configure content for Spring Dinner")).toBeTruthy();
    expect(screen.getByText("Sections in invite order")).toBeTruthy();
    expect(screen.getByText("Live preview")).toBeTruthy();
    expect(screen.getByText("Recommended next section")).toBeTruthy();
    expect(screen.getByText(/Preview contract:/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Open Introduction editor" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "Introduction" })).toBeTruthy();
    ["Introduction", "Date and Time", "Story", "Location", "RSVP"].forEach((label) => {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    });
  });

  it("expands one section card from keyboard selection", async () => {
    const user = userEvent.setup();

    renderWithAuth(createApiClientStub());

    await screen.findByText("Configure content for Spring Dinner");
    expect(screen.getByRole("region", { name: "Introduction" })).toBeTruthy();

    const storyCard = screen.getByRole("button", { name: "Open Story editor" });

    storyCard.focus();
    await user.keyboard("{Enter}");

    const storyEditor = screen.getByRole("region", { name: "Story" });

    expect(storyEditor).toBeTruthy();
    expect(screen.queryByRole("region", { name: "Introduction" })).toBeNull();
    expect(storyCard.getAttribute("aria-expanded")).toBe("true");
    expect(document.activeElement).toBe(storyCard);

    await user.keyboard("{Enter}");

    expect(screen.queryByRole("region", { name: "Story" })).toBeNull();
    expect(storyCard.getAttribute("aria-expanded")).toBe("false");
  });

  it("shows validation for enabled sections with missing required fields", async () => {
    const user = userEvent.setup();

    renderWithAuth(createApiClientStub());

    await screen.findByText("Configure content for Spring Dinner");
    await user.click(screen.getByRole("button", { name: "Open Story editor" }));
    const storyEditor = within(screen.getByRole("region", { name: "Story" }));

    await user.click(storyEditor.getByLabelText("Enable Story"));
    await user.clear(storyEditor.getByLabelText(/^Paragraph/));
    await user.click(storyEditor.getByRole("button", { name: "Save sections" }));

    expect(
      await screen.findByText("Check the highlighted section fields before saving."),
    ).toBeTruthy();
    expect(storyEditor.getByLabelText(/^Paragraph/).getAttribute("aria-invalid")).toBe("true");
    expect(storyEditor.getAllByText(/paragraphs\.0:/).length).toBeGreaterThan(0);
  });

  it("locks enabled required sections once the event is published", async () => {
    const getEvent = vi.fn<DashboardApiClient["getEvent"]>(async () => ({
      event: {
        ...dashboardEvent,
        status: "published",
      },
    }));
    const listEventSections = vi.fn<DashboardApiClient["listEventSections"]>(async () => ({
      sections: [savedIntroductionSection],
    }));

    renderWithAuth(
      createApiClientStub({
        getEvent,
        listEventSections,
      }),
    );

    await screen.findByText("Configure content for Spring Dinner");

    expect(
      screen.getByText("Required sections stay enabled once the event is no longer a draft."),
    ).toBeTruthy();
    expect((screen.getByLabelText("Enable Introduction") as HTMLInputElement).disabled).toBe(true);
    await userEvent.click(screen.getByRole("button", { name: "Open Story editor" }));
    expect((screen.getByLabelText("Enable Story") as HTMLInputElement).disabled).toBe(false);
  });

  it("shows required section details before saving a published event", async () => {
    const user = userEvent.setup();
    const getEvent = vi.fn<DashboardApiClient["getEvent"]>(async () => ({
      event: {
        ...dashboardEvent,
        status: "published",
      },
    }));
    const updateEventSections = vi.fn<DashboardApiClient["updateEventSections"]>();

    renderWithAuth(
      createApiClientStub({
        getEvent,
        updateEventSections,
      }),
    );

    await screen.findByText("Configure content for Spring Dinner");
    await user.click(screen.getAllByRole("button", { name: "Save sections" })[0]!);

    expect(
      await screen.findByText(/Introduction is required before publishing Dinner events/),
    ).toBeTruthy();
    expect(screen.getByText(/RSVP is required before publishing Dinner events/)).toBeTruthy();
    expect(updateEventSections).not.toHaveBeenCalled();
  });

  it("shows dirty state and confirms before canceling unsaved edits", async () => {
    const user = userEvent.setup();
    const confirm = vi.spyOn(window, "confirm");

    renderWithAuth(createApiClientStub());

    await screen.findByText("Configure content for Spring Dinner");
    const introductionEditor = within(screen.getByRole("region", { name: "Introduction" }));

    await user.click(introductionEditor.getByLabelText("Enable Introduction"));
    await user.clear(introductionEditor.getByLabelText(/^Title/));
    await user.type(introductionEditor.getByLabelText(/^Title/), "Unsaved Supper");

    expect(screen.getAllByText("Unsaved").length).toBeGreaterThan(0);

    confirm.mockReturnValueOnce(false);
    await user.click(introductionEditor.getByRole("button", { name: "Cancel changes" }));

    expect((introductionEditor.getByLabelText(/^Title/) as HTMLInputElement).value).toBe(
      "Unsaved Supper",
    );

    confirm.mockReturnValueOnce(true);
    await user.click(introductionEditor.getByRole("button", { name: "Cancel changes" }));

    expect((introductionEditor.getByLabelText(/^Title/) as HTMLInputElement).value).toBe(
      "Spring Dinner",
    );

    confirm.mockRestore();
  });

  it("saves typed field edits, repeatable content, visibility, and accessible reordering", async () => {
    const user = userEvent.setup();
    const updateEventSections = vi.fn<DashboardApiClient["updateEventSections"]>(
      async (eventId, input) => ({
        sections: input.sections.map((section, index): EventSection => ({
          ...section,
          content: section.content as Record<string, JsonValue>,
          createdAt: "2030-01-01T00:00:00.000Z",
          enabled: section.enabled ?? true,
          eventId,
          id: `section_${index}`,
          settings: (section.settings ?? {}) as Record<string, JsonValue>,
          updatedAt: "2030-01-01T00:00:00.000Z",
        })),
      }),
    );

    renderWithAuth(
      createApiClientStub({
        updateEventSections,
      }),
    );

    await screen.findByText("Configure content for Spring Dinner");
    const introductionEditor = within(screen.getByRole("region", { name: "Introduction" }));

    await user.click(introductionEditor.getByLabelText("Enable Introduction"));
    await user.clear(introductionEditor.getByLabelText(/^Title/));
    await user.type(introductionEditor.getByLabelText(/^Title/), "Garden Supper");
    await user.click(screen.getByRole("button", { name: "Open Date and Time editor" }));
    const dateEditor = within(screen.getByRole("region", { name: "Date and Time" }));

    await user.click(dateEditor.getByLabelText("Enable Date and Time"));
    await user.click(screen.getByRole("button", { name: "Open Details editor" }));
    const detailsEditor = within(screen.getByRole("region", { name: "Details" }));

    await user.click(detailsEditor.getByLabelText("Enable Details"));
    await user.click(detailsEditor.getByRole("button", { name: "Add schedule item" }));
    await user.clear(detailsEditor.getAllByLabelText(/^Label/)[1]!);
    await user.type(detailsEditor.getAllByLabelText(/^Label/)[1]!, "Dessert");
    await user.clear(detailsEditor.getAllByLabelText(/^Value/)[1]!);
    await user.type(detailsEditor.getAllByLabelText(/^Value/)[1]!, "Cake and coffee at 9 PM.");
    await user.click(screen.getByRole("button", { name: "Open Introduction editor" }));
    const reopenedIntroductionEditor = within(screen.getByRole("region", { name: "Introduction" }));

    reopenedIntroductionEditor.getByLabelText("Introduction visibility").focus();
    await user.keyboard("{ArrowDown}");
    await user.click(screen.getByRole("option", { name: "Guest-only" }));
    await user.click(screen.getByRole("button", { name: "Open Date and Time editor" }));
    await user.click(screen.getByRole("button", { name: "Date and Time move up" }));
    await user.click(screen.getAllByRole("button", { name: "Save sections" })[0]!);

    await waitFor(() => expect(updateEventSections).toHaveBeenCalledTimes(1));

    const payload = updateEventSections.mock.calls[0]?.[1];

    expect(payload?.sections.map((section) => section.sectionType)).toEqual([
      "date",
      "introduction",
      "details",
    ]);
    expect(payload?.sections[1]?.visibility).toBe("guest_only");
    expect(payload?.sections[1]?.content).toMatchObject({
      title: "Garden Supper",
    });
    expect(payload?.sections[2]?.content).toMatchObject({
      items: [
        {
          label: "Schedule",
          value: "Add the key timing or guest notes here.",
        },
        {
          label: "Dessert",
          value: "Cake and coffee at 9 PM.",
        },
      ],
      title: "Details",
    });
    expect(payload?.sections[0]?.sortOrder).toBe(0);
    expect(payload?.sections[1]?.sortOrder).toBe(1);
    expect(payload?.sections[2]?.sortOrder).toBe(2);
    expect(await screen.findByText("Sections saved.")).toBeTruthy();
  });
});

function renderWithAuth(apiClient: Partial<DashboardApiClient>) {
  return render(
    <DashboardAuthProvider value={createAuthValue(apiClient)}>
      <SectionBuilderWorkspace eventId="evt_123" />
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
  const getEvent = vi.fn<DashboardApiClient["getEvent"]>(async () => ({ event: dashboardEvent }));
  const getEventTheme = vi.fn<DashboardApiClient["getEventTheme"]>(async () => ({
    selectedThemeId: "premium",
    theme: premiumTheme,
    themeConfig: {},
    themeMode: "toggleable",
  }));
  const listEventSections = vi.fn<DashboardApiClient["listEventSections"]>(async () => ({
    sections: [],
  }));

  return {
    getEvent,
    getEventTheme,
    listEventSections,
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
  status: "draft",
  themeConfig: {},
  themeMode: "toggleable",
  timezone: "Asia/Singapore",
  title: "Spring Dinner",
  updatedAt: "2030-01-01T00:00:00.000Z",
  venueAddress: "12 Orchard Road",
  venueName: "Glass Hall",
};

const savedIntroductionSection: EventSection = {
  content: {
    eyebrow: "You're invited",
    title: "Spring Dinner",
  },
  createdAt: "2030-01-01T00:00:00.000Z",
  enabled: true,
  eventId: "evt_123",
  id: "section_intro",
  sectionKey: "introduction",
  sectionType: "introduction",
  settings: {
    density: "spacious",
    layout: "editorial",
  },
  sortOrder: 0,
  updatedAt: "2030-01-01T00:00:00.000Z",
  visibility: "public",
};

const premiumTheme: Theme = {
  defaultMode: "toggleable",
  eventTypes: ["wedding", "dinner", "private_event"],
  id: "premium",
  metadata: {
    recommendedSections: ["introduction", "date", "details", "story", "location", "rsvp"],
    requiredSections: ["introduction", "date", "location", "rsvp"],
    sectionRhythm: ["introduction", "date", "details", "story", "location", "rsvp"],
    supportedSections: ["introduction", "date", "details", "story", "location", "rsvp"],
  },
  name: "Premium",
  supportedModes: ["light", "dark", "toggleable"],
  version: "0.0.0",
};
