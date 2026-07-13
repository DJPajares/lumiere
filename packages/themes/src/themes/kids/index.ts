import type { ThemeModule } from "../../contracts";
import { kidsAssets } from "./assets";
import { kidsTheme } from "./definition";
import { kidsEffects } from "./visual";

export const kidsThemeModule = {
  assets: kidsAssets,
  definition: kidsTheme,
  effects: kidsEffects,
} satisfies ThemeModule;

export { kidsTheme } from "./definition";
export { kidsEffects, kidsPresentation } from "./visual";
export { kidsAssets } from "./assets";
