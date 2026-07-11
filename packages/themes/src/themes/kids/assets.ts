import type { ThemeAssetManifest } from "../../contracts";

export const kidsAssets = {
  publicBasePath: "/themes/kids",
  slots: ["backdrop", "cover", "gallery", "ornament"],
} as const satisfies ThemeAssetManifest;
