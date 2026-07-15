import type { ThemeAssetManifest } from "../../contracts";

export const evergreenFolioAssets = {
  publicBasePath: "/themes/evergreen-folio",
  slots: ["backdrop", "cover", "gallery", "ornament"],
} as const satisfies ThemeAssetManifest;
