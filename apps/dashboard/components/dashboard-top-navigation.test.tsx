// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DashboardTopNavigation } from "./dashboard-top-navigation";

vi.mock("./dashboard-top-bar-controls", () => ({
  DashboardTopBarControls: () => <div data-testid="top-bar-controls">Account controls</div>,
}));

describe("DashboardTopNavigation", () => {
  let media: ReturnType<typeof installMatchMedia>;

  beforeEach(() => {
    media = installMatchMedia();
    Object.defineProperty(window, "scrollY", { configurable: true, value: 0, writable: true });
    window.requestAnimationFrame = (callback) => window.setTimeout(() => callback(0), 0);
    window.cancelAnimationFrame = (id) => window.clearTimeout(id);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders centered horizontal desktop navigation and a leftmost mobile burger", () => {
    render(<DashboardTopNavigation activePath="/events/demo-event/theme" />);

    const desktopNavigation = screen.getByRole("navigation", { name: "Dashboard navigation" });
    const mobileTrigger = screen.getByRole("button", { name: "Open dashboard navigation" });
    const brand = screen.getByRole("link", { name: "Lumiere Dashboard" });

    expect(desktopNavigation.className).toContain("md:justify-center");
    expect(mobileTrigger.className).toContain("md:hidden");
    expect(mobileTrigger.compareDocumentPosition(brand) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(screen.getByRole("link", { name: "Theme" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "Home" })).toBeTruthy();
    expect(brand.getAttribute("href")).toBe("/");
    expect(screen.queryByRole("button", { name: "Open event workspace navigation" })).toBeNull();
  });

  it("opens the mobile drawer, supports Escape, and restores trigger focus", async () => {
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

  it("closes the mobile drawer after route navigation", async () => {
    const user = userEvent.setup();
    render(<DashboardTopNavigation activePath="/events/demo-event/guests" />);

    await user.click(screen.getByRole("button", { name: "Open dashboard navigation" }));
    await user.click(await screen.findByRole("link", { name: "Activity" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("closes the mobile drawer after backdrop interaction", async () => {
    const user = userEvent.setup();
    render(<DashboardTopNavigation activePath="/events/demo-event" />);

    await user.click(screen.getByRole("button", { name: "Open dashboard navigation" }));
    expect(await screen.findByRole("dialog")).toBeTruthy();

    const backdrop = document.querySelector<HTMLElement>('[data-slot="drawer-overlay"]');

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

  it("closes an open drawer when the viewport crosses into tablet width", async () => {
    const user = userEvent.setup();
    render(<DashboardTopNavigation activePath="/events/demo-event" />);

    await user.click(screen.getByRole("button", { name: "Open dashboard navigation" }));
    expect(await screen.findByRole("dialog")).toBeTruthy();

    act(() => media.setMatches("(min-width: 768px)", true));

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
