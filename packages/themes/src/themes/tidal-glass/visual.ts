import type { ThemeVisualEffects } from "../../contracts";
import { createThemePresentation, shorelineRsvpPresentation } from "../../theme-shared";

export const tidalGlassPresentation = createThemePresentation({
  hero: {
    fallbackClassName: "lumiere-hero-media lumiere-hero-fallback",
    frameClassName:
      "lumiere-hero--tidal-glass bg-[radial-gradient(ellipse_at_78%_8%,color-mix(in_srgb,var(--accent)_26%,transparent),transparent_42%),linear-gradient(155deg,var(--background),color-mix(in_srgb,var(--surface-muted)_72%,var(--background)))]",
    imageClassName: "aspect-[16/10] w-full object-cover lg:min-h-[56dvh]",
    imageSizes: "(min-width: 1024px) 68vw, 100vw",
    innerClassName: "mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end",
    innerWithMediaClassName:
      "mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end",
    mediaClassName: "rounded-[var(--radius-lg)]",
  },
  rsvp: shorelineRsvpPresentation,
});

export const tidalGlassEffects = {
  backdrop: { imageSource: "none", overlay: "none", type: "gradient" },
  dividerStyle: "tide-line",
  frameStyle: "organic",
  imageTreatment: "refracted",
  ornaments: { density: "balanced", enabled: true, set: "tide-lines" },
  texture: { policy: "frost", strength: "subtle" },
} satisfies ThemeVisualEffects;
