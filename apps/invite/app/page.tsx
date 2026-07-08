import Link from "next/link";

import { InviteShell } from "./components/invite-shell";

export default function InviteHome() {
  return (
    <InviteShell context="public">
      <section className="grid min-h-[100dvh] content-center gap-8 px-5 py-10 sm:px-8 lg:px-16">
        <div className="mx-auto grid max-w-3xl gap-6 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--accent-strong)]">
            Lumiere invite app
          </p>
          <h1 className="text-5xl font-semibold leading-[0.95] text-balance sm:text-7xl">
            Public invitations begin at an event URL.
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-8 text-[color-mix(in_srgb,var(--foreground)_76%,transparent)]">
            Use the event route to preview the public invite shell, or open a guest route to see the
            personalized RSVP placeholder.
          </p>
          <div className="mx-auto flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--accent-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)] focus:ring-offset-2 focus:ring-offset-[var(--background)] active:scale-[0.99]"
              href="/e/launch-night"
            >
              Open public route
            </Link>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] px-5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)] focus:ring-offset-2 focus:ring-offset-[var(--background)] active:scale-[0.99]"
              href="/e/launch-night/g/sample-guest-token-for-preview"
            >
              Open guest route
            </Link>
          </div>
        </div>
      </section>
    </InviteShell>
  );
}
