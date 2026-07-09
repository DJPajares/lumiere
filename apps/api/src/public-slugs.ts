import { publicSlugSchema } from "@lumiere/types";
import { randomBytes } from "node:crypto";

export type PublicSlugAvailability = (slug: string) => boolean | Promise<boolean>;

export type PublicSlugSuggestionOptions = {
  createSuffix?: () => string;
  isAvailable: PublicSlugAvailability;
  maxAttempts?: number;
  title: string;
};

export const publicSlugPolicyNotes = {
  privacy:
    "Event slugs are stable public identifiers for readable URLs. They are not secrets or access tokens.",
  privateUrls:
    "If unlisted event URLs need stronger privacy later, add an optional random public key or unguessable slug mode while keeping normal readable slugs for standard public events.",
  tokens:
    "Guest-specific RSVP access must continue to use high-entropy random tokens and store only protected token hashes.",
} as const;

export async function suggestPublicSlug({
  createSuffix = createRandomSlugSuffix,
  isAvailable,
  maxAttempts = 8,
  title,
}: PublicSlugSuggestionOptions) {
  const baseSlug = toPublicSlugBase(title);

  if (await isUsablePublicSlug(baseSlug, isAvailable)) {
    return baseSlug;
  }

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidate = withSuffix(baseSlug, createSuffix());

    if (await isUsablePublicSlug(candidate, isAvailable)) {
      return candidate;
    }
  }

  throw new Error("Unable to suggest an available public event slug");
}

export function toPublicSlugBase(title: string) {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return slug.length >= 3 ? trimSlug(slug, 80) : "event";
}

function withSuffix(baseSlug: string, suffix: string) {
  const normalizedSuffix = suffix
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 8);
  const safeSuffix = normalizedSuffix || createRandomSlugSuffix();
  const maxBaseLength = 80 - safeSuffix.length - 1;
  const base = trimSlug(baseSlug, maxBaseLength);

  return `${base}-${safeSuffix}`;
}

function trimSlug(slug: string, maxLength: number) {
  return slug.slice(0, maxLength).replace(/-+$/g, "") || "event";
}

function createRandomSlugSuffix() {
  return randomBytes(3).toString("hex");
}

async function isUsablePublicSlug(slug: string, isAvailable: PublicSlugAvailability) {
  return publicSlugSchema.safeParse(slug).success && (await isAvailable(slug));
}
