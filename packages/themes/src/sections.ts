import { sectionTypeSchema, type SectionType } from "@lumiere/types";
import { z } from "zod";

const nonEmptyString = z.string().trim().min(1);
const optionalText = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .transform((value) => (value === "" ? undefined : value));

const publicUrlSchema = z
  .string()
  .trim()
  .url()
  .refine(
    (value) => {
      try {
        return ["http:", "https:"].includes(new URL(value).protocol);
      } catch {
        return false;
      }
    },
    {
      message: "Use HTTP or HTTPS URLs",
    },
  );

const secureMapUrlSchema = publicUrlSchema.refine((value) => new URL(value).protocol === "https:", {
  message: "Map URLs must use HTTPS",
});

const mapEmbedUrlSchema = secureMapUrlSchema.refine(isAllowedMapEmbedUrl, {
  message: "Use an approved OpenStreetMap embed URL",
});

const mapDirectionsUrlSchema = secureMapUrlSchema.refine(isAllowedMapDirectionsUrl, {
  message: "Use an approved Google Maps, Apple Maps, or OpenStreetMap directions URL",
});

const mapPlaceIdSchema = z
  .string()
  .trim()
  .min(3)
  .max(255)
  .regex(/^[A-Za-z0-9_-]+$/, "Use a valid provider place identifier");

const optionalMapEmbedUrlSchema = z.preprocess(
  (value) => (value === "" ? undefined : value),
  mapEmbedUrlSchema.optional(),
);
const optionalMapDirectionsUrlSchema = z.preprocess(
  (value) => (value === "" ? undefined : value),
  mapDirectionsUrlSchema.optional(),
);
const optionalMapPlaceIdSchema = z.preprocess(
  (value) => (value === "" ? undefined : value),
  mapPlaceIdSchema.optional(),
);

const assetSchema = z.object({
  url: publicUrlSchema,
  alt: z.string().trim().min(1).max(180),
  caption: z.string().trim().max(240).optional(),
});

const commonSettingsSchema = z.object({
  anchorId: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  variant: z.string().trim().max(80).optional(),
  density: z.enum(["compact", "balanced", "spacious"]).default("balanced"),
});

const commonContentSchema = z.object({
  eyebrow: z.string().trim().max(80).optional(),
});

export const introductionContentSchema = commonContentSchema.extend({
  title: nonEmptyString.max(160),
  subtitle: z.string().trim().max(240).optional(),
  body: optionalText,
  coverImage: assetSchema.optional(),
});

export const profileContentSchema = commonContentSchema.extend({
  title: nonEmptyString.max(160),
  people: z
    .array(
      z.object({
        name: nonEmptyString.max(120),
        role: z.string().trim().max(120).optional(),
        bio: z.string().trim().max(800).optional(),
        image: assetSchema.optional(),
      }),
    )
    .min(1)
    .max(8),
});

export const dateContentSchema = commonContentSchema.extend({
  title: z.string().trim().max(120).optional(),
  startsAt: z.string().datetime({ offset: true }),
  endsAt: z.string().datetime({ offset: true }).optional(),
  timezone: nonEmptyString.max(80),
  displayText: z.string().trim().max(180).optional(),
  countdownLabel: z.string().trim().max(80).optional(),
});

export const storyParagraphTitleMaxLength = 120;
export const storyParagraphBodyMaxLength = 1200;

export const storyParagraphSchema = z.preprocess(
  (value) => (typeof value === "string" ? { body: value } : value),
  z
    .object({
      title: z.string().trim().max(storyParagraphTitleMaxLength).optional(),
      body: nonEmptyString.max(storyParagraphBodyMaxLength),
    })
    .transform(({ title, body }): StoryParagraph => (title ? { title, body } : { body })),
);

export type StoryParagraph = {
  title?: string;
  body: string;
};

export function normalizeStoryParagraphs(value: unknown): StoryParagraph[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((paragraph) => {
    if (typeof paragraph === "string") {
      return { body: paragraph };
    }

    if (typeof paragraph !== "object" || paragraph === null || Array.isArray(paragraph)) {
      return { body: "" };
    }

    const title =
      "title" in paragraph && typeof paragraph.title === "string" ? paragraph.title : undefined;
    const body = "body" in paragraph && typeof paragraph.body === "string" ? paragraph.body : "";

    return title === undefined ? { body } : { title, body };
  });
}

export const storyContentSchema = commonContentSchema.extend({
  title: nonEmptyString.max(160),
  paragraphs: z.array(storyParagraphSchema).min(1).max(8),
  image: assetSchema.optional(),
});

export type StoryContent = z.infer<typeof storyContentSchema>;

export const detailsContentSchema = commonContentSchema.extend({
  title: nonEmptyString.max(160),
  items: z
    .array(
      z.object({
        label: nonEmptyString.max(80),
        value: nonEmptyString.max(400),
        hint: z.string().trim().max(240).optional(),
      }),
    )
    .min(1)
    .max(12),
});

export const entourageContentSchema = commonContentSchema.extend({
  title: nonEmptyString.max(160),
  groups: z
    .array(
      z.object({
        label: nonEmptyString.max(120),
        names: z.array(nonEmptyString.max(120)).min(1).max(24),
      }),
    )
    .min(1)
    .max(8),
});

export const dressCodeContentSchema = commonContentSchema.extend({
  title: nonEmptyString.max(160),
  description: z.string().trim().max(800).optional(),
  cards: z
    .array(
      z.object({
        label: z.string().trim().max(80).optional(),
        title: nonEmptyString.max(160),
        description: nonEmptyString.max(800),
      }),
    )
    .max(6)
    .default([]),
  paletteTitle: z.string().trim().max(160).optional(),
  paletteDescription: z.string().trim().max(800).optional(),
  palette: z
    .array(
      z.object({
        label: nonEmptyString.max(80),
        color: z
          .string()
          .trim()
          .regex(/^#[0-9a-fA-F]{6}$/)
          .optional(),
      }),
    )
    .max(8)
    .default([]),
});

const locationBaseContentSchema = commonContentSchema.extend({
  venueName: nonEmptyString.max(180),
  address: nonEmptyString.max(500),
  notes: z.string().trim().max(800).optional(),
});

export const locationContentSchema = locationBaseContentSchema
  .extend({
    latitude: z.number().finite().min(-90).max(90).optional(),
    longitude: z.number().finite().min(-180).max(180).optional(),
    placeId: optionalMapPlaceIdSchema,
    embedUrl: optionalMapEmbedUrlSchema,
    directionsUrl: optionalMapDirectionsUrlSchema,
    mapUrl: optionalMapDirectionsUrlSchema,
  })
  .superRefine((value, context) => {
    if ((value.latitude === undefined) !== (value.longitude === undefined)) {
      context.addIssue({
        code: "custom",
        message: "Latitude and longitude must be provided together",
        path: value.latitude === undefined ? ["latitude"] : ["longitude"],
      });
    }
  });

export type NormalizedLocationContent = z.infer<typeof locationContentSchema> & {
  directionsUrl: string;
};

export function normalizeLocationContent(
  content: Record<string, unknown>,
): NormalizedLocationContent | null {
  const base = locationBaseContentSchema.safeParse(content);

  if (!base.success) {
    return null;
  }

  const coordinates = z
    .object({
      latitude: z.number().finite().min(-90).max(90),
      longitude: z.number().finite().min(-180).max(180),
    })
    .safeParse(content);
  const placeId = mapPlaceIdSchema.safeParse(content.placeId);
  const embedUrl = mapEmbedUrlSchema.safeParse(content.embedUrl);
  const directionsUrl = mapDirectionsUrlSchema.safeParse(content.directionsUrl);
  const legacyMapUrl = mapDirectionsUrlSchema.safeParse(content.mapUrl);
  const latitude = coordinates.success ? coordinates.data.latitude : undefined;
  const longitude = coordinates.success ? coordinates.data.longitude : undefined;
  const safePlaceId = placeId.success ? placeId.data : undefined;

  const resolvedEmbedUrl =
    embedUrl.success && embedUrl.data
      ? embedUrl.data
      : latitude !== undefined && longitude !== undefined
        ? buildOpenStreetMapEmbedUrl(latitude, longitude)
        : undefined;

  return {
    ...base.data,
    ...(latitude !== undefined && longitude !== undefined ? { latitude, longitude } : {}),
    ...(safePlaceId ? { placeId: safePlaceId } : {}),
    ...(resolvedEmbedUrl ? { embedUrl: resolvedEmbedUrl } : {}),
    directionsUrl:
      (directionsUrl.success ? directionsUrl.data : undefined) ??
      (legacyMapUrl.success ? legacyMapUrl.data : undefined) ??
      buildGoogleMapsDirectionsUrl({
        address: base.data.address,
        latitude,
        longitude,
        placeId: safePlaceId,
      }),
  };
}

export function sanitizePublicLocationContent(content: Record<string, unknown>) {
  const {
    directionsUrl: _directionsUrl,
    embedUrl: _embedUrl,
    latitude: _latitude,
    longitude: _longitude,
    mapUrl: _mapUrl,
    placeId: _placeId,
    ...rest
  } = content;
  const normalized = normalizeLocationContent(content);

  return normalized ? { ...rest, ...normalized } : rest;
}

export function buildGoogleMapsDirectionsUrl({
  address,
  latitude,
  longitude,
  placeId,
}: {
  address: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
}) {
  const url = new URL("https://www.google.com/maps/dir/");
  const destination =
    latitude !== undefined && longitude !== undefined ? `${latitude},${longitude}` : address;

  url.searchParams.set("api", "1");
  url.searchParams.set("destination", destination);
  if (placeId) {
    url.searchParams.set("destination_place_id", placeId);
  }

  return url.toString();
}

export function buildOpenStreetMapEmbedUrl(latitude: number, longitude: number) {
  const longitudeDelta = 0.006;
  const latitudeDelta = 0.0045;
  const url = new URL("https://www.openstreetmap.org/export/embed.html");

  url.searchParams.set(
    "bbox",
    [
      longitude - longitudeDelta,
      latitude - latitudeDelta,
      longitude + longitudeDelta,
      latitude + latitudeDelta,
    ].join(","),
  );
  url.searchParams.set("layer", "mapnik");
  url.searchParams.set("marker", `${latitude},${longitude}`);

  return url.toString();
}

function isAllowedMapEmbedUrl(value: string) {
  const url = new URL(value);

  return (
    isSafeMapUrlBase(url) &&
    url.hostname === "www.openstreetmap.org" &&
    url.pathname === "/export/embed.html"
  );
}

function isAllowedMapDirectionsUrl(value: string) {
  const url = new URL(value);
  const isLegacyGoogleMapsSearch =
    url.hostname === "maps.google.com" && url.pathname === "/" && url.searchParams.has("q");

  return (
    isSafeMapUrlBase(url) &&
    (isLegacyGoogleMapsSearch ||
      ((url.hostname === "www.google.com" || url.hostname === "maps.google.com") &&
        url.pathname.startsWith("/maps/")) ||
      (url.hostname === "maps.apple.com" && url.pathname === "/") ||
      (url.hostname === "www.openstreetmap.org" && url.pathname.startsWith("/directions")))
  );
}

function isSafeMapUrlBase(url: URL) {
  return url.protocol === "https:" && url.username === "" && url.password === "" && url.port === "";
}

export const galleryContentSchema = commonContentSchema.extend({
  title: z.string().trim().max(160).optional(),
  images: z.array(assetSchema).min(1).max(30),
});

export const rsvpContentSchema = commonContentSchema.extend({
  title: nonEmptyString.max(160),
  description: z.string().trim().max(800).optional(),
  submitLabel: z.string().trim().max(80).optional(),
  questions: z
    .array(
      z.object({
        key: z
          .string()
          .trim()
          .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
        label: nonEmptyString.max(160),
        type: z.enum(["text", "textarea", "single_choice", "multi_choice"]),
        required: z.boolean().default(false),
        options: z.array(nonEmptyString.max(120)).max(12).optional(),
      }),
    )
    .max(12)
    .default([]),
});

export const outroContentSchema = commonContentSchema.extend({
  title: nonEmptyString.max(160),
  message: z.string().trim().max(1000).optional(),
  image: assetSchema.optional(),
});

export const customContentSchema = commonContentSchema.extend({
  title: nonEmptyString.max(160),
  blocks: z
    .array(
      z.object({
        heading: z.string().trim().max(160).optional(),
        body: nonEmptyString.max(1200),
      }),
    )
    .min(1)
    .max(8),
});

export const sectionContentSchemas = {
  introduction: introductionContentSchema,
  profile: profileContentSchema,
  date: dateContentSchema,
  story: storyContentSchema,
  details: detailsContentSchema,
  entourage: entourageContentSchema,
  dress_code: dressCodeContentSchema,
  location: locationContentSchema,
  gallery: galleryContentSchema,
  rsvp: rsvpContentSchema,
  outro: outroContentSchema,
  custom: customContentSchema,
} satisfies Record<SectionType, z.ZodType>;

export const sectionSettingsSchemas = {
  introduction: commonSettingsSchema.extend({
    layout: z.enum(["editorial", "split", "centered"]).default("editorial"),
  }),
  profile: commonSettingsSchema.extend({
    layout: z.enum(["cards", "split", "stacked"]).default("cards"),
  }),
  date: commonSettingsSchema.extend({
    showCountdown: z.boolean().default(true),
  }),
  story: commonSettingsSchema.extend({
    layout: z.enum(["timeline", "editorial", "stacked"]).default("editorial"),
  }),
  details: commonSettingsSchema.extend({
    columns: z.number().int().min(1).max(3).default(2),
  }),
  entourage: commonSettingsSchema.extend({
    columns: z.number().int().min(1).max(3).default(2),
  }),
  dress_code: commonSettingsSchema.extend({
    showSwatches: z.boolean().default(true),
  }),
  location: commonSettingsSchema.extend({
    showMapPreview: z.boolean().default(true),
  }),
  gallery: commonSettingsSchema.extend({
    layout: z.enum(["grid", "masonry", "carousel"]).default("grid"),
  }),
  rsvp: commonSettingsSchema.extend({
    requireGuestToken: z.boolean().default(true),
  }),
  outro: commonSettingsSchema.extend({
    layout: z.enum(["simple", "editorial"]).default("simple"),
  }),
  custom: commonSettingsSchema,
} satisfies Record<SectionType, z.ZodType>;

export type SectionRendererKey = `section.${SectionType}`;

export type SectionDefinition = {
  type: SectionType;
  label: string;
  description: string;
  defaultVisibility: "public" | "guest_only" | "hidden";
  rendererKey: SectionRendererKey;
  contentSchema: (typeof sectionContentSchemas)[SectionType];
  settingsSchema: (typeof sectionSettingsSchemas)[SectionType];
  requiresGuestContext: boolean;
};

const createSectionDefinition = (
  type: SectionType,
  definition: Omit<SectionDefinition, "type" | "rendererKey" | "contentSchema" | "settingsSchema">,
): SectionDefinition => ({
  type,
  rendererKey: `section.${type}`,
  contentSchema: sectionContentSchemas[type],
  settingsSchema: sectionSettingsSchemas[type],
  ...definition,
});

export const sectionDefinitions = {
  introduction: createSectionDefinition("introduction", {
    label: "Introduction",
    description: "Opening moment with title, supporting copy, and optional cover image.",
    defaultVisibility: "public",
    requiresGuestContext: false,
  }),
  profile: createSectionDefinition("profile", {
    label: "Profile",
    description: "Couple, celebrant, host, or featured people profiles.",
    defaultVisibility: "public",
    requiresGuestContext: false,
  }),
  date: createSectionDefinition("date", {
    label: "Date and Time",
    description: "Event date, time, timezone, and optional countdown label.",
    defaultVisibility: "public",
    requiresGuestContext: false,
  }),
  story: createSectionDefinition("story", {
    label: "Story",
    description: "Editorial text section for event story or background.",
    defaultVisibility: "public",
    requiresGuestContext: false,
  }),
  details: createSectionDefinition("details", {
    label: "Details",
    description: "Structured event details such as schedule, gifts, or notes.",
    defaultVisibility: "public",
    requiresGuestContext: false,
  }),
  entourage: createSectionDefinition("entourage", {
    label: "Entourage",
    description: "Named groups such as wedding party, hosts, or helpers.",
    defaultVisibility: "public",
    requiresGuestContext: false,
  }),
  dress_code: createSectionDefinition("dress_code", {
    label: "Dress Code",
    description: "Attire guidance cards with an optional labeled color palette.",
    defaultVisibility: "public",
    requiresGuestContext: false,
  }),
  location: createSectionDefinition("location", {
    label: "Location",
    description: "Venue, address, and map link.",
    defaultVisibility: "public",
    requiresGuestContext: false,
  }),
  gallery: createSectionDefinition("gallery", {
    label: "Gallery",
    description: "Real event imagery or prepared asset slots.",
    defaultVisibility: "public",
    requiresGuestContext: false,
  }),
  rsvp: createSectionDefinition("rsvp", {
    label: "RSVP",
    description: "Guest-token RSVP form content and questions.",
    defaultVisibility: "guest_only",
    requiresGuestContext: true,
  }),
  outro: createSectionDefinition("outro", {
    label: "Outro",
    description: "Closing message for guests.",
    defaultVisibility: "public",
    requiresGuestContext: false,
  }),
  custom: createSectionDefinition("custom", {
    label: "Custom Text",
    description: "Bounded custom text blocks; never executable content.",
    defaultVisibility: "public",
    requiresGuestContext: false,
  }),
} satisfies Record<SectionType, SectionDefinition>;

export const availableSectionTypes = sectionTypeSchema.options;
