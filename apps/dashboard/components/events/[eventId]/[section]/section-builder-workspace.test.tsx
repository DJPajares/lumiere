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
    expect(screen.getByRole("button", { name: "Edit Introduction" })).toBeTruthy();
    expect(screen.queryByRole("region", { name: "Introduction" })).toBeNull();
    ["Introduction", "Date and Time", "Story", "Dress Code", "Location", "RSVP"].forEach(
      (label) => {
        expect(screen.getAllByText(label).length).toBeGreaterThan(0);
      },
    );
  });

  it("opens a labeled section dialog from the keyboard and restores focus", async () => {
    const user = userEvent.setup();

    renderWithAuth(createApiClientStub());

    await screen.findByText("Configure content for Spring Dinner");
    const editStory = screen.getByRole("button", { name: "Edit Story" });

    editStory.focus();
    await user.keyboard("{Enter}");

    expect(await screen.findByRole("dialog", { name: "Edit Story" })).toBeTruthy();
    const storyEditor = screen.getByRole("region", { name: "Story" });
    const modalFooter = document.querySelector('[data-slot="responsive-modal-footer"]');

    expect(storyEditor).toBeTruthy();
    expect(modalFooter).toBeTruthy();
    expect(
      within(modalFooter as HTMLElement).getByRole("button", { name: "Save sections" }),
    ).toBeTruthy();
    expect(
      within(modalFooter as HTMLElement).getByRole("button", { name: "Cancel changes" }),
    ).toBeTruthy();
    expect(screen.queryByRole("region", { name: "Introduction" })).toBeNull();
    await user.click(screen.getByRole("button", { name: "Close Edit Story" }));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Edit Story" })).toBeNull());
    expect(document.activeElement).toBe(editStory);
  });

  it("configures whether guests can interact with the location map", async () => {
    const user = userEvent.setup();

    renderWithAuth(createApiClientStub());

    await screen.findByText("Configure content for Spring Dinner");
    await user.click(screen.getByLabelText("Enable Location"));
    await user.click(screen.getByRole("button", { name: "Edit Location" }));

    const locationEditor = within(screen.getByRole("region", { name: "Location" }));
    const showMapPreview = locationEditor.getByLabelText("Show map preview");
    const allowMapInteraction = locationEditor.getByLabelText(/^Allow map interaction/);

    expect((showMapPreview as HTMLInputElement).checked).toBe(true);
    expect((allowMapInteraction as HTMLInputElement).checked).toBe(false);
    expect(document.querySelector('[data-map-interaction="preview-only"]')).toBeTruthy();

    await user.click(allowMapInteraction);

    expect((allowMapInteraction as HTMLInputElement).checked).toBe(true);
    expect(document.querySelector('[data-map-interaction="interactive"]')).toBeTruthy();
    expect(locationEditor.getByText(/pan and zoom inside the embedded map/)).toBeTruthy();
  });

  it("preserves spaces and commas while editing entourage names", async () => {
    const user = userEvent.setup();
    const getEvent = vi.fn<DashboardApiClient["getEvent"]>(async () => ({
      access: ownerAccess,
      event: {
        ...dashboardEvent,
        eventType: "wedding",
      },
    }));
    const getEventTheme = vi.fn<DashboardApiClient["getEventTheme"]>(async () => ({
      selectedThemeId: "premium",
      theme: {
        ...premiumTheme,
        eventTypes: ["wedding"],
        metadata: {
          recommendedSections: ["introduction", "date", "entourage", "location", "rsvp"],
          requiredSections: ["introduction", "date", "location", "rsvp"],
          sectionRhythm: ["introduction", "date", "entourage", "location", "rsvp"],
          supportedSections: ["introduction", "date", "entourage", "location", "rsvp"],
        },
      },
      themeConfig: {},
      themeMode: "toggleable",
    }));

    renderWithAuth(createApiClientStub({ getEvent, getEventTheme }));

    await screen.findByText("Configure content for Spring Dinner");
    await user.click(screen.getByLabelText("Enable Entourage"));
    await user.click(screen.getByRole("button", { name: "Edit Entourage" }));

    const entourageEditor = within(screen.getByRole("region", { name: "Entourage" }));
    const namesInput = entourageEditor.getByLabelText("Names") as HTMLTextAreaElement;

    expect(entourageEditor.getByText(/Use Profile when each person needs a role/)).toBeTruthy();

    await user.clear(namesInput);
    await user.type(namesInput, "Jamie Lee, Alex Cruz{Enter}Morgan Reyes");

    expect(namesInput.value).toBe("Jamie Lee, Alex Cruz\nMorgan Reyes");

    await user.tab();

    expect(namesInput.value).toBe("Jamie Lee, Alex Cruz, Morgan Reyes");
    expect(screen.getAllByText("Jamie Lee, Alex Cruz, Morgan Reyes").length).toBeGreaterThan(0);
  });

  it("shows validation for enabled sections with missing required fields", async () => {
    const user = userEvent.setup();
    const listEventSections = vi.fn<DashboardApiClient["listEventSections"]>(async () => ({
      sections: [savedLegacyStorySection],
    }));

    renderWithAuth(createApiClientStub({ listEventSections }));

    await screen.findByText("Configure content for Spring Dinner");
    await user.click(screen.getByLabelText("Enable Story"));
    await user.click(screen.getByRole("button", { name: "Edit Story" }));
    const storyEditor = within(screen.getByRole("region", { name: "Story" }));
    const legacyBody = storyEditor.getByLabelText("Paragraph body") as HTMLTextAreaElement;

    expect(legacyBody.value).toBe("A legacy paragraph without a title.");

    await user.type(storyEditor.getByLabelText("Paragraph title (optional)"), "First chapter");
    await user.click(storyEditor.getByRole("button", { name: "Add story paragraph" }));

    const titleInputs = storyEditor.getAllByLabelText("Paragraph title (optional)");
    const bodyInputs = storyEditor.getAllByLabelText("Paragraph body");

    await user.type(titleInputs[1]!, "Second chapter");
    await user.clear(bodyInputs[1]!);
    await user.type(bodyInputs[1]!, "A structured paragraph with a title.");
    await user.click(storyEditor.getAllByRole("button", { name: "Move up" })[1]!);

    expect(
      (storyEditor.getAllByLabelText("Paragraph title (optional)")[0] as HTMLInputElement).value,
    ).toBe("Second chapter");
    expect((storyEditor.getAllByLabelText("Paragraph body")[0] as HTMLTextAreaElement).value).toBe(
      "A structured paragraph with a title.",
    );

    await user.clear(storyEditor.getAllByLabelText("Paragraph body")[0]!);
    await user.click(getModalFooter().getByRole("button", { name: "Save sections" }));

    expect(
      await screen.findByText("Check the highlighted section fields before saving."),
    ).toBeTruthy();
    expect(storyEditor.getAllByLabelText("Paragraph body")[0]!.getAttribute("aria-invalid")).toBe(
      "true",
    );
    expect(storyEditor.getAllByText(/paragraphs\.0\.body:/).length).toBeGreaterThan(0);
  });

  it("locks enabled required sections once the event is published", async () => {
    const getEvent = vi.fn<DashboardApiClient["getEvent"]>(async () => ({
      access: ownerAccess,
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
      access: ownerAccess,
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

    renderWithAuth(createApiClientStub());

    await screen.findByText("Configure content for Spring Dinner");
    await user.click(screen.getByLabelText("Enable Introduction"));
    await user.click(screen.getByRole("button", { name: "Edit Introduction" }));
    const introductionEditor = within(screen.getByRole("region", { name: "Introduction" }));

    await user.clear(introductionEditor.getByLabelText(/^Title/));
    await user.type(introductionEditor.getByLabelText(/^Title/), "Unsaved Supper");

    expect(screen.getAllByText("Unsaved").length).toBeGreaterThan(0);

    await user.click(getModalFooter().getByRole("button", { name: "Cancel changes" }));
    expect(
      await screen.findByRole("alertdialog", { name: "Discard unsaved changes?" }),
    ).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Keep editing" }));

    expect((introductionEditor.getByLabelText(/^Title/) as HTMLInputElement).value).toBe(
      "Unsaved Supper",
    );

    await user.click(getModalFooter().getByRole("button", { name: "Cancel changes" }));
    await user.click(await screen.findByRole("button", { name: "Discard changes" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Edit Introduction" })).toBeNull(),
    );

    await user.click(screen.getByRole("button", { name: "Edit Introduction" }));
    expect((screen.getByLabelText(/^Title/) as HTMLInputElement).value).toBe("Spring Dinner");
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
    const updateEvent = vi.fn<DashboardApiClient["updateEvent"]>(async (_eventId, input) => ({
      event: {
        ...dashboardEvent,
        rsvpSettings: {
          ...dashboardEvent.rsvpSettings,
          collectGuestMessage:
            input.rsvpSettings?.collectGuestMessage ??
            dashboardEvent.rsvpSettings.collectGuestMessage,
          collectGuestNames:
            input.rsvpSettings?.collectGuestNames ?? dashboardEvent.rsvpSettings.collectGuestNames,
        },
      },
    }));

    renderWithAuth(
      createApiClientStub({
        updateEvent,
        updateEventSections,
      }),
    );

    await screen.findByText("Configure content for Spring Dinner");
    await user.click(screen.getByLabelText("Enable Introduction"));
    await user.click(screen.getByRole("button", { name: "Edit Introduction" }));
    const introductionEditor = within(screen.getByRole("region", { name: "Introduction" }));
    await user.clear(introductionEditor.getByLabelText(/^Title/));
    await user.type(introductionEditor.getByLabelText(/^Title/), "Garden Supper");
    await user.click(getModalFooter().getByRole("button", { name: "Save sections" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Edit Introduction" })).toBeNull(),
    );

    await user.click(screen.getByLabelText("Enable Date and Time"));
    await user.click(screen.getByLabelText("Enable Details"));
    await user.click(screen.getByRole("button", { name: "Edit Details" }));
    const detailsEditor = within(screen.getByRole("region", { name: "Details" }));

    await user.click(detailsEditor.getByRole("button", { name: "Add schedule item" }));
    await user.clear(detailsEditor.getAllByLabelText(/^Label/)[1]!);
    await user.type(detailsEditor.getAllByLabelText(/^Label/)[1]!, "Dessert");
    await user.clear(detailsEditor.getAllByLabelText(/^Value/)[1]!);
    await user.type(detailsEditor.getAllByLabelText(/^Value/)[1]!, "Cake and coffee at 9 PM.");
    await user.click(getModalFooter().getByRole("button", { name: "Save sections" }));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Edit Details" })).toBeNull());

    await user.click(screen.getByLabelText("Enable Dress Code"));
    await user.click(screen.getByRole("button", { name: "Edit Dress Code" }));
    const dressCodeEditor = within(screen.getByRole("region", { name: "Dress Code" }));

    await user.clear(dressCodeEditor.getAllByLabelText("Card title")[0]!);
    await user.type(dressCodeEditor.getAllByLabelText("Card title")[0]!, "Garden formal");
    await user.clear(dressCodeEditor.getByLabelText("Palette title"));
    await user.type(
      dressCodeEditor.getByLabelText("Palette title"),
      "A garden celebration palette",
    );
    await user.click(getModalFooter().getByRole("button", { name: "Save sections" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Edit Dress Code" })).toBeNull(),
    );

    screen.getByLabelText("Introduction visibility").focus();
    await user.keyboard("{ArrowDown}");
    await user.click(screen.getByRole("option", { name: "Guest-only" }));
    await user.click(screen.getByRole("button", { name: "Date and Time move up" }));
    await user.click(screen.getByLabelText("Enable RSVP"));
    await user.click(screen.getByRole("button", { name: "RSVP move up" }));
    await user.click(screen.getByRole("button", { name: "RSVP move up" }));
    await user.click(screen.getByRole("button", { name: "RSVP move up" }));
    await user.click(screen.getByRole("button", { name: "Edit RSVP" }));
    const rsvpEditor = within(screen.getByRole("region", { name: "RSVP" }));

    await user.click(rsvpEditor.getByRole("switch", { name: /Guest names/ }));
    await user.click(rsvpEditor.getByRole("switch", { name: /Guest message/ }));
    await user.click(rsvpEditor.getByRole("switch", { name: /Dietary requirements/ }));
    await user.click(rsvpEditor.getByRole("switch", { name: /Song request/ }));
    await user.click(getModalFooter().getByRole("button", { name: "Save sections" }));

    await waitFor(() => expect(updateEventSections).toHaveBeenCalledTimes(4));
    await waitFor(() => expect(updateEvent).toHaveBeenCalledTimes(1));

    const payload = updateEventSections.mock.calls.at(-1)?.[1];

    expect(payload?.sections.map((section) => section.sectionType)).toEqual([
      "date",
      "introduction",
      "rsvp",
      "details",
      "dress_code",
    ]);
    expect(payload?.sections[1]?.visibility).toBe("guest_only");
    expect(payload?.sections[1]?.content).toMatchObject({
      title: "Garden Supper",
    });
    expect(payload?.sections[3]?.content).toMatchObject({
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
    expect(payload?.sections[4]?.content).toMatchObject({
      cards: expect.arrayContaining([expect.objectContaining({ title: "Garden formal" })]),
      paletteTitle: "A garden celebration palette",
    });
    expect(payload?.sections[2]?.content).toMatchObject({
      questions: [
        expect.objectContaining({ key: "dietary-notes" }),
        expect.objectContaining({ key: "song-request" }),
      ],
    });
    expect(payload?.sections[0]?.sortOrder).toBe(0);
    expect(payload?.sections[1]?.sortOrder).toBe(1);
    expect(payload?.sections[2]?.sortOrder).toBe(2);
    expect(payload?.sections[3]?.sortOrder).toBe(3);
    expect(payload?.sections[4]?.sortOrder).toBe(4);
    expect(updateEvent).toHaveBeenCalledWith("evt_123", {
      rsvpSettings: {
        collectGuestMessage: false,
        collectGuestNames: false,
      },
    });
    expect(await screen.findByText("Sections saved.")).toBeTruthy();
  });
});

function getModalFooter() {
  const footer = document.querySelector('[data-slot="responsive-modal-footer"]');

  if (!(footer instanceof HTMLElement)) {
    throw new Error("Expected the responsive modal footer to be rendered.");
  }

  return within(footer);
}

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
  const getEvent = vi.fn<DashboardApiClient["getEvent"]>(async () => ({
    access: ownerAccess,
    event: dashboardEvent,
  }));
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

const ownerAccess = {
  eventId: "evt_123",
  role: "owner" as const,
  userId: "user_123",
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

const savedLegacyStorySection: EventSection = {
  content: {
    paragraphs: ["A legacy paragraph without a title."],
    title: "Our story",
  },
  createdAt: "2030-01-01T00:00:00.000Z",
  enabled: false,
  eventId: "evt_123",
  id: "section_story",
  sectionKey: "story",
  sectionType: "story",
  settings: {
    density: "balanced",
    layout: "timeline",
  },
  sortOrder: 3,
  updatedAt: "2030-01-01T00:00:00.000Z",
  visibility: "public",
};

const premiumTheme: Theme = {
  defaultMode: "toggleable",
  eventTypes: ["wedding", "dinner", "private_event"],
  id: "premium",
  metadata: {
    recommendedSections: [
      "introduction",
      "date",
      "details",
      "story",
      "dress_code",
      "location",
      "rsvp",
    ],
    requiredSections: ["introduction", "date", "location", "rsvp"],
    sectionRhythm: ["introduction", "date", "details", "story", "dress_code", "location", "rsvp"],
    supportedSections: [
      "introduction",
      "date",
      "details",
      "story",
      "dress_code",
      "location",
      "rsvp",
    ],
  },
  name: "Premium",
  supportedModes: ["light", "dark", "toggleable"],
  version: "0.0.0",
};
