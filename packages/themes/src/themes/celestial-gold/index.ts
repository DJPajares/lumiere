import type { ThemeModule } from "../../contracts";
import { celestialGoldAssets } from "./assets";
import { celestialGoldTheme } from "./definition";
import { celestialGoldEffects } from "./visual";

export const celestialGoldThemeModule = {
  assets: celestialGoldAssets,
  definition: celestialGoldTheme,
  effects: celestialGoldEffects,
} satisfies ThemeModule;

export { celestialGoldTheme } from "./definition";
export { celestialGoldEffects } from "./visual";
export { celestialGoldAssets } from "./assets";
