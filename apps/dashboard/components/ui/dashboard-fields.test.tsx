// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@lumiere/dashboard-ui/components/dialog";
import { useState } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import {
  DashboardCheckbox,
  DashboardCombobox,
  DashboardNotice,
  DashboardSelect,
  DashboardTabs,
  DashboardTextInput,
} from "./dashboard-fields";

const statusOptions = [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
];

describe("dashboard field primitives", () => {
  beforeAll(() => {
    Element.prototype.scrollIntoView ??= vi.fn();
  });

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

  it("selects an option with the mouse and restores the trigger value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <DashboardSelect
        id="status"
        label="Publish status"
        onValueChange={onValueChange}
        options={statusOptions}
        value="draft"
      />,
    );

    const trigger = screen.getByRole("combobox", { name: "Publish status" });
    expect(trigger.textContent).toContain("Draft");

    await user.click(trigger);
    await user.click(await screen.findByRole("option", { name: "Published" }));

    expect(onValueChange).toHaveBeenCalledWith("published");
    expect(document.activeElement).toBe(trigger);
  });

  it("supports keyboard selection and viewport-aware popup sizing", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <DashboardSelect
        id="keyboard-status"
        label="Keyboard status"
        onValueChange={onValueChange}
        options={statusOptions}
        value="draft"
      />,
    );

    const trigger = screen.getByRole("combobox", { name: "Keyboard status" });
    trigger.focus();
    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("published");

    trigger.focus();
    await user.keyboard("{ArrowDown}");
    const popup = document.querySelector('[data-slot="select-content"]');
    expect(popup?.className).toContain("max-h-(--available-height)");
    expect(popup?.className).toContain("w-(--anchor-width)");

    await user.keyboard("{Escape}");
    expect(document.activeElement).toBe(trigger);
  });

  it("announces an empty combobox search and selects a matching result", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <DashboardCombobox
        emptyMessage="No matching timezone."
        id="timezone"
        label="Timezone"
        onValueChange={onValueChange}
        options={[
          { label: "Asia/Singapore", value: "Asia/Singapore" },
          { label: "Europe/London", value: "Europe/London" },
        ]}
        placeholder="Search timezones"
        value={null}
      />,
    );

    const input = screen.getByRole("combobox", { name: "Timezone" });
    await user.click(input);
    await user.type(input, "Mars");
    expect(await screen.findByText("No matching timezone.")).toBeTruthy();

    await user.clear(input);
    await user.type(input, "Singapore");
    await user.click(screen.getByRole("option", { name: "Asia/Singapore" }));
    expect(onValueChange).toHaveBeenCalledWith("Asia/Singapore");
  });

  it("exposes validation, loading, and disabled select states", async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <DashboardSelect
        disabled
        error="Choose a publish status."
        id="disabled-status"
        label="Disabled status"
        onValueChange={vi.fn()}
        options={statusOptions}
        value="draft"
      />,
    );

    const disabledTrigger = screen.getByRole("combobox", { name: "Disabled status" });
    expect((disabledTrigger as HTMLButtonElement).disabled).toBe(true);
    expect(disabledTrigger.getAttribute("aria-invalid")).toBe("true");
    expect(disabledTrigger.getAttribute("aria-describedby")).toContain("disabled-status-error");
    await user.click(disabledTrigger);
    expect(screen.queryByRole("option")).toBeNull();

    rerender(
      <DashboardSelect
        id="disabled-status"
        label="Disabled status"
        loading
        onValueChange={vi.fn()}
        options={statusOptions}
        value="draft"
      />,
    );

    expect(
      screen.getByRole("combobox", { name: "Disabled status" }).getAttribute("aria-busy"),
    ).toBe("true");
    expect(screen.getByText("Loading options...")).toBeTruthy();
  });

  it("preserves controlled value and validation across dialog close and reopen", async () => {
    const user = userEvent.setup();

    function DialogSelectHarness() {
      const [value, setValue] = useState("draft");

      return (
        <Dialog>
          <DialogTrigger>Open status editor</DialogTrigger>
          <DialogContent>
            <DialogTitle>Edit publish status</DialogTitle>
            <DashboardSelect
              error="Confirm the intended guest visibility."
              id="dialog-status"
              label="Dialog status"
              onValueChange={setValue}
              options={statusOptions}
              value={value}
            />
            <button onClick={() => setValue("published")} type="button">
              Set published
            </button>
            <DialogClose>Done</DialogClose>
          </DialogContent>
        </Dialog>
      );
    }

    render(<DialogSelectHarness />);
    await user.click(screen.getByRole("button", { name: "Open status editor" }));

    const select = screen.getByRole("combobox", { name: "Dialog status" });
    await user.click(screen.getByRole("button", { name: "Set published" }));
    expect(select.textContent).toContain("Published");

    await user.click(screen.getByRole("button", { name: "Done" }));
    await user.click(screen.getByRole("button", { name: "Open status editor" }));

    const reopenedSelect = screen.getByRole("combobox", { name: "Dialog status" });
    expect(reopenedSelect.textContent).toContain("Published");
    expect(reopenedSelect.getAttribute("aria-invalid")).toBe("true");
    expect(reopenedSelect.getAttribute("aria-describedby")).toContain("dialog-status-error");
  });

  it("renders checkboxes, notices, and tabs with accessible roles", () => {
    render(
      <div>
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

    expect((screen.getByLabelText("Enabled") as HTMLInputElement).checked).toBe(true);
    expect(screen.getByRole("status").textContent).toBe("Saved.");
    expect(screen.getByRole("tablist", { name: "Settings" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Basics" }).getAttribute("aria-selected")).toBe("true");
  });
});
