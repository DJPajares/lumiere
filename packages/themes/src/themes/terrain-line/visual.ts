import type { ThemeVisualEffects } from "../../contracts";
import { basecampRsvpPresentation, createThemePresentation } from "../../theme-shared";

export const terrainLinePresentation = createThemePresentation({
  hero: {
    fallbackClassName: "lumiere-hero-media lumiere-hero-fallback",
    frameClassName:
      "lumiere-hero--terrain-line bg-[radial-gradient(ellipse_at_90%_8%,color-mix(in_srgb,var(--accent)_18%,transparent),transparent_40%),linear-gradient(150deg,var(--background),color-mix(in_srgb,var(--surface-muted)_64%,var(--background)))]",
    imageClassName: "aspect-[16/11] w-full object-cover lg:min-h-[62dvh]",
    imageSizes: "(min-width: 1024px) 58vw, 100vw",
    innerClassName:
      "mx-auto grid w-full max-w-7xl gap-9 lg:grid-cols-[0.82fr_1.18fr] lg:items-center",
    mediaClassName: "rounded-[var(--radius-lg)]",
    pretitleCopy: "Origin / Route 01",
  },
  rsvp: basecampRsvpPresentation,
});

export const terrainLineEffects = {
  backdrop: { imageSource: "none", overlay: "none", type: "texture" },
  dividerStyle: "route-line",
  frameStyle: "terrain",
  imageTreatment: "documentary",
  ornaments: { density: "balanced", enabled: true, set: "contour-lines" },
  texture: { policy: "fine-noise", strength: "subtle" },
} satisfies ThemeVisualEffects;
