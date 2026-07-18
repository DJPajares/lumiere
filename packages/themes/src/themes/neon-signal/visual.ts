import type { ThemeVisualEffects } from "../../contracts";
import { checkInConsoleRsvpPresentation, createThemePresentation } from "../../theme-shared";

export const neonSignalPresentation = createThemePresentation({
  hero: {
    fallbackClassName: "lumiere-hero-media lumiere-hero-fallback",
    frameClassName:
      "lumiere-hero--neon-signal bg-[radial-gradient(circle_at_82%_16%,color-mix(in_srgb,var(--accent)_16%,transparent),transparent_30%),linear-gradient(125deg,var(--background),color-mix(in_srgb,var(--surface)_86%,var(--background)))]",
    imageClassName: "aspect-[5/6] w-full object-cover sm:aspect-[4/5] lg:min-h-[72dvh]",
    imageSizes: "(min-width: 1024px) 46vw, 100vw",
    innerClassName:
      "mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center",
    mediaClassName: "rounded-[var(--radius-lg)]",
    pretitleCopy: "Live transmission",
  },
  rsvp: checkInConsoleRsvpPresentation,
});

export const neonSignalEffects = {
  backdrop: { imageSource: "none", overlay: "none", type: "solid" },
  dividerStyle: "signal-track",
  frameStyle: "edge-lit",
  imageTreatment: "edge-lit",
  ornaments: { density: "balanced", enabled: true, set: "signal-grid" },
  texture: { policy: "fine-noise", strength: "subtle" },
} satisfies ThemeVisualEffects;
