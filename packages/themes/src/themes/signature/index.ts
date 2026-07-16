import type { ThemeModule } from "../../contracts";
import { signatureAssets } from "./assets";
import { signatureTheme } from "./definition";
import { signatureEffects } from "./visual";

export const signatureThemeModule = {
  assets: signatureAssets,
  definition: signatureTheme,
  effects: signatureEffects,
} satisfies ThemeModule;

export { signatureTheme } from "./definition";
export { signatureEffects, signaturePresentation } from "./visual";
export { signatureAssets } from "./assets";
