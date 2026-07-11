import type { ThemeAssetManifest } from "../../contracts";

export const editorialIvoryAssets = {
  publicBasePath: "/themes/editorial-ivory",
  slots: ["backdrop", "cover", "gallery", "ornament"],
} as const satisfies ThemeAssetManifest;
