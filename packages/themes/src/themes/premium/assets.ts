import type { ThemeAssetManifest } from "../../contracts";

export const premiumAssets = {
  publicBasePath: "/themes/premium",
  slots: ["backdrop", "cover", "gallery", "ornament"],
} as const satisfies ThemeAssetManifest;
