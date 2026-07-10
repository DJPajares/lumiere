"use client";

import {
  Button,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@lumiere/dashboard-ui";
import Link from "next/link";
import { useEffect, useState } from "react";

import { DashboardBrandLockup } from "./dashboard-brand";
import { type DashboardNavigationItem, getDashboardNavigation } from "./dashboard-navigation";
import { DashboardTopBarControls } from "./dashboard-top-bar-controls";
import { useTopBarVisibility } from "./use-top-bar-visibility";

export const DASHBOARD_DESKTOP_QUERY = "(min-width: 768px)";

type DashboardTopNavigationProps = {
  activePath: string;
};

export function DashboardTopNavigation({ activePath }: DashboardTopNavigationProps) {
  const navigation = getDashboardNavigation(activePath);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<"manager" | "workspace" | null>(null);
  const { isVisible, prefersReducedMotion } = useTopBarVisibility(drawerOpen || openMenu !== null);

  useEffect(() => {
    const desktopQuery = window.matchMedia(DASHBOARD_DESKTOP_QUERY);
    const closeDrawerAtDesktop = () => {
      if (desktopQuery.matches) {
        setDrawerOpen(false);
      }
    };

    closeDrawerAtDesktop();
    desktopQuery.addEventListener("change", closeDrawerAtDesktop);

    return () => desktopQuery.removeEventListener("change", closeDrawerAtDesktop);
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
        <Link
          className="shrink-0 rounded-md text-sm font-semibold text-primary outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          href="/events"
        >
          <DashboardBrandLockup />
        </Link>

        <nav
          aria-label="Dashboard navigation"
          className="hidden min-w-0 flex-1 items-center gap-2 md:flex"
          data-breakpoint="tablet-desktop"
        >
          <NavigationDropdown
            items={navigation.manager}
            label="Manager"
            onOpenChange={(open) =>
              setOpenMenu((current) => (open ? "manager" : current === "manager" ? null : current))
            }
            open={openMenu === "manager"}
          />
          <NavigationDropdown
            contextLabel={navigation.context.eventId}
            items={navigation.workspace}
            label="Event workspace"
            onOpenChange={(open) =>
              setOpenMenu((current) =>
                open ? "workspace" : current === "workspace" ? null : current,
              )
            }
            open={openMenu === "workspace"}
          />
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} swipeDirection="left">
            <DrawerTrigger
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
            </DrawerTrigger>
            <DrawerContent className="[--drawer-content-width:min(22rem,calc(100vw-3rem))]">
              <DrawerHeader className="border-b border-border px-5 pt-5 pb-4 text-left">
                <DrawerTitle>Dashboard navigation</DrawerTitle>
                <DrawerDescription>
                  {navigation.context.eventId
                    ? `Managing event ${navigation.context.eventId}`
                    : "Choose an event to open its workspace."}
                </DrawerDescription>
              </DrawerHeader>
              <MobileNavigation
                managerItems={navigation.manager}
                onNavigate={() => setDrawerOpen(false)}
                workspaceItems={navigation.workspace}
              />
            </DrawerContent>
          </Drawer>

          <DashboardTopBarControls eventId={navigation.context.eventId} />
        </div>
      </div>
    </header>
  );
}

function NavigationDropdown({
  contextLabel,
  items,
  label,
  onOpenChange,
  open,
}: {
  contextLabel?: string;
  items: DashboardNavigationItem[];
  label: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const activeItem = items.find((item) => item.active);
  const allDisabled = items.every((item) => item.disabled);
  const triggerLabel = contextLabel
    ? `${contextLabel} · ${activeItem?.label ?? "Overview"}`
    : (activeItem?.label ?? label);

  if (allDisabled) {
    return (
      <Button
        aria-label={`${label} unavailable`}
        disabled
        title={items.find((item) => item.disabledReason)?.disabledReason}
        variant="ghost"
      >
        <span className="max-w-44 truncate">Choose an event</span>
        <ChevronDownIcon />
      </Button>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger
        render={
          <Button
            aria-label={`Open ${label.toLowerCase()} navigation`}
            className="max-w-64"
            variant="ghost"
          />
        }
      >
        <span className="truncate">{triggerLabel}</span>
        <ChevronDownIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
          {items.map((item) => (
            <NavigationDropdownItem item={item} key={item.id} />
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NavigationDropdownItem({ item }: { item: DashboardNavigationItem }) {
  const className = item.active ? "bg-accent text-accent-foreground" : undefined;

  if (!item.href) {
    return (
      <DropdownMenuItem className={className} disabled title={item.disabledReason}>
        {item.label}
      </DropdownMenuItem>
    );
  }

  return (
    <DropdownMenuItem
      aria-current={item.active ? "page" : undefined}
      className={className}
      render={<Link href={item.href} />}
    >
      {item.label}
      {item.active ? <CurrentIcon /> : null}
    </DropdownMenuItem>
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

function ChevronDownIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="m8 10 4 4 4-4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
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
