import type { ThemeVisualEffects } from "../../contracts";

export const premiumEffects = {
  backdrop: { imageSource: "none", overlay: "soft", type: "gradient" },
  dividerStyle: "luminous",
  frameStyle: "double-line",
  imageTreatment: "cinematic",
  ornaments: { density: "balanced", enabled: true, set: "candlelight" },
  texture: { policy: "fine-noise", strength: "subtle" },
} satisfies ThemeVisualEffects;
