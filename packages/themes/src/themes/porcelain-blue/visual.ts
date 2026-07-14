import type { ThemeVisualEffects } from "../../contracts";
import { createThemePresentation, editorialLedgerRsvpPresentation } from "../../theme-shared";

export const porcelainBluePresentation = createThemePresentation({
  hero: {
    fallbackClassName: "lumiere-hero-media lumiere-hero-fallback",
    frameClassName:
      "lumiere-hero--porcelain-blue bg-[radial-gradient(circle_at_14%_18%,color-mix(in_srgb,var(--accent)_13%,transparent),transparent_22%),linear-gradient(180deg,var(--background)_0%,color-mix(in_srgb,var(--surface)_82%,var(--background))_100%)]",
    imageClassName: "aspect-[16/10] w-full object-cover lg:min-h-[54dvh]",
    imageSizes: "(min-width: 1024px) 76vw, 100vw",
    innerClassName: "mx-auto grid w-full max-w-7xl justify-items-center gap-10 text-center",
    mediaClassName: "order-first w-full max-w-5xl rounded-[var(--radius-lg)]",
  },
  rsvp: editorialLedgerRsvpPresentation,
});

export const porcelainBlueEffects = {
  backdrop: { imageSource: "none", overlay: "none", type: "texture" },
  dividerStyle: "short-rule",
  frameStyle: "frosted",
  imageTreatment: "crisp",
  ornaments: { density: "balanced", enabled: true, set: "porcelain-rings" },
  texture: { policy: "paper-grain", strength: "subtle" },
} satisfies ThemeVisualEffects;
