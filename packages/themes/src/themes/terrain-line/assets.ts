import type { ThemeAssetManifest } from "../../contracts";

export const terrainLineAssets = {
  publicBasePath: "/themes/terrain-line",
  slots: ["backdrop", "cover", "gallery", "ornament"],
} as const satisfies ThemeAssetManifest;
