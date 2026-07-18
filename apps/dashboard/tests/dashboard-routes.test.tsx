// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DashboardAuthProvider,
  type DashboardAuthContextValue,
  toFriendlyAuthError,
} from "../auth/dashboard-auth-provider";
import { createDashboardApiClient } from "../lib/dashboard-api";
import { metadata as dashboardAppMetadata } from "../app/layout";
import EventSectionPage from "../app/events/[eventId]/[section]/page";
import EventPage from "../app/events/[eventId]/page";
import EventsPage from "../app/events/page";
import LoginPage from "../app/login/page";
import DashboardHome from "../app/page";
import AccountSettingsPage from "../app/settings/page";
import ProfileSettingsPage from "../app/settings/profile/page";
import SignupPage from "../app/signup/page";

const { redirect, routerReplace } = vi.hoisted(() => ({
  redirect: vi.fn(),
  routerReplace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect,
  usePathname: () => "/events",
  useRouter: () => ({
    replace: routerReplace,
  }),
}));

describe("dashboard routes", () => {
  afterEach(() => {
    cleanup();
    routerReplace.mockClear();
    window.history.replaceState({}, "", "/");
  });

  it("declares dashboard PWA metadata and icons", () => {
    expect(dashboardAppMetadata.applicationName).toBe("Lumiere Dashboard");
    expect(dashboardAppMetadata.manifest).toBe("/manifest.webmanifest");
    expect(dashboardAppMetadata.appleWebApp).toMatchObject({
      capable: true,
      title: "Lumiere Dashboard",
    });
    expect(JSON.stringify(dashboardAppMetadata.icons)).toContain("/icons/icon-192.png");
    expect(JSON.stringify(dashboardAppMetadata.icons)).toContain("/icons/icon-512.png");
    expect(JSON.stringify(dashboardAppMetadata.icons)).toContain("/apple-touch-icon.png");
    expect(JSON.stringify(dashboardAppMetadata.icons)).toContain("/icons/maskable-icon-512.png");
    expect(JSON.stringify(dashboardAppMetadata.icons)).not.toContain(".svg");
    expect(dashboardAppMetadata.robots).toMatchObject({
      follow: false,
      index: false,
    });
  });

  it("declares dashboard install icons in the web manifest", () => {
    const manifest = JSON.parse(readFileSync("public/manifest.webmanifest", "utf8"));

    expect(manifest).toMatchObject({
      background_color: "#f7f5f0",
      name: "Lumiere Dashboard",
      short_name: "Dashboard",
      theme_color: "#6f5a38",
    });
    expect(manifest.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          src: "/icons/icon-192.png",
          purpose: "any",
        }),
        expect.objectContaining({
          src: "/icons/maskable-icon-192.png",
          purpose: "maskable",
        }),
        expect.objectContaining({
          src: "/icons/maskable-icon-512.png",
          purpose: "maskable",
        }),
      ]),
    );
    expect(JSON.stringify(manifest.icons)).not.toContain(".svg");
  });

  it("renders the root dashboard shell for authenticated managers", () => {
    const html = renderWithAuth(createElement(DashboardHome));

    expect(html).toContain("Lumiere Dashboard");
    expect(html).toContain('aria-label="Notifications"');
    expect(html).toContain('aria-label="Open account menu for Lumiere manager"');
    expect(html).toContain("Manager overview");
    expect(html).toContain('aria-label="Loading manager overview"');
    expect(html).not.toContain("Event list placeholder");
  });

  it("renders and submits the login form for signed-out managers", async () => {
    const html = renderWithAuth(createElement(LoginPage), unauthenticatedAuthValue);
    const user = userEvent.setup();
    const signIn = vi.fn(async () => ({ ok: true as const }));

    expect(html).toContain("Manager sign in");
    expect(html).toContain("Manager email");
    expect(html).toContain("Password");
    expect(html).toContain("Sign in");

    window.history.replaceState({}, "", "/login?redirectTo=/events/demo-event/content");
    render(
      createElement(DashboardAuthProvider, {
        value: { ...unauthenticatedAuthValue, signIn },
        children: createElement(LoginPage),
      }),
    );

    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(screen.getByRole("alert").textContent).toContain(
      "Enter the manager email and password.",
    );
    await user.type(screen.getByLabelText("Manager email"), " manager@example.com ");
    await user.type(screen.getByLabelText("Password"), "correct horse battery staple");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(signIn).toHaveBeenCalledWith({
      email: "manager@example.com",
      password: "correct horse battery staple",
    });
    expect(routerReplace).toHaveBeenCalledWith("/events/demo-event/content");
  });

  it("creates a manager account and handles email confirmation", async () => {
    const html = renderWithAuth(createElement(SignupPage), unauthenticatedAuthValue);
    const user = userEvent.setup();
    const signUp = vi.fn(async () => ({
      ok: true as const,
      requiresEmailConfirmation: true,
    }));

    expect(html).toContain("Create manager account");
    expect(html).toContain("Manager name");
    expect(html).toContain("Confirm password");

    window.history.replaceState({}, "", "/signup?redirectTo=/events/demo-event/settings");
    render(
      createElement(DashboardAuthProvider, {
        value: { ...unauthenticatedAuthValue, signUp },
        children: createElement(SignupPage),
      }),
    );

    await user.click(screen.getByRole("button", { name: "Create manager account" }));
    expect(screen.getByRole("alert").textContent).toContain("Complete all manager account fields.");

    await user.type(screen.getByLabelText("Manager name"), " Eva Hernandez ");
    await user.type(screen.getByLabelText("Manager email"), " eva@example.com ");
    await user.type(screen.getByLabelText("Password"), "correct horse battery staple");
    await user.type(screen.getByLabelText("Confirm password"), "correct horse battery staple");
    await user.click(screen.getByRole("button", { name: "Create manager account" }));

    expect(signUp).toHaveBeenCalledWith({
      displayName: "Eva Hernandez",
      email: "eva@example.com",
      password: "correct horse battery staple",
    });
    expect(screen.getByRole("status").textContent).toContain("Check your email");
    expect(screen.getByRole("link", { name: "Back to sign in" }).getAttribute("href")).toBe(
      "/login?redirectTo=%2Fevents%2Fdemo-event%2Fsettings",
    );
  });

  it("redirects the redundant event index to Home", () => {
    EventsPage();

    expect(redirect).toHaveBeenCalledWith("/");
  });

  it("renders the event detail shell", async () => {
    const element = await EventPage({
      params: Promise.resolve({
        eventId: "demo-event",
      }),
    });
    const html = renderWithAuth(element);

    expect(html).toContain("Event workspace");
    expect(html).toContain('aria-label="Breadcrumb"');
    expect(html).toContain("Overview for the selected event");
    expect(html).toContain('href="/events/demo-event"');
    expect(html).toContain(">Overview</a>");
    expect(html).toContain("Loading event overview");
    expect(html).not.toContain("Current context");
  });

  it("renders management section routes", async () => {
    const element = await EventSectionPage({
      params: Promise.resolve({
        eventId: "demo-event",
        section: "guests",
      }),
    });
    const html = renderWithAuth(element);

    expect(html).toContain("Guests setup");
    expect(html).toContain("Guests for the selected event");
    expect(html).toContain('href="/events/demo-event/guests"');
    expect(html).toContain("Guests");
    expect(html).toContain("Loading guest groups");
    expect(html).not.toContain("Current:");
  });

  it("renders the event settings editor route", async () => {
    const element = await EventSectionPage({
      params: Promise.resolve({
        eventId: "demo-event",
        section: "settings",
      }),
    });
    const html = renderWithAuth(element);

    expect(html).toContain("Settings setup");
    expect(html).toContain("Settings for the selected event");
    expect(html).toContain('href="/events/demo-event/settings"');
    expect(html).toContain("Loading event settings");
    expect(html).not.toContain("Settings workspace placeholder");
  });

  it("renders protected manager account and profile routes", () => {
    const accountHtml = renderWithAuth(createElement(AccountSettingsPage));
    const profileHtml = renderWithAuth(createElement(ProfileSettingsPage));

    expect(accountHtml).toContain("Account settings");
    expect(accountHtml).toContain("Supabase manager account");
    expect(accountHtml).toContain("manager@example.com");
    expect(accountHtml).toContain('href="/settings/profile"');
    expect(profileHtml).toContain("Edit profile");
    expect(profileHtml).toContain("Save profile");
  });

  it("adds the Supabase access token to authenticated API requests", async () => {
    let requestInit: RequestInit | undefined;
    const fetch = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      requestInit = init;

      return Response.json({ events: [] });
    });
    const apiClient = createDashboardApiClient(createSupabaseStub("manager-token"), {
      baseUrl: "https://api.example.test",
      fetch,
    });

    await apiClient.authorizedFetch("/events");

    const headers = new Headers(requestInit?.headers);

    expect(headers.get("authorization")).toBe("Bearer manager-token");
  });

  it("maps Supabase auth failures to manager-friendly messages", () => {
    expect(toFriendlyAuthError("Invalid login credentials")).toBe(
      "Email or password did not match a dashboard manager account.",
    );
  });
});

const authenticatedAuthValue: DashboardAuthContextValue = {
  apiClient: null,
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

const unauthenticatedAuthValue: DashboardAuthContextValue = {
  ...authenticatedAuthValue,
  getAccessToken: async () => null,
  session: null,
  status: "unauthenticated",
  user: null,
};

function renderWithAuth(
  element: ReturnType<typeof createElement>,
  value: DashboardAuthContextValue = authenticatedAuthValue,
) {
  return renderToStaticMarkup(
    createElement(DashboardAuthProvider, {
      value,
      children: element,
    }),
  );
}

function createSupabaseStub(accessToken: string) {
  return {
    auth: {
      getSession: async () => ({
        data: {
          session: {
            access_token: accessToken,
          },
        },
        error: null,
      }),
    },
  };
}
