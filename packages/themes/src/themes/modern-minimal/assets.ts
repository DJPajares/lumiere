import type { ThemeAssetManifest } from "../../contracts";

export const modernMinimalAssets = {
  publicBasePath: "/themes/modern-minimal",
  slots: ["backdrop", "cover", "gallery", "ornament"],
} as const satisfies ThemeAssetManifest;
