import type { ThemeVisualEffects } from "../../contracts";

export const modernMinimalEffects = {
  backdrop: { imageSource: "none", overlay: "none", type: "solid" },
  dividerStyle: "hairline",
  frameStyle: "frameless",
  imageTreatment: "crisp",
  ornaments: { density: "none", enabled: false, set: "none" },
  texture: { policy: "none", strength: "none" },
} satisfies ThemeVisualEffects;
