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
    window.localStorage.clear();
  });

  it("loads sections supported by the selected theme", async () => {
    const getEventTheme = vi.fn<DashboardApiClient["getEventTheme"]>(async () => ({
      selectedThemeId: "premium",
      theme: premiumThemeWithCustom,
      themeConfig: {},
      themeMode: "toggleable",
    }));
    const listEventSections = vi.fn<DashboardApiClient["listEventSections"]>(async () => ({
      sections: [savedCustomSection, savedSecondCustomSection],
    }));

    renderWithAuth(createApiClientStub({ getEventTheme, listEventSections }));

    expect(screen.getByLabelText("Loading sections")).toBeTruthy();
    expect(await screen.findByText("Configure content for Spring Dinner")).toBeTruthy();
    expect(screen.getByText("Sections in invite order")).toBeTruthy();
    expect(screen.queryByText("Live preview")).toBeNull();
    expect(screen.getByText("Recommended next section")).toBeTruthy();
    expect(screen.queryByText(/Preview contract:/)).toBeNull();
    expect(screen.getByRole("button", { name: "Preview" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Add custom text" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Edit Introduction" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Edit Custom Text: Arrival notes" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Edit Custom Text: Shuttle schedule" })).toBeTruthy();
    expect(document.querySelectorAll('[data-section-card-key^="custom"]')).toHaveLength(2);
    expect(screen.queryByRole("region", { name: "Introduction" })).toBeNull();
    ["Introduction", "Date and Time", "Story", "Dress Code", "Location", "RSVP"].forEach(
      (label) => {
        expect(screen.getAllByText(label).length).toBeGreaterThan(0);
      },
    );
  });

  it("switches between always-open detailed cards and single-row list items", async () => {
    const user = userEvent.setup();

    renderWithAuth(createApiClientStub());

    await screen.findByText("Configure content for Spring Dinner");
    const sectionPanel = screen.getByRole("region", { name: "Section order and validation" });
    const sectionOrder = sectionPanel.querySelector("[data-section-order-view]");

    expect(sectionOrder?.getAttribute("data-section-order-view")).toBe("detailed");
    expect(within(sectionPanel).getByRole("button", { name: "Edit Story" })).toBeTruthy();
    expect(
      within(sectionPanel).queryByRole("button", { name: "Minimalist section view" }),
    ).toBeNull();

    await user.click(within(sectionPanel).getByRole("button", { name: "List section view" }));

    expect(sectionOrder?.getAttribute("data-section-order-view")).toBe("list");
    expect(sectionPanel.querySelectorAll('[data-section-row-layout="single"]')).toHaveLength(7);
    expect(sectionPanel.querySelectorAll('[data-mobile-actions="menu"]')).toHaveLength(7);
    expect(within(sectionPanel).getByRole("button", { name: "Edit Story" })).toBeTruthy();

    await user.click(within(sectionPanel).getByRole("button", { name: "Introduction actions" }));

    const mobileActions = await screen.findByRole("menu");

    expect(within(mobileActions).getByRole("menuitemcheckbox", { name: "Enabled" })).toBeTruthy();
    expect(within(mobileActions).getByRole("menuitem", { name: "Visibility" })).toBeTruthy();
    expect(within(mobileActions).getByRole("menuitem", { name: "Move down" })).toBeTruthy();
    expect(within(mobileActions).getByRole("menuitem", { name: "Edit" })).toBeTruthy();
    expect(window.localStorage.getItem("lumiere.dashboard.content-section-view")).toBe("list");
  });

  it("opens the complete draft from the Preview button", async () => {
    const user = userEvent.setup();

    renderWithAuth(createApiClientStub());

    await screen.findByText("Configure content for Spring Dinner");
    await user.click(screen.getByLabelText("Enable Introduction"));
    await confirmSectionControlUpdate(user);
    await user.click(screen.getByRole("button", { name: "Preview" }));

    const preview = await screen.findByRole("dialog", { name: "Preview invitation" });

    expect(within(preview).getByRole("button", { name: "Guest" })).toBeTruthy();
    expect(within(preview).getByRole("button", { name: "Public" })).toBeTruthy();
    expect(within(preview).getByText(/visible sections/)).toBeTruthy();
    expect(within(preview).getAllByText("Spring Dinner").length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: "Close Preview invitation" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Preview invitation" })).toBeNull(),
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
    await confirmSectionControlUpdate(user);
    await user.click(screen.getByRole("button", { name: "Edit Location" }));

    const locationEditor = within(screen.getByRole("region", { name: "Location" }));
    const showMapPreview = locationEditor.getByLabelText("Show map preview");
    const allowMapInteraction = locationEditor.getByLabelText(/^Allow map interaction/);

    expect((showMapPreview as HTMLInputElement).checked).toBe(true);
    expect((allowMapInteraction as HTMLInputElement).checked).toBe(false);
    await user.click(allowMapInteraction);

    expect((allowMapInteraction as HTMLInputElement).checked).toBe(true);
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
    await confirmSectionControlUpdate(user);
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
    await confirmSectionControlUpdate(user);
    await user.click(screen.getByRole("button", { name: "Edit Story" }));
    const storyEditor = within(screen.getByRole("region", { name: "Story" }));
    const legacyBody = storyEditor.getByLabelText("Paragraph body") as HTMLTextAreaElement;

    expect(legacyBody.value).toBe("A legacy paragraph without a title.");
    expect(storyEditor.getByText("Story cover photo (optional)")).toBeTruthy();
    expect(
      storyEditor.getByText(
        "Shown once beneath the story title. It remains visible whether individual paragraph photos are shown or hidden.",
      ),
    ).toBeTruthy();
    await user.type(storyEditor.getByLabelText("Paragraph title (optional)"), "First chapter");
    await user.click(storyEditor.getByRole("button", { name: "Add story paragraph" }));

    const titleInputs = storyEditor.getAllByLabelText("Paragraph title (optional)");
    const bodyInputs = storyEditor.getAllByLabelText("Paragraph body");

    await user.click(storyEditor.getAllByText("Paragraph photo (optional)")[1]!);

    const imageUrlInputs = storyEditor.getAllByLabelText("Image URL");
    const imageAltInputs = storyEditor.getAllByLabelText("Alt text");

    await user.type(titleInputs[1]!, "Second chapter");
    await user.clear(bodyInputs[1]!);
    await user.type(bodyInputs[1]!, "A structured paragraph with a title.");
    await user.type(imageUrlInputs[1]!, "https://images.example.com/second-chapter.jpg");
    await user.type(imageAltInputs[1]!, "A candlelit table shared with friends");

    const storyPhotoToggles = storyEditor.getAllByRole("checkbox", {
      name: /Show this story photo/,
    }) as HTMLInputElement[];

    expect(storyPhotoToggles).toHaveLength(2);
    expect(storyPhotoToggles.every((toggle) => toggle.checked)).toBe(true);

    await user.click(storyPhotoToggles[1]!);

    expect(storyPhotoToggles[1]!.checked).toBe(false);
    await user.click(storyEditor.getAllByRole("button", { name: "Move up" })[1]!);

    expect(
      (storyEditor.getAllByLabelText("Paragraph title (optional)")[0] as HTMLInputElement).value,
    ).toBe("Second chapter");
    expect((storyEditor.getAllByLabelText("Paragraph body")[0] as HTMLTextAreaElement).value).toBe(
      "A structured paragraph with a title.",
    );
    expect((storyEditor.getAllByLabelText("Image URL")[0] as HTMLInputElement).value).toBe(
      "https://images.example.com/second-chapter.jpg",
    );
    expect((storyEditor.getAllByLabelText("Alt text")[0] as HTMLInputElement).value).toBe(
      "A candlelit table shared with friends",
    );
    expect(
      (
        storyEditor.getAllByRole("checkbox", {
          name: /Show this story photo/,
        })[0] as HTMLInputElement
      ).checked,
    ).toBe(false);

    await user.clear(storyEditor.getAllByLabelText("Paragraph body")[0]!);
    await user.click(getModalFooter().getByRole("button", { name: "Save sections" }));

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
    expect(screen.getByLabelText("Enable Introduction").getAttribute("aria-disabled")).toBe("true");
    expect(screen.getByLabelText("Enable Story").getAttribute("aria-disabled")).not.toBe("true");
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

    expect(screen.getAllByText("Needs fixes").length).toBeGreaterThan(0);
    expect(updateEventSections).not.toHaveBeenCalled();
  });

  it("shows dirty state and confirms before canceling unsaved edits", async () => {
    const user = userEvent.setup();

    renderWithAuth(createApiClientStub());

    await screen.findByText("Configure content for Spring Dinner");
    await user.click(screen.getByLabelText("Enable Introduction"));
    await confirmSectionControlUpdate(user);
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
    const getEventTheme = vi.fn<DashboardApiClient["getEventTheme"]>(async () => ({
      selectedThemeId: "premium",
      theme: premiumThemeWithCustom,
      themeConfig: {},
      themeMode: "toggleable",
    }));
    const sectionStore = new Map<string, EventSection>();
    const updateEventSection = vi.fn<DashboardApiClient["updateEventSection"]>(
      async (eventId, sectionKey, input) => {
        const previous = sectionStore.get(sectionKey);
        const section: EventSection = {
          content: input.content as Record<string, JsonValue>,
          createdAt: previous?.createdAt ?? "2030-01-01T00:00:00.000Z",
          enabled: input.enabled ?? true,
          eventId,
          id: input.id ?? previous?.id ?? `section_${sectionStore.size}`,
          sectionKey,
          sectionType: input.sectionType,
          settings: (input.settings ?? {}) as Record<string, JsonValue>,
          sortOrder: previous?.sortOrder ?? sectionStore.size,
          updatedAt: "2030-01-01T00:00:00.000Z",
          visibility: input.visibility,
        };

        sectionStore.set(sectionKey, section);

        return { section };
      },
    );
    const reorderEventSections = vi.fn<DashboardApiClient["reorderEventSections"]>(
      async (eventId, input) => {
        const sections = input.sectionKeys.map((sectionKey, sortOrder) => {
          const section = sectionStore.get(sectionKey);

          if (!section) {
            throw new Error(`Missing section ${sectionKey}`);
          }

          return {
            ...section,
            eventId,
            sortOrder,
          };
        });

        sectionStore.clear();
        sections.forEach((section) => sectionStore.set(section.sectionKey, section));

        return { sections };
      },
    );
    const listEventSections = vi.fn<DashboardApiClient["listEventSections"]>(async () => ({
      sections: [...sectionStore.values()],
    }));
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
        getEventTheme,
        listEventSections,
        reorderEventSections,
        updateEvent,
        updateEventSection,
      }),
    );

    await screen.findByText("Configure content for Spring Dinner");
    await user.click(screen.getByRole("button", { name: "Add custom text" }));
    const firstCustomEditor = within(screen.getByRole("region", { name: "Custom Text" }));
    await user.clear(firstCustomEditor.getByLabelText("Title"));
    await user.type(firstCustomEditor.getByLabelText("Title"), "Arrival notes");
    await user.click(getModalFooter().getByRole("button", { name: "Save sections" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Edit Custom Text" })).toBeNull(),
    );

    await user.click(screen.getByRole("button", { name: "Add custom text" }));
    const secondCustomEditor = within(screen.getByRole("region", { name: "Custom Text" }));
    await user.clear(secondCustomEditor.getByLabelText("Title"));
    await user.type(secondCustomEditor.getByLabelText("Title"), "Shuttle schedule");
    await user.click(getModalFooter().getByRole("button", { name: "Save sections" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Edit Custom Text" })).toBeNull(),
    );

    await user.click(screen.getByLabelText("Enable Introduction"));
    await confirmSectionControlUpdate(user);
    await user.click(screen.getByRole("button", { name: "Edit Introduction" }));
    const introductionEditor = within(screen.getByRole("region", { name: "Introduction" }));
    await user.clear(introductionEditor.getByLabelText(/^Title/));
    await user.type(introductionEditor.getByLabelText(/^Title/), "Garden Supper");
    await user.click(getModalFooter().getByRole("button", { name: "Save sections" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Edit Introduction" })).toBeNull(),
    );

    await user.click(screen.getByLabelText("Enable Date and Time"));
    await confirmSectionControlUpdate(user);
    await user.click(screen.getByLabelText("Enable Details"));
    await confirmSectionControlUpdate(user);
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
    await confirmSectionControlUpdate(user);
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
    await confirmSectionControlUpdate(user);
    await user.click(screen.getByRole("button", { name: "Date and Time move up" }));
    await user.click(screen.getByLabelText("Enable RSVP"));
    await confirmSectionControlUpdate(user);
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

    await waitFor(() => expect(updateEventSection).toHaveBeenCalledTimes(12));
    await waitFor(() => expect(updateEvent).toHaveBeenCalledTimes(1));
    await user.click(screen.getAllByRole("button", { name: "Save sections" })[0]!);
    await waitFor(() => expect(updateEventSection).toHaveBeenCalledTimes(12));
    await waitFor(() => expect(reorderEventSections).toHaveBeenCalledTimes(1));

    expect(updateEventSection).toHaveBeenCalledWith(
      "evt_123",
      "introduction",
      expect.objectContaining({
        content: expect.objectContaining({ title: "Garden Supper" }),
        visibility: "guest_only",
      }),
    );
    expect(updateEventSection).toHaveBeenCalledWith(
      "evt_123",
      "details",
      expect.objectContaining({
        content: expect.objectContaining({
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
        }),
      }),
    );
    expect(updateEventSection).toHaveBeenCalledWith(
      "evt_123",
      "dress-code",
      expect.objectContaining({
        content: expect.objectContaining({
          cards: expect.arrayContaining([expect.objectContaining({ title: "Garden formal" })]),
          paletteTitle: "A garden celebration palette",
        }),
      }),
    );
    expect(reorderEventSections).toHaveBeenCalledWith("evt_123", {
      expectedSectionKeys: expect.any(Array),
      sectionKeys: ["rsvp", "date", "introduction", "details", "dress-code", "custom", "custom-2"],
    });
    expect(updateEvent).toHaveBeenCalledWith("evt_123", {
      rsvpSettings: {
        collectGuestMessage: false,
        collectGuestNames: false,
      },
    });
  });
});

function getModalFooter() {
  const footer = document.querySelector('[data-slot="responsive-modal-footer"]');

  if (!(footer instanceof HTMLElement)) {
    throw new Error("Expected the responsive modal footer to be rendered.");
  }

  return within(footer);
}

async function confirmSectionControlUpdate(user: ReturnType<typeof userEvent.setup>) {
  const dialog = await screen.findByRole("alertdialog", { name: "Confirm section update" });
  await user.click(within(dialog).getByRole("button", { name: "Confirm update" }));
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
  const sectionStore = new Map<string, EventSection>();
  const updateEventSection = vi.fn<DashboardApiClient["updateEventSection"]>(
    async (eventId, sectionKey, input) => {
      const previous = sectionStore.get(sectionKey);
      const section: EventSection = {
        content: input.content as Record<string, JsonValue>,
        createdAt: previous?.createdAt ?? "2030-01-01T00:00:00.000Z",
        enabled: input.enabled ?? true,
        eventId,
        id: input.id ?? previous?.id ?? `section_${sectionStore.size}`,
        sectionKey,
        sectionType: input.sectionType,
        settings: (input.settings ?? {}) as Record<string, JsonValue>,
        sortOrder: previous?.sortOrder ?? sectionStore.size,
        updatedAt: "2030-01-01T00:00:00.000Z",
        visibility: input.visibility,
      };

      sectionStore.set(sectionKey, section);

      return { section };
    },
  );

  return {
    getEvent,
    getEventTheme,
    listEventSections,
    updateEventSection,
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
    image: {
      alt: "Legacy section-wide story feature",
      url: "https://images.example.com/legacy-story-feature.jpg",
    },
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

const premiumThemeWithCustom: Theme = {
  ...premiumTheme,
  metadata: {
    ...premiumTheme.metadata,
    sectionRhythm: [...(premiumTheme.metadata.sectionRhythm as string[]), "custom"],
    supportedSections: [...(premiumTheme.metadata.supportedSections as string[]), "custom"],
  },
};

const savedCustomSection: EventSection = {
  content: {
    blocks: [{ body: "Parking is available beside the venue." }],
    title: "Arrival notes",
  },
  createdAt: "2030-01-01T00:00:00.000Z",
  enabled: true,
  eventId: "evt_123",
  id: "section_custom",
  sectionKey: "custom",
  sectionType: "custom",
  settings: {},
  sortOrder: 0,
  updatedAt: "2030-01-01T00:00:00.000Z",
  visibility: "public",
};

const savedSecondCustomSection: EventSection = {
  ...savedCustomSection,
  content: {
    blocks: [{ body: "The final shuttle leaves at midnight." }],
    title: "Shuttle schedule",
  },
  id: "section_custom_2",
  sectionKey: "custom-2",
  sortOrder: 1,
};
