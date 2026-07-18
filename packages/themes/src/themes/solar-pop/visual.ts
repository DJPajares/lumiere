import type { ThemeVisualEffects } from "../../contracts";
import { createThemePresentation, festivalGateRsvpPresentation } from "../../theme-shared";

export const solarPopPresentation = createThemePresentation({
  hero: {
    fallbackClassName: "lumiere-hero-media lumiere-hero-fallback",
    frameClassName:
      "lumiere-hero--solar-pop bg-[linear-gradient(118deg,var(--accent)_0_31%,var(--background)_31%_67%,var(--warning)_67%)]",
    imageClassName: "aspect-[4/5] w-full object-cover lg:min-h-[66dvh]",
    imageSizes: "(min-width: 1024px) 44vw, 100vw",
    innerClassName:
      "mx-auto grid w-full max-w-7xl gap-7 lg:grid-cols-[1.1fr_0.9fr] lg:items-center",
    mediaClassName: "rounded-[var(--radius-lg)]",
    pretitleCopy: "Daylight edition",
  },
  rsvp: festivalGateRsvpPresentation,
});

export const solarPopEffects = {
  backdrop: { imageSource: "none", overlay: "none", type: "gradient" },
  dividerStyle: "short-rule",
  frameStyle: "geometric",
  imageTreatment: "cutout",
  ornaments: { density: "balanced", enabled: true, set: "geometric-planes" },
  texture: { policy: "none", strength: "none" },
} satisfies ThemeVisualEffects;
