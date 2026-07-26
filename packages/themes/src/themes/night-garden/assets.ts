import type { ThemeAssetManifest } from "../../contracts";

export const nightGardenAssets = {
  publicBasePath: "/themes/night-garden",
  slots: ["backdrop", "cover", "gallery", "ornament"],
} as const satisfies ThemeAssetManifest;
