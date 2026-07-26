import type { ThemeModule } from "../../contracts";
import { emberTableAssets } from "./assets";
import { emberTableTheme } from "./definition";
import { emberTableEffects } from "./visual";

export const emberTableThemeModule = {
  assets: emberTableAssets,
  definition: emberTableTheme,
  effects: emberTableEffects,
} satisfies ThemeModule;

export { emberTableAssets } from "./assets";
export { emberTableTheme } from "./definition";
export { emberTableEffects, emberTablePresentation } from "./visual";
