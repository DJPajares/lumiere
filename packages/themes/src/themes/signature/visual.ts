import type { ThemeRsvpPresentation, ThemeVisualEffects } from "../../contracts";
import { createThemePresentation, editorialLedgerRsvpPresentation } from "../../theme-shared";

export const signatureRsvpPresentation = {
  ...editorialLedgerRsvpPresentation,
  cardClassName:
    "lumiere-rsvp-card--signature grid overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_97%,transparent)] shadow-[0_32px_100px_color-mix(in_srgb,var(--foreground)_14%,transparent)]",
  counterValueClassName: "lumiere-type-name",
  eyebrowClassName: "lumiere-type-eyebrow text-[var(--accent-strong)]",
  fieldLabelClassName:
    "lumiere-type-label text-[color-mix(in_srgb,var(--foreground)_66%,transparent)]",
  inputClassName:
    "lumiere-type-body min-h-11 rounded-none border-0 border-b border-[var(--border)] bg-transparent px-1 text-[var(--foreground)] focus:border-[var(--focus)] focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60",
  submitClassName:
    "lumiere-type-control min-h-12 w-full rounded-[var(--radius-sm)] border border-[var(--accent)] bg-[var(--accent)] px-5 text-[var(--accent-contrast)] shadow-[0_16px_42px_color-mix(in_srgb,var(--accent)_22%,transparent)] transition hover:-translate-y-0.5 hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-[var(--focus)] focus:ring-offset-2 focus:ring-offset-[var(--surface)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60",
  titleClassName: "lumiere-type-name text-[var(--foreground)]",
} satisfies ThemeRsvpPresentation;

export const signaturePresentation = createThemePresentation({
  hero: {
    decorationClassName: "lumiere-signature-aperture",
    eyebrowCopy: "A gathering, composed for you",
    fallbackClassName: "lumiere-signature-invitation-card",
    frameClassName: "lumiere-hero--signature",
    imageClassName: "aspect-[4/5] w-full object-cover sm:aspect-[3/4] lg:min-h-[66dvh]",
    imageSizes: "(min-width: 1024px) 43vw, 100vw",
    innerClassName: "mx-auto grid w-full max-w-5xl place-items-center text-center",
    innerWithMediaClassName:
      "mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.88fr)_minmax(22rem,0.72fr)] lg:items-center lg:gap-16",
    mediaClassName: "lumiere-signature-portrait mx-auto w-full max-w-[31rem]",
    pretitleCopy: "Private invitation",
  },
  rsvp: signatureRsvpPresentation,
});

export const signatureEffects = {
  backdrop: { imageSource: "none", overlay: "none", type: "texture" },
  dividerStyle: "hairline",
  frameStyle: "double-line",
  imageTreatment: "natural",
  ornaments: { density: "balanced", enabled: true, set: "signature-thread" },
  texture: { policy: "fine-noise", strength: "subtle" },
} satisfies ThemeVisualEffects;
