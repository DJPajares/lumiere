"use client";

import { Badge } from "@lumiere/dashboard-ui/components/badge";
import { Tabs, TabsList, TabsTrigger } from "@lumiere/dashboard-ui/components/tabs";
import type { ThemeDefinition } from "@lumiere/themes";
import { useEffect, useState } from "react";

import {
  InviteThemePreviewRenderer,
  type InvitePreviewMode,
  type InvitePreviewViewport,
} from "./theme-preview-renderer";

export function ThemeExpandedPreview({
  fallbackReason,
  initialMode,
  theme,
}: {
  fallbackReason?: string;
  initialMode: InvitePreviewMode;
  theme: ThemeDefinition;
}) {
  const [mode, setMode] = useState<InvitePreviewMode>(
    initialMode === "dark" && theme.tokens.dark ? "dark" : "light",
  );
  const [viewport, setViewport] = useState<InvitePreviewViewport>("desktop");
  const availableModes: InvitePreviewMode[] = theme.tokens.dark ? ["light", "dark"] : ["light"];

  useEffect(() => {
    setMode(initialMode === "dark" && theme.tokens.dark ? "dark" : "light");
    setViewport("desktop");
  }, [initialMode, theme]);

  return (
    <div className="grid gap-4" data-expanded-theme-preview={theme.id}>
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Invite renderer</Badge>
          <Badge variant="outline">{theme.composition.visualSystem.compositionMap}</Badge>
          {fallbackReason ? <Badge variant="destructive">Fallback preview</Badge> : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <Tabs
            aria-label="Preview viewport"
            onValueChange={(value) => setViewport(value as InvitePreviewViewport)}
            value={viewport}
          >
            <TabsList>
              <TabsTrigger value="mobile">Mobile</TabsTrigger>
              <TabsTrigger value="desktop">Desktop</TabsTrigger>
            </TabsList>
          </Tabs>
          <Tabs
            aria-label="Preview color variant"
            onValueChange={(value) => setMode(value as InvitePreviewMode)}
            value={mode}
          >
            <TabsList>
              {availableModes.map((item) => (
                <TabsTrigger key={item} value={item}>
                  {item === "light" ? "Light" : "Dark"}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="overflow-auto rounded-lg border border-border bg-muted/50 p-3 sm:p-5">
        <InviteThemePreviewRenderer
          fallbackReason={fallbackReason}
          mode={mode}
          theme={theme}
          viewport={viewport}
        />
      </div>
    </div>
  );
}
