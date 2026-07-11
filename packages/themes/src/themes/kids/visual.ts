import type { ThemeVisualEffects } from "../../contracts";

export const kidsEffects = {
  backdrop: { imageSource: "none", overlay: "none", type: "texture" },
  dividerStyle: "dotted",
  frameStyle: "playful",
  imageTreatment: "vibrant",
  ornaments: { density: "balanced", enabled: true, set: "confetti" },
  texture: { policy: "soft-speckle", strength: "visible" },
} satisfies ThemeVisualEffects;
