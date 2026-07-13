import type { ThemeVisualEffects } from "../../contracts";
import { createThemePresentation, seasonalRsvpPresentation } from "../../theme-shared";

export const noelPresentation = createThemePresentation({
  hero: {
    frameClassName:
      "lumiere-hero--noel bg-[radial-gradient(circle_at_80%_12%,color-mix(in_srgb,var(--accent)_18%,transparent),transparent_30%),linear-gradient(180deg,var(--background),color-mix(in_srgb,var(--surface-muted)_54%,var(--background)))]",
    imageClassName: "aspect-[4/5] w-full object-cover sm:aspect-[16/12]",
    imageSizes: "(min-width: 1024px) 50vw, 100vw",
    innerClassName:
      "mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center",
    mediaClassName: "order-first rounded-[var(--radius-lg)] lg:order-none",
  },
  rsvp: seasonalRsvpPresentation,
});

export const noelEffects = {
  backdrop: { imageSource: "cover", overlay: "strong", type: "image" },
  dividerStyle: "luminous",
  frameStyle: "frosted",
  imageTreatment: "frosted",
  ornaments: { density: "sparse", enabled: true, set: "snowfall" },
  texture: { policy: "frost", strength: "subtle" },
} satisfies ThemeVisualEffects;
