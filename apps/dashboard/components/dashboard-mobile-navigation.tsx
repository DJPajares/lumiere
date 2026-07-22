"use client";

import {
  Button,
  MenuIcon,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@lumiere/dashboard-ui";
import type { Event } from "@lumiere/types";
import Link from "next/link";

import { DashboardBrandLockup } from "./dashboard-brand";
import {
  DashboardEventSwitcher,
  type DashboardEventSwitcherState,
} from "./dashboard-event-switcher";
import { DashboardSelectedEventSummary } from "./dashboard-navigation-event-context";
import { DashboardMobileNavigationLinks } from "./dashboard-navigation-links";
import type { DashboardNavigationItem, DashboardWorkspaceContext } from "./dashboard-navigation";

export function DashboardMobileNavigation({
  context,
  currentEvent,
  eventListState,
  onOpenChange,
  onRetry,
  open,
  workspaceItems,
}: {
  context: DashboardWorkspaceContext;
  currentEvent?: Event;
  eventListState: DashboardEventSwitcherState;
  onOpenChange: (open: boolean) => void;
  onRetry: () => void;
  open: boolean;
  workspaceItems: DashboardNavigationItem[];
}) {
  const closeNavigation = () => onOpenChange(false);

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetTrigger
        render={
          <Button
            aria-label="Open dashboard navigation"
            className="lg:hidden"
            data-breakpoint="mobile-tablet"
            size="icon-lg"
            variant="ghost"
          />
        }
      >
        <MenuIcon data-icon="inline-start" />
      </SheetTrigger>
      <SheetContent
        className="w-[min(23rem,calc(100vw-2rem))] max-w-none gap-0 duration-300 ease-out data-[side=left]:data-ending-style:-translate-x-full data-[side=left]:data-starting-style:-translate-x-full motion-reduce:transition-none sm:max-w-none"
        showCloseButton={false}
        side="left"
      >
        <SheetHeader className="px-5 pt-5 pb-4 text-left">
          <Link
            aria-label="Lumiere Dashboard home"
            className="mb-3 w-fit rounded-lg text-sm font-semibold text-primary outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            href="/"
            onClick={closeNavigation}
          >
            <DashboardBrandLockup compact />
          </Link>
          <SheetTitle>Dashboard navigation</SheetTitle>
          <SheetDescription>Selected event workspace navigation.</SheetDescription>
          <div className="mt-4 rounded-xl bg-muted/60 p-3">
            <DashboardSelectedEventSummary
              context={context}
              currentEvent={currentEvent}
              eventListState={eventListState}
            />
          </div>
          <DashboardEventSwitcher
            className="mt-3 w-full justify-between"
            context={context}
            eventListState={eventListState}
            mobile
            onNavigate={closeNavigation}
            onRetry={onRetry}
          />
        </SheetHeader>
        <Separator />
        <DashboardMobileNavigationLinks
          onNavigate={closeNavigation}
          workspaceItems={workspaceItems}
        />
      </SheetContent>
    </Sheet>
  );
}
