import type { ThemeAssetManifest } from "../../contracts";

export const porcelainBlueAssets = {
  publicBasePath: "/themes/porcelain-blue",
  slots: ["backdrop", "cover", "gallery", "ornament"],
} as const satisfies ThemeAssetManifest;
