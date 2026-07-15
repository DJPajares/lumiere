import type { ThemeRsvpPresentation, ThemeVisualEffects } from "../../contracts";
import { createThemePresentation, defaultRsvpPresentation } from "../../theme-shared";

export const evergreenFolioRsvpPresentation = {
  ...defaultRsvpPresentation,
  cardClassName:
    "lumiere-rsvp-card--evergreen-folio grid gap-5 border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_24px_60px_color-mix(in_srgb,var(--background)_38%,transparent)] sm:p-8",
  eyebrowClassName:
    "text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]",
  fieldLabelClassName:
    "text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[color-mix(in_srgb,var(--foreground)_68%,transparent)]",
  inputClassName:
    "min-h-11 rounded-none border-0 border-b border-[var(--border)] bg-transparent px-1 text-sm text-[var(--foreground)] focus:outline-none focus:ring-0 focus:border-[var(--focus)] disabled:cursor-not-allowed disabled:opacity-60",
  submitClassName:
    "min-h-12 w-full rounded-none border border-[var(--accent)] bg-[var(--accent)] px-5 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent-contrast)] shadow-[4px_4px_0_color-mix(in_srgb,var(--accent)_22%,transparent)] transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_color-mix(in_srgb,var(--accent)_26%,transparent)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)] focus:ring-offset-2 focus:ring-offset-[var(--surface)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60",
  titleClassName:
    "lumiere-display text-3xl font-normal uppercase leading-[1.05] tracking-[-0.02em] text-[var(--foreground)] sm:text-4xl",
} satisfies ThemeRsvpPresentation;

export const evergreenFolioPresentation = createThemePresentation({
  hero: {
    decorationClassName: "lumiere-evergreen-folio-ornaments",
    eyebrowCopy: "You are invited to the wedding of",
    pretitleCopy: "Christmas Wedding",
    fallbackClassName: "lumiere-evergreen-folio-fallback",
    frameClassName: "lumiere-hero--evergreen-folio",
    imageClassName: "aspect-[4/5] w-full object-cover",
    imageSizes: "(min-width: 1024px) 30vw, 100vw",
    innerClassName:
      "lumiere-evergreen-folio-layout mx-auto grid w-full max-w-[48rem] place-items-center",
    innerWithMediaClassName:
      "lumiere-evergreen-folio-layout lumiere-evergreen-folio-layout--media mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[minmax(32rem,0.92fr)_minmax(18rem,0.48fr)] lg:items-center",
    mediaClassName: "lumiere-evergreen-folio-print",
  },
  rsvp: evergreenFolioRsvpPresentation,
});

export const evergreenFolioEffects = {
  backdrop: { imageSource: "none", overlay: "none", type: "texture" },
  dividerStyle: "hairline",
  frameStyle: "double-line",
  imageTreatment: "natural",
  ornaments: { density: "none", enabled: false, set: "none" },
  texture: { policy: "paper-grain", strength: "visible" },
} satisfies ThemeVisualEffects;
