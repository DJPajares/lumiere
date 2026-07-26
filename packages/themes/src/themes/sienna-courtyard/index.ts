import type { ThemeModule } from "../../contracts";
import { siennaCourtyardAssets } from "./assets";
import { siennaCourtyardTheme } from "./definition";
import { siennaCourtyardEffects } from "./visual";

export const siennaCourtyardThemeModule = {
  assets: siennaCourtyardAssets,
  definition: siennaCourtyardTheme,
  effects: siennaCourtyardEffects,
} satisfies ThemeModule;

export { siennaCourtyardAssets } from "./assets";
export { siennaCourtyardTheme } from "./definition";
export { siennaCourtyardEffects, siennaCourtyardPresentation } from "./visual";
