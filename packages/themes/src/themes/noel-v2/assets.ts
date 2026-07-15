import type { ThemeAssetManifest } from "../../contracts";

export const noelV2Assets = {
  publicBasePath: "/themes/noel-v2",
  slots: ["backdrop", "cover", "gallery", "ornament"],
} as const satisfies ThemeAssetManifest;
