import type { ThemeModule } from "../../contracts";
import { neonSignalAssets } from "./assets";
import { neonSignalTheme } from "./definition";
import { neonSignalEffects } from "./visual";

export const neonSignalThemeModule = {
  assets: neonSignalAssets,
  definition: neonSignalTheme,
  effects: neonSignalEffects,
} satisfies ThemeModule;

export { neonSignalAssets } from "./assets";
export { neonSignalTheme } from "./definition";
export { neonSignalEffects, neonSignalPresentation } from "./visual";
