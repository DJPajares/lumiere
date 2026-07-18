import type { ThemeAssetManifest } from "../../contracts";

export const solarPopAssets = {
  publicBasePath: "/themes/solar-pop",
  slots: ["backdrop", "cover", "gallery", "ornament"],
} as const satisfies ThemeAssetManifest;
