import type { ThemeAssetManifest } from "../../contracts";

export const velvetDuskAssets = {
  publicBasePath: "/themes/velvet-dusk",
  slots: ["backdrop", "cover", "gallery", "ornament"],
} as const satisfies ThemeAssetManifest;
