import type { ThemeVisualEffects } from "../../contracts";
import { createThemePresentation } from "../../theme-shared";

export const lumiereDefaultPresentation = createThemePresentation({
  hero: {
    frameClassName:
      "bg-[linear-gradient(180deg,var(--background),color-mix(in_srgb,var(--surface-muted)_42%,var(--background)))]",
    imageClassName: "aspect-[4/5] w-full object-cover",
    imageSizes: "(min-width: 1024px) 48vw, 100vw",
    innerClassName:
      "mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center",
    mediaClassName: "rounded-[var(--radius-lg)]",
  },
});

export const lumiereDefaultEffects = {
  backdrop: { imageSource: "none", overlay: "none", type: "solid" },
  dividerStyle: "hairline",
  frameStyle: "soft",
  imageTreatment: "natural",
  ornaments: { density: "none", enabled: false, set: "none" },
  texture: { policy: "paper-grain", strength: "subtle" },
} satisfies ThemeVisualEffects;
