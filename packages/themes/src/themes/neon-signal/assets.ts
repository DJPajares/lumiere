import type { ThemeAssetManifest } from "../../contracts";

export const neonSignalAssets = {
  publicBasePath: "/themes/neon-signal",
  slots: ["backdrop", "cover", "gallery", "ornament"],
} as const satisfies ThemeAssetManifest;
