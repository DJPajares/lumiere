import type { ThemeAssetManifest } from "../../contracts";

export const noelAssets = {
  publicBasePath: "/themes/noel",
  slots: ["backdrop", "cover", "gallery", "ornament"],
} as const satisfies ThemeAssetManifest;
