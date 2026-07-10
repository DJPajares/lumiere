import Link from "next/link";
import type { ReactNode } from "react";

import {
  type DashboardWorkspaceContext,
  getDashboardWorkspaceContext,
} from "./dashboard-navigation";
import { DashboardTopNavigation } from "./dashboard-top-navigation";

type DashboardShellProps = {
  activePath?: string;
  children: ReactNode;
  eyebrow?: string;
  title: string;
};

export function DashboardShell({
  activePath = "/",
  children,
  eyebrow = "Manager workspace",
  title,
}: DashboardShellProps) {
  const workspaceContext = getDashboardWorkspaceContext(activePath);
  const isEventList = !workspaceContext.eventId;

  return (
    <main className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)]">
      <DashboardTopNavigation activePath={activePath} />
      <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <section className="grid content-start gap-5">
          <header className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <DashboardBreadcrumb activePath={activePath} context={workspaceContext} />
                <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
                <p className="mt-2 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_68%,transparent)]">
                  {workspaceContext.eventId
                    ? `${workspaceContext.sectionLabel} for event ${workspaceContext.eventId}`
                    : eyebrow}
                </p>
              </div>
              {isEventList ? null : (
                <Link
                  className="inline-flex min-h-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] px-4 text-sm font-semibold transition hover:bg-[var(--surface-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  href="/"
                >
                  Home
                </Link>
              )}
            </div>
          </header>
          {children}
        </section>
      </div>
    </main>
  );
}

function DashboardBreadcrumb({
  activePath,
  context,
}: {
  activePath: string;
  context: DashboardWorkspaceContext;
}) {
  if (activePath.split(/[?#]/, 1)[0] === "/") {
    return (
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-2 text-sm font-medium text-[color-mix(in_srgb,var(--foreground)_62%,transparent)]"
      >
        <span aria-current="page" className="text-[var(--foreground)]">
          Home
        </span>
      </nav>
    );
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-2 text-sm font-medium text-[color-mix(in_srgb,var(--foreground)_62%,transparent)]"
    >
      <Link
        className="rounded-[var(--radius-sm)] text-[var(--accent-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        href="/"
      >
        Home
      </Link>
      {!context.eventId ? (
        <>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="text-[var(--foreground)]">
            Events
          </span>
        </>
      ) : null}
      {context.eventId ? (
        <>
          <span aria-hidden="true">/</span>
          <Link
            aria-current={context.sectionKey ? undefined : "page"}
            className="rounded-[var(--radius-sm)] font-mono text-[var(--accent-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            href={`/events/${context.eventId}`}
          >
            {context.eventId}
          </Link>
        </>
      ) : null}
      {context.eventId && context.sectionKey ? (
        <>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="text-[var(--foreground)]">
            {context.sectionLabel}
          </span>
        </>
      ) : null}
    </nav>
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
