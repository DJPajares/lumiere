import type { ApiEnv } from "@lumiere/config";
import type { Database } from "@lumiere/db";
import { and, eq, eventManagers, events, isNull, sql, users } from "@lumiere/db";
import type { ManagerRole } from "@lumiere/types";
import type { MiddlewareHandler } from "hono";
import { createHmac, timingSafeEqual, webcrypto } from "node:crypto";

import { ApiHttpError } from "./errors";
import type { ApiBindings } from "./request-context";

export type LocalUser = typeof users.$inferSelect;

export type SupabaseJwtPayload = {
  aud?: string | string[];
  email?: string;
  exp?: number;
  nbf?: number;
  sub?: string;
  user_metadata?: Record<string, unknown>;
  [key: string]: unknown;
};

type SupabaseJwtHeader = {
  alg?: string;
  kid?: string;
  typ?: string;
};

type SupabaseJwksKey = JsonWebKey & {
  alg?: string;
  kid?: string;
};

type SupabaseJwksResponse = {
  keys?: SupabaseJwksKey[];
};

export type AuthenticatedManager = {
  claims: SupabaseJwtPayload;
  email: string;
  displayName: string | null;
  supabaseUserId: string;
  user: LocalUser;
};

export type UpsertUserProfileInput = {
  displayName: string | null;
  email: string;
  supabaseUserId: string;
};

export type EventAccess = {
  eventId: string;
  role: ManagerRole;
  userId: string;
};

export type EventAccessLookup =
  | {
      eventFound: false;
    }
  | {
      access: EventAccess | null;
      eventFound: true;
    };

export type AuthStore = {
  findEventAccess(
    eventId: string,
    userId: string,
    options?: { includeDeleted?: boolean },
  ): Promise<EventAccessLookup>;
  upsertUserProfile(input: UpsertUserProfileInput): Promise<LocalUser>;
};

export const managerRoleRank = {
  viewer: 1,
  editor: 2,
  owner: 3,
} as const satisfies Record<ManagerRole, number>;

const jwksCache = new Map<string, { expiresAt: number; keys: SupabaseJwksKey[] }>();
const jwksCacheTtlMs = 10 * 60 * 1000;

export const createDrizzleAuthStore = (db: Database): AuthStore => ({
  async findEventAccess(eventId, userId, options = {}) {
    const [event] = await db
      .select({
        id: events.id,
        ownerUserId: events.ownerUserId,
      })
      .from(events)
      .where(
        options.includeDeleted
          ? eq(events.id, eventId)
          : and(eq(events.id, eventId), isNull(events.deletedAt)),
      )
      .limit(1);

    if (!event) {
      return { eventFound: false };
    }

    if (event.ownerUserId === userId) {
      return {
        eventFound: true,
        access: {
          eventId: event.id,
          role: "owner",
          userId,
        },
      };
    }

    const [manager] = await db
      .select({
        eventId: eventManagers.eventId,
        role: eventManagers.role,
        userId: eventManagers.userId,
      })
      .from(eventManagers)
      .where(and(eq(eventManagers.eventId, eventId), eq(eventManagers.userId, userId)))
      .limit(1);

    return {
      eventFound: true,
      access: manager ?? null,
    };
  },

  async upsertUserProfile(input) {
    const [user] = await db
      .insert(users)
      .values({
        displayName: input.displayName,
        email: input.email,
        supabaseUserId: input.supabaseUserId,
      })
      .onConflictDoUpdate({
        target: users.supabaseUserId,
        set: {
          displayName: input.displayName,
          email: input.email,
          updatedAt: sql`now()`,
        },
      })
      .returning();

    if (!user) {
      throw new ApiHttpError("INTERNAL_ERROR", "Unable to mirror authenticated user");
    }

    return user;
  },
});

export const resolveCurrentManager = async ({
  authStore,
  authorizationHeader,
  config,
  now = Date.now(),
}: {
  authStore: AuthStore;
  authorizationHeader: string | undefined;
  config: ApiEnv;
  now?: number;
}): Promise<AuthenticatedManager> => {
  const token = parseBearerToken(authorizationHeader);
  const claims = await verifySupabaseJwt(token, config, now);
  const supabaseUserId = readRequiredStringClaim(claims.sub, "Supabase token is missing subject");
  const email = resolveEmail(claims);
  const displayName = resolveDisplayName(claims);
  const user = await authStore.upsertUserProfile({
    displayName,
    email,
    supabaseUserId,
  });

  return {
    claims,
    displayName,
    email,
    supabaseUserId,
    user,
  };
};

export const requireManagerAuth = ({
  authStore,
  config,
}: {
  authStore: AuthStore | undefined;
  config: ApiEnv;
}): MiddlewareHandler<ApiBindings> => {
  return async (context, next) => {
    if (!authStore) {
      throw new ApiHttpError("INTERNAL_ERROR", "Auth store is not configured");
    }

    const manager = await resolveCurrentManager({
      authStore,
      authorizationHeader: context.req.header("authorization"),
      config,
    });

    context.set("manager", manager);

    await next();
  };
};

export const assertEventAccess = async ({
  authStore,
  eventId,
  includeDeleted = false,
  manager,
  minimumRole = "viewer",
}: {
  authStore: AuthStore;
  eventId: string;
  includeDeleted?: boolean;
  manager: AuthenticatedManager;
  minimumRole?: ManagerRole;
}) => {
  const lookup = includeDeleted
    ? await authStore.findEventAccess(eventId, manager.user.id, { includeDeleted: true })
    : await authStore.findEventAccess(eventId, manager.user.id);

  if (!lookup.eventFound) {
    throw new ApiHttpError("NOT_FOUND", "Event not found");
  }

  if (!lookup.access || managerRoleRank[lookup.access.role] < managerRoleRank[minimumRole]) {
    throw new ApiHttpError("FORBIDDEN", "Manager does not have access to this event");
  }

  return lookup.access;
};

export const parseBearerToken = (authorizationHeader: string | undefined) => {
  const match = authorizationHeader?.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1]?.trim();

  if (!token) {
    throw new ApiHttpError("UNAUTHORIZED", "Missing bearer token");
  }

  return token;
};

export const verifySupabaseJwt = (
  token: string,
  config: Pick<ApiEnv, "SUPABASE_JWT_SECRET" | "SUPABASE_URL" | "SUPABASE_JWKS">,
  now = Date.now(),
): Promise<SupabaseJwtPayload> => {
  return verifySupabaseJwtWithConfig(token, config, now);
};

const verifySupabaseJwtWithConfig = async (
  token: string,
  config: Pick<ApiEnv, "SUPABASE_JWT_SECRET" | "SUPABASE_URL" | "SUPABASE_JWKS">,
  now: number,
): Promise<SupabaseJwtPayload> => {
  const tokenParts = token.split(".");

  if (tokenParts.length !== 3) {
    throw new ApiHttpError("UNAUTHORIZED", "Invalid bearer token");
  }

  const [encodedHeader, encodedPayload, encodedSignature] = tokenParts;

  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    throw new ApiHttpError("UNAUTHORIZED", "Invalid bearer token");
  }

  const header = decodeBase64UrlJson<SupabaseJwtHeader>(encodedHeader);
  const signedContent = `${encodedHeader}.${encodedPayload}`;

  if (header.alg === "HS256") {
    verifyLegacyJwtSignature({
      encodedSignature,
      jwtSecret: config.SUPABASE_JWT_SECRET,
      signedContent,
    });
  } else if (header.alg === "ES256") {
    await verifyJwksJwtSignature({
      encodedSignature,
      header,
      signedContent,
      serializedJwks: config.SUPABASE_JWKS,
      supabaseUrl: config.SUPABASE_URL,
    });
  } else {
    throw new ApiHttpError("UNAUTHORIZED", "Invalid bearer token");
  }

  const claims = decodeBase64UrlJson<SupabaseJwtPayload>(encodedPayload);
  const nowSeconds = Math.floor(now / 1000);

  if (typeof claims.exp === "number" && nowSeconds >= claims.exp) {
    throw new ApiHttpError("UNAUTHORIZED", "Bearer token has expired");
  }

  if (typeof claims.nbf === "number" && nowSeconds < claims.nbf) {
    throw new ApiHttpError("UNAUTHORIZED", "Bearer token is not active");
  }

  return claims;
};

const verifyLegacyJwtSignature = ({
  encodedSignature,
  jwtSecret,
  signedContent,
}: {
  encodedSignature: string;
  jwtSecret: string;
  signedContent: string;
}) => {
  const expectedSignature = createHmac("sha256", jwtSecret)
    .update(signedContent)
    .digest("base64url");

  if (!safeEqualBase64Url(encodedSignature, expectedSignature)) {
    throw new ApiHttpError("UNAUTHORIZED", "Invalid bearer token");
  }
};

const verifyJwksJwtSignature = async ({
  encodedSignature,
  header,
  signedContent,
  serializedJwks,
  supabaseUrl,
}: {
  encodedSignature: string;
  header: SupabaseJwtHeader;
  signedContent: string;
  serializedJwks: string | undefined;
  supabaseUrl: string;
}) => {
  if (!header.kid) {
    throw new ApiHttpError("UNAUTHORIZED", "Invalid bearer token");
  }

  const jwks = serializedJwks
    ? parseSupabaseJwks(serializedJwks)
    : await getSupabaseJwks(supabaseUrl);
  const jwk = jwks.find((key) => key.kid === header.kid);

  if (!jwk) {
    throw new ApiHttpError("UNAUTHORIZED", "Invalid bearer token");
  }

  const key = await webcrypto.subtle.importKey(
    "jwk",
    jwk,
    {
      name: "ECDSA",
      namedCurve: "P-256",
    },
    false,
    ["verify"],
  );
  const verified = await webcrypto.subtle.verify(
    {
      name: "ECDSA",
      hash: "SHA-256",
    },
    key,
    Buffer.from(encodedSignature, "base64url"),
    Buffer.from(signedContent),
  );

  if (!verified) {
    throw new ApiHttpError("UNAUTHORIZED", "Invalid bearer token");
  }
};

const parseSupabaseJwks = (serializedJwks: string): SupabaseJwksKey[] => {
  try {
    const body = JSON.parse(serializedJwks) as SupabaseJwksResponse;

    if (!Array.isArray(body.keys)) {
      throw new Error("The JWKS value must contain a keys array");
    }

    return body.keys;
  } catch {
    throw new ApiHttpError("INTERNAL_ERROR", "Invalid SUPABASE_JWKS configuration");
  }
};

const decodeBase64UrlJson = <TValue>(value: string): TValue => {
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as TValue;
  } catch {
    throw new ApiHttpError("UNAUTHORIZED", "Invalid bearer token");
  }
};

const safeEqualBase64Url = (actual: string, expected: string) => {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);

  return (
    actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer)
  );
};

const getSupabaseJwks = async (supabaseUrl: string) => {
  const cacheKey = supabaseUrl.replace(/\/+$/, "");
  const cached = jwksCache.get(cacheKey);
  const now = Date.now();

  if (cached && cached.expiresAt > now) {
    return cached.keys;
  }

  const response = await fetch(`${cacheKey}/auth/v1/.well-known/jwks.json`);

  if (!response.ok) {
    throw new ApiHttpError("UNAUTHORIZED", "Invalid bearer token");
  }

  const body = (await response.json()) as SupabaseJwksResponse;
  const keys = Array.isArray(body.keys) ? body.keys : [];

  jwksCache.set(cacheKey, {
    expiresAt: now + jwksCacheTtlMs,
    keys,
  });

  return keys;
};

const readRequiredStringClaim = (value: unknown, message: string) => {
  if (typeof value !== "string" || value.trim() === "") {
    throw new ApiHttpError("UNAUTHORIZED", message);
  }

  return value.trim();
};

const resolveEmail = (claims: SupabaseJwtPayload) => {
  const metadataEmail = claims.user_metadata?.email;

  if (typeof claims.email === "string" && claims.email.trim() !== "") {
    return claims.email.trim().toLowerCase();
  }

  if (typeof metadataEmail === "string" && metadataEmail.trim() !== "") {
    return metadataEmail.trim().toLowerCase();
  }

  throw new ApiHttpError("UNAUTHORIZED", "Supabase token is missing manager email");
};

const resolveDisplayName = (claims: SupabaseJwtPayload) => {
  const metadata = claims.user_metadata ?? {};

  for (const key of ["name", "full_name", "display_name"]) {
    const value = metadata[key];

    if (typeof value === "string" && value.trim() !== "") {
      return value.trim();
    }
  }

  return null;
};
