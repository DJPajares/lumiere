import type { ThemeVisualEffects } from "../../contracts";
import { createThemePresentation, editorialRsvpPresentation } from "../../theme-shared";

export const velvetDuskPresentation = createThemePresentation({
  hero: {
    fallbackClassName: "lumiere-hero-media lumiere-hero-fallback",
    frameClassName:
      "lumiere-hero--velvet-dusk bg-[radial-gradient(circle_at_68%_32%,color-mix(in_srgb,var(--accent)_16%,transparent),transparent_26%),linear-gradient(112deg,var(--background)_0%,var(--background)_48%,color-mix(in_srgb,var(--surface-muted)_72%,var(--background))_100%)]",
    imageClassName: "aspect-[3/4] w-full object-cover lg:min-h-[72dvh]",
    imageSizes: "(min-width: 1024px) 48vw, 100vw",
    innerClassName:
      "mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center",
    mediaClassName:
      "order-first mx-auto w-full max-w-[28rem] rounded-[var(--radius-lg)] lg:order-none lg:max-w-none",
  },
  rsvp: editorialRsvpPresentation,
});

export const velvetDuskEffects = {
  backdrop: { imageSource: "none", overlay: "soft", type: "gradient" },
  dividerStyle: "luminous",
  frameStyle: "double-line",
  imageTreatment: "cinematic",
  ornaments: { density: "sparse", enabled: true, set: "drapery" },
  texture: { policy: "fine-noise", strength: "subtle" },
} satisfies ThemeVisualEffects;
