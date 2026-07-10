"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";

import { TooltipProvider } from "./tooltip";

export function DashboardUiProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" disableTransitionOnChange enableSystem>
      <TooltipProvider>{children}</TooltipProvider>
    </ThemeProvider>
  );
}
