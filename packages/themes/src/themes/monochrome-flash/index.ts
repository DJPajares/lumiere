import type { ThemeModule } from "../../contracts";
import { monochromeFlashAssets } from "./assets";
import { monochromeFlashTheme } from "./definition";
import { monochromeFlashEffects } from "./visual";

export const monochromeFlashThemeModule = {
  assets: monochromeFlashAssets,
  definition: monochromeFlashTheme,
  effects: monochromeFlashEffects,
} satisfies ThemeModule;

export { monochromeFlashAssets } from "./assets";
export { monochromeFlashTheme } from "./definition";
export { monochromeFlashEffects, monochromeFlashPresentation } from "./visual";
