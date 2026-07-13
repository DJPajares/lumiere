import type { ThemeDefinition, ThemeId, ThemeModule, ThemeVisualEffects } from "../contracts";
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

export const themeModuleRegistry = {
  "lumiere-default": lumiereDefaultThemeModule,
  premium: premiumThemeModule,
  kids: kidsThemeModule,
  noel: noelThemeModule,
  "editorial-ivory": editorialIvoryThemeModule,
  "garden-light": gardenLightThemeModule,
  "modern-minimal": modernMinimalThemeModule,
  "celestial-gold": celestialGoldThemeModule,
} satisfies Record<ThemeId, ThemeModule>;

export const themeVisualEffects = Object.fromEntries(
  themeIds.map((themeId) => [themeId, themeModuleRegistry[themeId].effects]),
) as Record<ThemeId, ThemeVisualEffects>;

export const themeRegistry = Object.fromEntries(
  themeIds.map((themeId) => [themeId, themeModuleRegistry[themeId].definition]),
) as Record<ThemeId, ThemeDefinition>;

export const availableThemeIds = themeIds;
export const availableThemes: ThemeDefinition[] = Object.values(themeRegistry);
