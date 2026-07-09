import Link from "next/link";
import type { ReactNode } from "react";

import { DashboardBrandLockup } from "./dashboard-brand";
import { DashboardSessionControls } from "./session-controls";

export const eventTabs = [
  { href: "content", label: "Content" },
  { href: "theme", label: "Theme" },
  { href: "guests", label: "Guests" },
  { href: "responses", label: "Responses" },
  { href: "activity", label: "Activity" },
  { href: "settings", label: "Settings" },
] as const;

export type EventTabHref = (typeof eventTabs)[number]["href"];

const primaryNav = [{ href: "/events", label: "Events" }] as const;

type DashboardShellProps = {
  activePath?: string;
  children: ReactNode;
  eyebrow?: string;
  title: string;
};

export function DashboardShell({
  activePath = "/events",
  children,
  eyebrow = "Manager workspace",
  title,
}: DashboardShellProps) {
  const workspaceContext = getWorkspaceContext(activePath);

  return (
    <main className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[17rem_1fr] lg:px-8">
        <aside className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 lg:sticky lg:top-4 lg:min-h-[calc(100dvh-2rem)]">
          <div className="flex items-center justify-between gap-3">
            <Link
              className="text-sm font-semibold text-[var(--accent-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              href="/events"
            >
              <DashboardBrandLockup />
            </Link>
            <DashboardSessionControls />
          </div>

          <WorkspaceContextPanel context={workspaceContext} />

          <details className="mt-4 lg:hidden">
            <summary className="cursor-pointer rounded-[var(--radius-md)] border border-[var(--border)] px-3 py-2 text-sm font-semibold hover:bg-[var(--surface-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]">
              Navigation · {workspaceContext.sectionLabel}
            </summary>
            <DashboardNav activePath={activePath} className="mt-3" />
          </details>

          <DashboardNav activePath={activePath} className="mt-6 hidden lg:grid" />
        </aside>

        <section className="grid content-start gap-5">
          <header className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--accent-strong)]">
                  {eyebrow}
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
                <div
                  className="mt-4 flex flex-wrap gap-2 text-sm"
                  aria-label="Current dashboard context"
                >
                  <ContextPill label="Scope" value={workspaceContext.scopeLabel} />
                  <ContextPill label="Editing" value={workspaceContext.sectionLabel} />
                  {workspaceContext.eventId ? (
                    <ContextPill label="Event ID" value={workspaceContext.eventId} />
                  ) : null}
                </div>
              </div>
              <Link
                className="inline-flex min-h-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-contrast)] transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--background)] active:scale-[0.99]"
                href="/events"
              >
                Event list
              </Link>
            </div>
          </header>
          {children}
        </section>
      </div>
    </main>
  );
}

function DashboardNav({ activePath, className = "" }: { activePath: string; className?: string }) {
  const activeEventId = getActiveEventId(activePath);

  return (
    <nav className={`gap-1 text-sm ${className}`} aria-label="Dashboard navigation">
      {primaryNav.map((item) => (
        <Link
          aria-current={activePath === item.href ? "page" : undefined}
          className="rounded-[var(--radius-md)] px-3 py-2 font-medium transition hover:bg-[var(--surface-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] aria-[current=page]:bg-[var(--surface-muted)] aria-[current=page]:text-[var(--accent-strong)]"
          href={item.href}
          key={item.href}
        >
          {item.label}
        </Link>
      ))}
      {activeEventId ? (
        <div className="mt-5 grid gap-1 border-t border-[var(--border)] pt-4">
          <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[color-mix(in_srgb,var(--foreground)_54%,transparent)]">
            Event workspace
          </p>
          <p className="mx-3 mb-2 rounded-[var(--radius-sm)] bg-[var(--surface-muted)] px-3 py-2 text-xs leading-5 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
            Editing event <span className="font-mono font-semibold">{activeEventId}</span>
          </p>
          <Link
            aria-current={activePath === `/events/${activeEventId}` ? "page" : undefined}
            className="rounded-[var(--radius-md)] px-3 py-2 font-medium transition hover:bg-[var(--surface-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] aria-[current=page]:bg-[var(--surface-muted)] aria-[current=page]:text-[var(--accent-strong)]"
            href={`/events/${activeEventId}`}
          >
            Overview
          </Link>
          {eventTabs.map((item) => {
            const href = `/events/${activeEventId}/${item.href}`;

            return (
              <Link
                aria-current={activePath === href ? "page" : undefined}
                className="rounded-[var(--radius-md)] px-3 py-2 font-medium transition hover:bg-[var(--surface-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] aria-[current=page]:bg-[var(--surface-muted)] aria-[current=page]:text-[var(--accent-strong)]"
                href={href}
                key={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      ) : null}
    </nav>
  );
}

function getActiveEventId(activePath: string) {
  const match = activePath.match(/^\/events\/([^/]+)/);

  return match?.[1];
}

function getWorkspaceContext(activePath: string) {
  const eventId = getActiveEventId(activePath);
  const sectionKey = activePath.match(/^\/events\/[^/]+\/([^/]+)/)?.[1];
  const activeTab = sectionKey ? eventTabs.find((item) => item.href === sectionKey) : undefined;
  const sectionLabel = activeTab?.label ?? (eventId ? "Overview" : "Event list");

  return {
    eventId,
    scopeLabel: eventId ? "Event workspace" : "Manager events",
    sectionLabel,
  };
}

function WorkspaceContextPanel({ context }: { context: ReturnType<typeof getWorkspaceContext> }) {
  return (
    <div className="mt-4 grid gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface-muted)_48%,var(--surface))] p-3 text-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color-mix(in_srgb,var(--foreground)_58%,transparent)]">
        Current context
      </p>
      <p className="font-semibold">{context.sectionLabel}</p>
      <p className="break-all text-xs leading-5 text-[color-mix(in_srgb,var(--foreground)_68%,transparent)]">
        {context.eventId ? `Event ${context.eventId}` : "All manager events"}
      </p>
    </div>
  );
}

function ContextPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1.5 text-xs">
      <span className="font-semibold uppercase tracking-[0.12em] text-[color-mix(in_srgb,var(--foreground)_56%,transparent)]">
        {label}
      </span>
      <span className="truncate font-medium">{value}</span>
    </span>
  );
}

export function AuthRequiredPlaceholder() {
  return (
    <section className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
      <p className="text-sm font-semibold text-[var(--accent-strong)]">Unauthenticated state</p>
      <p className="max-w-2xl text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
        Dashboard routes require a Supabase manager session. Signed-out managers are redirected to
        login before protected management content opens.
      </p>
      <Link
        className="inline-flex min-h-10 w-fit items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] px-4 text-sm font-semibold transition hover:bg-[var(--surface-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        href="/login"
      >
        Go to sign in
      </Link>
    </section>
  );
}
