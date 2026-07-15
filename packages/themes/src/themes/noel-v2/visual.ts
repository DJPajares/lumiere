import type { ThemeRsvpPresentation, ThemeVisualEffects } from "../../contracts";
import { createThemePresentation, seasonalRsvpPresentation } from "../../theme-shared";

export const noelV2RsvpPresentation = {
  ...seasonalRsvpPresentation,
  cardClassName:
    "lumiere-rsvp-card--noel-v2 grid gap-5 border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] p-5 shadow-[0_28px_80px_color-mix(in_srgb,var(--foreground)_10%,transparent)] sm:p-8",
  counterValueClassName: "lumiere-display text-2xl font-medium leading-none",
  eyebrowClassName:
    "text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]",
  fieldLabelClassName:
    "text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[color-mix(in_srgb,var(--foreground)_68%,transparent)]",
  inputClassName:
    "min-h-11 rounded-none border-0 border-b border-[var(--border)] bg-transparent px-1 text-base text-[var(--foreground)] focus:border-[var(--focus)] focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60",
  submitClassName:
    "min-h-12 w-full rounded-none border border-[var(--accent)] bg-[var(--accent)] px-5 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-contrast)] shadow-[0_16px_42px_color-mix(in_srgb,var(--accent)_18%,transparent)] transition hover:-translate-y-0.5 hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-[var(--focus)] focus:ring-offset-2 focus:ring-offset-[var(--surface)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60",
  titleClassName:
    "lumiere-display text-4xl font-medium leading-[0.95] tracking-[-0.03em] text-[var(--foreground)] sm:text-5xl",
} satisfies ThemeRsvpPresentation;

export const noelV2Presentation = createThemePresentation({
  hero: {
    decorationClassName: "lumiere-noel-v2-decoration",
    eyebrowCopy: "Together with their families",
    fallbackClassName: "lumiere-noel-v2-folio",
    frameClassName: "lumiere-hero--noel-v2",
    imageClassName: "aspect-[4/5] w-full object-cover sm:aspect-[16/11]",
    imageSizes: "(min-width: 1024px) 58vw, 100vw",
    innerClassName: "mx-auto grid w-full max-w-5xl place-items-center",
    innerWithMediaClassName:
      "mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-[minmax(0,0.86fr)_minmax(22rem,0.7fr)] lg:items-center lg:gap-16",
    mediaClassName: "lumiere-noel-v2-portrait",
  },
  rsvp: noelV2RsvpPresentation,
});

export const noelV2Effects = {
  backdrop: { imageSource: "none", overlay: "none", type: "texture" },
  dividerStyle: "short-rule",
  frameStyle: "frameless",
  imageTreatment: "natural",
  ornaments: { density: "balanced", enabled: true, set: "botanical" },
  texture: { policy: "paper-grain", strength: "subtle" },
} satisfies ThemeVisualEffects;
