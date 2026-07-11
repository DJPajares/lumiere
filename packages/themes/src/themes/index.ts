import type { ThemeDefinition, ThemeId, ThemeVisualEffects } from "../contracts";
import { themeIds } from "../contracts";
import { celestialGoldThemeModule } from "./celestial-gold";
import { editorialIvoryThemeModule } from "./editorial-ivory";
import { gardenLightThemeModule } from "./garden-light";
import { kidsThemeModule } from "./kids";
import { lumiereDefaultThemeModule } from "./lumiere-default";
import { modernMinimalThemeModule } from "./modern-minimal";
import { noelThemeModule } from "./noel";
import { premiumThemeModule } from "./premium";

export * from "../contracts";
export * from "./celestial-gold";
export * from "./editorial-ivory";
export * from "./garden-light";
export * from "./kids";
export * from "./lumiere-default";
export * from "./modern-minimal";
export * from "./noel";
export * from "./premium";

export const themeVisualEffects = {
  "lumiere-default": lumiereDefaultThemeModule.effects,
  premium: premiumThemeModule.effects,
  kids: kidsThemeModule.effects,
  noel: noelThemeModule.effects,
  "editorial-ivory": editorialIvoryThemeModule.effects,
  "garden-light": gardenLightThemeModule.effects,
  "modern-minimal": modernMinimalThemeModule.effects,
  "celestial-gold": celestialGoldThemeModule.effects,
} satisfies Record<ThemeId, ThemeVisualEffects>;

export const themeRegistry = {
  "lumiere-default": lumiereDefaultThemeModule.definition,
  premium: premiumThemeModule.definition,
  kids: kidsThemeModule.definition,
  noel: noelThemeModule.definition,
  "editorial-ivory": editorialIvoryThemeModule.definition,
  "garden-light": gardenLightThemeModule.definition,
  "modern-minimal": modernMinimalThemeModule.definition,
  "celestial-gold": celestialGoldThemeModule.definition,
} satisfies Record<ThemeId, ThemeDefinition>;

export const availableThemeIds = themeIds;
export const availableThemes: ThemeDefinition[] = Object.values(themeRegistry);
