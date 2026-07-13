import type { EventType, SectionType } from "@lumiere/types";
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
    "grid gap-5 rounded-[calc(var(--radius-lg)*1.6)] border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] p-5 shadow-[0_28px_90px_color-mix(in_srgb,var(--accent)_16%,transparent)] backdrop-blur sm:p-7",
  counterValueClassName: "text-2xl font-semibold leading-none",
  eyebrowClassName: "text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent-strong)]",
  fieldLabelClassName:
    "text-xs font-semibold uppercase tracking-[0.18em] text-[color-mix(in_srgb,var(--foreground)_58%,transparent)]",
  inputClassName:
    "min-h-11 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)] disabled:cursor-not-allowed disabled:opacity-60",
  rendererId: "common",
  submitClassName:
    "min-h-12 w-full rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-[var(--accent-contrast)] shadow-[0_16px_44px_color-mix(in_srgb,var(--accent)_28%,transparent)] transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[var(--focus)] focus:ring-offset-2 focus:ring-offset-[var(--surface)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60",
  titleClassName: "text-3xl font-light tracking-tight",
} satisfies ThemeRsvpPresentation;

export const editorialRsvpPresentation = {
  ...defaultRsvpPresentation,
  titleClassName:
    "font-serif text-3xl font-light tracking-[-0.01em] text-[var(--foreground)] sm:text-4xl",
} satisfies ThemeRsvpPresentation;

export const editorialLedgerRsvpPresentation = {
  ...editorialRsvpPresentation,
  cardClassName:
    "grid overflow-hidden rounded-none border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_96%,transparent)] shadow-[0_32px_100px_color-mix(in_srgb,var(--accent)_18%,transparent)]",
  rendererId: "editorial-ledger",
  submitClassName: `${editorialRsvpPresentation.submitClassName} rounded-none`,
} satisfies ThemeRsvpPresentation;

export const playfulRsvpPresentation = {
  ...defaultRsvpPresentation,
  cardClassName:
    "grid gap-5 rounded-[calc(var(--radius-lg)*1.4)] border-2 border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_20px_70px_color-mix(in_srgb,var(--accent)_18%,transparent)] sm:p-6",
  submitClassName: `${defaultRsvpPresentation.submitClassName} rounded-[var(--radius-lg)]`,
  titleClassName: "text-3xl font-semibold tracking-tight",
} satisfies ThemeRsvpPresentation;

export const seasonalRsvpPresentation = {
  ...defaultRsvpPresentation,
  cardClassName:
    "grid gap-5 rounded-[calc(var(--radius-lg)*1.3)] border border-[var(--border)] bg-[linear-gradient(160deg,color-mix(in_srgb,var(--surface)_96%,transparent),color-mix(in_srgb,var(--surface-muted)_74%,var(--surface)))] p-5 shadow-[0_28px_90px_color-mix(in_srgb,var(--accent)_16%,transparent)] sm:p-7",
  titleClassName: "font-serif text-3xl font-light tracking-tight sm:text-4xl",
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
