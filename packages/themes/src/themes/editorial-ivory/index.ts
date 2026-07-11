import type { ThemeModule } from "../../contracts";
import { editorialIvoryAssets } from "./assets";
import { editorialIvoryTheme } from "./definition";
import { editorialIvoryEffects } from "./visual";

export const editorialIvoryThemeModule = {
  assets: editorialIvoryAssets,
  definition: editorialIvoryTheme,
  effects: editorialIvoryEffects,
} satisfies ThemeModule;

export { editorialIvoryTheme } from "./definition";
export { editorialIvoryEffects } from "./visual";
export { editorialIvoryAssets } from "./assets";
