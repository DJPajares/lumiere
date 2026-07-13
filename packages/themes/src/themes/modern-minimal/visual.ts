import type { ThemeVisualEffects } from "../../contracts";
import { createThemePresentation } from "../../theme-shared";

export const modernMinimalPresentation = createThemePresentation({
  hero: {
    fallbackClassName: "lumiere-hero-media lumiere-hero-fallback",
    frameClassName:
      "lumiere-hero--modern-minimal bg-[linear-gradient(90deg,var(--background)_0%,var(--background)_66%,var(--surface-muted)_66%,var(--surface-muted)_100%)]",
    imageClassName: "aspect-[3/4] w-full object-cover sm:aspect-[4/5] lg:h-full lg:min-h-[66dvh]",
    imageSizes: "(min-width: 1024px) 40vw, 100vw",
    innerClassName:
      "mx-auto grid w-full max-w-7xl gap-0 lg:grid-cols-[1.2fr_0.8fr] lg:items-stretch",
    mediaClassName: "rounded-[var(--radius-lg)]",
  },
});

export const modernMinimalEffects = {
  backdrop: { imageSource: "none", overlay: "none", type: "solid" },
  dividerStyle: "hairline",
  frameStyle: "frameless",
  imageTreatment: "crisp",
  ornaments: { density: "none", enabled: false, set: "none" },
  texture: { policy: "none", strength: "none" },
} satisfies ThemeVisualEffects;
