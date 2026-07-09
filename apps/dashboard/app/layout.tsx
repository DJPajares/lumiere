import type { Metadata } from "next";
import type { ReactNode } from "react";

import { DashboardAuthProvider } from "../auth/dashboard-auth-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lumiere Dashboard",
  description: "Event management for Lumiere hosts.",
  applicationName: "Lumiere Dashboard",
  manifest: "/manifest.webmanifest",
  icons: {
    // icon: [{ url: "/icons/lumiere-dashboard-mark.svg", type: "image/svg+xml", sizes: "any" }],
    // shortcut: "/icons/lumiere-dashboard-mark.svg",
    // apple: "/icons/lumiere-dashboard-mark.svg",
    icon: [
      { url: "/favicon.ico", type: "image/x-icon", sizes: "any" },
      { url: "/logo.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/logo.png",
    apple: "/logo.png",
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
      <body>
        <DashboardAuthProvider>{children}</DashboardAuthProvider>
      </body>
    </html>
  );
}
