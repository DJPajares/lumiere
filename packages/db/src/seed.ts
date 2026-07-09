import { createHmac } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { and, eq, or } from "drizzle-orm";

import { createDatabase, createPostgresClient } from "./client";
import {
  activityEvents,
  eventManagers,
  events,
  eventSections,
  guestGroups,
  notifications,
  rsvpResponses,
  themeRegistrySnapshots,
  users,
} from "./schema";

type JsonObject = Record<string, unknown>;

loadApiEnv();

const databaseUrl = normalizeDatabaseUrl(
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/lumiere",
);
const publicAppBaseUrl = process.env.PUBLIC_APP_BASE_URL ?? "http://localhost:3000";
const dashboardAppBaseUrl = process.env.DASHBOARD_APP_BASE_URL ?? "http://localhost:3001";
const inviteTokenSecret =
  process.env.INVITE_TOKEN_SECRET ?? "local-dev-invite-token-secret-change-me";

const seedEventId = "00000000-0000-4000-8000-00000000d001";
const seedManagerId = "00000000-0000-4000-8000-00000000d101";
const seedEventSlug = process.env.SEED_EVENT_SLUG ?? "lumiere-demo";
const seedManagerEmail = (process.env.SEED_MANAGER_EMAIL ?? "manager@example.com").toLowerCase();
const fallbackSupabaseUserId = "00000000-0000-4000-8000-00000000d201";

const eventStartsAt = "2026-08-23T09:00:00.000Z";
const eventEndsAt = "2026-08-23T15:30:00.000Z";
const seededAt = "2026-07-09T00:00:00.000Z";

const guestInviteTokens = {
  lee: "lumiere-demo-lee-family-rsvp-token",
  morgan: "lumiere-demo-morgan-family-rsvp-token",
  rivera: "lumiere-demo-rivera-family-rsvp-token",
  tan: "lumiere-demo-tan-family-rsvp-token",
} as const;

const guestGroupIds = {
  lee: "00000000-0000-4000-8000-00000000d303",
  morgan: "00000000-0000-4000-8000-00000000d304",
  rivera: "00000000-0000-4000-8000-00000000d302",
  tan: "00000000-0000-4000-8000-00000000d301",
} as const;

async function main() {
  const client = createPostgresClient(databaseUrl, { max: 1 });
  const db = createDatabase(client);

  try {
    const result = await db.transaction(async (tx) => {
      const [existingManager] = process.env.SEED_SUPABASE_USER_ID
        ? []
        : await tx.select().from(users).where(eq(users.email, seedManagerEmail)).limit(1);
      const managerSupabaseUserId =
        process.env.SEED_SUPABASE_USER_ID ??
        existingManager?.supabaseUserId ??
        fallbackSupabaseUserId;
      const managerId = existingManager?.id ?? seedManagerId;

      const [manager] = await tx
        .insert(users)
        .values({
          displayName: "Demo Manager",
          email: seedManagerEmail,
          id: managerId,
          supabaseUserId: managerSupabaseUserId,
        })
        .onConflictDoUpdate({
          target: users.supabaseUserId,
          set: {
            displayName: "Demo Manager",
            email: seedManagerEmail,
          },
        })
        .returning();

      if (!manager) {
        throw new Error("Unable to seed demo manager");
      }

      await tx
        .delete(events)
        .where(or(eq(events.id, seedEventId), eq(events.publicSlug, seedEventSlug)));

      const [event] = await tx
        .insert(events)
        .values({
          endsAt: eventEndsAt,
          eventType: "wedding",
          id: seedEventId,
          ownerUserId: manager.id,
          publicSettingsJson: {
            shareTitle: "Amara & Theo",
          },
          rsvpSettingsJson: {
            allowMaybe: true,
            allowUpdates: true,
            enabled: true,
          },
          selectedThemeId: "premium",
          publicSlug: seedEventSlug,
          startsAt: eventStartsAt,
          status: "published",
          themeConfigJson: {
            accentName: "Candlelit gold",
            welcomeTone: "formal",
          },
          themeMode: "toggleable",
          timezone: "Asia/Singapore",
          title: "Amara & Theo",
          venueAddress: "18 Marina Gardens Drive, Singapore 018953",
          venueName: "Emerald Gardens",
        })
        .returning();

      if (!event) {
        throw new Error("Unable to seed demo event");
      }

      await tx.insert(eventManagers).values({
        eventId: event.id,
        role: "owner",
        userId: manager.id,
      });

      await tx.insert(eventSections).values(buildSections(event.id));
      await tx.insert(themeRegistrySnapshots).values({
        eventId: event.id,
        metadataJson: {
          label: "Premium",
          seeded: true,
        },
        themeId: "premium",
        version: "0.0.0",
      });

      await tx.insert(guestGroups).values(buildGuestGroups(event.id));
      await tx.insert(rsvpResponses).values(buildRsvpResponses(event.id));
      await tx.insert(activityEvents).values(buildActivity(event.id, manager.id));
      await tx.insert(notifications).values(buildNotifications(event.id, manager.id));

      return {
        eventId: event.id,
        managerSupabaseUserId,
        usedExistingManager: Boolean(existingManager),
      };
    });

    printSeedSummary(result);
  } finally {
    await client.end();
  }
}

function buildSections(eventId: string) {
  return [
    section(eventId, "00000000-0000-4000-8000-00000000d401", "introduction", "welcome", 0, {
      body: "Join us for an intimate evening of vows, dinner, music, and candlelight.",
      coverImage: {
        alt: "Warm garden tables prepared for an evening wedding",
        caption: "Emerald Gardens, Singapore",
        url: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80",
      },
      eyebrow: "Wedding invitation",
      subtitle: "Sunday, August 23, 2026 at Emerald Gardens",
      title: "Amara & Theo",
    }),
    section(eventId, "00000000-0000-4000-8000-00000000d402", "profile", "hosts", 1, {
      people: [
        {
          bio: "Keeper of playlists, handwritten notes, and late-night dessert plans.",
          name: "Amara",
          role: "Bride",
        },
        {
          bio: "Believes good coffee and good company can fix almost anything.",
          name: "Theo",
          role: "Groom",
        },
      ],
      title: "The couple",
    }),
    section(eventId, "00000000-0000-4000-8000-00000000d403", "date", "date", 2, {
      countdownLabel: "Until we gather",
      displayText: "Sunday, August 23, 2026, 5:00 PM",
      startsAt: eventStartsAt,
      timezone: "Asia/Singapore",
      title: "Date and time",
    }),
    section(eventId, "00000000-0000-4000-8000-00000000d404", "story", "story", 3, {
      paragraphs: [
        "What began as a shared table at a friend's dinner became weekend walks, family introductions, and a quiet certainty.",
        "We are grateful to celebrate this next chapter with the people who have shaped our lives.",
      ],
      title: "Our story",
    }),
    section(eventId, "00000000-0000-4000-8000-00000000d405", "details", "details", 4, {
      items: [
        {
          hint: "The ceremony lawn opens at 4:30 PM.",
          label: "Ceremony",
          value: "5:00 PM",
        },
        {
          hint: "Dinner and speeches follow in the glasshouse.",
          label: "Reception",
          value: "6:30 PM",
        },
        {
          label: "Transport",
          value: "Ride-share drop-off is available at the Garden East entrance.",
        },
        {
          label: "Children",
          value: "Little ones are welcome. Please include them in your RSVP count.",
        },
      ],
      title: "Evening details",
    }),
    section(eventId, "00000000-0000-4000-8000-00000000d406", "dress_code", "dress-code", 5, {
      description:
        "Formal garden attire. Soft neutrals, sage, blush, and warm metallics are welcome.",
      palette: [
        { color: "#d8c6a4", label: "Champagne" },
        { color: "#9caf88", label: "Sage" },
        { color: "#d7a6a1", label: "Blush" },
      ],
      title: "Dress code",
    }),
    section(eventId, "00000000-0000-4000-8000-00000000d407", "location", "location", 6, {
      address: "18 Marina Gardens Drive, Singapore 018953",
      mapUrl: "https://maps.google.com/?q=Gardens+by+the+Bay+Singapore",
      notes: "Please use the Garden East entrance. Hosts will guide guests from the lobby.",
      venueName: "Emerald Gardens",
    }),
    section(eventId, "00000000-0000-4000-8000-00000000d408", "gallery", "gallery", 7, {
      images: [
        {
          alt: "Editorial wedding place setting with neutral florals",
          url: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=900&q=80",
        },
        {
          alt: "Garden walkway lit for an evening celebration",
          url: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=900&q=80",
        },
      ],
      title: "A glimpse of the evening",
    }),
    section(
      eventId,
      "00000000-0000-4000-8000-00000000d409",
      "rsvp",
      "rsvp",
      8,
      {
        description: "Use your private guest link to confirm attendance and guest count.",
        questions: [
          {
            key: "dietary-notes",
            label: "Any dietary notes we should know?",
            required: false,
            type: "textarea",
          },
          {
            key: "song-request",
            label: "One song that gets you on the dance floor",
            required: false,
            type: "text",
          },
        ],
        submitLabel: "Send RSVP",
        title: "RSVP",
      },
      "guest_only",
    ),
    section(eventId, "00000000-0000-4000-8000-00000000d410", "outro", "thank-you", 9, {
      message: "Your presence means the world to us. We cannot wait to celebrate together.",
      title: "With love",
    }),
  ];
}

function section(
  eventId: string,
  id: string,
  sectionType: (typeof eventSections.$inferInsert)["sectionType"],
  sectionKey: string,
  sortOrder: number,
  contentJson: JsonObject,
  visibility: (typeof eventSections.$inferInsert)["visibility"] = "public",
) {
  return {
    contentJson,
    enabled: true,
    eventId,
    id,
    sectionKey,
    sectionType,
    settingsJson: {
      density: "balanced",
    },
    sortOrder,
    visibility,
  };
}

function buildGuestGroups(eventId: string) {
  return [
    {
      contactEmail: "mina.tan@example.com",
      contactName: "Mina Tan",
      eventId,
      id: guestGroupIds.tan,
      inviteCode: "DEMO-TAN",
      inviteTokenHash: hashInviteToken(guestInviteTokens.tan),
      label: "Tan Family",
      lastOpenedAt: "2026-07-09T01:00:00.000Z",
      maxPax: 4,
      notes: "Close family table.",
      status: "responded" as const,
    },
    {
      contactEmail: "ana.rivera@example.com",
      contactName: "Ana Rivera",
      eventId,
      id: guestGroupIds.rivera,
      inviteCode: "DEMO-RIVERA",
      inviteTokenHash: hashInviteToken(guestInviteTokens.rivera),
      label: "Rivera Party",
      maxPax: 2,
      notes: "Pending RSVP.",
      status: "pending" as const,
    },
    {
      contactEmail: "jon.lee@example.com",
      contactName: "Jon Lee",
      eventId,
      id: guestGroupIds.lee,
      inviteCode: "DEMO-LEE",
      inviteTokenHash: hashInviteToken(guestInviteTokens.lee),
      label: "Lee Family",
      lastOpenedAt: "2026-07-09T02:00:00.000Z",
      maxPax: 3,
      notes: "Sent regrets.",
      status: "declined" as const,
    },
    {
      contactEmail: "sam.morgan@example.com",
      contactName: "Sam Morgan",
      eventId,
      id: guestGroupIds.morgan,
      inviteCode: "DEMO-MORGAN",
      inviteTokenHash: hashInviteToken(guestInviteTokens.morgan),
      label: "Morgan Table",
      maxPax: 2,
      notes: "Disabled sample group.",
      status: "disabled" as const,
    },
  ];
}

function buildRsvpResponses(eventId: string) {
  return [
    {
      answersJson: [
        {
          questionKey: "dietary-notes",
          value: "One vegetarian meal, please.",
        },
        {
          questionKey: "song-request",
          value: "September by Earth, Wind & Fire",
        },
      ],
      attendeeCount: 3,
      eventId,
      guestGroupId: guestGroupIds.tan,
      guestNamesJson: ["Mina Tan", "Alex Tan", "Jamie Tan"],
      id: "00000000-0000-4000-8000-00000000d501",
      message: "So excited to celebrate with you.",
      responseStatus: "attending" as const,
      submittedAt: "2026-07-09T01:05:00.000Z",
    },
    {
      answersJson: [],
      attendeeCount: 0,
      eventId,
      guestGroupId: guestGroupIds.lee,
      guestNamesJson: [],
      id: "00000000-0000-4000-8000-00000000d502",
      message: "Sending love from abroad.",
      responseStatus: "not_attending" as const,
      submittedAt: "2026-07-09T02:05:00.000Z",
    },
  ];
}

function buildActivity(eventId: string, managerId: string) {
  return [
    {
      actorId: managerId,
      actorType: "manager" as const,
      activityType: "event_created" as const,
      createdAt: seededAt,
      eventId,
      id: "00000000-0000-4000-8000-00000000d601",
      metadataJson: {
        title: "Amara & Theo",
      },
    },
    {
      actorId: managerId,
      actorType: "manager" as const,
      activityType: "theme_updated" as const,
      createdAt: "2026-07-09T00:10:00.000Z",
      eventId,
      id: "00000000-0000-4000-8000-00000000d602",
      metadataJson: {
        selectedThemeId: "premium",
        themeMode: "toggleable",
      },
    },
    {
      actorId: guestGroupIds.tan,
      actorType: "guest" as const,
      activityType: "guest_invite_opened" as const,
      createdAt: "2026-07-09T01:00:00.000Z",
      eventId,
      id: "00000000-0000-4000-8000-00000000d603",
      metadataJson: {
        guestGroupId: guestGroupIds.tan,
        guestGroupLabel: "Tan Family",
      },
    },
    {
      actorId: guestGroupIds.tan,
      actorType: "guest" as const,
      activityType: "rsvp_submitted" as const,
      createdAt: "2026-07-09T01:05:00.000Z",
      eventId,
      id: "00000000-0000-4000-8000-00000000d604",
      metadataJson: {
        attendeeCount: 3,
        guestGroupId: guestGroupIds.tan,
        guestGroupLabel: "Tan Family",
        responseStatus: "attending",
      },
    },
    {
      actorId: guestGroupIds.lee,
      actorType: "guest" as const,
      activityType: "rsvp_submitted" as const,
      createdAt: "2026-07-09T02:05:00.000Z",
      eventId,
      id: "00000000-0000-4000-8000-00000000d605",
      metadataJson: {
        attendeeCount: 0,
        guestGroupId: guestGroupIds.lee,
        guestGroupLabel: "Lee Family",
        responseStatus: "not_attending",
      },
    },
  ];
}

function buildNotifications(eventId: string, managerId: string) {
  return [
    {
      createdAt: "2026-07-09T01:05:00.000Z",
      eventId,
      id: "00000000-0000-4000-8000-00000000d701",
      message: "Tan Family submitted an RSVP for Amara & Theo.",
      metadataJson: {
        attendeeCount: 3,
        guestGroupId: guestGroupIds.tan,
        guestGroupLabel: "Tan Family",
        responseStatus: "attending",
      },
      notificationType: "rsvp_submitted" as const,
      title: "RSVP submitted",
      userId: managerId,
    },
    {
      createdAt: "2026-07-09T02:05:00.000Z",
      eventId,
      id: "00000000-0000-4000-8000-00000000d702",
      message: "Lee Family cannot attend Amara & Theo.",
      metadataJson: {
        attendeeCount: 0,
        guestGroupId: guestGroupIds.lee,
        guestGroupLabel: "Lee Family",
        responseStatus: "not_attending",
      },
      notificationType: "rsvp_submitted" as const,
      title: "RSVP submitted",
      userId: managerId,
    },
  ];
}

function hashInviteToken(token: string) {
  return createHmac("sha256", inviteTokenSecret).update(token).digest("hex");
}

function inviteUrl(token: string) {
  return `${publicAppBaseUrl.replace(/\/+$/, "")}/e/${seedEventSlug}/g/${token}`;
}

function printSeedSummary({
  eventId,
  managerSupabaseUserId,
  usedExistingManager,
}: {
  eventId: string;
  managerSupabaseUserId: string;
  usedExistingManager: boolean;
}) {
  const publicUrl = `${publicAppBaseUrl.replace(/\/+$/, "")}/e/${seedEventSlug}`;
  const dashboardUrl = `${dashboardAppBaseUrl.replace(/\/+$/, "")}/events/${eventId}`;

  console.log("Seeded Lumiere demo data.");
  console.log("");
  console.log(`Dashboard event: ${dashboardUrl}`);
  console.log(`Public invite:    ${publicUrl}`);
  console.log(`Guest invite:     ${inviteUrl(guestInviteTokens.rivera)}`);
  console.log("");
  console.log(`Manager email:       ${seedManagerEmail}`);
  console.log(`Supabase user id:    ${managerSupabaseUserId}`);
  console.log(`Used existing user:  ${usedExistingManager ? "yes" : "no"}`);

  if (!process.env.SEED_SUPABASE_USER_ID && managerSupabaseUserId === fallbackSupabaseUserId) {
    console.log("");
    console.log(
      "Dashboard note: set SEED_SUPABASE_USER_ID to your Supabase auth user id, or sign in once and rerun with SEED_MANAGER_EMAIL matching your account.",
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

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
