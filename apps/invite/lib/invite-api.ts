import { createApiClient, type ApiClientFetch } from "@lumiere/api-client";

import { readInvitePublicEnv } from "./invite-env";

type InviteApiClientOptions = {
  baseUrl?: string;
  fetch?: ApiClientFetch;
};

export function createInviteApiClient(options: InviteApiClientOptions = {}) {
  const baseUrl = options.baseUrl ?? readInvitePublicEnv().apiBaseUrl;
  const fetchImplementation = options.fetch ?? globalThis.fetch?.bind(globalThis);

  if (!fetchImplementation) {
    throw new Error("Invite API requests require a fetch implementation.");
  }

  return createApiClient({
    baseUrl,
    fetch: fetchImplementation,
  });
}
