// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  EventDatePicker,
  EventDateTimeRange,
  eventIsoToLocalDateTime,
  eventLocalDateTimeToIso,
  formatEventTime,
} from "./event-date-time-picker";

describe("event date and time pickers", () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView ??= vi.fn();
    mockViewport(true);
  });

  afterEach(() => {
    cleanup();
  });

  it("navigates stable calendar months and selects a date", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <EventDatePicker
        aria-label="Starts date"
        id="starts-date"
        onValueChange={onValueChange}
        value="2030-06-01"
      />,
    );

    const trigger = screen.getByRole("button", { name: "Starts date" });
    await user.click(trigger);

    expect(document.querySelectorAll("select")).toHaveLength(2);
    expect(document.querySelectorAll("[role='gridcell']")).toHaveLength(42);

    await user.click(screen.getByRole("button", { name: /next month/i }));
    const julyFourth = findCalendarDay(new Date(2030, 6, 4));
    expect(julyFourth).toBeDefined();
    await user.click(julyFourth as HTMLButtonElement);

    expect(onValueChange).toHaveBeenCalledWith("2030-07-04");
    expect(document.activeElement).toBe(trigger);
  });

  it("keeps optional end values valid and supports clearing", async () => {
    const user = userEvent.setup();

    function RangeHarness() {
      const [start, setStart] = useState("2030-06-01T18:30");
      const [end, setEnd] = useState("2030-06-01T20:00");

      return (
        <EventDateTimeRange
          endId="ends"
          endValue={end}
          onEndValueChange={setEnd}
          onStartValueChange={setStart}
          startId="starts"
          startValue={start}
          timezone="Asia/Singapore"
        />
      );
    }

    render(<RangeHarness />);

    expect(screen.getAllByText("Event timezone: Asia/Singapore")).toHaveLength(2);
    expect(document.querySelector('input[type="datetime-local"]')).toBeNull();

    await user.click(screen.getByRole("combobox", { name: "Ends optional time" }));
    expect(
      (await screen.findByRole("option", { name: formatEventTime("18:30") })).hasAttribute(
        "data-disabled",
      ),
    ).toBe(true);
    await user.keyboard("{Escape}");

    await user.click(screen.getByRole("combobox", { name: "Starts time" }));
    await user.click(await screen.findByRole("option", { name: formatEventTime("20:15") }));

    expect(screen.queryByRole("button", { name: "Clear Ends optional date and time" })).toBeNull();
    expect(screen.getByRole("button", { name: "Ends optional date" }).textContent).toContain(
      "Choose date",
    );

    await user.click(screen.getByRole("button", { name: "Starts date" }));
    await user.keyboard("{Escape}");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Starts date" }));
  });

  it("clears an optional end date and time explicitly", async () => {
    const user = userEvent.setup();
    const onEndValueChange = vi.fn();

    render(
      <EventDateTimeRange
        endId="ends"
        endValue="2030-06-01T20:00"
        onEndValueChange={onEndValueChange}
        onStartValueChange={vi.fn()}
        startId="starts"
        startValue="2030-06-01T18:30"
        timezone="Asia/Singapore"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Clear Ends optional date and time" }));
    expect(onEndValueChange).toHaveBeenCalledWith("");
  });

  it("uses the responsive drawer presentation on mobile", async () => {
    const user = userEvent.setup();
    mockViewport(false);

    render(
      <EventDatePicker
        aria-label="Mobile event date"
        id="mobile-date"
        onValueChange={vi.fn()}
        value="2030-06-01"
      />,
    );

    await waitFor(() => expect(window.matchMedia("(min-width: 640px)").matches).toBe(false));
    await user.click(screen.getByRole("button", { name: "Mobile event date" }));

    expect(await screen.findByRole("dialog")).toBeTruthy();
    expect(screen.getByText("Choose a calendar date.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Done" })).toBeTruthy();
  });

  it("round-trips wall time using the explicit timezone and rejects DST gaps", () => {
    expect(eventLocalDateTimeToIso("2030-06-01T18:30", "Asia/Singapore")).toBe(
      "2030-06-01T10:30:00.000Z",
    );
    expect(eventIsoToLocalDateTime("2030-06-01T10:30:00.000Z", "Asia/Singapore")).toBe(
      "2030-06-01T18:30",
    );
    expect(eventLocalDateTimeToIso("2026-03-08T02:30", "America/New_York")).toBeNull();
    expect(eventLocalDateTimeToIso("2030-01-01T00:30", "Pacific/Auckland")).toBe(
      "2029-12-31T11:30:00.000Z",
    );
  });
});

function findCalendarDay(date: Date) {
  return [...document.querySelectorAll<HTMLButtonElement>("[data-day]")].find(
    (button) => button.dataset.day === date.toLocaleDateString(),
  );
}

function mockViewport(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn((query: string): MediaQueryList => ({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(() => true),
      matches,
      media: query,
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    })),
    writable: true,
  });
}
