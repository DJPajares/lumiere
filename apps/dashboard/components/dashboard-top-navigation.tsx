"use client";

import { Separator } from "@lumiere/dashboard-ui";
import { cn } from "@lumiere/dashboard-ui/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";

import { DashboardBrandLockup } from "./dashboard-brand";
import { DashboardEventSwitcher } from "./dashboard-event-switcher";
import { DashboardMobileNavigation } from "./dashboard-mobile-navigation";
import { DashboardSelectedEventSummary } from "./dashboard-navigation-event-context";
import { DashboardDesktopNavigation } from "./dashboard-navigation-links";
import { DashboardTopBarControls } from "./dashboard-top-bar-controls";
import { useDashboardNavigationShell } from "./use-dashboard-navigation-shell";
import { useTopBarVisibility } from "./use-top-bar-visibility";

export const DASHBOARD_DESKTOP_QUERY = "(min-width: 1024px)";

type DashboardTopNavigationProps = {
  activePath: string;
};

export function DashboardTopNavigation({ activePath }: DashboardTopNavigationProps) {
  const { currentEvent, eventListState, navigation, retryEventList } =
    useDashboardNavigationShell(activePath);
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const { isVisible, prefersReducedMotion } = useTopBarVisibility(mobileNavigationOpen);

  useEffect(() => {
    const desktopQuery = window.matchMedia(DASHBOARD_DESKTOP_QUERY);
    const closeMobileNavigationAtDesktop = () => {
      if (desktopQuery.matches) {
        setMobileNavigationOpen(false);
      }
    };

    closeMobileNavigationAtDesktop();
    desktopQuery.addEventListener("change", closeMobileNavigationAtDesktop);

    return () => desktopQuery.removeEventListener("change", closeMobileNavigationAtDesktop);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40",
        !prefersReducedMotion && "transition-[transform,opacity] duration-200 ease-out",
        isVisible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-full opacity-0",
      )}
      data-top-bar-state={isVisible ? "visible" : "hidden"}
    >
      <div className="w-full bg-background/95 supports-backdrop-filter:bg-background/85 supports-backdrop-filter:backdrop-blur-md">
        <div className="mx-auto max-w-7xl grid min-h-14 grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-2 px-4 sm:px-6 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-3 lg:px-8">
          <DashboardMobileNavigation
            context={navigation.context}
            currentEvent={currentEvent}
            eventListState={eventListState}
            onOpenChange={setMobileNavigationOpen}
            onRetry={retryEventList}
            open={mobileNavigationOpen}
            workspaceItems={navigation.workspace}
          />

          <Link
            aria-label="Lumiere Dashboard"
            className="shrink-0 rounded-lg text-sm font-semibold text-primary outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            href="/"
          >
            <DashboardBrandLockup compact />
          </Link>

          <DashboardDesktopNavigation workspaceItems={navigation.workspace} />

          <DashboardTopBarControls
            className="ml-auto"
            eventId={navigation.context.eventId}
            eventSwitcher={
              <DashboardEventSwitcher
                compact
                context={navigation.context}
                eventListState={eventListState}
                onRetry={retryEventList}
              />
            }
          />
        </div>

        <Separator className="hidden lg:block" />

        <div
          className="mx-auto max-w-7xl hidden min-h-12 items-center gap-4 px-8 lg:flex"
          data-slot="desktop-event-context"
        >
          <div className="min-w-0 flex-1">
            <DashboardSelectedEventSummary
              context={navigation.context}
              currentEvent={currentEvent}
              eventListState={eventListState}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
