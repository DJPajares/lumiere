import type { ThemeVisualEffects } from "../../contracts";
import { createThemePresentation, playfulRsvpPresentation } from "../../theme-shared";

export const kidsPresentation = createThemePresentation({
  hero: {
    frameClassName:
      "lumiere-hero--kids bg-[radial-gradient(circle_at_15%_18%,color-mix(in_srgb,var(--accent)_18%,transparent),transparent_24%),linear-gradient(180deg,var(--surface),var(--background))]",
    imageClassName: "aspect-[4/3] w-full object-cover sm:aspect-[1/1]",
    imageSizes: "min(22rem, 100vw)",
    innerClassName: "mx-auto grid w-full max-w-4xl gap-7 text-center",
    mediaClassName: "mx-auto w-full max-w-[22rem] rounded-[var(--radius-lg)]",
  },
  rsvp: playfulRsvpPresentation,
});

export const kidsEffects = {
  backdrop: { imageSource: "none", overlay: "none", type: "texture" },
  dividerStyle: "dotted",
  frameStyle: "playful",
  imageTreatment: "vibrant",
  ornaments: { density: "balanced", enabled: true, set: "confetti" },
  texture: { policy: "soft-speckle", strength: "visible" },
} satisfies ThemeVisualEffects;
