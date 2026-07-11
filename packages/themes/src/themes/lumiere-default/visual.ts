import type { ThemeVisualEffects } from "../../contracts";

export const lumiereDefaultEffects = {
  backdrop: { imageSource: "none", overlay: "none", type: "solid" },
  dividerStyle: "hairline",
  frameStyle: "soft",
  imageTreatment: "natural",
  ornaments: { density: "none", enabled: false, set: "none" },
  texture: { policy: "paper-grain", strength: "subtle" },
} satisfies ThemeVisualEffects;
