import type { Metadata } from "next";
import Link from "next/link";

import { InviteImage } from "../components/invite-image";
import { InviteShell } from "../components/invite-shell";

export const metadata: Metadata = {
  title: "Lumiere Invitation and RSVP Platform",
  description:
    "Create distinct event invitations, share private guest links, collect RSVPs, and follow guest activity with Lumiere.",
  openGraph: {
    description:
      "Create distinct event invitations, share private guest links, collect RSVPs, and follow guest activity with Lumiere.",
    siteName: "Lumiere Invite",
    title: "Lumiere Invitation and RSVP Platform",
    type: "website",
  },
  robots: {
    follow: false,
    index: false,
  },
};

const productSteps = [
  {
    description:
      "Create one or many events, then choose the theme, mode, content, and section rhythm that fit each occasion.",
    number: "01",
    title: "Shape the event",
  },
  {
    description:
      "Publish a public invitation for event details and share unique links that unlock the right RSVP for each guest group.",
    number: "02",
    title: "Invite with context",
  },
  {
    description:
      "Track guest groups, response status, attendee counts, updates, and activity from one calm manager workspace.",
    number: "03",
    title: "Know who is coming",
  },
] as const;

export default function InviteHome() {
  return (
    <InviteShell context="public">
      <div className="lumiere-invite-surface min-h-[100dvh] overflow-hidden">
        <header className="mx-auto flex w-full max-w-[90rem] items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-12">
          <Link
            aria-label="Lumiere home"
            className="lumiere-type-eyebrow inline-flex items-center gap-2 rounded-[var(--radius-sm)] text-[var(--accent-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)]"
            href="/"
          >
            <InviteImage
              alt=""
              aria-hidden="true"
              className="h-10 w-auto object-contain"
              height={40}
              sizes="40px"
              src="/logo.png?v=20260726"
              width={40}
            />
            <span>Lumiere</span>
          </Link>
          <p className="lumiere-type-caption hidden text-[color-mix(in_srgb,var(--foreground)_62%,transparent)] sm:block">
            Invitation and RSVP platform
          </p>
        </header>

        <section className="mx-auto grid min-h-[calc(100dvh-5rem)] w-full max-w-[90rem] items-center gap-12 px-5 py-14 sm:px-8 sm:py-18 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.7fr)] lg:gap-16 lg:px-12 lg:py-20">
          <div className="max-w-4xl">
            <p className="lumiere-type-eyebrow text-[var(--accent-strong)]">
              Invitations and RSVP, thoughtfully connected
            </p>
            <h1 className="lumiere-type-hero mt-5 max-w-4xl text-balance">
              Create the invitation. Share the right link. Know who is coming.
            </h1>
            <p className="lumiere-type-description mt-6 max-w-2xl text-[color-mix(in_srgb,var(--foreground)_76%,transparent)]">
              Lumiere is a multi-event platform for hosts who want every invitation to feel
              personal without losing control of guest groups, responses, and activity. Guests get
              a beautiful, mobile-first experience with no account required.
            </p>
            <Link
              className="lumiere-type-control mt-8 inline-flex min-h-12 items-center justify-center gap-3 rounded-[var(--radius-md)] bg-[var(--accent)] px-6 text-[var(--accent-contrast)] shadow-sm transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[var(--focus)] focus:ring-offset-2 focus:ring-offset-[var(--background)] active:scale-[0.99] motion-reduce:transition-none"
              href="/demos"
            >
              View demo events
              <span aria-hidden="true">↗</span>
            </Link>
          </div>

          <aside
            aria-labelledby="invitation-flow-title"
            className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_24px_80px_color-mix(in_srgb,var(--foreground)_8%,transparent)] sm:p-7"
          >
            <div className="absolute right-[-3rem] top-[-4rem] size-48 rounded-full bg-[color-mix(in_srgb,var(--accent)_13%,transparent)] blur-2xl" />
            <div className="relative">
              <p className="lumiere-type-eyebrow text-[var(--accent-strong)]">One managed event</p>
              <h2 className="lumiere-type-title mt-3 text-balance" id="invitation-flow-title">
                Two ways to arrive. One clear response story.
              </h2>

              <div className="mt-7 grid gap-3">
                <div className="rounded-[var(--radius-md)] bg-[var(--surface-muted)] p-4">
                  <p className="lumiere-type-label">Event manager</p>
                  <p className="lumiere-type-caption mt-1 text-[color-mix(in_srgb,var(--foreground)_68%,transparent)]">
                    Theme, sections, guest groups, and access are configured together.
                  </p>
                </div>

                <div aria-hidden="true" className="mx-auto h-5 w-px bg-[var(--border)]" />

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[var(--radius-md)] border border-[var(--border)] p-4">
                    <p className="lumiere-type-label">Public invitation</p>
                    <p className="lumiere-type-caption mt-1 text-[color-mix(in_srgb,var(--foreground)_68%,transparent)]">
                      Event details without private RSVP access.
                    </p>
                  </div>
                  <div className="rounded-[var(--radius-md)] border border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_8%,var(--surface))] p-4">
                    <p className="lumiere-type-label">Private guest link</p>
                    <p className="lumiere-type-caption mt-1 text-[color-mix(in_srgb,var(--foreground)_68%,transparent)]">
                      A group-aware RSVP with the correct party limit.
                    </p>
                  </div>
                </div>

                <div aria-hidden="true" className="mx-auto h-5 w-px bg-[var(--border)]" />

                <div className="rounded-[var(--radius-md)] bg-[var(--foreground)] p-4 text-[var(--background)]">
                  <p className="lumiere-type-label">Responses and activity</p>
                  <p className="lumiere-type-caption mt-1 opacity-75">
                    The manager sees who replied, who is attending, and what changed.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section className="border-y border-[var(--border)] bg-[var(--surface)]">
          <div className="mx-auto grid w-full max-w-[90rem] gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[minmax(17rem,0.7fr)_minmax(0,1.15fr)] lg:gap-20 lg:px-12 lg:py-24">
            <div>
              <p className="lumiere-type-eyebrow text-[var(--accent-strong)]">The full journey</p>
              <h2 className="lumiere-type-title mt-4 max-w-xl text-balance">
                Built around the event, not a rigid template.
              </h2>
              <p className="lumiere-type-description mt-5 max-w-xl text-[color-mix(in_srgb,var(--foreground)_70%,transparent)]">
                Weddings, birthdays, dinners, holidays, launches, and private gatherings can each
                keep their own visual language while using the same dependable invitation system.
              </p>
            </div>

            <ol className="border-t border-[var(--border)]">
              {productSteps.map((step) => (
                <li
                  className="grid gap-3 border-b border-[var(--border)] py-6 sm:grid-cols-[5rem_minmax(10rem,0.45fr)_minmax(0,1fr)] sm:items-start sm:gap-4"
                  key={step.number}
                >
                  <span className="lumiere-type-numeric text-[var(--accent-strong)]">
                    {step.number}
                  </span>
                  <h3 className="lumiere-type-label">{step.title}</h3>
                  <p className="lumiere-type-caption text-[color-mix(in_srgb,var(--foreground)_68%,transparent)]">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-[90rem] gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,0.8fr)_minmax(22rem,1fr)] lg:gap-20 lg:px-12 lg:py-24">
          <div>
            <p className="lumiere-type-eyebrow text-[var(--accent-strong)]">Clear by design</p>
            <h2 className="lumiere-type-title mt-4 max-w-2xl text-balance">
              The right experience for every person opening the invitation.
            </h2>
          </div>

          <dl className="border-t border-[var(--border)]">
            <div className="grid gap-2 border-b border-[var(--border)] py-6 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-6">
              <dt className="lumiere-type-label">Public visitor</dt>
              <dd className="lumiere-type-description text-[color-mix(in_srgb,var(--foreground)_70%,transparent)]">
                Opens the event page and sees the public story, details, location, and gallery
                without private RSVP controls.
              </dd>
            </div>
            <div className="grid gap-2 border-b border-[var(--border)] py-6 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-6">
              <dt className="lumiere-type-label">Invited guest</dt>
              <dd className="lumiere-type-description text-[color-mix(in_srgb,var(--foreground)_70%,transparent)]">
                Uses a unique group link to respond within the assigned party size—without creating
                a guest account.
              </dd>
            </div>
            <div className="grid gap-2 border-b border-[var(--border)] py-6 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-6">
              <dt className="lumiere-type-label">Event manager</dt>
              <dd className="lumiere-type-description text-[color-mix(in_srgb,var(--foreground)_70%,transparent)]">
                Manages separate events, guest access, RSVP status, attendee counts, notifications,
                and activity from the dashboard.
              </dd>
            </div>
          </dl>
        </section>

        <footer className="border-t border-[var(--border)]">
          <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-3 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
            <p className="lumiere-type-caption text-[color-mix(in_srgb,var(--foreground)_62%,transparent)]">
              Lumiere — invitations, guest links, and RSVP in one event system.
            </p>
            <Link
              className="lumiere-type-control w-fit rounded-[var(--radius-sm)] text-[var(--accent-strong)] underline decoration-[var(--border)] underline-offset-4 focus:outline-none focus:ring-2 focus:ring-[var(--focus)]"
              href="/demos"
            >
              View demo events
            </Link>
          </div>
        </footer>
      </div>
    </InviteShell>
  );
}
