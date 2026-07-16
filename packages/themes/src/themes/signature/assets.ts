import type { ThemeAssetManifest } from "../../contracts";

export const signatureAssets = {
  publicBasePath: "/themes/signature",
  slots: ["backdrop", "cover", "gallery", "ornament"],
} as const satisfies ThemeAssetManifest;
