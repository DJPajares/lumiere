import type { ThemeModule } from "../../contracts";
import { noelV2Assets } from "./assets";
import { noelV2Theme } from "./definition";
import { noelV2Effects } from "./visual";

export const noelV2ThemeModule = {
  assets: noelV2Assets,
  definition: noelV2Theme,
  effects: noelV2Effects,
} satisfies ThemeModule;

export { noelV2Theme } from "./definition";
export { noelV2Effects, noelV2Presentation } from "./visual";
export { noelV2Assets } from "./assets";
