import type { ThemeVisualEffects } from "../../contracts";
import { conservatoryRsvpPresentation, createThemePresentation } from "../../theme-shared";

export const nightGardenPresentation = createThemePresentation({
  hero: {
    fallbackClassName: "lumiere-hero-media lumiere-hero-fallback",
    frameClassName:
      "lumiere-hero--night-garden bg-[radial-gradient(ellipse_at_78%_18%,color-mix(in_srgb,var(--accent)_18%,transparent),transparent_34%),linear-gradient(148deg,var(--background),color-mix(in_srgb,var(--surface)_88%,var(--background)))]",
    imageClassName: "aspect-[4/5] w-full object-cover sm:aspect-[5/6] lg:min-h-[76dvh]",
    imageSizes: "(min-width: 1024px) 46vw, 100vw",
    innerClassName:
      "mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1.04fr_0.96fr] lg:items-center",
    mediaClassName: "rounded-[48%_48%_var(--radius-lg)_var(--radius-lg)]",
    pretitleCopy: "After the garden closes",
  },
  rsvp: conservatoryRsvpPresentation,
});

export const nightGardenEffects = {
  backdrop: { imageSource: "none", overlay: "strong", type: "gradient" },
  dividerStyle: "luminous",
  frameStyle: "organic",
  imageTreatment: "nocturne",
  ornaments: { density: "balanced", enabled: true, set: "night-foliage" },
  texture: { policy: "fine-noise", strength: "subtle" },
} satisfies ThemeVisualEffects;
