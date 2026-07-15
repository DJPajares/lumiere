import type { ThemeRsvpPresentation, ThemeVisualEffects } from "../../contracts";
import { createThemePresentation, seasonalRsvpPresentation } from "../../theme-shared";

export const noelV2RsvpPresentation = {
  ...seasonalRsvpPresentation,
  cardClassName:
    "lumiere-rsvp-card--noel-v2 grid gap-4 border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] p-4 shadow-[0_32px_100px_color-mix(in_srgb,var(--background)_46%,transparent)] backdrop-blur-xl sm:p-6",
  eyebrowClassName:
    "text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]",
  inputClassName:
    "min-h-11 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] px-3 text-sm text-[var(--foreground)] shadow-[inset_0_1px_0_color-mix(in_srgb,var(--foreground)_5%,transparent)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)] disabled:cursor-not-allowed disabled:opacity-60",
  submitClassName:
    "min-h-12 w-full rounded-[var(--radius-sm)] bg-[var(--accent)] px-5 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--accent-contrast)] shadow-[0_16px_42px_color-mix(in_srgb,var(--accent)_24%,transparent)] transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-[var(--focus)] focus:ring-offset-2 focus:ring-offset-[var(--surface)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60",
  titleClassName:
    "lumiere-display text-3xl font-normal leading-tight tracking-[-0.02em] text-[var(--foreground)] sm:text-4xl",
} satisfies ThemeRsvpPresentation;

export const noelV2Presentation = createThemePresentation({
  hero: {
    fallbackClassName: "lumiere-noel-v2-folio",
    frameClassName: "lumiere-hero--noel-v2",
    imageClassName: "aspect-[4/5] w-full object-cover",
    imageSizes: "(min-width: 1024px) 34vw, 100vw",
    innerClassName:
      "lumiere-noel-v2-invite-layout mx-auto grid w-full max-w-3xl place-items-center",
    innerWithMediaClassName:
      "lumiere-noel-v2-invite-layout lumiere-noel-v2-invite-layout--media mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[minmax(32rem,0.98fr)_minmax(20rem,0.62fr)] lg:items-center lg:gap-12",
    mediaClassName: "lumiere-noel-v2-portrait",
  },
  rsvp: noelV2RsvpPresentation,
});

export const noelV2Effects = {
  backdrop: { imageSource: "none", overlay: "soft", type: "texture" },
  dividerStyle: "short-rule",
  frameStyle: "organic",
  imageTreatment: "natural",
  ornaments: { density: "balanced", enabled: true, set: "botanical" },
  texture: { policy: "paper-grain", strength: "subtle" },
} satisfies ThemeVisualEffects;
