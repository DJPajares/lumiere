import type { ThemeModule } from "../../contracts";
import { nightGardenAssets } from "./assets";
import { nightGardenTheme } from "./definition";
import { nightGardenEffects } from "./visual";

export const nightGardenThemeModule = {
  assets: nightGardenAssets,
  definition: nightGardenTheme,
  effects: nightGardenEffects,
} satisfies ThemeModule;

export { nightGardenAssets } from "./assets";
export { nightGardenTheme } from "./definition";
export { nightGardenEffects, nightGardenPresentation } from "./visual";
