// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DashboardAuthProvider,
  type DashboardAuthContextValue,
} from "../../auth/dashboard-auth-provider";
import { ProfileSettingsWorkspace } from "./profile-settings-workspace";

describe("ProfileSettingsWorkspace", () => {
  afterEach(() => cleanup());

  it("saves validated manager profile metadata", async () => {
    const user = userEvent.setup();
    const updateProfile = vi.fn(async () => ({ ok: true }) as const);

    renderProfile(updateProfile);

    const displayName = screen.getByLabelText("Display name");
    await user.clear(displayName);
    await user.type(displayName, "Avery Tan");
    await user.type(screen.getByLabelText("Avatar URL"), "https://images.example.test/avery.jpg");
    await user.click(screen.getByRole("button", { name: "Save profile" }));

    expect(updateProfile).toHaveBeenCalledWith({
      avatarUrl: "https://images.example.test/avery.jpg",
      displayName: "Avery Tan",
    });
    expect(await screen.findByText("Manager profile saved.")).toBeTruthy();
  });

  it("shows local URL validation and Supabase update failures", async () => {
    const user = userEvent.setup();
    const updateProfile = vi.fn(
      async () => ({ error: "Profile update failed.", ok: false }) as const,
    );

    renderProfile(updateProfile);

    await user.type(screen.getByLabelText("Avatar URL"), "http://images.example.test/avatar.jpg");
    await user.click(screen.getByRole("button", { name: "Save profile" }));
    expect(screen.getByRole("alert").textContent).toBe("Use an HTTPS avatar URL.");
    expect(updateProfile).not.toHaveBeenCalled();

    await user.clear(screen.getByLabelText("Avatar URL"));
    await user.click(screen.getByRole("button", { name: "Save profile" }));
    expect(await screen.findByText("Profile update failed.")).toBeTruthy();
  });
});

function renderProfile(updateProfile: DashboardAuthContextValue["updateProfile"]) {
  const authValue: DashboardAuthContextValue = {
    apiClient: null,
    errorMessage: null,
    getAccessToken: async () => "manager-token",
    session: {
      access_token: "manager-token",
      user: {
        email: "manager@example.com",
        user_metadata: { display_name: "Manager" },
      },
    } as unknown as DashboardAuthContextValue["session"],
    signIn: async () => ({ ok: true }),
    signOut: async () => ({ ok: true }),
    signUp: async () => ({ ok: true, requiresEmailConfirmation: false }),
    status: "authenticated",
    updateProfile,
    user: {
      email: "manager@example.com",
      user_metadata: { display_name: "Manager" },
    } as unknown as DashboardAuthContextValue["user"],
  };

  return render(
    <DashboardAuthProvider value={authValue}>
      <ProfileSettingsWorkspace />
    </DashboardAuthProvider>,
  );
}
