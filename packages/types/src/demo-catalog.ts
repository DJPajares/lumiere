import { z } from "zod";

import { eventTypeSchema } from "./enums";
import { nonEmptyStringSchema, publicSlugSchema } from "./primitives";

export const demoEventKeySchema = z.enum(["wedding", "kids-birthday", "launch"]);
export type DemoEventKey = z.infer<typeof demoEventKeySchema>;

export const demoEventCatalogEntrySchema = z.object({
  eventType: eventTypeSchema,
  key: demoEventKeySchema,
  publicSlug: publicSlugSchema,
  summary: nonEmptyStringSchema.max(240),
  themeId: nonEmptyStringSchema.max(120),
  title: nonEmptyStringSchema.max(160),
});
export type DemoEventCatalogEntry = z.infer<typeof demoEventCatalogEntrySchema>;

export const demoEventCatalog = [
  {
    eventType: "wedding",
    key: "wedding",
    publicSlug: "amara-theo-garden-wedding",
    summary: "A candlelit garden wedding with an editorial ceremony-to-dinner rhythm.",
    themeId: "premium",
    title: "Amara & Theo",
  },
  {
    eventType: "kids_party",
    key: "kids-birthday",
    publicSlug: "milo-turns-eight",
    summary: "A bright, parent-friendly birthday afternoon with games, lunch, and cake.",
    themeId: "kids",
    title: "Milo Turns Eight",
  },
  {
    eventType: "launch",
    key: "launch",
    publicSlug: "after-hours-studio-18",
    summary: "An after-dark product launch shaped as a neon route through Studio 18.",
    themeId: "neon-signal",
    title: "After Hours / Studio 18",
  },
] as const satisfies readonly DemoEventCatalogEntry[];
