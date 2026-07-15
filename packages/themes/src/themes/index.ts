import type { ThemeDefinition, ThemeId, ThemeModule, ThemeVisualEffects } from "../contracts";
import { themeIds } from "../contracts";
import { celestialGoldThemeModule } from "./celestial-gold";
import { editorialIvoryThemeModule } from "./editorial-ivory";
import { gardenLightThemeModule } from "./garden-light";
import { kidsThemeModule } from "./kids";
import { lumiereDefaultThemeModule } from "./lumiere-default";
import { modernMinimalThemeModule } from "./modern-minimal";
import { noelThemeModule } from "./noel";
import { noelV2ThemeModule } from "./noel-v2";
import { evergreenFolioThemeModule } from "./evergreen-folio";
import { porcelainBlueThemeModule } from "./porcelain-blue";
import { premiumThemeModule } from "./premium";
import { velvetDuskThemeModule } from "./velvet-dusk";

export * from "../contracts";
export * from "./celestial-gold";
export * from "./editorial-ivory";
export * from "./garden-light";
export * from "./kids";
export * from "./lumiere-default";
export * from "./modern-minimal";
export * from "./noel";
export * from "./noel-v2";
export * from "./evergreen-folio";
export * from "./porcelain-blue";
export * from "./premium";
export * from "./velvet-dusk";

export const themeModuleRegistry = {
  "lumiere-default": lumiereDefaultThemeModule,
  premium: premiumThemeModule,
  kids: kidsThemeModule,
  noel: noelThemeModule,
  "noel-v2": noelV2ThemeModule,
  "evergreen-folio": evergreenFolioThemeModule,
  "editorial-ivory": editorialIvoryThemeModule,
  "garden-light": gardenLightThemeModule,
  "modern-minimal": modernMinimalThemeModule,
  "celestial-gold": celestialGoldThemeModule,
  "velvet-dusk": velvetDuskThemeModule,
  "porcelain-blue": porcelainBlueThemeModule,
} satisfies Record<ThemeId, ThemeModule>;

export const themeVisualEffects = Object.fromEntries(
  themeIds.map((themeId) => [themeId, themeModuleRegistry[themeId].effects]),
) as Record<ThemeId, ThemeVisualEffects>;

export const themeRegistry = Object.fromEntries(
  themeIds.map((themeId) => [themeId, themeModuleRegistry[themeId].definition]),
) as Record<ThemeId, ThemeDefinition>;

export const availableThemeIds = themeIds;
export const availableThemes: ThemeDefinition[] = Object.values(themeRegistry);
