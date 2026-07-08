// @vitest-environment jsdom

import type { Theme } from "@lumiere/types";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DashboardAuthProvider,
  type DashboardApiClient,
  type DashboardAuthContextValue,
} from "../../../auth/dashboard-auth-provider";
import { ThemeSelectorWorkspace } from "./theme-selector-workspace";

describe("ThemeSelectorWorkspace", () => {
  afterEach(() => {
    cleanup();
  });

  it("loads themes and current event theme state", async () => {
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
    const premiumOption = await screen.findByRole("button", { name: /Premium/ });

    expect(premiumOption).toBeTruthy();
    expect(screen.getByText("Kids")).toBeTruthy();
    expect(screen.getByDisplayValue(/"spacing": "editorial"/)).toBeTruthy();
    expect(premiumOption.getAttribute("aria-pressed")).toBe("true");
  });

  it("selects a theme and saves supported mode plus JSON settings", async () => {
    const user = userEvent.setup();
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
      getEventTheme,
      listThemes,
      updateEventTheme,
    });

    await screen.findByRole("button", { name: /Premium/ });
    await user.click(screen.getByRole("button", { name: /Kids/ }));
    fireEvent.change(screen.getByLabelText("Theme settings JSON"), {
      target: {
        value: '{"headlineTone":"playful"}',
      },
    });
    await user.click(screen.getByRole("button", { name: "Save theme" }));

    await waitFor(() => expect(updateEventTheme).toHaveBeenCalledTimes(1));
    expect(updateEventTheme).toHaveBeenCalledWith("evt_123", {
      selectedThemeId: "kids",
      themeConfig: {
        headlineTone: "playful",
      },
      themeMode: "light",
    });
    expect(await screen.findByText("Theme settings saved.")).toBeTruthy();
  });

  it("shows validation near invalid theme settings", async () => {
    const user = userEvent.setup();
    const updateEventTheme = vi.fn();
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
      getEventTheme,
      listThemes,
      updateEventTheme,
    });

    await screen.findByRole("button", { name: /Premium/ });
    fireEvent.change(screen.getByLabelText("Theme settings JSON"), {
      target: {
        value: "[invalid",
      },
    });
    await user.click(screen.getByRole("button", { name: "Save theme" }));

    expect(await screen.findByText("Theme settings must be valid JSON.")).toBeTruthy();
    expect(updateEventTheme).not.toHaveBeenCalled();
  });
});

function renderWithAuth(apiClient: Partial<DashboardApiClient>) {
  return render(
    <DashboardAuthProvider value={createAuthValue(apiClient)}>
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
    user: {
      email: "manager@example.com",
    } as DashboardAuthContextValue["user"],
  };
}

const premiumTheme: Theme = {
  defaultMode: "toggleable",
  eventTypes: ["wedding", "dinner", "private_event"],
  id: "premium",
  metadata: {
    dashboardPreview: {
      summary: "Refined editorial theme for formal celebrations.",
      swatch: "#a36a2f",
    },
    description: "Editorial, intimate design for weddings and dinners.",
    designRead: "Luminous editorial layout with formal pacing.",
    imageTreatment: "Large editorial imagery with generous whitespace.",
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
