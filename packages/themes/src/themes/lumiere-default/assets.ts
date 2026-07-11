import type { ThemeAssetManifest } from "../../contracts";

export const lumiereDefaultAssets = {
  publicBasePath: "/themes/lumiere-default",
  slots: ["backdrop", "cover", "gallery", "ornament"],
} as const satisfies ThemeAssetManifest;
