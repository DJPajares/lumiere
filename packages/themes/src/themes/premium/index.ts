import type { ThemeModule } from "../../contracts";
import { premiumAssets } from "./assets";
import { premiumTheme } from "./definition";
import { premiumEffects } from "./visual";

export const premiumThemeModule = {
  assets: premiumAssets,
  definition: premiumTheme,
  effects: premiumEffects,
} satisfies ThemeModule;

export { premiumTheme } from "./definition";
export { premiumEffects, premiumPresentation } from "./visual";
export { premiumAssets } from "./assets";
