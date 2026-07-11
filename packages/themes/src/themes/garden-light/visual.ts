import type { ThemeVisualEffects } from "../../contracts";

export const gardenLightEffects = {
  backdrop: { imageSource: "none", overlay: "soft", type: "gradient" },
  dividerStyle: "short-rule",
  frameStyle: "organic",
  imageTreatment: "sun-washed",
  ornaments: { density: "balanced", enabled: true, set: "botanical" },
  texture: { policy: "soft-speckle", strength: "subtle" },
} satisfies ThemeVisualEffects;
