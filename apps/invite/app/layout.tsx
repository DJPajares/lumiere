import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Lumiere Invite",
    template: "%s | Lumiere Invite",
  },
  description: "A luminous invitation and RSVP experience.",
  applicationName: "Lumiere Invite",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/lumiere-mark.svg", type: "image/svg+xml", sizes: "any" },
      { url: "/favicon.ico", type: "image/x-icon", sizes: "any" },
      { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icons/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/logo.png", type: "image/png", sizes: "1024x1024" }],
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

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
