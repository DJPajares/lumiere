"use client";

import {
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@lumiere/dashboard-ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useDashboardAuth } from "../auth/dashboard-auth-provider";
import { DashboardBrandLockup } from "./dashboard-brand";
import {
  DashboardEventSwitcher,
  type DashboardEventSwitcherState,
} from "./dashboard-event-switcher";
import { type DashboardNavigationItem, getDashboardNavigation } from "./dashboard-navigation";
import { DashboardTopBarControls } from "./dashboard-top-bar-controls";
import { useTopBarVisibility } from "./use-top-bar-visibility";

export const DASHBOARD_DESKTOP_QUERY = "(min-width: 768px)";

type DashboardTopNavigationProps = {
  activePath: string;
};

export function DashboardTopNavigation({ activePath }: DashboardTopNavigationProps) {
  const router = useRouter();
  const { apiClient, status } = useDashboardAuth();
  const navigation = getDashboardNavigation(activePath);
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const [eventListState, setEventListState] = useState<DashboardEventSwitcherState>({
    error: null,
    events: [],
    status: "idle",
  });
  const [eventListRevision, setEventListRevision] = useState(0);
  const { isVisible, prefersReducedMotion } = useTopBarVisibility(mobileNavigationOpen);

  useEffect(() => {
    if (status !== "authenticated" || !apiClient) {
      setEventListState({ error: null, events: [], status: "idle" });
      return;
    }

    let isMounted = true;
    setEventListState((current) => ({ ...current, error: null, status: "loading" }));

    apiClient
      .listEvents()
      .then(({ events }) => {
        if (isMounted) {
          setEventListState({ error: null, events, status: "ready" });
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setEventListState({
            error: error instanceof Error ? error.message : "Unable to load your events.",
            events: [],
            status: "error",
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [apiClient, eventListRevision, status]);

  useEffect(() => {
    if (
      eventListState.status !== "ready" ||
      !navigation.context.eventId ||
      eventListState.events.some((event) => event.id === navigation.context.eventId)
    ) {
      return;
    }

    router.replace("/");
  }, [eventListState, navigation.context.eventId, router]);

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
      className={`sticky top-0 z-40 border-b border-border/80 bg-background/95 shadow-xs supports-backdrop-filter:bg-background/85 supports-backdrop-filter:backdrop-blur-md ${
        prefersReducedMotion ? "" : "transition-[transform,opacity] duration-200 ease-out"
      } ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-[calc(100%+1px)] opacity-0"
      }`}
      data-top-bar-state={isVisible ? "visible" : "hidden"}
    >
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Sheet open={mobileNavigationOpen} onOpenChange={setMobileNavigationOpen}>
          <SheetTrigger
            render={
              <Button
                aria-label="Open dashboard navigation"
                className="md:hidden"
                data-breakpoint="mobile-only"
                size="icon-lg"
                variant="ghost"
              />
            }
          >
            <MenuIcon />
          </SheetTrigger>
          <SheetContent
            className="w-[min(22rem,calc(100vw-3rem))] max-w-none gap-0 duration-300 ease-out data-[side=left]:data-ending-style:-translate-x-full data-[side=left]:data-starting-style:-translate-x-full motion-reduce:transition-none sm:max-w-none"
            showCloseButton={false}
            side="left"
          >
            <SheetHeader className="border-b border-border px-5 pt-5 pb-4 text-left">
              <SheetTitle>Dashboard navigation</SheetTitle>
              <SheetDescription>
                {navigation.context.eventId
                  ? "Managing the selected event."
                  : "Choose an event to open its workspace."}
              </SheetDescription>
              <DashboardEventSwitcher
                activePath={activePath}
                className="mt-3 w-full justify-between"
                eventListState={eventListState}
                mobile
                onNavigate={() => setMobileNavigationOpen(false)}
                onRetry={() => setEventListRevision((revision) => revision + 1)}
              />
            </SheetHeader>
            <MobileNavigation
              managerItems={navigation.manager}
              onNavigate={() => setMobileNavigationOpen(false)}
              workspaceItems={navigation.workspace}
            />
          </SheetContent>
        </Sheet>

        <Link
          className="shrink-0 rounded-md text-sm font-semibold text-primary outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          href="/"
        >
          <DashboardBrandLockup />
        </Link>

        <div className="hidden min-w-0 md:block">
          <DashboardEventSwitcher
            activePath={activePath}
            eventListState={eventListState}
            onRetry={() => setEventListRevision((revision) => revision + 1)}
          />
        </div>

        <nav
          aria-label="Dashboard navigation"
          className="hidden min-w-0 flex-1 overflow-x-auto md:flex md:justify-center"
          data-breakpoint="tablet-desktop"
        >
          <HorizontalNavigation
            managerItems={navigation.manager}
            workspaceItems={navigation.workspace}
          />
        </nav>

        <DashboardTopBarControls className="ml-auto md:ml-0" eventId={navigation.context.eventId} />
      </div>
    </header>
  );
}

function HorizontalNavigation({
  managerItems,
  workspaceItems,
}: {
  managerItems: DashboardNavigationItem[];
  workspaceItems: DashboardNavigationItem[];
}) {
  const availableWorkspaceItems = workspaceItems.filter((item) => !item.disabled);
  const unavailableReason = workspaceItems.find((item) => item.disabled)?.disabledReason;

  return (
    <ul className="flex min-w-max items-center justify-center gap-1 px-1">
      {managerItems.map((item) => (
        <HorizontalNavigationItem item={item} key={item.id} />
      ))}
      <li aria-hidden="true" className="mx-1 h-4 w-px bg-border" />
      {availableWorkspaceItems.length > 0 ? (
        availableWorkspaceItems.map((item) => (
          <HorizontalNavigationItem item={item} key={item.id} />
        ))
      ) : (
        <li>
          <Button
            aria-label="Event workspace unavailable"
            disabled
            title={unavailableReason}
            variant="ghost"
          >
            Choose an event
          </Button>
        </li>
      )}
    </ul>
  );
}

function HorizontalNavigationItem({ item }: { item: DashboardNavigationItem }) {
  if (!item.href) {
    return null;
  }

  return (
    <li>
      <Link
        aria-current={item.active ? "page" : undefined}
        className="inline-flex h-8 items-center rounded-md px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 aria-[current=page]:bg-accent aria-[current=page]:text-accent-foreground"
        href={item.href}
      >
        {item.label}
      </Link>
    </li>
  );
}

function MobileNavigation({
  managerItems,
  onNavigate,
  workspaceItems,
}: {
  managerItems: DashboardNavigationItem[];
  onNavigate: () => void;
  workspaceItems: DashboardNavigationItem[];
}) {
  return (
    <nav
      aria-label="Mobile dashboard navigation"
      className="min-h-0 flex-1 overflow-y-auto px-3 py-4"
    >
      <MobileNavigationGroup items={managerItems} label="Manager" onNavigate={onNavigate} />
      <MobileNavigationGroup
        className="mt-5"
        items={workspaceItems}
        label="Event workspace"
        onNavigate={onNavigate}
      />
    </nav>
  );
}

function MobileNavigationGroup({
  className = "",
  items,
  label,
  onNavigate,
}: {
  className?: string;
  items: DashboardNavigationItem[];
  label: string;
  onNavigate: () => void;
}) {
  return (
    <section
      aria-labelledby={`mobile-navigation-${label.toLowerCase().replace(" ", "-")}`}
      className={className}
    >
      <h2
        className="px-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground"
        id={`mobile-navigation-${label.toLowerCase().replace(" ", "-")}`}
      >
        {label}
      </h2>
      <div className="mt-2 grid gap-1">
        {items.map((item) =>
          item.href ? (
            <Link
              aria-current={item.active ? "page" : undefined}
              className="flex min-h-11 items-center justify-between rounded-lg px-3 text-sm font-medium outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 aria-[current=page]:bg-accent aria-[current=page]:text-accent-foreground"
              href={item.href}
              key={item.id}
              onClick={onNavigate}
            >
              {item.label}
              {item.active ? <CurrentIcon /> : null}
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-muted-foreground opacity-55"
              key={item.id}
              title={item.disabledReason}
            >
              {item.label}
            </span>
          ),
        )}
      </div>
    </section>
  );
}

function MenuIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function CurrentIcon() {
  return (
    <svg aria-hidden="true" className="ml-auto size-4" fill="none" viewBox="0 0 24 24">
      <path
        d="m7 12 3 3 7-7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}
