import type { ThemeModule } from "../../contracts";
import { porcelainBlueAssets } from "./assets";
import { porcelainBlueTheme } from "./definition";
import { porcelainBlueEffects } from "./visual";

export const porcelainBlueThemeModule = {
  assets: porcelainBlueAssets,
  definition: porcelainBlueTheme,
  effects: porcelainBlueEffects,
} satisfies ThemeModule;

export { porcelainBlueAssets } from "./assets";
export { porcelainBlueTheme } from "./definition";
export { porcelainBlueEffects, porcelainBluePresentation } from "./visual";
