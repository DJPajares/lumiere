import type { ThemeVisualEffects } from "../../contracts";
import { createThemePresentation } from "../../theme-shared";

export const gardenLightPresentation = createThemePresentation({
  hero: {
    fallbackClassName: "lumiere-hero-media lumiere-hero-fallback",
    frameClassName:
      "lumiere-hero--garden-light bg-[radial-gradient(circle_at_18%_14%,color-mix(in_srgb,var(--surface-muted)_82%,transparent),transparent_30%),radial-gradient(circle_at_84%_24%,color-mix(in_srgb,var(--accent)_13%,transparent),transparent_27%),var(--background)]",
    imageClassName: "aspect-[4/3] w-full object-cover sm:aspect-[16/9]",
    imageSizes: "min(48rem, 100vw)",
    innerClassName: "mx-auto grid w-full max-w-4xl gap-8 text-center sm:grid-cols-2 sm:text-left",
    innerWithMediaClassName: "mx-auto grid w-full max-w-5xl gap-8 text-center",
    mediaClassName: "mx-auto w-full max-w-3xl rounded-[var(--radius-lg)]",
  },
});

export const gardenLightEffects = {
  backdrop: { imageSource: "none", overlay: "soft", type: "gradient" },
  dividerStyle: "short-rule",
  frameStyle: "organic",
  imageTreatment: "sun-washed",
  ornaments: { density: "balanced", enabled: true, set: "botanical" },
  texture: { policy: "soft-speckle", strength: "subtle" },
} satisfies ThemeVisualEffects;
