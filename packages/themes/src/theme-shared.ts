import { eventTypeSchema, type EventType, type SectionType } from "@lumiere/types";
import type {
  ThemeHeroPresentation,
  ThemeInvitePresentation,
  ThemeRsvpPresentation,
} from "./contracts";

const heroMediaBaseClassName =
  "lumiere-hero-media overflow-hidden border border-[var(--border)] bg-[var(--surface)] shadow-[0_24px_70px_color-mix(in_srgb,var(--accent)_15%,transparent)]";
const heroFallbackBaseClassName =
  "grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_24px_70px_color-mix(in_srgb,var(--accent)_12%,transparent)]";

export const defaultRsvpPresentation = {
  cardClassName:
    "grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] p-4 shadow-[0_24px_72px_color-mix(in_srgb,var(--accent)_14%,transparent)] backdrop-blur sm:p-5",
  counterValueClassName: "lumiere-type-numeric text-[var(--foreground)]",
  eyebrowClassName: "lumiere-type-eyebrow text-[var(--accent-strong)]",
  fieldLabelClassName:
    "lumiere-type-label text-[color-mix(in_srgb,var(--foreground)_58%,transparent)]",
  inputClassName:
    "lumiere-type-body min-h-11 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)] disabled:cursor-not-allowed disabled:opacity-60",
  rendererId: "common",
  submitClassName:
    "lumiere-type-control min-h-11 w-full rounded-[var(--radius-md)] bg-[var(--accent)] px-5 text-[var(--accent-contrast)] shadow-[0_12px_32px_color-mix(in_srgb,var(--accent)_24%,transparent)] transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[var(--focus)] focus:ring-offset-2 focus:ring-offset-[var(--surface)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60",
  titleClassName: "lumiere-type-title",
} satisfies ThemeRsvpPresentation;

export const editorialRsvpPresentation = {
  ...defaultRsvpPresentation,
  titleClassName: "lumiere-type-title text-[var(--foreground)]",
} satisfies ThemeRsvpPresentation;

export const editorialLedgerRsvpPresentation = {
  ...editorialRsvpPresentation,
  cardClassName:
    "grid overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_96%,transparent)] shadow-[0_24px_72px_color-mix(in_srgb,var(--accent)_16%,transparent)]",
  rendererId: "editorial-ledger",
  submitClassName: editorialRsvpPresentation.submitClassName,
} satisfies ThemeRsvpPresentation;

export const playfulRsvpPresentation = {
  ...defaultRsvpPresentation,
  cardClassName:
    "grid gap-4 rounded-[var(--radius-lg)] border-2 border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_20px_64px_color-mix(in_srgb,var(--accent)_16%,transparent)] sm:p-5",
  titleClassName: "lumiere-type-title",
} satisfies ThemeRsvpPresentation;

export const seasonalRsvpPresentation = {
  ...defaultRsvpPresentation,
  cardClassName:
    "grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[linear-gradient(160deg,color-mix(in_srgb,var(--surface)_96%,transparent),color-mix(in_srgb,var(--surface-muted)_74%,var(--surface)))] p-4 shadow-[0_24px_72px_color-mix(in_srgb,var(--accent)_14%,transparent)] sm:p-5",
  titleClassName: "lumiere-type-title",
} satisfies ThemeRsvpPresentation;

export function createThemePresentation({
  hero,
  rsvp = defaultRsvpPresentation,
}: {
  hero: Omit<ThemeHeroPresentation, "fallbackClassName" | "mediaClassName"> & {
    fallbackClassName?: string;
    mediaClassName?: string;
  };
  rsvp?: ThemeRsvpPresentation;
}): ThemeInvitePresentation {
  return {
    hero: {
      ...hero,
      fallbackClassName: joinClassNames(heroFallbackBaseClassName, hero.fallbackClassName),
      mediaClassName: joinClassNames(heroMediaBaseClassName, hero.mediaClassName),
    },
    rsvp,
  };
}

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

export const allEventTypes: EventType[] = [...eventTypeSchema.options];

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

function joinClassNames(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}
