import type { ThemeRsvpPresentation, ThemeVisualEffects } from "../../contracts";
import { createThemePresentation, seasonalRsvpPresentation } from "../../theme-shared";

export const noelRsvpPresentation = {
  ...seasonalRsvpPresentation,
  cardClassName:
    "lumiere-rsvp-card--noel grid gap-4 border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] p-4 shadow-[0_32px_100px_color-mix(in_srgb,var(--background)_46%,transparent)] backdrop-blur-xl sm:p-6",
  eyebrowClassName: "lumiere-type-eyebrow text-[var(--accent-strong)]",
  inputClassName:
    "lumiere-type-body min-h-11 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] px-3 text-[var(--foreground)] shadow-[inset_0_1px_0_color-mix(in_srgb,var(--foreground)_5%,transparent)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)] disabled:cursor-not-allowed disabled:opacity-60",
  submitClassName:
    "lumiere-type-control min-h-12 w-full rounded-[var(--radius-sm)] bg-[var(--accent)] px-5 text-[var(--accent-contrast)] shadow-[0_16px_42px_color-mix(in_srgb,var(--accent)_24%,transparent)] transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-[var(--focus)] focus:ring-offset-2 focus:ring-offset-[var(--surface)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60",
  titleClassName: "lumiere-type-title text-[var(--foreground)]",
} satisfies ThemeRsvpPresentation;

export const noelPresentation = createThemePresentation({
  hero: {
    fallbackClassName: "lumiere-noel-folio",
    frameClassName: "lumiere-hero--noel",
    imageClassName: "aspect-[4/5] w-full object-cover sm:aspect-[16/12]",
    imageSizes: "(min-width: 1024px) 50vw, 100vw",
    innerClassName:
      "mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[minmax(0,1.12fr)_minmax(19rem,0.72fr)] lg:items-center lg:gap-16",
    mediaClassName: "lumiere-noel-portrait rounded-[var(--radius-lg)]",
  },
  rsvp: noelRsvpPresentation,
});

export const noelEffects = {
  backdrop: { imageSource: "cover", overlay: "strong", type: "image" },
  dividerStyle: "luminous",
  frameStyle: "frosted",
  imageTreatment: "frosted",
  ornaments: { density: "balanced", enabled: true, set: "snowfall" },
  texture: { policy: "frost", strength: "subtle" },
} satisfies ThemeVisualEffects;
