import type { ThemeModule } from "../../contracts";
import { modernMinimalAssets } from "./assets";
import { modernMinimalTheme } from "./definition";
import { modernMinimalEffects } from "./visual";

export const modernMinimalThemeModule = {
  assets: modernMinimalAssets,
  definition: modernMinimalTheme,
  effects: modernMinimalEffects,
} satisfies ThemeModule;

export { modernMinimalTheme } from "./definition";
export { modernMinimalEffects, modernMinimalPresentation } from "./visual";
export { modernMinimalAssets } from "./assets";
