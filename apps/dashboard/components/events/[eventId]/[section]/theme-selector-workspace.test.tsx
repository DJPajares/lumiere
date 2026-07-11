// @vitest-environment jsdom

import { getTheme, resolveThemeRendererSlot } from "@lumiere/themes";
import type { Event, Theme } from "@lumiere/types";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DashboardAuthProvider,
  type DashboardApiClient,
  type DashboardAuthContextValue,
} from "../../../../auth/dashboard-auth-provider";
import { buildThemeGalleryEntries, ThemeSelectorWorkspace } from "./theme-selector-workspace";

describe("ThemeSelectorWorkspace", () => {
  afterEach(() => {
    cleanup();
  });

  it("loads themes and current event theme state", async () => {
    const user = userEvent.setup();
    const getEventTheme = vi.fn<DashboardApiClient["getEventTheme"]>(async () => ({
      selectedThemeId: "premium",
      theme: premiumTheme,
      themeConfig: {
        spacing: "editorial",
      },
      themeMode: "toggleable",
    }));
    const listThemes = vi.fn<DashboardApiClient["listThemes"]>(async () => ({
      themes: [premiumTheme, kidsTheme],
    }));

    renderWithAuth({
      getEventTheme,
      listThemes,
    });

    expect(screen.getByLabelText("Loading theme settings")).toBeTruthy();
    await screen.findByRole("heading", { name: "Premium" });

    expect(screen.queryByRole("heading", { name: "Kids" })).toBeNull();
    expect(screen.getByText("1 compatible · 1 unavailable for this setup")).toBeTruthy();
    expect(
      (screen.getByRole("button", { name: "Use Premium" }) as HTMLButtonElement).disabled,
    ).toBe(true);
    expect(screen.getByText("Amara & Jules")).toBeTruthy();
    expect(screen.getByText("Opening portrait")).toBeTruthy();
    const boundary = document.querySelector<HTMLElement>(
      '[data-invite-preview-boundary="isolated"]',
    )!;
    const introductionRenderer = resolveThemeRendererSlot(getTheme("premium")!, "introduction");

    expect(boundary.style.all).toBe("initial");
    expect(boundary.style.contain).toContain("style");
    expect(document.querySelector('[data-preview-theme="premium"]')).toBeTruthy();
    expect(
      document.querySelector(`[data-renderer-key="${introductionRenderer.rendererKey}"]`),
    ).toBeTruthy();
    expect(document.querySelectorAll("[data-expanded-theme-preview]")).toHaveLength(0);

    await user.click(screen.getByRole("button", { name: "Preview Premium" }));
    const dialog = await screen.findByRole("dialog", { name: "Premium invite preview" });

    await waitFor(() => expect(within(dialog).getByText("Invite renderer")).toBeTruthy());
    expect(document.querySelectorAll("[data-expanded-theme-preview]")).toHaveLength(1);
    await user.click(within(dialog).getByRole("tab", { name: "Mobile" }));
    expect(document.querySelector('[data-preview-viewport="mobile"]')).toBeTruthy();
    await user.click(within(dialog).getByRole("tab", { name: "Dark" }));
    expect(document.querySelector('[data-preview-mode="dark"]')).toBeTruthy();
  });

  it("applies a theme immediately with the mode selected on its card", async () => {
    const user = userEvent.setup();
    const getEvent = vi.fn<DashboardApiClient["getEvent"]>(async () => ({
      event: {
        ...dashboardEvent,
        eventType: "birthday",
      },
    }));
    const getEventTheme = vi.fn<DashboardApiClient["getEventTheme"]>(async () => ({
      selectedThemeId: "premium",
      theme: premiumTheme,
      themeConfig: {},
      themeMode: "toggleable",
    }));
    const listThemes = vi.fn<DashboardApiClient["listThemes"]>(async () => ({
      themes: [premiumTheme, kidsTheme],
    }));
    const updateEventTheme = vi.fn<DashboardApiClient["updateEventTheme"]>(async () => ({
      selectedThemeId: "kids",
      theme: kidsTheme,
      themeConfig: {
        headlineTone: "playful",
      },
      themeMode: "light",
    }));

    renderWithAuth({
      getEvent,
      getEventTheme,
      listThemes,
      updateEventTheme,
    });

    await screen.findByRole("heading", { name: "Kids" });
    await user.click(screen.getByRole("button", { name: "Use Kids" }));

    await waitFor(() => expect(updateEventTheme).toHaveBeenCalledTimes(1));
    expect(updateEventTheme).toHaveBeenCalledWith("evt_123", {
      selectedThemeId: "kids",
      themeConfig: {},
      themeMode: "light",
    });
    expect(await screen.findByText("Kids is now active.")).toBeTruthy();
  });

  it("keeps the gallery usable when an automatic theme save fails", async () => {
    const user = userEvent.setup();
    const getEvent = vi.fn<DashboardApiClient["getEvent"]>(async () => ({
      event: {
        ...dashboardEvent,
        eventType: "birthday",
      },
    }));
    const getEventTheme = vi.fn<DashboardApiClient["getEventTheme"]>(async () => ({
      selectedThemeId: "premium",
      theme: premiumTheme,
      themeConfig: {},
      themeMode: "toggleable",
    }));
    const listThemes = vi.fn<DashboardApiClient["listThemes"]>(async () => ({
      themes: [premiumTheme, kidsTheme],
    }));
    const updateEventTheme = vi.fn<DashboardApiClient["updateEventTheme"]>(async () => {
      throw new Error("Theme service is unavailable.");
    });

    renderWithAuth({
      getEvent,
      getEventTheme,
      listThemes,
      updateEventTheme,
    });

    await screen.findByRole("heading", { name: "Kids" });
    await user.click(screen.getByRole("button", { name: "Use Kids" }));

    expect(await screen.findByText("Theme service is unavailable.")).toBeTruthy();
    expect(updateEventTheme).toHaveBeenCalledWith("evt_123", {
      selectedThemeId: "kids",
      themeConfig: {},
      themeMode: "light",
    });
    expect(screen.getByRole("button", { name: "Use Kids" })).toBeTruthy();
  });

  it("prevents selecting themes that do not support the event type", async () => {
    const getEvent = vi.fn<DashboardApiClient["getEvent"]>(async () => ({
      event: dashboardEvent,
    }));
    const getEventTheme = vi.fn<DashboardApiClient["getEventTheme"]>(async () => ({
      selectedThemeId: "premium",
      theme: premiumTheme,
      themeConfig: {},
      themeMode: "toggleable",
    }));
    const listThemes = vi.fn<DashboardApiClient["listThemes"]>(async () => ({
      themes: [premiumTheme, kidsTheme],
    }));

    renderWithAuth({
      getEvent,
      getEventTheme,
      listThemes,
    });

    await screen.findByRole("heading", { name: "Premium" });

    expect(screen.queryByRole("heading", { name: "Kids" })).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Show incompatible (1)" }));

    expect(screen.getByRole("heading", { name: "Kids" })).toBeTruthy();
    expect(screen.getByText("Kids does not support wedding events.")).toBeTruthy();
    expect((screen.getByRole("button", { name: "Use Kids" }) as HTMLButtonElement).disabled).toBe(
      true,
    );

    const entries = buildThemeGalleryEntries({
      eventType: "wedding",
      modeFilter: "any",
      preferredMode: "light",
      themes: [legacyTheme, kidsTheme, premiumTheme],
    });

    expect(entries.map((entry) => entry.theme.id)).toEqual(["premium", "kids", "legacy"]);
    expect(entries[0]).toMatchObject({ isCompatible: true, publishReady: true });
    expect(entries[1]?.reasons).toContain("Kids does not support wedding events.");
    expect(entries[2]).toMatchObject({
      fallbackReason: expect.stringContaining("Lumiere Default"),
      isCompatible: false,
      previewDefinition: expect.objectContaining({ id: "lumiere-default" }),
    });

    const darkEntries = buildThemeGalleryEntries({
      eventType: "birthday",
      modeFilter: "dark",
      preferredMode: "light",
      themes: [kidsTheme],
    });

    expect(darkEntries[0]).toMatchObject({ isCompatible: false, resolvedMode: "dark" });
    expect(darkEntries[0]?.reasons).toContain("Kids does not support dark mode.");
  });
});

function renderWithAuth(apiClient: Partial<DashboardApiClient>) {
  const getEvent =
    apiClient.getEvent ??
    vi.fn<DashboardApiClient["getEvent"]>(async () => ({
      event: dashboardEvent,
    }));

  return render(
    <DashboardAuthProvider value={createAuthValue({ ...apiClient, getEvent })}>
      <ThemeSelectorWorkspace eventId="evt_123" />
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

const dashboardEvent: Event = {
  createdAt: "2030-01-01T00:00:00.000Z",
  eventType: "wedding",
  id: "evt_123",
  ownerUserId: "user_123",
  publicSettings: {},
  rsvpSettings: {},
  slug: "garden-evening",
  startsAt: "2030-06-01T10:30:00.000Z",
  status: "draft",
  themeConfig: {},
  themeMode: "toggleable",
  timezone: "Asia/Singapore",
  title: "Garden Evening",
  updatedAt: "2030-01-01T00:00:00.000Z",
  venueAddress: "18 Marina Gardens Drive",
  venueName: "Emerald Gardens",
};

const premiumTheme: Theme = {
  defaultMode: "toggleable",
  eventTypes: ["wedding", "dinner", "private_event"],
  id: "premium",
  metadata: {
    composition: {
      visualSystem: {
        compositionMap: "wedding-editorial",
      },
    },
    dashboardPreview: {
      summary: "Refined editorial theme for formal celebrations.",
      swatch: "#a36a2f",
    },
    description: "Editorial, intimate design for weddings and dinners.",
    designRead: "Luminous editorial layout with formal pacing.",
    imageTreatment: "Large editorial imagery with generous whitespace.",
    previewData: {
      eventTitle: "Amara & Jules",
      eyebrow: "You are invited",
      sections: [
        {
          summary: "Full-viewport opening with portrait media.",
          title: "Opening portrait",
          type: "introduction",
        },
        {
          summary: "Story and venue use an editorial rhythm.",
          title: "The celebration",
          type: "story",
        },
        {
          summary: "The reply is part of the invitation.",
          title: "Your reply",
          type: "rsvp",
        },
      ],
      subtitle: "An intimate garden celebration.",
      venueName: "Emerald Gardens",
    },
    radius: {
      lg: "0.875rem",
    },
    tokens: {
      light: {
        accent: "#a36a2f",
        accentStrong: "#653b1d",
        background: "#fbf6ed",
        border: "#d9c7ab",
        foreground: "#241c17",
        success: "#246c50",
        surface: "#fffdf8",
        surfaceMuted: "#efe2cf",
        warning: "#9b601b",
      },
    },
    typography: {
      css: {
        bodyFamily: "ui-sans-serif, system-ui, sans-serif",
        displayFamily: "ui-serif, Georgia, serif",
      },
    },
  },
  name: "Premium",
  supportedModes: ["light", "dark", "toggleable"],
  version: "0.0.0",
};

const kidsTheme: Theme = {
  defaultMode: "light",
  eventTypes: ["birthday", "kids_party"],
  id: "kids",
  metadata: {
    dashboardPreview: {
      summary: "Warm playful birthday theme without emoji-heavy UI.",
      swatch: "#ef7b45",
    },
    description: "Bright but controlled family party theme.",
    designRead: "Playful invite with rounded rhythm.",
    imageTreatment: "Bright image slots with rounded corners.",
    tokens: {
      light: {
        accent: "#ef7b45",
        accentStrong: "#b94d22",
        background: "#fff8df",
        border: "#efd88f",
        foreground: "#263238",
        success: "#26825f",
        surface: "#fffef8",
        surfaceMuted: "#fcecb7",
        warning: "#b56b14",
      },
    },
  },
  name: "Kids",
  supportedModes: ["light"],
  version: "0.0.0",
};

const legacyTheme: Theme = {
  ...premiumTheme,
  id: "legacy",
  name: "Legacy",
};
