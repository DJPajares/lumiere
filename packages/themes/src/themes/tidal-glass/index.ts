import type { ThemeModule } from "../../contracts";
import { tidalGlassAssets } from "./assets";
import { tidalGlassTheme } from "./definition";
import { tidalGlassEffects } from "./visual";

export const tidalGlassThemeModule = {
  assets: tidalGlassAssets,
  definition: tidalGlassTheme,
  effects: tidalGlassEffects,
} satisfies ThemeModule;

export { tidalGlassAssets } from "./assets";
export { tidalGlassTheme } from "./definition";
export { tidalGlassEffects, tidalGlassPresentation } from "./visual";
