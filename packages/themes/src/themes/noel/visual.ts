import type { ThemeVisualEffects } from "../../contracts";

export const noelEffects = {
  backdrop: { imageSource: "cover", overlay: "strong", type: "image" },
  dividerStyle: "luminous",
  frameStyle: "frosted",
  imageTreatment: "frosted",
  ornaments: { density: "sparse", enabled: true, set: "snowfall" },
  texture: { policy: "frost", strength: "subtle" },
} satisfies ThemeVisualEffects;
