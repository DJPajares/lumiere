import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import EventSectionPage from "./events/[eventId]/[section]/page";
import EventPage from "./events/[eventId]/page";
import EventsPage from "./events/page";
import LoginPage from "./login/page";
import DashboardHome from "./page";

describe("dashboard routes", () => {
  it("renders the root authenticated shell placeholder", () => {
    const html = renderToStaticMarkup(createElement(DashboardHome));

    expect(html).toContain("Lumiere Dashboard");
    expect(html).toContain("Unauthenticated state");
    expect(html).toContain("Event list placeholder");
  });

  it("renders the login placeholder", () => {
    const html = renderToStaticMarkup(createElement(LoginPage));

    expect(html).toContain("Manager sign in");
    expect(html).toContain("Sign in arrives next");
  });

  it("renders the event list route", () => {
    const html = renderToStaticMarkup(createElement(EventsPage));

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
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Demo event workspace");
    expect(html).toContain("Setup path");
    expect(html).toContain("/events/demo-event/content");
  });

  it("renders management section routes", async () => {
    const element = await EventSectionPage({
      params: Promise.resolve({
        eventId: "demo-event",
        section: "guests",
      }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Guests setup");
    expect(html).toContain("Guests workspace placeholder");
    expect(html).toContain("Reserved state treatment");
  });
});
