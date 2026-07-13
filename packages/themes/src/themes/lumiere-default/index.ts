import type { ThemeModule } from "../../contracts";
import { lumiereDefaultAssets } from "./assets";
import { lumiereDefaultTheme } from "./definition";
import { lumiereDefaultEffects } from "./visual";

export const lumiereDefaultThemeModule = {
  assets: lumiereDefaultAssets,
  definition: lumiereDefaultTheme,
  effects: lumiereDefaultEffects,
} satisfies ThemeModule;

export { lumiereDefaultTheme } from "./definition";
export { lumiereDefaultEffects, lumiereDefaultPresentation } from "./visual";
export { lumiereDefaultAssets } from "./assets";
