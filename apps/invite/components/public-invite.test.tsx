import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { EventSection, PublicEventResponse, PublicGuestInviteResponse } from "@lumiere/types";

import { GuestInvitation, PublicInvitation } from "./public-invite";

describe("public invite section renderers", () => {
  it("emits composition and motion hooks for immersive section layouts", () => {
    const html = renderToStaticMarkup(
      createElement(PublicInvitation, {
        invite: createInvite([
          createSection({
            content: {
              body: "A luminous evening for close friends.",
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
              paragraphs: ["First the quiet hello.", "Then a life gathered around one table."],
              title: "Our story",
            },
            sectionKey: "story",
            sectionType: "story",
            settings: {
              layout: "timeline",
            },
            sortOrder: 2,
          }),
          createSection({
            content: {
              address: "18 Marina Gardens Drive, Singapore 018953",
              mapUrl: "https://maps.example.com/emerald-gardens",
              notes: "Please use the Garden East entrance.",
              venueName: "Emerald Gardens",
            },
            sectionKey: "venue",
            sectionType: "location",
            sortOrder: 3,
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
            sortOrder: 4,
          }),
        ]),
      }),
    );

    expect(html).toContain('data-section-composition="full-bleed"');
    expect(html).toContain('data-section-composition="timeline"');
    expect(html).toContain('data-section-composition="editorial-split"');
    expect(html).toContain('data-section-composition="gallery-feature"');
    expect(html).toContain('data-motion-kind="timeline-reveal"');
    expect(html).toContain('data-motion-kind="media-reveal"');
    expect(html).toContain('data-section-renderer="section.gallery"');
    expect(html).toContain("Map preview");
    expect(html).toContain("Garden aisle at dusk");
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
        ]),
      }),
    );

    expect(html).toContain('data-section-density="compact"');
    expect(html).toContain('data-section-variant="framed"');
    expect(html).toContain("lg:grid-cols-3");
    expect(html).toContain("Champagne");
    expect(html).toContain("Sage");
    expect(html).not.toContain("background-color:#e7d6b8");
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
            questions: [
              {
                key: "meal-choice",
                label: "Meal choice",
                required: true,
                type: "single_choice",
              },
            ],
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
    };
    const html = renderToStaticMarkup(createElement(GuestInvitation, { invite }));

    expect(html).toContain('data-section-renderer="section.rsvp"');
    expect(html).toContain('data-section-composition="full-bleed"');
    expect(html).toContain("Tan Family");
    expect(html).toContain("Max 4 pax");
    expect(html).toContain("Meal choice");
  });
});

function createInvite(sections: EventSection[]): PublicEventResponse {
  return {
    event: {
      eventType: "wedding",
      id: "evt_renderer",
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
