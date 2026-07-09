import { z } from "zod";

export const idSchema = z.string().trim().min(1);

export const slugSchema = z
  .string()
  .trim()
  .min(3)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens");

export const reservedPublicSlugs = [
  "admin",
  "api",
  "app",
  "assets",
  "auth",
  "dashboard",
  "e",
  "event",
  "events",
  "g",
  "guest",
  "guests",
  "health",
  "invite",
  "invites",
  "login",
  "logout",
  "manage",
  "public",
  "rsvp",
  "settings",
  "static",
  "themes",
] as const;

export const publicSlugSchema = slugSchema.refine(
  (slug) => !(reservedPublicSlugs as readonly string[]).includes(slug),
  "This event slug is reserved",
);

export const timezoneSchema = z.string().trim().min(1).max(80);

export const isoDateTimeSchema = z.string().datetime({ offset: true });

export const nonEmptyStringSchema = z.string().trim().min(1);

export const optionalTextSchema = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .transform((value) => (value === "" ? undefined : value));

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    jsonObjectSchema,
  ]),
);

export const jsonObjectSchema: z.ZodType<Record<string, JsonValue>> = z.record(
  z.string(),
  jsonValueSchema,
);

export const metadataSchema = jsonObjectSchema.default({});
