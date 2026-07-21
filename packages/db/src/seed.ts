import { createHmac } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  demoEventCatalog,
  type DemoEventCatalogEntry,
  type DemoEventKey,
  type GuestGroupStatus,
  type JsonValue,
  type RsvpAnswer,
  type RsvpStatus,
  type SectionType,
  type SectionVisibility,
  type ThemeMode,
} from "@lumiere/types";
import { eq, inArray, or } from "drizzle-orm";

import { createDatabase, createPostgresClient } from "./client";
import {
  activityEvents,
  eventManagers,
  eventPublications,
  eventRsvpSettings,
  eventSectionContents,
  eventSections,
  eventThemeSettings,
  events,
  guestGroupMembers,
  guestGroups,
  notifications,
  rsvpResponses,
  themeRegistrySnapshots,
  users,
} from "./schema";

type JsonObject = Record<string, JsonValue>;

type DemoSection = {
  contentJson: JsonObject;
  enabled: boolean;
  eventId: string;
  id: string;
  sectionKey: string;
  sectionType: SectionType;
  settingsJson: JsonObject;
  sortOrder: number;
  visibility: SectionVisibility;
};

type DemoResponse = {
  answersJson: RsvpAnswer[];
  attendeeCount: number;
  guestNamesJson: string[];
  id: string;
  message?: string;
  responseStatus: RsvpStatus;
  submittedAt: string;
};

type DemoGuest = {
  contactEmail: string;
  contactName: string;
  id: string;
  inviteCode: string;
  label: string;
  lastOpenedAt?: string;
  maxPax: number;
  members: string[];
  notes: string;
  response?: DemoResponse;
  status: GuestGroupStatus;
  token: string;
};

type DemoSeedDefinition = {
  catalog: DemoEventCatalogEntry;
  databaseId: string;
  endsAt: string;
  guests: DemoGuest[];
  publicSettings: JsonObject;
  rsvpSettings: JsonObject;
  sections: DemoSection[];
  startsAt: string;
  themeConfig: JsonObject;
  themeMode: ThemeMode;
  timezone: string;
  venueAddress: string;
  venueName: string;
};

loadApiEnv();

const databaseUrl = normalizeDatabaseUrl(
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/lumiere",
);
const publicAppBaseUrl = process.env.PUBLIC_APP_BASE_URL ?? "http://localhost:3000";
const dashboardAppBaseUrl = process.env.DASHBOARD_APP_BASE_URL ?? "http://localhost:3001";
const inviteTokenSecret =
  process.env.INVITE_TOKEN_SECRET ?? "local-dev-invite-token-secret-change-me";

const seedManagerId = uuid("d101");
const fallbackManagerEmail = "demo.manager@example.com";
const fallbackSupabaseUserId = uuid("d201");
const seededAt = "2026-07-22T00:00:00.000Z";
const legacySeedSlug = "lumiere-demo";

const demoDefinitions = buildDemoDefinitions();

async function main() {
  const client = createPostgresClient(databaseUrl, { max: 1 });
  const db = createDatabase(client);

  try {
    const result = await db.transaction(async (tx) => {
      const manager = await resolveSeedManager(tx);
      const eventIds = demoDefinitions.map((definition) => definition.databaseId);
      const slugs = [
        ...demoDefinitions.map((definition) => definition.catalog.publicSlug),
        legacySeedSlug,
      ];

      await tx
        .delete(events)
        .where(or(inArray(events.id, eventIds), inArray(events.publicSlug, slugs)));

      for (const definition of demoDefinitions) {
        await seedDemoEvent(tx, definition, manager.id);
      }

      return {
        events: demoDefinitions.map((definition) => ({
          eventId: definition.databaseId,
          guestToken: representativeGuest(definition).token,
          publicSlug: definition.catalog.publicSlug,
          title: definition.catalog.title,
        })),
        managerEmail: manager.email,
        managerSupabaseUserId: manager.supabaseUserId,
        syntheticManager: manager.supabaseUserId === fallbackSupabaseUserId,
      };
    });

    printSeedSummary(result);
  } finally {
    await client.end();
  }
}

type SeedTransaction = Parameters<
  Parameters<ReturnType<typeof createDatabase>["transaction"]>[0]
>[0];

async function resolveSeedManager(tx: SeedTransaction) {
  const configuredEmail = process.env.SEED_MANAGER_EMAIL?.trim().toLowerCase();
  const configuredSupabaseUserId = process.env.SEED_SUPABASE_USER_ID?.trim();
  const lookupEmail = configuredEmail ?? fallbackManagerEmail;

  const [bySupabaseId] = configuredSupabaseUserId
    ? await tx
        .select()
        .from(users)
        .where(eq(users.supabaseUserId, configuredSupabaseUserId))
        .limit(1)
    : [];
  const [byEmail] = bySupabaseId
    ? []
    : await tx.select().from(users).where(eq(users.email, lookupEmail)).limit(1);
  const [bySeedId] =
    bySupabaseId || byEmail
      ? []
      : await tx.select().from(users).where(eq(users.id, seedManagerId)).limit(1);
  const existingManager = bySupabaseId ?? byEmail ?? bySeedId;
  const managerValues = {
    displayName: existingManager?.displayName ?? "Demo Manager",
    email: configuredEmail ?? existingManager?.email ?? fallbackManagerEmail,
    supabaseUserId:
      configuredSupabaseUserId ?? existingManager?.supabaseUserId ?? fallbackSupabaseUserId,
  };

  if (existingManager) {
    const [manager] = await tx
      .update(users)
      .set({
        ...managerValues,
        updatedAt: seededAt,
      })
      .where(eq(users.id, existingManager.id))
      .returning();

    if (manager) {
      return manager;
    }
  } else {
    const [manager] = await tx
      .insert(users)
      .values({
        ...managerValues,
        createdAt: seededAt,
        id: seedManagerId,
        updatedAt: seededAt,
      })
      .returning();

    if (manager) {
      return manager;
    }
  }

  throw new Error("Unable to create the standalone demo manager");
}

async function seedDemoEvent(
  tx: SeedTransaction,
  definition: DemoSeedDefinition,
  managerId: string,
) {
  const [event] = await tx
    .insert(events)
    .values({
      createdAt: seededAt,
      endsAt: definition.endsAt,
      eventType: definition.catalog.eventType,
      id: definition.databaseId,
      ownerUserId: managerId,
      publicSettingsJson: definition.publicSettings,
      publicSlug: definition.catalog.publicSlug,
      startsAt: definition.startsAt,
      status: "published",
      timezone: definition.timezone,
      title: definition.catalog.title,
      updatedAt: seededAt,
      venueAddress: definition.venueAddress,
      venueName: definition.venueName,
    })
    .returning();

  if (!event) {
    throw new Error(`Unable to seed demo event: ${definition.catalog.title}`);
  }

  await tx.insert(eventManagers).values({
    createdAt: seededAt,
    eventId: event.id,
    role: "owner",
    userId: managerId,
  });
  await tx.insert(eventThemeSettings).values({
    configJson: definition.themeConfig,
    eventId: event.id,
    selectedThemeId: definition.catalog.themeId,
    themeMode: definition.themeMode,
    updatedAt: seededAt,
  });
  await tx.insert(eventRsvpSettings).values({
    eventId: event.id,
    settingsJson: definition.rsvpSettings,
    updatedAt: seededAt,
  });
  await tx.insert(eventSections).values(
    definition.sections.map(({ contentJson: _contentJson, ...item }) => ({
      ...item,
      createdAt: seededAt,
      updatedAt: seededAt,
    })),
  );
  await tx.insert(eventSectionContents).values(
    definition.sections.map((item) => ({
      contentJson: item.contentJson,
      eventSectionId: item.id,
      updatedAt: seededAt,
    })),
  );
  await tx.insert(eventPublications).values({
    eventId: event.id,
    publishedAt: seededAt,
    publicSettingsJson: definition.publicSettings,
    rsvpSettingsJson: definition.rsvpSettings,
    sectionsJson: definition.sections.map((item) => ({
      content: item.contentJson,
      createdAt: seededAt,
      enabled: item.enabled,
      eventId: item.eventId,
      id: item.id,
      sectionKey: item.sectionKey,
      sectionType: item.sectionType,
      settings: item.settingsJson,
      sortOrder: item.sortOrder,
      updatedAt: seededAt,
      visibility: item.visibility,
    })),
    selectedThemeId: definition.catalog.themeId,
    themeConfigJson: definition.themeConfig,
    themeMode: definition.themeMode,
  });
  await tx.insert(themeRegistrySnapshots).values({
    createdAt: seededAt,
    eventId: event.id,
    metadataJson: {
      demoCatalogKey: definition.catalog.key,
      label: definition.catalog.themeId,
      seeded: true,
    },
    themeId: definition.catalog.themeId,
    version: "demo-v1",
  });

  await tx.insert(guestGroups).values(
    definition.guests.map((guest) => ({
      contactEmail: guest.contactEmail,
      contactName: guest.contactName,
      createdAt: seededAt,
      eventId: event.id,
      id: guest.id,
      inviteCode: guest.inviteCode,
      inviteTokenHash: hashInviteToken(guest.token),
      label: guest.label,
      lastOpenedAt: guest.lastOpenedAt,
      maxPax: guest.maxPax,
      notes: guest.notes,
      status: guest.status,
      updatedAt: seededAt,
    })),
  );

  const members = definition.guests.flatMap((guest) =>
    guest.members.map((name, sortOrder) => ({
      createdAt: seededAt,
      guestGroupId: guest.id,
      id: memberId(guest.id, sortOrder),
      name,
      sortOrder,
      updatedAt: seededAt,
    })),
  );
  if (members.length > 0) {
    await tx.insert(guestGroupMembers).values(members);
  }

  const responses = definition.guests.flatMap((guest) =>
    guest.response
      ? [
          {
            ...guest.response,
            eventId: event.id,
            guestGroupId: guest.id,
            updatedAt: guest.response.submittedAt,
          },
        ]
      : [],
  );
  if (responses.length > 0) {
    await tx.insert(rsvpResponses).values(responses);
  }

  await tx.insert(activityEvents).values(buildActivity(definition, managerId));
  const eventNotifications = buildNotifications(definition, managerId);
  if (eventNotifications.length > 0) {
    await tx.insert(notifications).values(eventNotifications);
  }
}

function buildActivity(definition: DemoSeedDefinition, managerId: string) {
  const eventNumber = demoEventNumber(definition.catalog.key);
  const base = [
    {
      actorId: managerId,
      actorType: "manager" as const,
      activityType: "event_created" as const,
      createdAt: seededAt,
      eventId: definition.databaseId,
      id: uuid(`d${eventNumber}601`),
      metadataJson: { title: definition.catalog.title },
    },
    {
      actorId: managerId,
      actorType: "manager" as const,
      activityType: "theme_updated" as const,
      createdAt: addMinutes(seededAt, eventNumber * 5),
      eventId: definition.databaseId,
      id: uuid(`d${eventNumber}602`),
      metadataJson: {
        selectedThemeId: definition.catalog.themeId,
        themeMode: definition.themeMode,
      },
    },
  ];
  const guestActivity = definition.guests.flatMap((guest, index) => {
    const opened = guest.lastOpenedAt
      ? [
          {
            actorId: guest.id,
            actorType: "guest" as const,
            activityType: "guest_invite_opened" as const,
            createdAt: guest.lastOpenedAt,
            eventId: definition.databaseId,
            id: uuid(`d${eventNumber}61${index * 2 + 3}`),
            metadataJson: {
              guestGroupId: guest.id,
              guestGroupLabel: guest.label,
            },
          },
        ]
      : [];
    const responded = guest.response
      ? [
          {
            actorId: guest.id,
            actorType: "guest" as const,
            activityType: "rsvp_submitted" as const,
            createdAt: guest.response.submittedAt,
            eventId: definition.databaseId,
            id: uuid(`d${eventNumber}61${index * 2 + 4}`),
            metadataJson: {
              attendeeCount: guest.response.attendeeCount,
              guestGroupId: guest.id,
              guestGroupLabel: guest.label,
              responseStatus: guest.response.responseStatus,
            },
          },
        ]
      : [];

    return [...opened, ...responded];
  });

  return [...base, ...guestActivity];
}

function buildNotifications(definition: DemoSeedDefinition, managerId: string) {
  const eventNumber = demoEventNumber(definition.catalog.key);

  return definition.guests.flatMap((guest, index) => {
    if (!guest.response) {
      return [];
    }

    const attending = guest.response.responseStatus !== "not_attending";

    return [
      {
        createdAt: guest.response.submittedAt,
        eventId: definition.databaseId,
        id: uuid(`d${eventNumber}70${index + 1}`),
        message: attending
          ? `${guest.label} replied to ${definition.catalog.title} for ${guest.response.attendeeCount} guest${guest.response.attendeeCount === 1 ? "" : "s"}.`
          : `${guest.label} sent their regrets for ${definition.catalog.title}.`,
        metadataJson: {
          attendeeCount: guest.response.attendeeCount,
          guestGroupId: guest.id,
          guestGroupLabel: guest.label,
          responseStatus: guest.response.responseStatus,
        },
        notificationType: "rsvp_submitted" as const,
        title: attending ? "RSVP received" : "Guest cannot attend",
        userId: managerId,
      },
    ];
  });
}

function buildDemoDefinitions(): DemoSeedDefinition[] {
  return [buildWeddingDemo(), buildBirthdayDemo(), buildLaunchDemo()];
}

function buildWeddingDemo(): DemoSeedDefinition {
  const catalog = catalogEntry("wedding");
  const eventId = uuid("d001");
  const startsAt = "2026-08-23T09:00:00.000Z";

  return {
    catalog,
    databaseId: eventId,
    endsAt: "2026-08-23T15:30:00.000Z",
    guests: [
      demoGuest(1, 1, {
        contactEmail: "mina.tan@example.com",
        contactName: "Mina Tan",
        inviteCode: "DEMO-WED-TAN",
        label: "Tan Family",
        lastOpenedAt: "2026-07-23T01:00:00.000Z",
        maxPax: 4,
        members: ["Mina Tan", "Alex Tan", "Jamie Tan"],
        notes: "Close family table; one vegetarian meal.",
        response: demoResponse(1, 1, {
          answersJson: [
            { questionKey: "dietary-notes", value: "One vegetarian meal, please." },
            { questionKey: "song-request", value: "September" },
          ],
          attendeeCount: 3,
          guestNamesJson: ["Mina Tan", "Alex Tan", "Jamie Tan"],
          message: "We cannot wait to celebrate with you.",
          responseStatus: "attending",
          submittedAt: "2026-07-23T01:05:00.000Z",
        }),
        status: "responded",
        token: "demo-wedding-tan-family-rsvp-token",
      }),
      demoGuest(1, 2, {
        contactEmail: "ana.rivera@example.com",
        contactName: "Ana Rivera",
        inviteCode: "DEMO-WED-RIVERA",
        label: "Rivera Party",
        maxPax: 2,
        members: ["Ana Rivera", "Luis Rivera"],
        notes: "Representative pending guest link.",
        status: "pending",
        token: "demo-wedding-rivera-party-rsvp-token",
      }),
      demoGuest(1, 3, {
        contactEmail: "jon.lee@example.com",
        contactName: "Jon Lee",
        inviteCode: "DEMO-WED-LEE",
        label: "Lee Family",
        lastOpenedAt: "2026-07-23T02:00:00.000Z",
        maxPax: 3,
        members: ["Jon Lee"],
        notes: "Travelling during the wedding weekend.",
        response: demoResponse(1, 2, {
          answersJson: [],
          attendeeCount: 0,
          guestNamesJson: [],
          message: "Sending love from abroad.",
          responseStatus: "not_attending",
          submittedAt: "2026-07-23T02:05:00.000Z",
        }),
        status: "declined",
        token: "demo-wedding-lee-family-rsvp-token",
      }),
    ],
    publicSettings: { shareTitle: "Amara & Theo — Garden Wedding" },
    rsvpSettings: {
      allowMaybe: true,
      allowUpdates: true,
      collectGuestMessage: true,
      collectGuestNames: true,
      enabled: true,
    },
    sections: weddingSections(eventId, startsAt),
    startsAt,
    themeConfig: { accentName: "Candlelit gold", welcomeTone: "formal" },
    themeMode: "toggleable",
    timezone: "Asia/Singapore",
    venueAddress: "18 Marina Gardens Drive, Singapore 018953",
    venueName: "Emerald Gardens",
  };
}

function buildBirthdayDemo(): DemoSeedDefinition {
  const catalog = catalogEntry("kids-birthday");
  const eventId = uuid("d002");
  const startsAt = "2026-09-12T04:00:00.000Z";

  return {
    catalog,
    databaseId: eventId,
    endsAt: "2026-09-12T08:00:00.000Z",
    guests: [
      demoGuest(2, 1, {
        contactEmail: "sophie.chen@example.com",
        contactName: "Sophie Chen",
        inviteCode: "DEMO-BDAY-CHEN",
        label: "Chen Family",
        lastOpenedAt: "2026-07-24T03:00:00.000Z",
        maxPax: 3,
        members: ["Sophie Chen", "Eli Chen", "Maya Chen"],
        notes: "Maya has a nut allergy.",
        response: demoResponse(2, 1, {
          answersJson: [
            { questionKey: "allergies", value: "Nut allergy for Maya." },
            { questionKey: "activity", value: "Science slime lab" },
          ],
          attendeeCount: 3,
          guestNamesJson: ["Sophie Chen", "Eli Chen", "Maya Chen"],
          message: "Milo, we are ready for the big eight!",
          responseStatus: "attending",
          submittedAt: "2026-07-24T03:08:00.000Z",
        }),
        status: "responded",
        token: "demo-birthday-chen-family-rsvp-token",
      }),
      demoGuest(2, 2, {
        contactEmail: "nora.patel@example.com",
        contactName: "Nora Patel",
        inviteCode: "DEMO-BDAY-PATEL",
        label: "Patel Family",
        maxPax: 2,
        members: ["Nora Patel", "Ari Patel"],
        notes: "Representative pending guest link.",
        status: "pending",
        token: "demo-birthday-patel-family-rsvp-token",
      }),
      demoGuest(2, 3, {
        contactEmail: "leo.ng@example.com",
        contactName: "Leo Ng",
        inviteCode: "DEMO-BDAY-NG",
        label: "Ng Family",
        lastOpenedAt: "2026-07-24T04:00:00.000Z",
        maxPax: 2,
        members: ["Leo Ng", "Kai Ng"],
        notes: "Waiting on the school sports schedule.",
        status: "opened",
        token: "demo-birthday-ng-family-rsvp-token",
      }),
    ],
    publicSettings: { shareTitle: "Milo Turns Eight — Sunroom Party" },
    rsvpSettings: {
      allowMaybe: false,
      allowUpdates: true,
      collectGuestMessage: true,
      collectGuestNames: true,
      enabled: true,
    },
    sections: birthdaySections(eventId, startsAt),
    startsAt,
    themeConfig: { accentName: "Sunny coral", welcomeTone: "playful" },
    themeMode: "light",
    timezone: "Asia/Singapore",
    venueAddress: "3 Park Lane, Singapore 798387",
    venueName: "The Sunroom at Park House",
  };
}

function buildLaunchDemo(): DemoSeedDefinition {
  const catalog = catalogEntry("launch");
  const eventId = uuid("d003");
  const startsAt = "2026-10-02T11:30:00.000Z";

  return {
    catalog,
    databaseId: eventId,
    endsAt: "2026-10-02T15:00:00.000Z",
    guests: [
      demoGuest(3, 1, {
        contactEmail: "maya.ross@example.com",
        contactName: "Maya Ross",
        inviteCode: "DEMO-LAUNCH-ROSS",
        label: "Northstar Studio",
        lastOpenedAt: "2026-07-25T10:00:00.000Z",
        maxPax: 3,
        members: ["Maya Ross", "Dev Shah"],
        notes: "Press and creative partners.",
        response: demoResponse(3, 1, {
          answersJson: [
            { questionKey: "arrival-window", value: "7:30 PM reveal" },
            { questionKey: "accessibility", value: "No additional requirements" },
          ],
          attendeeCount: 2,
          guestNamesJson: ["Maya Ross", "Dev Shah"],
          message: "See you at the signal desk.",
          responseStatus: "attending",
          submittedAt: "2026-07-25T10:04:00.000Z",
        }),
        status: "responded",
        token: "demo-launch-northstar-studio-rsvp-token",
      }),
      demoGuest(3, 2, {
        contactEmail: "jules.kim@example.com",
        contactName: "Jules Kim",
        inviteCode: "DEMO-LAUNCH-KIM",
        label: "Signal Press",
        maxPax: 2,
        members: ["Jules Kim"],
        notes: "Representative pending guest link.",
        status: "pending",
        token: "demo-launch-signal-press-rsvp-token",
      }),
      demoGuest(3, 3, {
        contactEmail: "omar.haddad@example.com",
        contactName: "Omar Haddad",
        inviteCode: "DEMO-LAUNCH-HADDAD",
        label: "Field Office",
        lastOpenedAt: "2026-07-25T10:30:00.000Z",
        maxPax: 2,
        members: ["Omar Haddad"],
        notes: "Remote during launch week.",
        response: demoResponse(3, 2, {
          answersJson: [],
          attendeeCount: 0,
          guestNamesJson: [],
          message: "Following the release from Berlin.",
          responseStatus: "not_attending",
          submittedAt: "2026-07-25T10:35:00.000Z",
        }),
        status: "declined",
        token: "demo-launch-field-office-rsvp-token",
      }),
    ],
    publicSettings: { shareTitle: "After Hours / Studio 18" },
    rsvpSettings: {
      allowMaybe: true,
      allowUpdates: true,
      collectGuestMessage: true,
      collectGuestNames: true,
      enabled: true,
    },
    sections: launchSections(eventId, startsAt),
    startsAt,
    themeConfig: { accentName: "Electric cyan", routeLabel: "Signal 18" },
    themeMode: "dark",
    timezone: "Asia/Singapore",
    venueAddress: "18 Jalan Besar, Singapore 208835",
    venueName: "Studio 18",
  };
}

function weddingSections(eventId: string, startsAt: string): DemoSection[] {
  return [
    section(1, eventId, "introduction", "welcome", 0, {
      body: "Join us for an intimate evening of vows, dinner, music, and candlelight.",
      coverImage: {
        alt: "Warm garden tables prepared for an evening wedding",
        caption: "Emerald Gardens, Singapore",
        url: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1600&q=85",
      },
      eyebrow: "Wedding invitation",
      subtitle: "Sunday, August 23, 2026 at Emerald Gardens",
      title: "Amara & Theo",
    }),
    section(1, eventId, "profile", "hosts", 1, {
      people: [
        {
          bio: "Keeper of playlists, handwritten notes, and dessert plans.",
          name: "Amara",
          role: "Bride",
        },
        {
          bio: "Believes good coffee and good company fix almost anything.",
          name: "Theo",
          role: "Groom",
        },
      ],
      title: "The couple",
    }),
    section(1, eventId, "date", "date", 2, {
      countdownLabel: "Until we gather",
      displayText: "Sunday, August 23, 2026, 5:00 PM",
      startsAt,
      timezone: "Asia/Singapore",
      title: "Date and time",
    }),
    section(1, eventId, "story", "story", 3, {
      paragraphs: [
        "What began as a shared table at a friend's dinner became weekend walks, family introductions, and a quiet certainty.",
        "We are grateful to celebrate this next chapter with the people who shaped our lives.",
      ],
      title: "Our story",
    }),
    section(1, eventId, "details", "details", 4, {
      items: [
        { hint: "The ceremony lawn opens at 4:30 PM.", label: "Ceremony", value: "5:00 PM" },
        {
          hint: "Dinner and speeches follow in the glasshouse.",
          label: "Reception",
          value: "6:30 PM",
        },
        { label: "Transport", value: "Ride-share drop-off at the Garden East entrance." },
      ],
      title: "Evening details",
    }),
    section(1, eventId, "dress_code", "dress-code", 5, {
      description: "Formal garden attire in soft neutrals, sage, blush, and warm metallics.",
      palette: [
        { color: "#d8c6a4", label: "Champagne" },
        { color: "#9caf88", label: "Sage" },
        { color: "#d7a6a1", label: "Blush" },
      ],
      title: "Dress code",
    }),
    section(1, eventId, "location", "location", 6, {
      address: "18 Marina Gardens Drive, Singapore 018953",
      mapUrl: "https://maps.google.com/?q=Gardens+by+the+Bay+Singapore",
      notes: "Use the Garden East entrance; hosts will guide guests from the lobby.",
      venueName: "Emerald Gardens",
    }),
    section(1, eventId, "gallery", "gallery", 7, {
      images: [
        {
          alt: "Wedding place setting with neutral florals",
          url: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1000&q=80",
        },
        {
          alt: "Garden walkway lit for an evening celebration",
          url: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1000&q=80",
        },
      ],
      title: "A glimpse of the evening",
    }),
    section(
      1,
      eventId,
      "rsvp",
      "rsvp",
      8,
      {
        description: "Confirm attendance, guest names, and the details that help us host you well.",
        questions: [
          { key: "dietary-notes", label: "Any dietary notes?", required: false, type: "textarea" },
          { key: "song-request", label: "One dance-floor song", required: false, type: "text" },
        ],
        submitLabel: "Send RSVP",
        title: "RSVP",
      },
      "guest_only",
    ),
    section(1, eventId, "outro", "thank-you", 9, {
      message: "Your presence means the world to us. We cannot wait to celebrate together.",
      title: "With love",
    }),
  ];
}

function birthdaySections(eventId: string, startsAt: string): DemoSection[] {
  return [
    section(2, eventId, "introduction", "welcome", 0, {
      body: "A sunroom afternoon of inventing, racing, lunch, and a very serious amount of cake.",
      coverImage: {
        alt: "Colorful birthday table prepared for children",
        caption: "The Sunroom at Park House",
        url: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1600&q=85",
      },
      eyebrow: "Birthday mission",
      subtitle: "Saturday, September 12, 2026 from noon",
      title: "Milo Turns Eight",
    }),
    section(2, eventId, "date", "date", 1, {
      countdownLabel: "Until mission eight",
      displayText: "Saturday, September 12, 2026, 12:00 PM",
      startsAt,
      timezone: "Asia/Singapore",
      title: "Party time",
    }),
    section(2, eventId, "details", "details", 2, {
      items: [
        { hint: "Aprons and goggles are provided.", label: "12:30 PM", value: "Science slime lab" },
        { label: "1:30 PM", value: "Lunch and birthday cake" },
        { label: "2:30 PM", value: "Garden relay and prizes" },
        { label: "Bring", value: "Socks for the indoor play room and a water bottle" },
      ],
      title: "The afternoon plan",
    }),
    section(2, eventId, "gallery", "gallery", 3, {
      images: [
        {
          alt: "Bright paper decorations above a birthday table",
          url: "https://images.unsplash.com/photo-1513159446162-54eb8bdaa79b?auto=format&fit=crop&w=1000&q=80",
        },
        {
          alt: "Birthday cake with colorful candles",
          url: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=1000&q=80",
        },
      ],
      title: "Sunroom energy",
    }),
    section(2, eventId, "location", "location", 4, {
      address: "3 Park Lane, Singapore 798387",
      mapUrl: "https://maps.google.com/?q=Seletar+Singapore",
      notes: "Parent parking is beside the east lawn. Drop-off is available at the blue gate.",
      venueName: "The Sunroom at Park House",
    }),
    section(
      2,
      eventId,
      "rsvp",
      "rsvp",
      5,
      {
        description: "A grown-up should confirm each child attending and share allergy notes.",
        questions: [
          {
            key: "allergies",
            label: "Food allergies or sensory needs",
            required: false,
            type: "textarea",
          },
          {
            key: "activity",
            label: "Most anticipated activity",
            options: ["Science slime lab", "Garden relay", "Cake"],
            required: false,
            type: "single_choice",
          },
        ],
        submitLabel: "Join the party",
        title: "Parent RSVP",
      },
      "guest_only",
    ),
    section(2, eventId, "outro", "thank-you", 6, {
      message: "No presents are needed. A drawing or a favorite joke for Milo is perfect.",
      title: "See you in the sunroom",
    }),
  ];
}

function launchSections(eventId: string, startsAt: string): DemoSection[] {
  return [
    section(3, eventId, "introduction", "welcome", 0, {
      body: "Follow the cyan route through a live prototype floor, spatial sound room, and midnight release signal.",
      coverImage: {
        alt: "Electric blue light installation in a dark studio",
        caption: "Studio 18 after dark",
        url: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1600&q=85",
      },
      eyebrow: "Private launch signal",
      subtitle: "Friday, October 2, 2026 — doors at 7:30 PM",
      title: "After Hours / Studio 18",
    }),
    section(3, eventId, "date", "date", 1, {
      countdownLabel: "Signal goes live in",
      displayText: "Friday, October 2, 2026, 7:30 PM",
      startsAt,
      timezone: "Asia/Singapore",
      title: "Transmission window",
    }),
    section(3, eventId, "details", "details", 2, {
      items: [
        { hint: "Badge collection and welcome frequency.", label: "19:30", value: "Signal desk" },
        { label: "20:15", value: "Studio 18 product reveal" },
        { label: "21:00", value: "Prototype floor and listening room" },
        { label: "22:30", value: "Founder transmission and late set" },
      ],
      title: "Route map",
    }),
    section(3, eventId, "story", "manifesto", 3, {
      paragraphs: [
        "Studio 18 is a release built in public: one instrument, three rooms, and a live system that changes with the crowd.",
        "This first signal is for collaborators, press, and the people who shaped the work before it had a name.",
      ],
      title: "Why after hours",
    }),
    section(3, eventId, "gallery", "gallery", 4, {
      images: [
        {
          alt: "Blue illuminated corridor in a night venue",
          url: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=1000&q=80",
        },
        {
          alt: "Live electronic performance under cyan light",
          url: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1000&q=80",
        },
      ],
      title: "Field tests",
    }),
    section(3, eventId, "location", "location", 5, {
      address: "18 Jalan Besar, Singapore 208835",
      mapUrl: "https://maps.google.com/?q=Jalan+Besar+Singapore",
      notes:
        "Enter through the unmarked steel door beside loading bay B. The cyan line starts inside.",
      venueName: "Studio 18",
    }),
    section(
      3,
      eventId,
      "rsvp",
      "rsvp",
      6,
      {
        description:
          "Transmit your arrival window and accessibility requirements to the signal desk.",
        questions: [
          {
            key: "arrival-window",
            label: "Arrival checkpoint",
            options: ["7:30 PM reveal", "9:00 PM prototype floor", "10:30 PM late set"],
            required: true,
            type: "single_choice",
          },
          { key: "accessibility", label: "Access requirements", required: false, type: "textarea" },
        ],
        submitLabel: "Transmit response",
        title: "Check in",
      },
      "guest_only",
    ),
    section(3, eventId, "outro", "sign-off", 7, {
      message: "The route ends at the signal wall. Leave a mark before you exit.",
      title: "Stay on frequency",
    }),
  ];
}

function section(
  eventNumber: number,
  eventId: string,
  sectionType: SectionType,
  sectionKey: string,
  sortOrder: number,
  contentJson: JsonObject,
  visibility: SectionVisibility = "public",
): DemoSection {
  return {
    contentJson,
    enabled: true,
    eventId,
    id: uuid(`d${eventNumber}4${String(sortOrder + 1).padStart(2, "0")}`),
    sectionKey,
    sectionType,
    settingsJson: { density: "balanced" },
    sortOrder,
    visibility,
  };
}

function demoGuest(
  eventNumber: number,
  guestNumber: number,
  input: Omit<DemoGuest, "id">,
): DemoGuest {
  return { ...input, id: uuid(`d${eventNumber}30${guestNumber}`) };
}

function demoResponse(
  eventNumber: number,
  responseNumber: number,
  input: Omit<DemoResponse, "id">,
): DemoResponse {
  return { ...input, id: uuid(`d${eventNumber}50${responseNumber}`) };
}

function catalogEntry(key: DemoEventKey): DemoEventCatalogEntry {
  const entry = demoEventCatalog.find((item) => item.key === key);

  if (!entry) {
    throw new Error(`Missing demo catalog entry: ${key}`);
  }

  return entry;
}

function demoEventNumber(key: DemoEventKey) {
  return key === "wedding" ? 1 : key === "kids-birthday" ? 2 : 3;
}

function representativeGuest(definition: DemoSeedDefinition) {
  return definition.guests.find((guest) => guest.status === "pending") ?? definition.guests[0]!;
}

function memberId(guestId: string, sortOrder: number) {
  const suffix = guestId.slice(-6);
  return uuid(`${suffix}${sortOrder + 1}`);
}

function hashInviteToken(token: string) {
  return createHmac("sha256", inviteTokenSecret).update(token).digest("hex");
}

function addMinutes(timestamp: string, minutes: number) {
  return new Date(Date.parse(timestamp) + minutes * 60_000).toISOString();
}

function uuid(suffix: string) {
  return `00000000-0000-4000-8000-${suffix.padStart(12, "0")}`;
}

function printSeedSummary({
  events: seededEvents,
  managerEmail,
  managerSupabaseUserId,
  syntheticManager,
}: {
  events: Array<{ eventId: string; guestToken: string; publicSlug: string; title: string }>;
  managerEmail: string;
  managerSupabaseUserId: string;
  syntheticManager: boolean;
}) {
  const publicBase = publicAppBaseUrl.replace(/\/+$/, "");
  const dashboardBase = dashboardAppBaseUrl.replace(/\/+$/, "");

  console.log("Seeded the standalone Lumiere demo catalog.");
  console.log("");

  for (const event of seededEvents) {
    console.log(event.title);
    console.log(`  Dashboard: ${dashboardBase}/events/${event.eventId}`);
    console.log(`  Public:    ${publicBase}/e/${event.publicSlug}`);
    console.log(`  Guest:     ${publicBase}/e/${event.publicSlug}/g/${event.guestToken}`);
    console.log("");
  }

  console.log(`Seed manager email:    ${managerEmail}`);
  console.log(`Seed Supabase user id: ${managerSupabaseUserId}`);

  if (syntheticManager) {
    console.log("");
    console.log("Public and guest demos are ready without a Supabase account.");
    console.log(
      "Optional dashboard access: rerun with SEED_MANAGER_EMAIL and SEED_SUPABASE_USER_ID for your Supabase account.",
    );
  }
}

function loadApiEnv() {
  for (const candidate of [
    resolve(process.cwd(), ".env"),
    resolve(process.cwd(), "apps/api/.env"),
    resolve(process.cwd(), "../../apps/api/.env"),
  ]) {
    if (existsSync(candidate)) {
      loadEnvFile(candidate);
      return;
    }
  }
}

function normalizeDatabaseUrl(value: string) {
  const trimmed = value.trim();

  try {
    const url = new URL(trimmed);
    const pathname = url.pathname.replace(/(%20)+$/g, "");

    if (pathname !== url.pathname) {
      url.pathname = pathname;
      console.warn("Seed warning: trimmed trailing whitespace from DATABASE_URL database name.");
      return url.toString();
    }
  } catch {
    return trimmed;
  }

  const normalized = trimmed.replace(/%20+$/g, "");
  if (normalized !== value) {
    console.warn("Seed warning: trimmed trailing whitespace from DATABASE_URL.");
  }
  return normalized;
}

function loadEnvFile(path: string) {
  const lines = readFileSync(path, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed
      .slice(separatorIndex + 1)
      .trim()
      .replace(/^['"]|['"]$/g, "");

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
