import type { ThemeVisualEffects } from "../../contracts";
import { createThemePresentation, editorialRsvpPresentation } from "../../theme-shared";

export const premiumPresentation = createThemePresentation({
  hero: {
    fallbackClassName: "lumiere-hero-media lumiere-hero-fallback",
    frameClassName:
      "lumiere-hero--premium bg-[radial-gradient(circle_at_12%_12%,color-mix(in_srgb,var(--accent)_18%,transparent),transparent_28%),linear-gradient(180deg,color-mix(in_srgb,var(--surface)_64%,var(--background)),var(--background))]",
    imageClassName: "aspect-[4/5] w-full object-cover",
    imageSizes: "(min-width: 1024px) 50vw, 100vw",
    innerClassName:
      "mx-auto grid w-full max-w-6xl gap-9 lg:grid-cols-[0.9fr_1.1fr] lg:items-center",
    mediaClassName:
      "order-first mx-auto w-full max-w-[20rem] rounded-[var(--radius-lg)] lg:order-none lg:max-w-none",
  },
  rsvp: editorialRsvpPresentation,
});

export const premiumEffects = {
  backdrop: { imageSource: "none", overlay: "soft", type: "gradient" },
  dividerStyle: "luminous",
  frameStyle: "double-line",
  imageTreatment: "cinematic",
  ornaments: { density: "balanced", enabled: true, set: "candlelight" },
  texture: { policy: "fine-noise", strength: "subtle" },
} satisfies ThemeVisualEffects;
