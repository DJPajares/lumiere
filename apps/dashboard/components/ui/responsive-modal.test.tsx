// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ResponsiveModal, RESPONSIVE_MODAL_DESKTOP_QUERY } from "./responsive-modal";

describe("ResponsiveModal", () => {
  let media: ReturnType<typeof installMatchMedia>;

  beforeEach(() => {
    media = installMatchMedia();
  });

  afterEach(() => cleanup());

  it("uses a dialog on desktop and restores focus after closing", async () => {
    media.setMatches(RESPONSIVE_MODAL_DESKTOP_QUERY, true);
    const user = userEvent.setup();
    const Harness = () => {
      const [open, setOpen] = useState(false);

      return (
        <>
          <button onClick={() => setOpen(true)} type="button">
            Open editor
          </button>
          <ResponsiveModal
            description="Edit bounded details."
            onOpenChange={setOpen}
            open={open}
            title="Event details"
          >
            <input aria-label="Event name" />
          </ResponsiveModal>
        </>
      );
    };

    render(<Harness />);
    const trigger = screen.getByRole("button", { name: "Open editor" });
    await user.click(trigger);

    expect(await screen.findByRole("dialog", { name: "Event details" })).toBeTruthy();
    expect(document.querySelector('[data-slot="dialog-content"]')).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Close Event details" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(document.activeElement).toBe(trigger);
  });

  it("uses a drawer on mobile", async () => {
    media.setMatches(RESPONSIVE_MODAL_DESKTOP_QUERY, false);

    render(
      <ResponsiveModal
        description="Create a bounded record."
        onOpenChange={() => undefined}
        open
        title="Guest group"
      >
        <p>Drawer content</p>
      </ResponsiveModal>,
    );

    expect(await screen.findByRole("dialog", { name: "Guest group" })).toBeTruthy();
    expect(document.querySelector('[data-slot="drawer-popup"]')).toBeTruthy();
    expect(document.querySelector('[data-slot="dialog-content"]')).toBeNull();
  });

  it("confirms before closing dirty content", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onDiscard = vi.fn();

    render(
      <ResponsiveModal
        description="Edit bounded details."
        dirty
        onDiscard={onDiscard}
        onOpenChange={onOpenChange}
        open
        title="Event details"
      >
        <p>Unsaved form</p>
      </ResponsiveModal>,
    );

    await user.click(screen.getByRole("button", { name: "Close Event details" }));
    expect(
      await screen.findByRole("alertdialog", { name: "Discard unsaved changes?" }),
    ).toBeTruthy();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);

    await user.click(screen.getByRole("button", { name: "Keep editing" }));
    expect(screen.getByRole("dialog", { name: "Event details" })).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Close Event details" }));
    await user.click(await screen.findByRole("button", { name: "Discard changes" }));
    expect(onDiscard).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

function installMatchMedia() {
  const queries = new Map<string, { listeners: Set<() => void>; matches: boolean }>();
  const getQuery = (query: string) => {
    const existing = queries.get(query);

    if (existing) {
      return existing;
    }

    const entry = { listeners: new Set<() => void>(), matches: true };
    queries.set(query, entry);
    return entry;
  };

  window.matchMedia = vi.fn((query: string) => {
    const entry = getQuery(query);

    return {
      addEventListener: (_event: string, listener: () => void) => entry.listeners.add(listener),
      dispatchEvent: () => true,
      get matches() {
        return entry.matches;
      },
      media: query,
      onchange: null,
      removeEventListener: (_event: string, listener: () => void) =>
        entry.listeners.delete(listener),
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
