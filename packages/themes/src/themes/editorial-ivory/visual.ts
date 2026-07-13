import type { ThemeVisualEffects } from "../../contracts";
import { createThemePresentation, editorialRsvpPresentation } from "../../theme-shared";

export const editorialIvoryPresentation = createThemePresentation({
  hero: {
    fallbackClassName: "lumiere-hero-media lumiere-hero-fallback",
    frameClassName:
      "lumiere-hero--editorial-ivory bg-[linear-gradient(105deg,var(--background)_0%,var(--background)_52%,color-mix(in_srgb,var(--surface-muted)_58%,var(--background))_52%,var(--surface)_100%)]",
    imageClassName: "aspect-[4/5] w-full object-cover lg:min-h-[68dvh]",
    imageSizes: "(min-width: 1024px) 61vw, 100vw",
    innerClassName:
      "mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-center",
    mediaClassName:
      "order-first mx-auto w-full max-w-[24rem] rounded-[var(--radius-lg)] lg:order-none lg:max-w-none",
  },
  rsvp: editorialRsvpPresentation,
});

export const editorialIvoryEffects = {
  backdrop: { imageSource: "none", overlay: "none", type: "editorial-whitespace" },
  dividerStyle: "short-rule",
  frameStyle: "offset",
  imageTreatment: "desaturated",
  ornaments: { density: "sparse", enabled: true, set: "editorial-rules" },
  texture: { policy: "paper-grain", strength: "subtle" },
} satisfies ThemeVisualEffects;
