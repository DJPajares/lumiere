import type { ThemeAssetManifest } from "../../contracts";

export const gardenLightAssets = {
  publicBasePath: "/themes/garden-light",
  slots: ["backdrop", "cover", "gallery", "ornament"],
} as const satisfies ThemeAssetManifest;
