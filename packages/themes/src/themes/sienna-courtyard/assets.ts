import type { ThemeAssetManifest } from "../../contracts";

export const siennaCourtyardAssets = {
  publicBasePath: "/themes/sienna-courtyard",
  slots: ["backdrop", "cover", "gallery", "ornament"],
} as const satisfies ThemeAssetManifest;
