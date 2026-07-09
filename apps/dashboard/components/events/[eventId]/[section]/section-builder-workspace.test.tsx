// @vitest-environment jsdom

import type { Event, EventSection, JsonValue, Theme } from "@lumiere/types";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
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
    ["Introduction", "Date and Time", "Story", "Location", "RSVP"].forEach((label) => {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    });
  });

  it("shows validation for enabled sections with missing required fields", async () => {
    const user = userEvent.setup();

    renderWithAuth(createApiClientStub());

    await screen.findByText("Configure content for Spring Dinner");
    await user.click(screen.getByLabelText("Enable Story"));
    fireEvent.change(screen.getByLabelText("Story content JSON"), {
      target: {
        value: JSON.stringify(
          {
            title: "Story",
          },
          null,
          2,
        ),
      },
    });
    await user.click(screen.getByRole("button", { name: "Save sections" }));

    expect(
      await screen.findByText("Check the highlighted section fields before saving."),
    ).toBeTruthy();
    expect(screen.getAllByText(/paragraphs:/).length).toBeGreaterThan(0);
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
    await user.click(screen.getByRole("button", { name: "Save sections" }));

    expect(
      await screen.findByText(/Introduction is required before publishing Dinner events/),
    ).toBeTruthy();
    expect(screen.getByText(/RSVP is required before publishing Dinner events/)).toBeTruthy();
    expect(updateEventSections).not.toHaveBeenCalled();
  });

  it("saves enabled sections with visibility and accessible reordering", async () => {
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
    await user.click(screen.getByLabelText("Enable Introduction"));
    await user.click(screen.getByLabelText("Enable Date and Time"));
    await user.selectOptions(screen.getByLabelText("Introduction visibility"), "guest_only");
    await user.click(screen.getByRole("button", { name: "Date and Time move up" }));
    await user.click(screen.getByRole("button", { name: "Save sections" }));

    await waitFor(() => expect(updateEventSections).toHaveBeenCalledTimes(1));

    const payload = updateEventSections.mock.calls[0]?.[1];

    expect(payload?.sections.map((section) => section.sectionType)).toEqual([
      "date",
      "introduction",
    ]);
    expect(payload?.sections[1]?.visibility).toBe("guest_only");
    expect(payload?.sections[0]?.sortOrder).toBe(0);
    expect(payload?.sections[1]?.sortOrder).toBe(1);
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
  rsvpSettings: {},
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
    recommendedSections: ["introduction", "date", "story", "location", "rsvp"],
    requiredSections: ["introduction", "date", "location", "rsvp"],
    sectionRhythm: ["introduction", "date", "story", "location", "rsvp"],
    supportedSections: ["introduction", "date", "story", "location", "rsvp"],
  },
  name: "Premium",
  supportedModes: ["light", "dark", "toggleable"],
  version: "0.0.0",
};
