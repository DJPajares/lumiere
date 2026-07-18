import type { ThemeDefinition, ThemeId, ThemeModule, ThemeVisualEffects } from "../contracts";
import { themeIds } from "../contracts";
import { celestialGoldThemeModule } from "./celestial-gold";
import { editorialIvoryThemeModule } from "./editorial-ivory";
import { gardenLightThemeModule } from "./garden-light";
import { kidsThemeModule } from "./kids";
import { lumiereDefaultThemeModule } from "./lumiere-default";
import { modernMinimalThemeModule } from "./modern-minimal";
import { neonSignalThemeModule } from "./neon-signal";
import { noelThemeModule } from "./noel";
import { noelV2ThemeModule } from "./noel-v2";
import { solarPopThemeModule } from "./solar-pop";
import { signatureThemeModule } from "./signature";
import { evergreenFolioThemeModule } from "./evergreen-folio";
import { porcelainBlueThemeModule } from "./porcelain-blue";
import { premiumThemeModule } from "./premium";
import { terrainLineThemeModule } from "./terrain-line";
import { tidalGlassThemeModule } from "./tidal-glass";
import { velvetDuskThemeModule } from "./velvet-dusk";

export * from "../contracts";
export * from "./celestial-gold";
export * from "./editorial-ivory";
export * from "./garden-light";
export * from "./kids";
export * from "./lumiere-default";
export * from "./modern-minimal";
export * from "./neon-signal";
export * from "./noel";
export * from "./noel-v2";
export * from "./signature";
export * from "./evergreen-folio";
export * from "./porcelain-blue";
export * from "./premium";
export * from "./solar-pop";
export * from "./terrain-line";
export * from "./tidal-glass";
export * from "./velvet-dusk";

export const themeModuleRegistry = {
  "lumiere-default": lumiereDefaultThemeModule,
  premium: premiumThemeModule,
  kids: kidsThemeModule,
  noel: noelThemeModule,
  "noel-v2": noelV2ThemeModule,
  signature: signatureThemeModule,
  "evergreen-folio": evergreenFolioThemeModule,
  "editorial-ivory": editorialIvoryThemeModule,
  "garden-light": gardenLightThemeModule,
  "modern-minimal": modernMinimalThemeModule,
  "celestial-gold": celestialGoldThemeModule,
  "velvet-dusk": velvetDuskThemeModule,
  "porcelain-blue": porcelainBlueThemeModule,
  "neon-signal": neonSignalThemeModule,
  "tidal-glass": tidalGlassThemeModule,
  "solar-pop": solarPopThemeModule,
  "terrain-line": terrainLineThemeModule,
} satisfies Record<ThemeId, ThemeModule>;

export const themeVisualEffects = Object.fromEntries(
  themeIds.map((themeId) => [themeId, themeModuleRegistry[themeId].effects]),
) as Record<ThemeId, ThemeVisualEffects>;

export const themeRegistry = Object.fromEntries(
  themeIds.map((themeId) => [themeId, themeModuleRegistry[themeId].definition]),
) as Record<ThemeId, ThemeDefinition>;

export const availableThemeIds = themeIds;
export const availableThemes: ThemeDefinition[] = Object.values(themeRegistry);
