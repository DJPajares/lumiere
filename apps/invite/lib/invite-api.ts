import { createApiClient, type ApiClientFetch } from "@lumiere/api-client";

import { readInvitePublicEnv } from "./invite-env";

type InviteApiClientOptions = {
  baseUrl?: string;
  fetch?: ApiClientFetch;
};

export function createInviteApiClient(options: InviteApiClientOptions = {}) {
  const baseUrl = options.baseUrl ?? readInvitePublicEnv().apiBaseUrl;
  const defaultFetch = globalThis.fetch?.bind(globalThis);
  const fetchImplementation =
    options.fetch ??
    (defaultFetch
      ? (input, init) =>
          defaultFetch(input, {
            ...init,
            cache: "no-store",
          })
      : undefined);

  if (!fetchImplementation) {
    throw new Error("Invite API requests require a fetch implementation.");
  }

  return createApiClient({
    baseUrl,
    fetch: (input, init) =>
      fetchImplementation(input, {
        ...init,
        cache: "no-store",
      }),
  });
}
