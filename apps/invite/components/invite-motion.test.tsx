import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  calculateScrollProgress,
  inviteMotionPresets,
  resolveInviteMotionIntensity,
} from "./invite-motion-config";
import {
  InviteMaskedText,
  InviteMotionImageFrame,
  InviteMotionReveal,
  InviteParallaxLayer,
  invitePressFeedbackProps,
} from "./invite-motion-primitives";

describe("invite motion system", () => {
  it("provides no-motion, low-motion, and premium-motion variants", () => {
    const variants = [
      resolveInviteMotionIntensity("immersive", true),
      resolveInviteMotionIntensity("calm"),
      resolveInviteMotionIntensity("immersive"),
    ];

    expect(variants).toEqual(["none", "low", "premium"]);
    expect(inviteMotionPresets.none.revealDistance).toBe(0);
    expect(inviteMotionPresets.low.parallaxDistance).toBe(0);
    expect(inviteMotionPresets.premium.parallaxDistance).toBeGreaterThan(0);
  });

  it("clamps element scroll progress for the animation-frame fallback", () => {
    expect(calculateScrollProgress(900, 400, 800)).toBe(0);
    expect(calculateScrollProgress(200, 400, 800)).toBe(0.5);
    expect(calculateScrollProgress(-500, 400, 800)).toBe(1);
  });

  it("renders reusable reveal, masked-text, parallax, and soft-image hooks", () => {
    const html = renderToStaticMarkup(
      createElement(
        InviteMotionReveal,
        { as: "section", kind: "media-reveal", order: 2 },
        createElement(InviteMaskedText, null, "An evening in bloom"),
        createElement(
          InviteParallaxLayer,
          { as: "figure", layer: "hero-media" },
          createElement(InviteMotionImageFrame, { as: "span" }, "Portrait"),
        ),
      ),
    );

    expect(html).toContain('data-motion-scope="invite-section"');
    expect(html).toContain('data-motion-kind="media-reveal"');
    expect(html).toContain('data-motion-mask="text"');
    expect(html).toContain('data-parallax-layer="hero-media"');
    expect(html).toContain('data-motion-soft-image="true"');
    expect(invitePressFeedbackProps).toEqual({ "data-motion-feedback": "press" });
  });
});
