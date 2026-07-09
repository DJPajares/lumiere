import { describe, expect, it } from "vitest";

import { suggestPublicSlug, toPublicSlugBase } from "./public-slugs";

describe("public slug policy", () => {
  it("normalizes event titles into readable slug bases", () => {
    expect(toPublicSlugBase("  Amara & Theo: Garden Wedding!  ")).toBe("amara-theo-garden-wedding");
    expect(toPublicSlugBase("x")).toBe("event");
  });

  it("appends a suffix when the base slug is reserved or already taken", async () => {
    const suggestions = ["bad", "ok2026"];
    const usedSlugs = new Set(["launch-night", "launch-night-bad"]);

    await expect(
      suggestPublicSlug({
        createSuffix: () => suggestions.shift() ?? "final",
        isAvailable: (slug) => !usedSlugs.has(slug),
        title: "Launch Night",
      }),
    ).resolves.toBe("launch-night-ok2026");

    await expect(
      suggestPublicSlug({
        createSuffix: () => "2026",
        isAvailable: () => true,
        title: "events",
      }),
    ).resolves.toBe("events-2026");
  });
});
