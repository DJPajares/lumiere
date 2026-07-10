// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DashboardCheckbox,
  DashboardDateTimeInput,
  DashboardNotice,
  DashboardSelect,
  DashboardTabs,
  DashboardTextInput,
} from "./dashboard-fields";

describe("dashboard field primitives", () => {
  afterEach(() => {
    cleanup();
  });

  it("connects text labels, helper text, and errors to the input", () => {
    render(
      <DashboardTextInput
        description="Shown at the top of the invite."
        error="Event title is required."
        id="event-title"
        label="Event title"
        onChange={vi.fn()}
        required
        value=""
      />,
    );

    const input = screen.getByLabelText("Event title");

    expect(input.getAttribute("id")).toBe("event-title");
    expect(input.getAttribute("aria-describedby")).toContain("event-title-description");
    expect(input.getAttribute("aria-describedby")).toContain("event-title-error");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByText("Shown at the top of the invite.")).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toBe("Event title is required.");
  });

  it("shows timezone context for date-time controls", () => {
    render(
      <DashboardDateTimeInput
        description="Leave blank if the event has no set end time."
        id="event-ends"
        label="Ends optional"
        onChange={vi.fn()}
        timezone="Asia/Singapore"
        value=""
      />,
    );

    const input = screen.getByLabelText("Ends optional") as HTMLInputElement;

    expect(input.type).toBe("datetime-local");
    expect(screen.getByText("Leave blank if the event has no set end time.")).toBeTruthy();
    expect(screen.getByText("Event timezone: Asia/Singapore")).toBeTruthy();
  });

  it("renders selects, checkboxes, notices, and tabs with accessible roles", () => {
    render(
      <div>
        <DashboardSelect id="status" label="Publish status" onChange={vi.fn()} value="draft">
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </DashboardSelect>
        <DashboardCheckbox id="enabled" label="Enabled" onChange={vi.fn()} checked />
        <DashboardNotice tone="success">Saved.</DashboardNotice>
        <DashboardTabs
          label="Settings"
          tabs={[
            { active: true, id: "basics", label: "Basics" },
            { id: "rsvp", label: "RSVP" },
          ]}
        />
      </div>,
    );

    expect((screen.getByLabelText("Publish status") as HTMLSelectElement).value).toBe("draft");
    expect((screen.getByLabelText("Enabled") as HTMLInputElement).checked).toBe(true);
    expect(screen.getByRole("status").textContent).toBe("Saved.");
    expect(screen.getByRole("tablist", { name: "Settings" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Basics" }).getAttribute("aria-selected")).toBe("true");
  });
});
