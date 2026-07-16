import Link from "next/link";

import { InviteImage } from "../components/invite-image";
import { InviteShell } from "../components/invite-shell";

export default function InviteHome() {
  return (
    <InviteShell context="public">
      <section className="lumiere-invite-surface grid min-h-[100dvh] content-center gap-8 px-5 py-10 sm:px-8 lg:px-16">
        <div className="mx-auto grid max-w-3xl gap-6 text-center">
          <div className="lumiere-type-eyebrow mx-auto inline-flex items-center justify-center gap-2 text-[var(--accent-strong)]">
            <InviteImage
              alt=""
              aria-hidden="true"
              className="h-12 w-auto object-contain"
              height={48}
              sizes="48px"
              src="/logo.png"
              width={48}
            />
            <span>Lumiere invite app</span>
          </div>
          <h1 className="lumiere-type-hero text-balance">
            Public invitations begin at an event URL.
          </h1>
          <p className="lumiere-type-description mx-auto max-w-2xl text-[color-mix(in_srgb,var(--foreground)_76%,transparent)]">
            Use the event route to preview the public invite shell, or open a guest route to see the
            personalized RSVP placeholder.
          </p>
          <div className="mx-auto flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              className="lumiere-type-control inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] px-5 text-[var(--accent-contrast)] shadow-sm transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[var(--focus)] focus:ring-offset-2 focus:ring-offset-[var(--background)] active:scale-[0.99]"
              href="/e/launch-night"
            >
              Open public route
            </Link>
            <Link
              className="lumiere-type-control inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] px-5 text-[var(--foreground)] transition hover:bg-[var(--surface-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)] focus:ring-offset-2 focus:ring-offset-[var(--background)] active:scale-[0.99]"
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
