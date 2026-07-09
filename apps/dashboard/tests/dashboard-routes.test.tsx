import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  DashboardAuthProvider,
  type DashboardAuthContextValue,
  toFriendlyAuthError,
} from "../auth/dashboard-auth-provider";
import { createDashboardApiClient } from "../lib/dashboard-api";
import EventSectionPage from "../app/events/[eventId]/[section]/page";
import EventPage from "../app/events/[eventId]/page";
import EventsPage from "../app/events/page";
import LoginPage from "../app/login/page";
import DashboardHome from "../app/page";

vi.mock("next/navigation", () => ({
  usePathname: () => "/events",
  useRouter: () => ({
    replace: vi.fn(),
  }),
}));

describe("dashboard routes", () => {
  it("renders the root dashboard shell for authenticated managers", () => {
    const html = renderWithAuth(createElement(DashboardHome));

    expect(html).toContain("Lumiere Dashboard");
    expect(html).toContain("manager@example.com");
    expect(html).toContain("Sign out");
    expect(html).toContain("Event list placeholder");
  });

  it("renders the login form for signed-out managers", () => {
    const html = renderWithAuth(createElement(LoginPage), unauthenticatedAuthValue);

    expect(html).toContain("Manager sign in");
    expect(html).toContain("Manager email");
    expect(html).toContain("Password");
    expect(html).toContain("Sign in");
  });

  it("renders the protected route redirect state for signed-out managers", () => {
    const html = renderWithAuth(createElement(EventsPage), unauthenticatedAuthValue);

    expect(html).toContain("Sign in required");
    expect(html).toContain("Protected dashboard routes require a manager session.");
    expect(html).toContain("Go to sign in");
  });

  it("renders the event list route for authenticated managers", () => {
    const html = renderWithAuth(createElement(EventsPage));

    expect(html).toContain("Events");
    expect(html).toContain("Published events");
    expect(html).toContain("New event");
  });

  it("renders the event detail shell", async () => {
    const element = await EventPage({
      params: Promise.resolve({
        eventId: "demo-event",
      }),
    });
    const html = renderWithAuth(element);

    expect(html).toContain("Event workspace");
    expect(html).toContain("Loading event overview");
    expect(html).toContain("/events/demo-event/content");
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
    expect(html).toContain("Loading guest groups");
    expect(html).toContain("/events/demo-event/guests");
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
  status: "authenticated",
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
