import type { ThemeModule } from "../../contracts";
import { solarPopAssets } from "./assets";
import { solarPopTheme } from "./definition";
import { solarPopEffects } from "./visual";

export const solarPopThemeModule = {
  assets: solarPopAssets,
  definition: solarPopTheme,
  effects: solarPopEffects,
} satisfies ThemeModule;

export { solarPopAssets } from "./assets";
export { solarPopTheme } from "./definition";
export { solarPopEffects, solarPopPresentation } from "./visual";
