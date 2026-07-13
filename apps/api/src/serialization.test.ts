import {
  activityEventsResponseSchema,
  eventSectionsResponseSchema,
  guestGroupsResponseSchema,
  notificationsResponseSchema,
  publicEventResponseSchema,
  rsvpSubmissionResponseSchema,
} from "@lumiere/types";
import { describe, expect, it } from "vitest";

import { toApiActivityEvent, toApiNotification } from "./dashboard-data";
import { toApiGuestGroup } from "./guest-groups";
import { toPublicEventRecord } from "./public-invites";
import { toApiRsvpResponse } from "./rsvps";
import { toApiEventSection } from "./theme-sections";

const eventId = "00000000-0000-4000-8000-000000000101";
const guestGroupId = "00000000-0000-4000-8000-000000000301";
const userId = "00000000-0000-4000-8000-000000000001";

describe("API serialization", () => {
  it("serializes guest group database timestamps as shared API datetimes", () => {
    const guestGroup = toApiGuestGroup({
      contactEmail: null,
      contactName: null,
      createdAt: "2026-07-08 03:00:00+00",
      eventId,
      id: guestGroupId,
      inviteCode: "invite-code",
      inviteTokenHash: "hash",
      label: "Tan Family",
      lastOpenedAt: "2026-07-08 04:00:00+00",
      maxPax: 4,
      notes: null,
      status: "pending",
      updatedAt: "2026-07-08 05:00:00+00",
    } as Parameters<typeof toApiGuestGroup>[0]);

    expect(guestGroupsResponseSchema.parse({ guestGroups: [guestGroup] })).toEqual({
      guestGroups: [
        expect.objectContaining({
          createdAt: "2026-07-08T03:00:00.000Z",
          lastOpenedAt: "2026-07-08T04:00:00.000Z",
          updatedAt: "2026-07-08T05:00:00.000Z",
        }),
      ],
    });
  });

  it("serializes activity and notification timestamps as shared API datetimes", () => {
    const activity = toApiActivityEvent({
      actorId: guestGroupId,
      actorType: "guest",
      activityType: "rsvp_submitted",
      createdAt: "2026-07-08 06:00:00+00",
      eventId,
      id: "00000000-0000-4000-8000-000000000501",
      metadataJson: {
        guestGroupLabel: "Tan Family",
      },
    } as Parameters<typeof toApiActivityEvent>[0]);
    const notification = toApiNotification({
      createdAt: "2026-07-08 06:01:00+00",
      eventId,
      id: "00000000-0000-4000-8000-000000000601",
      message: "Tan Family submitted an RSVP.",
      metadataJson: {
        guestGroupId,
      },
      notificationType: "rsvp_submitted",
      readAt: "2026-07-08 06:02:00+00",
      title: "RSVP submitted",
      userId,
    } as Parameters<typeof toApiNotification>[0]);

    expect(activityEventsResponseSchema.parse({ activity: [activity] })).toEqual({
      activity: [
        expect.objectContaining({
          createdAt: "2026-07-08T06:00:00.000Z",
        }),
      ],
    });
    expect(notificationsResponseSchema.parse({ notifications: [notification] })).toEqual({
      notifications: [
        expect.objectContaining({
          createdAt: "2026-07-08T06:01:00.000Z",
          readAt: "2026-07-08T06:02:00.000Z",
        }),
      ],
    });
  });

  it("serializes section and RSVP timestamps as shared API datetimes", () => {
    const section = toApiEventSection({
      contentJson: {
        title: "Welcome",
      },
      createdAt: "2026-07-08 07:00:00+00",
      enabled: true,
      eventId,
      id: "00000000-0000-4000-8000-000000000701",
      sectionKey: "welcome",
      sectionType: "introduction",
      settingsJson: {},
      sortOrder: 0,
      updatedAt: "2026-07-08 07:01:00+00",
      visibility: "public",
    } as Parameters<typeof toApiEventSection>[0]);
    const response = toApiRsvpResponse({
      answersJson: [],
      attendeeCount: 2,
      eventId,
      guestGroupId,
      guestNamesJson: ["Mina Tan", "Alex Tan"],
      id: "00000000-0000-4000-8000-000000000401",
      message: null,
      responseStatus: "attending",
      submittedAt: "2026-07-08 08:00:00+00",
      updatedAt: "2026-07-08 08:01:00+00",
    } as Parameters<typeof toApiRsvpResponse>[0]);

    expect(eventSectionsResponseSchema.parse({ sections: [section] })).toEqual({
      sections: [
        expect.objectContaining({
          createdAt: "2026-07-08T07:00:00.000Z",
          updatedAt: "2026-07-08T07:01:00.000Z",
        }),
      ],
    });
    expect(rsvpSubmissionResponseSchema.parse({ response })).toEqual({
      response: expect.objectContaining({
        submittedAt: "2026-07-08T08:00:00.000Z",
        updatedAt: "2026-07-08T08:01:00.000Z",
      }),
    });
  });

  it("serializes public event timestamps as shared API datetimes", () => {
    const publicEvent = toPublicEventRecord({
      event: {
        endsAt: "2026-08-23 15:30:00+00",
        eventType: "wedding",
        id: eventId,
        publicSlug: "lumiere-demo",
        startsAt: "2026-08-23 09:00:00+00",
        status: "published",
        timezone: "Asia/Singapore",
        title: "Amara & Theo",
        venueAddress: "18 Marina Gardens Drive, Singapore 018953",
        venueName: "Emerald Gardens",
      },
      publication: {
        publicSettingsJson: {},
        rsvpSettingsJson: {},
        sectionsJson: [
          {
            content: {
              address: "18 Marina Gardens Drive, Singapore 018953",
              directionsUrl: "https://malicious.example.com/redirect",
              embedUrl: "https://malicious.example.com/embed",
              venueName: "Emerald Gardens",
            },
            sectionType: "location",
          },
        ],
        selectedThemeId: "premium",
        themeConfigJson: {},
        themeMode: "toggleable",
      },
    } as unknown as Parameters<typeof toPublicEventRecord>[0]);
    const { rsvpFields: _guestOnlyRsvpFields, ...publicEventPayload } = publicEvent;

    expect(publicEvent.sections[0]?.content).toMatchObject({
      directionsUrl: expect.stringContaining("https://www.google.com/maps/dir/"),
    });
    expect(publicEvent.sections[0]?.content).not.toHaveProperty("embedUrl");

    expect(
      publicEventResponseSchema.parse({
        ...publicEvent,
        sections: [],
      }),
    ).toEqual({
      ...publicEventPayload,
      event: expect.objectContaining({
        endsAt: "2026-08-23T15:30:00.000Z",
        startsAt: "2026-08-23T09:00:00.000Z",
      }),
      sections: [],
    });
  });
});
