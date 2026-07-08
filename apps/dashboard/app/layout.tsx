import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "Lumiere Dashboard",
  description: "Event management for Lumiere hosts.",
  applicationName: "Lumiere Dashboard",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icons/lumiere-dashboard-mark.svg", type: "image/svg+xml", sizes: "any" }],
    shortcut: "/icons/lumiere-dashboard-mark.svg",
    apple: "/icons/lumiere-dashboard-mark.svg",
  },
  appleWebApp: {
    capable: true,
    title: "Lumiere Dashboard",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
