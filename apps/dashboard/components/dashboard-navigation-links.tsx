import { CheckIcon } from "@lumiere/dashboard-ui";
import Link from "next/link";

import type { DashboardNavigationItem } from "./dashboard-navigation";

export function DashboardDesktopNavigation({
  workspaceItems,
}: {
  workspaceItems: DashboardNavigationItem[];
}) {
  const availableWorkspaceItems = workspaceItems.filter((item) => !item.disabled);

  return (
    <nav
      aria-label="Dashboard navigation"
      className="hidden min-w-0 justify-self-center lg:flex"
      data-breakpoint="desktop"
    >
      <ul className="flex min-w-max items-center justify-center gap-1">
        {availableWorkspaceItems.length > 0
          ? availableWorkspaceItems.map((item) => (
              <DashboardDesktopNavigationItem item={item} key={item.id} />
            ))
          : null}
      </ul>
    </nav>
  );
}

function DashboardDesktopNavigationItem({ item }: { item: DashboardNavigationItem }) {
  if (!item.href) {
    return null;
  }

  return (
    <li>
      <Link
        aria-current={item.active ? "page" : undefined}
        className="relative inline-flex h-14 items-center px-2.5 text-sm font-medium text-muted-foreground outline-none transition-colors after:absolute after:inset-x-2.5 after:bottom-0 after:h-0.5 after:origin-center after:scale-x-0 after:bg-primary after:transition-transform hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-[current=page]:text-foreground aria-[current=page]:after:scale-x-100 motion-reduce:transition-none motion-reduce:after:transition-none"
        href={item.href}
      >
        {item.label}
      </Link>
    </li>
  );
}

export function DashboardMobileNavigationLinks({
  onNavigate,
  workspaceItems,
}: {
  onNavigate: () => void;
  workspaceItems: DashboardNavigationItem[];
}) {
  return (
    <nav
      aria-label="Mobile dashboard navigation"
      className="min-h-0 flex-1 overflow-y-auto px-3 py-4"
    >
      <DashboardMobileNavigationGroup
        items={workspaceItems}
        label="Event workspace"
        onNavigate={onNavigate}
      />
    </nav>
  );
}

function DashboardMobileNavigationGroup({
  items,
  label,
  onNavigate,
}: {
  items: DashboardNavigationItem[];
  label: string;
  onNavigate: () => void;
}) {
  const labelId = `mobile-navigation-${label.toLowerCase().replace(" ", "-")}`;

  return (
    <section aria-labelledby={labelId}>
      <h2
        className="px-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground"
        id={labelId}
      >
        {label}
      </h2>
      <div className="mt-2 grid gap-1">
        {items.map((item) =>
          item.href ? (
            <Link
              aria-current={item.active ? "page" : undefined}
              className="flex min-h-11 items-center justify-between rounded-lg px-3 text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-[current=page]:text-foreground motion-reduce:transition-none"
              href={item.href}
              key={item.id}
              onClick={onNavigate}
            >
              {item.label}
              {item.active ? <CheckIcon aria-hidden="true" className="ml-auto size-4" /> : null}
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
