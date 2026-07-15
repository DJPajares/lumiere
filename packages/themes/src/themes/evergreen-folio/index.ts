import type { ThemeModule } from "../../contracts";
import { evergreenFolioAssets } from "./assets";
import { evergreenFolioTheme } from "./definition";
import { evergreenFolioEffects } from "./visual";

export const evergreenFolioThemeModule = {
  assets: evergreenFolioAssets,
  definition: evergreenFolioTheme,
  effects: evergreenFolioEffects,
} satisfies ThemeModule;

export { evergreenFolioTheme } from "./definition";
export { evergreenFolioEffects, evergreenFolioPresentation } from "./visual";
export { evergreenFolioAssets } from "./assets";
