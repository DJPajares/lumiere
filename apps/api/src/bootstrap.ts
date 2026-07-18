import { envIssuesToMessage, loadApiEnv } from "@lumiere/config";
import { createDatabase, createPostgresClient } from "@lumiere/db";

import { createDrizzleAuthStore } from "./auth";
import { createDrizzleCollaboratorStore } from "./collaborators";
import { createApp } from "./app";
import { createDrizzleDashboardDataStore } from "./dashboard-data";
import { createDrizzleEventStore } from "./events";
import { createDrizzleGuestDataExportStore } from "./guest-exports";
import { createDrizzleGuestGroupStore } from "./guest-groups";
import { createDrizzlePublicInviteStore } from "./public-invites";
import { createDrizzleRsvpStore } from "./rsvps";
import { createDrizzleThemeSectionStore } from "./theme-sections";

export function loadApiConfig() {
  try {
    return loadApiEnv();
  } catch (error) {
    throw new Error(`Invalid API environment: ${envIssuesToMessage(error)}`);
  }
}

export function createApiApplication(config = loadApiConfig()) {
  const client = createPostgresClient(config.DATABASE_URL, { prepare: false });
  const db = createDatabase(client);
  const authStore = createDrizzleAuthStore(db);
  const collaboratorStore = createDrizzleCollaboratorStore(db);
  const dashboardDataStore = createDrizzleDashboardDataStore(db);
  const eventStore = createDrizzleEventStore(db);
  const guestDataExportStore = createDrizzleGuestDataExportStore(db);
  const guestGroupStore = createDrizzleGuestGroupStore(db);
  const publicInviteStore = createDrizzlePublicInviteStore(db);
  const rsvpStore = createDrizzleRsvpStore(db);
  const themeSectionStore = createDrizzleThemeSectionStore(db);

  return createApp({
    authStore,
    collaboratorStore,
    config,
    dashboardDataStore,
    eventStore,
    guestDataExportStore,
    guestGroupStore,
    publicInviteStore,
    rsvpStore,
    themeSectionStore,
  });
}
