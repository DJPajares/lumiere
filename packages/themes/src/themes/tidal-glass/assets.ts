import type { ThemeAssetManifest } from "../../contracts";

export const tidalGlassAssets = {
  publicBasePath: "/themes/tidal-glass",
  slots: ["backdrop", "cover", "gallery", "ornament"],
} as const satisfies ThemeAssetManifest;
