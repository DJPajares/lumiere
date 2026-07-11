import type { EventType, SectionType } from "@lumiere/types";

export const publicCoreSections: SectionType[] = [
  "introduction",
  "date",
  "details",
  "location",
  "rsvp",
  "outro",
];

export const allInviteSections: SectionType[] = [
  ...publicCoreSections,
  "profile",
  "story",
  "entourage",
  "dress_code",
  "gallery",
  "custom",
];

export const expansionEventTypes: EventType[] = ["wedding", "birthday", "private_event", "other"];

export function createRendererSlots({
  fallback = [],
  specialized = [],
}: {
  fallback?: SectionType[];
  specialized?: SectionType[];
}) {
  return {
    ...Object.fromEntries(
      specialized.map((sectionType) => [
        sectionType,
        {
          coverage: "specialized" as const,
          notes: "Theme declares a section-level composition, motion, or layout treatment.",
        },
      ]),
    ),
    ...Object.fromEntries(
      fallback.map((sectionType) => [
        sectionType,
        {
          coverage: "fallback" as const,
          notes:
            "Uses the shared public invite renderer with theme tokens and generic section layout.",
        },
      ]),
    ),
  };
}
