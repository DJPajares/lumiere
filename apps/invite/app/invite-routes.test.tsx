import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import GuestEventPage from "./e/[eventSlug]/g/[guestToken]/page";
import PublicEventPage from "./e/[eventSlug]/page";
import InviteHome from "./page";

describe("invite app routes", () => {
  it("renders the root scaffold with links to public and guest routes", () => {
    const html = renderToStaticMarkup(createElement(InviteHome));

    expect(html).toContain("Lumiere invite app");
    expect(html).toContain("/e/launch-night");
    expect(html).toContain("/e/launch-night/g/sample-guest-token-for-preview");
  });

  it("renders the generic public event route without guest RSVP context", async () => {
    const element = await PublicEventPage({
      params: Promise.resolve({
        eventSlug: "launch-night",
      }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Public invitation");
    expect(html).toContain("launch-night");
    expect(html).toContain("RSVP hidden without invite token");
    expect(html).not.toContain("Tan Family");
  });

  it("renders the personalized guest event route with RSVP placeholder context", async () => {
    const element = await GuestEventPage({
      params: Promise.resolve({
        eventSlug: "launch-night",
        guestToken: "sample-guest-token-for-preview",
      }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Guest invitation");
    expect(html).toContain("Tan Family");
    expect(html).toContain("review");
    expect(html).toContain("RSVP form arrives next");
  });
});
