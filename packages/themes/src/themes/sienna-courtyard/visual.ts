import type { ThemeVisualEffects } from "../../contracts";
import { courtyardRsvpPresentation, createThemePresentation } from "../../theme-shared";

export const siennaCourtyardPresentation = createThemePresentation({
  hero: {
    fallbackClassName: "lumiere-hero-media lumiere-hero-fallback",
    frameClassName:
      "lumiere-hero--sienna-courtyard bg-[linear-gradient(118deg,color-mix(in_srgb,var(--surface)_96%,var(--background))_0_58%,color-mix(in_srgb,var(--accent)_18%,var(--background))_58%)]",
    imageClassName: "aspect-[4/5] w-full object-cover sm:aspect-[5/6] lg:min-h-[74dvh]",
    imageSizes: "(min-width: 1024px) 48vw, 100vw",
    innerClassName:
      "mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center",
    mediaClassName: "rounded-t-[9rem] rounded-b-[var(--radius-sm)]",
    pretitleCopy: "Through the courtyard",
  },
  rsvp: courtyardRsvpPresentation,
});

export const siennaCourtyardEffects = {
  backdrop: { imageSource: "none", overlay: "none", type: "solid" },
  dividerStyle: "short-rule",
  frameStyle: "offset",
  imageTreatment: "sun-washed",
  ornaments: { density: "sparse", enabled: true, set: "architectural-shadows" },
  texture: { policy: "fine-noise", strength: "subtle" },
} satisfies ThemeVisualEffects;
