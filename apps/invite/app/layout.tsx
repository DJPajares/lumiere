import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "Lumiere Invite",
  description: "A luminous invitation and RSVP experience.",
  applicationName: "Lumiere Invite",
  manifest: "/manifest.webmanifest",
  icons: {
    // icon: [{ url: "/icons/lumiere-mark.svg", type: "image/svg+xml", sizes: "any" }],
    // shortcut: "/icons/lumiere-mark.svg",
    // apple: "/icons/lumiere-mark.svg",
    icon: [
      { url: "/favicon.ico", type: "image/x-icon", sizes: "any" },
      { url: "/logo.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  appleWebApp: {
    capable: true,
    title: "Lumiere Invite",
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
