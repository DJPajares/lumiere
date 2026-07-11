import type { ThemeAssetManifest } from "../../contracts";

export const celestialGoldAssets = {
  publicBasePath: "/themes/celestial-gold",
  slots: ["backdrop", "cover", "gallery", "ornament"],
} as const satisfies ThemeAssetManifest;
