import type { ThemeAssetManifest } from "../../contracts";

export const emberTableAssets = {
  publicBasePath: "/themes/ember-table",
  slots: ["backdrop", "cover", "gallery", "ornament"],
} as const satisfies ThemeAssetManifest;
