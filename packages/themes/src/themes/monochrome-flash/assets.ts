import type { ThemeAssetManifest } from "../../contracts";

export const monochromeFlashAssets = {
  publicBasePath: "/themes/monochrome-flash",
  slots: ["backdrop", "cover", "gallery", "ornament"],
} as const satisfies ThemeAssetManifest;
