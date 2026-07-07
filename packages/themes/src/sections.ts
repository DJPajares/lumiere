import { sectionTypeSchema, type SectionType } from "@lumiere/types";
import { z } from "zod";

const nonEmptyString = z.string().trim().min(1);
const optionalText = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .transform((value) => (value === "" ? undefined : value));

const assetSchema = z.object({
  url: z.string().trim().url(),
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

export const introductionContentSchema = z.object({
  eyebrow: z.string().trim().max(80).optional(),
  title: nonEmptyString.max(160),
  subtitle: z.string().trim().max(240).optional(),
  body: optionalText,
  coverImage: assetSchema.optional(),
});

export const profileContentSchema = z.object({
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

export const dateContentSchema = z.object({
  title: z.string().trim().max(120).optional(),
  startsAt: z.string().datetime({ offset: true }),
  endsAt: z.string().datetime({ offset: true }).optional(),
  timezone: nonEmptyString.max(80),
  displayText: z.string().trim().max(180).optional(),
  countdownLabel: z.string().trim().max(80).optional(),
});

export const storyContentSchema = z.object({
  title: nonEmptyString.max(160),
  paragraphs: z.array(nonEmptyString.max(1200)).min(1).max(8),
  image: assetSchema.optional(),
});

export const detailsContentSchema = z.object({
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

export const entourageContentSchema = z.object({
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

export const dressCodeContentSchema = z.object({
  title: nonEmptyString.max(160),
  description: z.string().trim().max(800).optional(),
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

export const locationContentSchema = z.object({
  venueName: nonEmptyString.max(180),
  address: nonEmptyString.max(500),
  mapUrl: z.string().trim().url().optional(),
  notes: z.string().trim().max(800).optional(),
});

export const galleryContentSchema = z.object({
  title: z.string().trim().max(160).optional(),
  images: z.array(assetSchema).min(1).max(30),
});

export const rsvpContentSchema = z.object({
  title: nonEmptyString.max(160),
  description: z.string().trim().max(800).optional(),
  submitLabel: z.string().trim().max(80).default("Send RSVP"),
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

export const outroContentSchema = z.object({
  title: nonEmptyString.max(160),
  message: z.string().trim().max(1000).optional(),
  image: assetSchema.optional(),
});

export const customContentSchema = z.object({
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
    description: "Attire guidance with optional labeled color swatches.",
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
