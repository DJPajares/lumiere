import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "./globals.css";

const brandAssetVersion = "20260726";
const brandAsset = (path: string) => `${path}?v=${brandAssetVersion}`;

export const metadata: Metadata = {
  title: {
    default: "Lumiere Invite",
    template: "%s | Lumiere Invite",
  },
  description: "A luminous invitation and RSVP experience.",
  applicationName: "Lumiere Invite",
  manifest: brandAsset("/manifest.webmanifest"),
  icons: {
    icon: [
      { url: brandAsset("/favicon.ico"), type: "image/x-icon", sizes: "any" },
      { url: brandAsset("/icons/icon-192.png"), type: "image/png", sizes: "192x192" },
      { url: brandAsset("/icons/icon-512.png"), type: "image/png", sizes: "512x512" },
      {
        url: brandAsset("/icons/maskable-icon-192.png"),
        type: "image/png",
        sizes: "192x192",
      },
      {
        url: brandAsset("/icons/maskable-icon-512.png"),
        type: "image/png",
        sizes: "512x512",
      },
    ],
    shortcut: brandAsset("/favicon.ico"),
    apple: [{ url: brandAsset("/apple-touch-icon.png"), type: "image/png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Lumiere Invite",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    description: "A luminous invitation and RSVP experience.",
    siteName: "Lumiere Invite",
    title: "Lumiere Invite",
    type: "website",
  },
  robots: {
    follow: false,
    index: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#191510",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
