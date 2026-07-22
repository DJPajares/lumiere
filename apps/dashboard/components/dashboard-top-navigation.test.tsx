// @vitest-environment jsdom

import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Event } from "@lumiere/types";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  DashboardAuthProvider,
  type DashboardApiClient,
  type DashboardAuthContextValue,
} from "../auth/dashboard-auth-provider";
import { DashboardTopNavigation } from "./dashboard-top-navigation";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock("./dashboard-top-bar-controls", () => ({
  DashboardTopBarControls: () => <div data-testid="top-bar-controls">Account controls</div>,
}));

describe("DashboardTopNavigation", () => {
  let media: ReturnType<typeof installMatchMedia>;

  beforeEach(() => {
    (
      globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
    media = installMatchMedia();
    Object.defineProperty(window, "scrollY", { configurable: true, value: 0, writable: true });
    window.requestAnimationFrame = (callback) => window.setTimeout(() => callback(0), 0);
    window.cancelAnimationFrame = (id) => window.clearTimeout(id);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders a centered desktop rail and a leftmost mobile and tablet trigger", () => {
    render(<DashboardTopNavigation activePath="/events/demo-event/theme" />);

    const desktopNavigation = screen.getByRole("navigation", { name: "Dashboard navigation" });
    const mobileTrigger = screen.getByRole("button", { name: "Open dashboard navigation" });
    const brand = screen.getByRole("link", { name: "Lumiere Dashboard" });
    const topBar = screen.getByRole("banner");
    const shell = topBar.firstElementChild;
    const activeLink = screen.getByRole("link", { name: "Theme" });

    expect(desktopNavigation.className).toContain("justify-self-center");
    expect(desktopNavigation.className).toContain("lg:flex");
    expect(mobileTrigger.className).toContain("lg:hidden");
    expect(topBar.className).not.toContain("px-3");
    expect(topBar.className).not.toContain("pt-3");
    expect(shell?.className).toContain("w-full");
    expect(shell?.className).not.toContain("max-w-7xl");
    expect(shell?.className).not.toContain("rounded-2xl");
    expect(shell?.className).not.toContain("border-b");
    expect(mobileTrigger.compareDocumentPosition(brand) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(activeLink.getAttribute("aria-current")).toBe("page");
    expect(activeLink.className).toContain("aria-[current=page]:after:scale-x-100");
    expect(activeLink.className).not.toContain("aria-[current=page]:bg-background");
    expect(screen.queryByRole("link", { name: "Home" })).toBeNull();
    expect(brand.getAttribute("href")).toBe("/");
    expect(screen.queryByRole("button", { name: "Open event workspace navigation" })).toBeNull();
    expect({
      desktop1440: {
        navigation: desktopNavigation.dataset.breakpoint,
        responsiveClasses: responsiveClasses(desktopNavigation),
        shell: responsiveClasses(desktopNavigation.parentElement),
      },
      mobile390: {
        navigation: mobileTrigger.dataset.breakpoint,
        responsiveClasses: responsiveClasses(mobileTrigger),
        shell: responsiveClasses(desktopNavigation.parentElement),
      },
      tablet768: {
        navigation: desktopNavigation.dataset.breakpoint,
        responsiveClasses: responsiveClasses(desktopNavigation),
        triggerClasses: responsiveClasses(mobileTrigger),
      },
    }).toMatchInlineSnapshot(`
      {
        "desktop1440": {
          "navigation": "desktop",
          "responsiveClasses": [
            "lg:flex",
          ],
          "shell": [
            "sm:px-6",
            "lg:grid-cols-[auto_minmax(0,1fr)_auto]",
            "lg:gap-3",
            "lg:px-8",
          ],
        },
        "mobile390": {
          "navigation": "mobile-tablet",
          "responsiveClasses": [
            "lg:hidden",
          ],
          "shell": [
            "sm:px-6",
            "lg:grid-cols-[auto_minmax(0,1fr)_auto]",
            "lg:gap-3",
            "lg:px-8",
          ],
        },
        "tablet768": {
          "navigation": "desktop",
          "responsiveClasses": [
            "lg:flex",
          ],
          "triggerClasses": [
            "lg:hidden",
          ],
        },
      }
    `);
  });

  it("opens the animated mobile navigation, supports Escape, and restores trigger focus", async () => {
    const user = userEvent.setup();
    render(<DashboardTopNavigation activePath="/events/demo-event/guests" />);
    const trigger = screen.getByRole("button", { name: "Open dashboard navigation" });

    await user.click(trigger);

    expect(await screen.findByRole("dialog", { name: "Dashboard navigation" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Guests" }).getAttribute("aria-current")).toBe("page");

    await user.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(document.activeElement).toBe(trigger);
  });

  it("closes the mobile navigation after route navigation", async () => {
    const user = userEvent.setup();
    render(<DashboardTopNavigation activePath="/events/demo-event/guests" />);

    await user.click(screen.getByRole("button", { name: "Open dashboard navigation" }));
    const activityLink = await screen.findByRole("link", { name: "Activity" });
    activityLink.addEventListener("click", (event) => event.preventDefault());
    await user.click(activityLink);

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("closes the mobile navigation after backdrop interaction", async () => {
    const user = userEvent.setup();
    render(<DashboardTopNavigation activePath="/events/demo-event" />);

    await user.click(screen.getByRole("button", { name: "Open dashboard navigation" }));
    expect(await screen.findByRole("dialog")).toBeTruthy();

    const backdrop = document.querySelector<HTMLElement>('[data-slot="sheet-overlay"]');

    expect(backdrop).toBeTruthy();
    await user.click(backdrop as HTMLElement);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("renders direct desktop event links without a dropdown menu", () => {
    render(<DashboardTopNavigation activePath="/events/demo-event/content" />);

    expect(screen.getByRole("link", { name: "Content" }).getAttribute("aria-current")).toBe("page");
    expect(screen.queryByRole("menu")).toBeNull();
    expect(screen.queryByRole("button", { name: "Open event workspace navigation" })).toBeNull();
  });

  it("switches events while preserving the current workspace route", async () => {
    const user = userEvent.setup();
    const listEvents = vi.fn(async () => ({
      events: [springDinner, autumnLaunch],
    }));

    render(
      <DashboardAuthProvider value={createNavigationAuthValue({ listEvents })}>
        <DashboardTopNavigation activePath={`/events/${springDinner.id}/responses`} />
      </DashboardAuthProvider>,
    );

    await user.click(
      await screen.findByRole("button", {
        name: `Switch event, ${springDinner.title}`,
      }),
    );

    const eventPicker = screen.getByRole("dialog", { name: "Switch event" });
    const selectedEventContext = document.querySelector<HTMLElement>(
      '[data-slot="desktop-event-context"] [data-slot="selected-event-context"]',
    );
    const currentEvent = within(eventPicker).getByRole("button", { name: /Spring Dinner/ });
    const nextEvent = within(eventPicker).getByRole("button", { name: /Autumn Launch/ });

    expect(currentEvent.getAttribute("aria-current")).toBe("page");
    expect(currentEvent.getAttribute("href")).toBe(`/events/${springDinner.id}/responses`);
    expect(nextEvent.getAttribute("href")).toBe(`/events/${autumnLaunch.id}/responses`);
    expect(selectedEventContext).toBeTruthy();
    expect(within(selectedEventContext as HTMLElement).getByText("Spring Dinner")).toBeTruthy();
    expect(within(selectedEventContext as HTMLElement).getByText("Responses")).toBeTruthy();
    expect(listEvents).toHaveBeenCalledOnce();
  });

  it("keeps the drawer at tablet width and closes it at the desktop breakpoint", async () => {
    const user = userEvent.setup();
    render(<DashboardTopNavigation activePath="/events/demo-event" />);

    await user.click(screen.getByRole("button", { name: "Open dashboard navigation" }));
    expect(await screen.findByRole("dialog")).toBeTruthy();

    act(() => media.setMatches("(min-width: 768px)", true));

    expect(screen.getByRole("dialog")).toBeTruthy();

    act(() => media.setMatches("(min-width: 1024px)", true));

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("hides on sustained downward scroll, reveals upward, and stays visible for keyboard use", async () => {
    render(<DashboardTopNavigation activePath="/events" />);
    const topBar = screen.getByRole("banner");

    setScrollY(120);
    window.dispatchEvent(new Event("scroll"));
    await waitFor(() => expect(topBar.getAttribute("data-top-bar-state")).toBe("hidden"));

    setScrollY(110);
    window.dispatchEvent(new Event("scroll"));
    setScrollY(90);
    window.dispatchEvent(new Event("scroll"));
    await waitFor(() => expect(topBar.getAttribute("data-top-bar-state")).toBe("visible"));

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));
    setScrollY(200);
    window.dispatchEvent(new Event("scroll"));
    await waitFor(() => expect(topBar.getAttribute("data-top-bar-state")).toBe("visible"));
  });

  it("does not hide for a reduced-motion preference", async () => {
    media.setMatches("(prefers-reduced-motion: reduce)", true);
    render(<DashboardTopNavigation activePath="/events" />);
    const topBar = screen.getByRole("banner");

    setScrollY(180);
    window.dispatchEvent(new Event("scroll"));

    await waitFor(() => expect(topBar.getAttribute("data-top-bar-state")).toBe("visible"));
    expect(topBar.className).not.toContain("duration-200");
  });
});

function setScrollY(value: number) {
  Object.defineProperty(window, "scrollY", { configurable: true, value, writable: true });
}

function responsiveClasses(element: Element | null) {
  return (element?.getAttribute("class") ?? "")
    .split(/\s+/)
    .filter((className) => /^(?:sm|md|lg|xl):/.test(className));
}

function installMatchMedia() {
  const queries = new Map<
    string,
    {
      listeners: Set<() => void>;
      matches: boolean;
    }
  >();
  const getQuery = (query: string) => {
    const existing = queries.get(query);

    if (existing) {
      return existing;
    }

    const entry = { listeners: new Set<() => void>(), matches: false };
    queries.set(query, entry);
    return entry;
  };

  window.matchMedia = vi.fn((query: string) => {
    const entry = getQuery(query);

    return {
      addEventListener: (_event: string, listener: () => void) => entry.listeners.add(listener),
      addListener: (listener: () => void) => entry.listeners.add(listener),
      dispatchEvent: () => true,
      get matches() {
        return entry.matches;
      },
      media: query,
      onchange: null,
      removeEventListener: (_event: string, listener: () => void) =>
        entry.listeners.delete(listener),
      removeListener: (listener: () => void) => entry.listeners.delete(listener),
    } as unknown as MediaQueryList;
  });

  return {
    setMatches(query: string, matches: boolean) {
      const entry = getQuery(query);
      entry.matches = matches;
      entry.listeners.forEach((listener) => listener());
    },
  };
}

function createNavigationAuthValue(
  apiClient: Partial<DashboardApiClient>,
): DashboardAuthContextValue {
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

const springDinner: Event = {
  createdAt: "2030-01-01T00:00:00.000Z",
  eventType: "dinner",
  id: "event-spring",
  ownerUserId: "manager-1",
  publicSettings: {},
  rsvpSettings: {
    collectGuestMessage: true,
    collectGuestNames: true,
  },
  slug: "spring-dinner",
  startsAt: "2030-06-01T10:30:00.000Z",
  status: "published",
  themeConfig: {},
  themeMode: "system",
  timezone: "Asia/Singapore",
  title: "Spring Dinner",
  updatedAt: "2030-01-01T00:00:00.000Z",
};

const autumnLaunch: Event = {
  ...springDinner,
  eventType: "launch",
  id: "event-autumn",
  slug: "autumn-launch",
  title: "Autumn Launch",
};
