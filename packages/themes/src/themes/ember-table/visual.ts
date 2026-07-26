import type { ThemeVisualEffects } from "../../contracts";
import { createThemePresentation, placeSettingRsvpPresentation } from "../../theme-shared";

export const emberTablePresentation = createThemePresentation({
  hero: {
    fallbackClassName: "lumiere-hero-media lumiere-hero-fallback",
    frameClassName:
      "lumiere-hero--ember-table bg-[radial-gradient(ellipse_at_50%_18%,color-mix(in_srgb,var(--accent)_18%,transparent),transparent_52%),linear-gradient(180deg,var(--background),color-mix(in_srgb,var(--surface)_92%,var(--background)))]",
    imageClassName: "aspect-[16/10] w-full object-cover lg:min-h-[64dvh]",
    imageSizes: "(min-width: 1024px) 62vw, 100vw",
    innerClassName:
      "mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end",
    mediaClassName: "rounded-[var(--radius-sm)]",
    pretitleCopy: "Places are set",
  },
  rsvp: placeSettingRsvpPresentation,
});

export const emberTableEffects = {
  backdrop: { imageSource: "none", overlay: "none", type: "gradient" },
  dividerStyle: "hairline",
  frameStyle: "frameless",
  imageTreatment: "cinematic",
  ornaments: { density: "sparse", enabled: true, set: "table-axis" },
  texture: { policy: "fine-noise", strength: "subtle" },
} satisfies ThemeVisualEffects;
