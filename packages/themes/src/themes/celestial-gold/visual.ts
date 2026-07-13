import type { ThemeVisualEffects } from "../../contracts";
import { createThemePresentation, editorialRsvpPresentation } from "../../theme-shared";

export const celestialGoldPresentation = createThemePresentation({
  hero: {
    fallbackClassName: "lumiere-hero-media lumiere-hero-fallback",
    frameClassName:
      "lumiere-hero--celestial-gold bg-[radial-gradient(circle_at_72%_28%,color-mix(in_srgb,var(--accent)_21%,transparent),transparent_24%),radial-gradient(circle_at_18%_80%,color-mix(in_srgb,var(--surface-muted)_64%,transparent),transparent_35%),var(--background)]",
    imageClassName: "aspect-[4/5] w-full object-cover lg:min-h-[68dvh]",
    imageSizes: "(min-width: 1024px) 50vw, 100vw",
    innerClassName: "mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-2 lg:items-center",
    mediaClassName:
      "order-first mx-auto w-full max-w-[26rem] rounded-[var(--radius-lg)] lg:order-none lg:max-w-none",
  },
  rsvp: editorialRsvpPresentation,
});

export const celestialGoldEffects = {
  backdrop: { imageSource: "cover", overlay: "strong", type: "image" },
  dividerStyle: "luminous",
  frameStyle: "gilded",
  imageTreatment: "nocturne",
  ornaments: { density: "balanced", enabled: true, set: "constellation" },
  texture: { policy: "fine-noise", strength: "subtle" },
} satisfies ThemeVisualEffects;
