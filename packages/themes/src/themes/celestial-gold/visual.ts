import type { ThemeVisualEffects } from "../../contracts";

export const celestialGoldEffects = {
  backdrop: { imageSource: "cover", overlay: "strong", type: "image" },
  dividerStyle: "luminous",
  frameStyle: "gilded",
  imageTreatment: "nocturne",
  ornaments: { density: "balanced", enabled: true, set: "constellation" },
  texture: { policy: "fine-noise", strength: "subtle" },
} satisfies ThemeVisualEffects;
