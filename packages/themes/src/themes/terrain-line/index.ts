import type { ThemeModule } from "../../contracts";
import { terrainLineAssets } from "./assets";
import { terrainLineTheme } from "./definition";
import { terrainLineEffects } from "./visual";

export const terrainLineThemeModule = {
  assets: terrainLineAssets,
  definition: terrainLineTheme,
  effects: terrainLineEffects,
} satisfies ThemeModule;

export { terrainLineAssets } from "./assets";
export { terrainLineTheme } from "./definition";
export { terrainLineEffects, terrainLinePresentation } from "./visual";
