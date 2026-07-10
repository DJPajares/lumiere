import { describe, expect, it } from "vitest";

import {
  dashboardNavigationModel,
  getDashboardNavigation,
  getDashboardWorkspaceContext,
  getEventSectionDefinition,
} from "./dashboard-navigation";
import { getNextTopBarScrollState, initialTopBarScrollState } from "./use-top-bar-visibility";

describe("dashboard navigation model", () => {
  it("resolves manager and event workspace active routes from one model", () => {
    const navigation = getDashboardNavigation("/events/demo-event/guests");

    expect(dashboardNavigationModel.map((item) => item.id)).toEqual([
      "manager-overview",
      "event-overview",
      "event-content",
      "event-theme",
      "event-guests",
      "event-responses",
      "event-activity",
      "event-settings",
    ]);
    expect(navigation.manager).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ active: false, href: "/", id: "manager-overview" }),
      ]),
    );
    expect(navigation.workspace.find((item) => item.id === "event-guests")).toEqual(
      expect.objectContaining({
        active: true,
        disabled: false,
        href: "/events/demo-event/guests",
      }),
    );
    expect(navigation.workspace.filter((item) => item.active)).toHaveLength(1);
    expect(navigation.context).toEqual({
      eventId: "demo-event",
      sectionKey: "guests",
      sectionLabel: "Guests",
    });
  });

  it("makes workspace routes explicitly unavailable without a current event", () => {
    const navigation = getDashboardNavigation("/events");

    expect(navigation.workspace.every((item) => item.disabled)).toBe(true);
    expect(navigation.workspace.every((item) => item.href === undefined)).toBe(true);
    expect(navigation.workspace[0]?.disabledReason).toMatch(/Choose an event/);
    expect(getDashboardWorkspaceContext("/events/").sectionLabel).toBe("Event list");
    expect(getEventSectionDefinition("settings")?.label).toBe("Settings");
    expect(getEventSectionDefinition("unknown")).toBeUndefined();
  });

  it("marks the consolidated manager overview active at the dashboard root", () => {
    const navigation = getDashboardNavigation("/");

    expect(navigation.manager.find((item) => item.id === "manager-overview")).toEqual(
      expect.objectContaining({ active: true, href: "/" }),
    );
    expect(navigation.manager).toHaveLength(1);
  });
});

describe("top bar scroll state", () => {
  it("uses directional thresholds to hide and reveal without jitter", () => {
    const hidden = getNextTopBarScrollState(initialTopBarScrollState, 120);

    expect(hidden.visible).toBe(false);

    const smallUpwardMovement = getNextTopBarScrollState(hidden, 110);

    expect(smallUpwardMovement.visible).toBe(false);

    const revealed = getNextTopBarScrollState(smallUpwardMovement, 95);

    expect(revealed.visible).toBe(true);
  });

  it("keeps the bar visible while interaction is locked", () => {
    const hidden = getNextTopBarScrollState(initialTopBarScrollState, 120);
    const locked = getNextTopBarScrollState(hidden, 180, true);

    expect(locked).toMatchObject({ direction: "idle", distance: 0, visible: true });
  });
});
