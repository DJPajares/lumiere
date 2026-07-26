import type { ThemeVisualEffects } from "../../contracts";
import { createThemePresentation, guestListRsvpPresentation } from "../../theme-shared";

export const monochromeFlashPresentation = createThemePresentation({
  hero: {
    fallbackClassName: "lumiere-hero-media lumiere-hero-fallback",
    frameClassName:
      "lumiere-hero--monochrome-flash bg-[linear-gradient(105deg,var(--background)_0_66%,color-mix(in_srgb,var(--accent)_88%,var(--background))_66%_68%,var(--surface)_68%)]",
    imageClassName: "aspect-[4/5] w-full object-cover sm:aspect-[3/4] lg:min-h-[76dvh]",
    imageSizes: "(min-width: 1024px) 48vw, 100vw",
    innerClassName:
      "mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center",
    mediaClassName: "rounded-none",
    pretitleCopy: "Frame 01 · Guest list open",
  },
  rsvp: guestListRsvpPresentation,
});

export const monochromeFlashEffects = {
  backdrop: { imageSource: "none", overlay: "strong", type: "solid" },
  dividerStyle: "dotted",
  frameStyle: "double-line",
  imageTreatment: "desaturated",
  ornaments: { density: "balanced", enabled: true, set: "contact-sheet" },
  texture: { policy: "fine-noise", strength: "visible" },
} satisfies ThemeVisualEffects;
