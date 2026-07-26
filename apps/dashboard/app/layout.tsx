import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { DashboardUiProvider } from "@lumiere/dashboard-ui/components/dashboard-ui-provider";
import { Toaster } from "@lumiere/dashboard-ui/components/sonner";

import { DashboardAuthProvider } from "../auth/dashboard-auth-provider";
import "./globals.css";

const brandAssetVersion = "20260726";
const brandAsset = (path: string) => `${path}?v=${brandAssetVersion}`;

export const metadata: Metadata = {
  title: {
    default: "Lumiere Dashboard",
    template: "%s | Lumiere Dashboard",
  },
  description: "Event management for Lumiere hosts.",
  applicationName: "Lumiere Dashboard",
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
    title: "Lumiere Dashboard",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    description: "Event management for Lumiere hosts.",
    siteName: "Lumiere Dashboard",
    title: "Lumiere Dashboard",
    type: "website",
  },
  robots: {
    follow: false,
    index: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#F1EDE5",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <DashboardUiProvider>
          <DashboardAuthProvider>{children}</DashboardAuthProvider>
          <Toaster closeButton position="top-right" />
        </DashboardUiProvider>
      </body>
    </html>
  );
}
