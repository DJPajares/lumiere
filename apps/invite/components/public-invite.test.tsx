// @vitest-environment jsdom

import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { EventSection, PublicEventResponse, PublicGuestInviteResponse } from "@lumiere/types";

import { resolveBrowserMode } from "./invite-theme-mode-control";
import { GuestInvitation, PublicInvitation } from "./public-invite";

describe("public invite section renderers", () => {
  afterEach(() => {
    document.body.replaceChildren();
    window.localStorage.clear();
  });

  it("renders a distinct public hero and composition signature for every expansion theme", async () => {
    const directions = [
      ["editorial-ivory", "ivory-editorial", "lumiere-hero--editorial-ivory"],
      ["garden-light", "garden-celebration", "lumiere-hero--garden-light"],
      ["modern-minimal", "minimal-modern", "lumiere-hero--modern-minimal"],
      ["celestial-gold", "celestial-evening", "lumiere-hero--celestial-gold"],
    ] as const;
    const signatures = directions.map(([themeId, compositionMap, heroClassName]) => {
      const invite = createInvite([
        createSection({
          content: {
            coverImage: {
              alt: `${themeId} event portrait`,
              url: `https://images.example.com/${themeId}.jpg`,
            },
            subtitle: "A theme compatibility sample.",
            title: "A shared celebration",
          },
          sectionKey: "welcome",
          sectionType: "introduction",
          sortOrder: 0,
        }),
        createSection({
          content: {
            paragraphs: [
              { title: "Chapter one", body: "A titled story paragraph." },
              { body: "An untitled story paragraph." },
            ],
            title: "Our story",
          },
          sectionKey: "story",
          sectionType: "story",
          sortOrder: 1,
        }),
      ]);
      invite.selectedThemeId = themeId;
      invite.themeMode = themeId === "celestial-gold" ? "dark" : "light";

      const html = renderToStaticMarkup(createElement(PublicInvitation, { invite }));

      expect(html).toContain(`data-theme-id="${themeId}"`);
      expect(html).toContain(`data-composition-map="${compositionMap}"`);
      expect(html).toContain(heroClassName);
      expect(html).toContain(`${themeId} event portrait`);
      expect(html).toContain("Chapter one");
      expect(html).toContain("A titled story paragraph.");
      expect(html).toContain("An untitled story paragraph.");

      return {
        backdrop: readDataValue(html, "backdrop-type"),
        compositionMap,
        frame: readDataValue(html, "frame-style"),
        heroClassName,
        imageTreatment: readDataValue(html, "image-treatment"),
        mode: readDataValue(html, "theme-resolved-mode"),
        ornament: readDataValue(html, "ornament-set"),
        sectionCompositions: readDataValues(html, "section-composition"),
        themeId,
      };
    });

    expect(new Set(signatures.map((signature) => JSON.stringify(signature))).size).toBe(
      directions.length,
    );
    expect(signatures).toMatchInlineSnapshot(`
      [
        {
          "backdrop": "editorial-whitespace",
          "compositionMap": "ivory-editorial",
          "frame": "offset",
          "heroClassName": "lumiere-hero--editorial-ivory",
          "imageTreatment": "desaturated",
          "mode": "light",
          "ornament": "editorial-rules",
          "sectionCompositions": [
            "full-bleed",
            "timeline",
          ],
          "themeId": "editorial-ivory",
        },
        {
          "backdrop": "gradient",
          "compositionMap": "garden-celebration",
          "frame": "organic",
          "heroClassName": "lumiere-hero--garden-light",
          "imageTreatment": "sun-washed",
          "mode": "light",
          "ornament": "botanical",
          "sectionCompositions": [
            "full-bleed",
            "layered-media",
          ],
          "themeId": "garden-light",
        },
        {
          "backdrop": "solid",
          "compositionMap": "minimal-modern",
          "frame": "frameless",
          "heroClassName": "lumiere-hero--modern-minimal",
          "imageTreatment": "crisp",
          "mode": "light",
          "ornament": "none",
          "sectionCompositions": [
            "full-bleed",
            "timeline",
          ],
          "themeId": "modern-minimal",
        },
        {
          "backdrop": "image",
          "compositionMap": "celestial-evening",
          "frame": "gilded",
          "heroClassName": "lumiere-hero--celestial-gold",
          "imageTreatment": "nocturne",
          "mode": "dark",
          "ornament": "constellation",
          "sectionCompositions": [
            "full-bleed",
            "layered-media",
          ],
          "themeId": "celestial-gold",
        },
      ]
    `);

    const toggleableInvite = createInvite([]);
    toggleableInvite.selectedThemeId = "premium";
    toggleableInvite.themeMode = "toggleable";
    const toggleableHtml = renderToStaticMarkup(
      createElement(PublicInvitation, { invite: toggleableInvite }),
    );

    expect(toggleableHtml).toContain('data-theme-mode="toggleable"');
    expect(toggleableHtml).toContain('data-theme-mode-control="soft-pill"');
    expect(toggleableHtml).toContain('data-theme-mode-initializer="true"');
    expect(toggleableHtml).toContain("lumiere:theme-mode:garden-evening");
    expect(toggleableHtml).toContain("localStorage.getItem");
    expect(toggleableHtml.indexOf("data-theme-mode-initializer")).toBeLessThan(
      toggleableHtml.indexOf("lumiere-invitation"),
    );
    expect(toggleableHtml).toContain("Invitation appearance: switch to");

    const container = document.createElement("div");
    const root = createRoot(container);

    (
      globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
    window.matchMedia = vi.fn(
      (query: string): MediaQueryList =>
        ({
          addEventListener: vi.fn(),
          addListener: vi.fn(),
          dispatchEvent: vi.fn(),
          matches: query === "(prefers-reduced-motion: reduce)",
          media: query,
          onchange: null,
          removeEventListener: vi.fn(),
          removeListener: vi.fn(),
        }) as unknown as MediaQueryList,
    );
    document.body.append(container);
    await act(() => root.render(createElement(PublicInvitation, { invite: toggleableInvite })));
    const modeControl = container.querySelector<HTMLButtonElement>(
      'button[aria-label^="Invitation appearance: switch to"]',
    );

    expect(modeControl?.getAttribute("aria-pressed")).toBe("false");
    await act(() => modeControl?.click());
    expect(modeControl?.getAttribute("aria-pressed")).toBe("true");
    expect(modeControl?.closest("main")?.getAttribute("data-theme-resolved-mode")).toBe("dark");
    expect(window.localStorage.getItem("lumiere:theme-mode:garden-evening")).toBe("dark");
    await act(() => root.unmount());

    const systemInvite = createInvite([]);
    systemInvite.selectedThemeId = "modern-minimal";
    systemInvite.themeMode = "system";
    const systemHtml = renderToStaticMarkup(
      createElement(PublicInvitation, { invite: systemInvite }),
    );

    expect(systemHtml).toContain('data-theme-mode-initializer="true"');
    expect(systemHtml).not.toContain("data-theme-mode-control=");
    expect(systemHtml).toContain("prefers-color-scheme: dark");

    const unsupportedInvite = createInvite([]);
    unsupportedInvite.selectedThemeId = "kids";
    unsupportedInvite.themeMode = "toggleable";
    const unsupportedHtml = renderToStaticMarkup(
      createElement(PublicInvitation, { invite: unsupportedInvite }),
    );

    expect(unsupportedHtml).toContain('data-theme-resolved-mode="light"');
    expect(unsupportedHtml).not.toContain('data-theme-mode-initializer="true"');

    const fallbackInvite = createInvite([]);
    fallbackInvite.selectedThemeId = "unavailable-theme";
    const fallbackHtml = renderToStaticMarkup(
      createElement(PublicInvitation, { invite: fallbackInvite }),
    );

    expect(fallbackHtml).toContain('data-theme-id="lumiere-default"');
    expect(fallbackHtml).toContain('data-composition-map="neutral-basic"');
    expect(
      resolveBrowserMode({
        configuredMode: "toggleable",
        defaultPreference: "system",
        hasDarkTokens: true,
        prefersDark: false,
        savedMode: "dark",
      }),
    ).toBe("dark");
    expect(
      resolveBrowserMode({
        configuredMode: "system",
        hasDarkTokens: true,
        prefersDark: true,
        savedMode: "light",
      }),
    ).toBe("dark");
    expect(
      resolveBrowserMode({
        configuredMode: "dark",
        hasDarkTokens: false,
        prefersDark: true,
        savedMode: "dark",
      }),
    ).toBe("light");
  });

  it("emits composition and motion hooks for immersive section layouts", () => {
    const html = renderToStaticMarkup(
      createElement(PublicInvitation, {
        invite: createInvite([
          createSection({
            content: {
              body: "A luminous evening for close friends.",
              coverImage: {
                alt: "Garden portrait at golden hour",
                url: "https://images.example.com/garden-portrait.jpg",
              },
              eyebrow: "Wedding invitation",
              subtitle: "Dinner, dancing, and garden lights.",
              title: "Amara and Theo",
            },
            sectionKey: "welcome",
            sectionType: "introduction",
            sortOrder: 0,
          }),
          createSection({
            content: {
              countdownLabel: "Together in 42 days",
              displayText: "Saturday, 1 June 2030 at 6:30 PM",
              startsAt: "2030-06-01T10:30:00.000Z",
              timezone: "Asia/Singapore",
              title: "When",
            },
            sectionKey: "when",
            sectionType: "date",
            sortOrder: 1,
          }),
          createSection({
            content: {
              people: [
                {
                  name: "Amara",
                  role: "Host",
                },
              ],
              title: "The hosts",
            },
            sectionKey: "hosts",
            sectionType: "profile",
            sortOrder: 2,
          }),
          createSection({
            content: {
              paragraphs: ["First the quiet hello.", "Then a life gathered around one table."],
              title: "Our story",
            },
            sectionKey: "story",
            sectionType: "story",
            settings: {
              layout: "timeline",
            },
            sortOrder: 3,
          }),
          createSection({
            content: {
              address: "18 Marina Gardens Drive, Singapore 018953",
              latitude: 1.2816,
              longitude: 103.8636,
              notes: "Please use the Garden East entrance.",
              venueName: "Emerald Gardens",
            },
            sectionKey: "venue",
            sectionType: "location",
            sortOrder: 4,
          }),
          createSection({
            content: {
              images: [
                {
                  alt: "Garden aisle at dusk",
                  url: "https://images.example.com/garden-aisle.jpg",
                },
                {
                  alt: "Long dinner table with candlelight",
                  url: "https://images.example.com/dinner-table.jpg",
                },
              ],
              title: "A glimpse of the evening",
            },
            sectionKey: "gallery",
            sectionType: "gallery",
            sortOrder: 5,
          }),
        ]),
      }),
    );

    expect(html).toContain('data-ambient-audio="optional"');
    expect(html).toContain('data-ambient-audio-controls="external-controls"');
    expect(html).toContain('data-invite-modernization="editorial-v1"');
    expect(html).toContain('data-composition-map="wedding-editorial"');
    expect(html).toContain('data-motion-profile="immersive"');
    expect(html).toContain('data-motion-intensity="high"');
    expect(html).toContain('data-motion-root="invite"');
    expect(html).toContain('data-motion-runtime-marker="high"');
    expect(html).toContain('data-backdrop-type="gradient"');
    expect(html).toContain('data-texture-policy="fine-noise"');
    expect(html).toContain('data-ornament-set="candlelight"');
    expect(html).toContain('data-divider-style="luminous"');
    expect(html).toContain('data-frame-style="double-line"');
    expect(html).toContain('data-image-treatment="cinematic"');
    expect(html).toContain('data-effects-layer="invite-atmosphere"');
    expect(html).toContain('data-parallax-profile="hero-and-media"');
    expect(html).toContain('data-theme-hero-composition="layered-portrait"');
    expect(html).toContain('data-parallax-kind="hero-depth"');
    expect(html).toContain('data-parallax-layer="hero-image"');
    expect(html).toContain('class="lumiere-scroll-progress"');
    expect(html).toContain("lumiere-hero-title");
    expect(html).toContain('data-motion-mask="text"');
    expect(html).toContain('data-motion-soft-image="true"');
    expect(html).toContain("lumiere-profile-card");
    expect(html).toContain("lumiere-gallery-grid");
    expect(html).toContain('data-image-role="feature"');
    expect(html).toContain('data-section-composition="full-bleed"');
    expect(html).toContain('data-section-composition="timeline"');
    expect(html).toContain('data-section-composition="editorial-split"');
    expect(html).toContain('data-section-composition="gallery-feature"');
    expect(html).toContain('data-parallax-kind="gallery-depth"');
    expect(html).toContain('data-section-key="hosts"');
    expect(html).toContain('data-section-layout="split"');
    expect(html).toContain('data-motion-kind="timeline-reveal"');
    expect(html).toContain('data-motion-kind="gallery-drift"');
    expect(html).toContain('data-motion-kind="media-reveal"');
    expect(html).toContain('data-section-renderer="section.gallery"');
    expect(html).toContain('data-map-state="embedded"');
    expect(html).toContain('data-map-frame="editorial"');
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('title="Map showing Emerald Gardens"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain("Open directions");
    expect(html).toContain("openstreetmap.org/export/embed.html");
    expect(html).toContain("Garden portrait at golden hour");
    expect(html).toContain("Garden aisle at dusk");
    expect(html).toContain("First the quiet hello.");
    expect(html).toContain("Then a life gathered around one table.");

    const gardenInvite = createInvite([
      createSection({
        content: {
          address: "18 Marina Gardens Drive, Singapore 018953",
          latitude: 1.2816,
          longitude: 103.8636,
          venueName: "Emerald Gardens",
        },
        sectionKey: "garden-location",
        sectionType: "location",
        sortOrder: 0,
      }),
    ]);
    gardenInvite.selectedThemeId = "garden-light";
    const gardenHtml = renderToStaticMarkup(
      createElement(PublicInvitation, { invite: gardenInvite }),
    );

    expect(gardenHtml).toContain('data-map-frame="organic"');
    expect(gardenHtml).toContain('data-map-aspect="landscape"');
  });

  it("respects section settings for columns, density, variants, and swatches", () => {
    const html = renderToStaticMarkup(
      createElement(PublicInvitation, {
        invite: createInvite([
          createSection({
            content: {
              subtitle: "A small formal gathering.",
              title: "Dinner in the garden",
            },
            sectionKey: "welcome",
            sectionType: "introduction",
            sortOrder: 0,
          }),
          createSection({
            content: {
              items: [
                { label: "Ceremony", value: "5:30 PM" },
                { label: "Dinner", value: "6:30 PM" },
                { label: "After party", value: "9:00 PM" },
              ],
              title: "Schedule",
            },
            sectionKey: "schedule",
            sectionType: "details",
            settings: {
              columns: 3,
              density: "compact",
              variant: "framed",
            },
            sortOrder: 1,
          }),
          createSection({
            content: {
              description: "Formal garden attire. Soft neutrals are welcome.",
              palette: [
                {
                  color: "#e7d6b8",
                  label: "Champagne",
                },
                {
                  color: "#9caf88",
                  label: "Sage",
                },
              ],
              title: "Dress code",
            },
            sectionKey: "dress-code",
            sectionType: "dress_code",
            settings: {
              showSwatches: false,
            },
            sortOrder: 2,
          }),
          createSection({
            content: {
              blocks: [
                {
                  body: "Please arrive a little early for welcome drinks.",
                },
              ],
              title: "A note from the hosts",
            },
            sectionKey: "host-note",
            sectionType: "custom",
            sortOrder: 3,
          }),
        ]),
      }),
    );

    expect(html).toContain('data-section-renderer-coverage="specialized"');
    expect(html).toContain('data-section-renderer-coverage="fallback"');
    expect(html).toContain('data-section-density="compact"');
    expect(html).toContain('data-section-variant="framed"');
    expect(html).toContain("lg:grid-cols-3");
    expect(html).toContain("A note from the hosts");
    expect(html).toContain("Champagne");
    expect(html).toContain("Sage");
    expect(html).not.toContain("background-color:#e7d6b8");
  });

  it("renders theme-aware ambient audio controls when audio metadata is configured", () => {
    const invite = createInvite([]);
    invite.themeMode = "toggleable";
    invite.themeConfig = {
      ambientAudio: {
        autoplay: true,
        label: "Evening music",
        lowDistraction: true,
        src: "https://audio.example.com/garden-strings.mp3",
        title: "Garden strings",
      },
    };

    const html = renderToStaticMarkup(createElement(PublicInvitation, { invite }));

    expect(html).toContain('data-audio-status="idle"');
    expect(html).toContain('data-low-distraction="true"');
    expect(html).toContain('preload="metadata"');
    expect(html).toContain('src="https://audio.example.com/garden-strings.mp3"');
    expect(html).toContain("Evening music");
    expect(html).toContain("Play Garden strings");
    expect(html).toContain("Tap to begin");
    expect(html).toContain("top-20 sm:top-4");
  });

  it("omits ambient audio controls when audio is missing or disabled", () => {
    const missingAudioHtml = renderToStaticMarkup(
      createElement(PublicInvitation, {
        invite: createInvite([]),
      }),
    );
    const disabledInvite = createInvite([]);
    disabledInvite.themeConfig = {
      ambientAudio: {
        enabled: false,
        src: "https://audio.example.com/disabled.mp3",
      },
    };
    const disabledAudioHtml = renderToStaticMarkup(
      createElement(PublicInvitation, {
        invite: disabledInvite,
      }),
    );

    expect(missingAudioHtml).not.toContain("data-audio-status");
    expect(disabledAudioHtml).not.toContain("data-audio-status");
  });

  it("renders guest-only RSVP sections with guest context", () => {
    const invite: PublicGuestInviteResponse = {
      ...createInvite([
        createSection({
          content: {
            subtitle: "Your private invitation is ready.",
            title: "Dinner in the garden",
          },
          sectionKey: "welcome",
          sectionType: "introduction",
          sortOrder: 0,
        }),
        createSection({
          content: {
            description: "Please reply before Friday.",
            questions: [
              {
                key: "meal-choice",
                label: "Meal choice",
                required: true,
                type: "single_choice",
              },
            ],
            submitLabel: "Send private reply",
            title: "Private RSVP",
          },
          sectionKey: "rsvp",
          sectionType: "rsvp",
          sortOrder: 1,
          visibility: "guest_only",
        }),
      ]),
      guest: {
        guestGroup: {
          label: "Tan Family",
          maxPax: 4,
          status: "opened",
        },
        responseStatus: null,
      },
      rsvpFields: {
        collectGuestMessage: true,
        collectGuestNames: true,
      },
      themeConfig: {
        ambientAudio: {
          label: "Private music",
          src: "https://audio.example.com/private-suite.mp3",
          title: "Private suite",
        },
      },
    };
    const html = renderToStaticMarkup(
      createElement(GuestInvitation, {
        guestToken: "sample-guest-token-for-preview",
        invite,
      }),
    );

    expect(html).toContain('data-section-renderer="section.rsvp"');
    expect(html).toContain('data-section-composition="full-bleed"');
    expect(html).toContain("Tan Family");
    expect(html).toContain("Max 4 pax");
    expect(html).toContain("Meal choice");
    expect(html).toContain("Private RSVP");
    expect(html).toContain("Please reply before Friday.");
    expect(html).toContain("Send private reply");
    expect(html).toContain("Will you celebrate with us?");
    expect(html).toContain('data-rsvp-design="editorial"');
    expect(html).toContain('data-rsvp-renderer="editorial-ledger"');
    expect(html).toContain('data-invite-modernization="editorial-v1"');
    expect(html).toContain("lumiere-guest-panel");
    expect(html).toContain("lumiere-rsvp-layout");
    expect(html).toContain("Private music");
    expect(html).toContain('src="https://audio.example.com/private-suite.mp3"');
  });
});

function readDataValue(html: string, attribute: string) {
  return html.match(new RegExp(`data-${attribute}="([^"]+)"`))?.[1] ?? null;
}

function readDataValues(html: string, attribute: string) {
  return [
    ...new Set(
      [...html.matchAll(new RegExp(`data-${attribute}="([^"]+)"`, "g"))].map((match) => match[1]),
    ),
  ];
}

function createInvite(sections: EventSection[]): PublicEventResponse {
  return {
    event: {
      eventType: "wedding",
      publicSettings: {},
      slug: "garden-evening",
      startsAt: "2030-06-01T10:30:00.000Z",
      status: "published",
      timezone: "Asia/Singapore",
      title: "Garden Evening",
      venueAddress: "18 Marina Gardens Drive, Singapore 018953",
      venueName: "Emerald Gardens",
    },
    sections,
    selectedThemeId: "premium",
    themeConfig: {},
    themeMode: "light",
  };
}

function createSection(
  input: Pick<EventSection, "content" | "sectionKey" | "sectionType" | "sortOrder"> &
    Partial<Pick<EventSection, "settings" | "visibility">>,
): EventSection {
  return {
    content: input.content,
    createdAt: "2030-01-01T00:00:00.000Z",
    enabled: true,
    eventId: "evt_renderer",
    id: `section_${input.sectionKey}`,
    sectionKey: input.sectionKey,
    sectionType: input.sectionType,
    settings: input.settings ?? {},
    sortOrder: input.sortOrder,
    updatedAt: "2030-01-01T00:00:00.000Z",
    visibility: input.visibility ?? "public",
  };
}
