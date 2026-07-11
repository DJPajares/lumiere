import type { ThemeModule } from "../../contracts";
import { gardenLightAssets } from "./assets";
import { gardenLightTheme } from "./definition";
import { gardenLightEffects } from "./visual";

export const gardenLightThemeModule = {
  assets: gardenLightAssets,
  definition: gardenLightTheme,
  effects: gardenLightEffects,
} satisfies ThemeModule;

export { gardenLightTheme } from "./definition";
export { gardenLightEffects } from "./visual";
export { gardenLightAssets } from "./assets";
