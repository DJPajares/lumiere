import type { ThemeModule } from "../../contracts";
import { velvetDuskAssets } from "./assets";
import { velvetDuskTheme } from "./definition";
import { velvetDuskEffects } from "./visual";

export const velvetDuskThemeModule = {
  assets: velvetDuskAssets,
  definition: velvetDuskTheme,
  effects: velvetDuskEffects,
} satisfies ThemeModule;

export { velvetDuskAssets } from "./assets";
export { velvetDuskTheme } from "./definition";
export { velvetDuskEffects, velvetDuskPresentation } from "./visual";
