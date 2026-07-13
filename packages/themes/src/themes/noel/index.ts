import type { ThemeModule } from "../../contracts";
import { noelAssets } from "./assets";
import { noelTheme } from "./definition";
import { noelEffects } from "./visual";

export const noelThemeModule = {
  assets: noelAssets,
  definition: noelTheme,
  effects: noelEffects,
} satisfies ThemeModule;

export { noelTheme } from "./definition";
export { noelEffects, noelPresentation } from "./visual";
export { noelAssets } from "./assets";
