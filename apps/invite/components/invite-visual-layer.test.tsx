import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { themeVisualEffects } from "@lumiere/themes";

import { InviteVisualLayer } from "./invite-visual-layer";

describe("invite visual layer", () => {
  it("renders a cover-backed atmosphere without adding meaningful image semantics", () => {
    const html = renderToStaticMarkup(
      createElement(InviteVisualLayer, {
        backdropImageUrl: "https://images.example.com/evening.jpg",
        effects: themeVisualEffects["celestial-gold"],
      }),
    );

    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('data-backdrop-image="ready"');
    expect(html).toContain('alt=""');
    expect(html).toContain('loading="lazy"');
    expect(html).toContain("https://images.example.com/evening.jpg");
    expect(html).toContain('data-ornament-position="tertiary"');
  });

  it("falls back without an image and omits disabled ornaments", () => {
    const html = renderToStaticMarkup(
      createElement(InviteVisualLayer, {
        effects: themeVisualEffects["modern-minimal"],
      }),
    );

    expect(html).toContain('data-backdrop-image="missing"');
    expect(html).not.toContain("<img");
    expect(html).not.toContain("lumiere-ornaments");
    expect(html).not.toContain("lumiere-visual-layer__texture");
  });
});
