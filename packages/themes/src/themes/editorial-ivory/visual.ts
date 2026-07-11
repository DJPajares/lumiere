import type { ThemeVisualEffects } from "../../contracts";

export const editorialIvoryEffects = {
  backdrop: { imageSource: "none", overlay: "none", type: "editorial-whitespace" },
  dividerStyle: "short-rule",
  frameStyle: "offset",
  imageTreatment: "desaturated",
  ornaments: { density: "sparse", enabled: true, set: "editorial-rules" },
  texture: { policy: "paper-grain", strength: "subtle" },
} satisfies ThemeVisualEffects;
