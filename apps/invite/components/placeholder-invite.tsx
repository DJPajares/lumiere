import Link from "next/link";

import { InviteShell } from "./invite-shell";

const publicDetails = [
  { label: "When", value: "Saturday, December 12, 6:30 PM" },
  { label: "Where", value: "The Glasshouse, Singapore" },
  { label: "Guest access", value: "RSVP unlocks from a private invite link" },
];

type PlaceholderInviteProps = {
  eventSlug: string;
  guestToken?: string;
};

export function PublicInvitePlaceholder({ eventSlug }: PlaceholderInviteProps) {
  return (
    <InviteShell context="public">
      <section className="grid min-h-[100dvh] gap-10 px-5 py-8 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:px-16">
        <div className="mx-auto flex max-w-2xl flex-col gap-8">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--accent-strong)]">
            Public invitation
          </p>
          <div className="grid gap-5">
            <h1 className="text-5xl font-semibold leading-[0.95] text-balance sm:text-7xl">
              Launch Night is ready for guests to preview.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-[color-mix(in_srgb,var(--foreground)_76%,transparent)]">
              This public route is prepared for event slug{" "}
              <span className="font-semibold text-[var(--foreground)]">{eventSlug}</span>. It shows
              invitation details without exposing guest-only RSVP context.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--accent-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)] focus:ring-offset-2 focus:ring-offset-[var(--background)] active:scale-[0.99]"
              href="#details"
            >
              View public details
            </a>
            <span className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] px-5 text-sm font-semibold text-[var(--foreground)]">
              RSVP hidden without invite token
            </span>
          </div>
        </div>

        <EventDetailsCard context="public" eventSlug={eventSlug} />
      </section>
    </InviteShell>
  );
}

export function GuestInvitePlaceholder({ eventSlug, guestToken }: PlaceholderInviteProps) {
  return (
    <InviteShell context="guest">
      <section className="grid min-h-[100dvh] gap-10 px-5 py-8 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:px-16">
        <div className="mx-auto flex max-w-2xl flex-col gap-8">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--accent-strong)]">
            Guest invitation
          </p>
          <div className="grid gap-5">
            <h1 className="text-5xl font-semibold leading-[0.95] text-balance sm:text-7xl">
              Your RSVP space is ready.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-[color-mix(in_srgb,var(--foreground)_76%,transparent)]">
              This personalized route is prepared for event slug{" "}
              <span className="font-semibold text-[var(--foreground)]">{eventSlug}</span> and a
              private guest token ending in{" "}
              <span className="font-semibold text-[var(--foreground)]">
                {guestToken?.slice(-6) ?? "unknown"}
              </span>
              .
            </p>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_20px_70px_color-mix(in_srgb,var(--accent)_14%,transparent)]">
            <p className="text-sm font-semibold text-[var(--accent-strong)]">Tan Family</p>
            <h2 className="mt-3 text-2xl font-semibold">RSVP placeholder</h2>
            <p className="mt-3 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
              Max pax, current RSVP status, attendee names, and confirmation states will connect to
              the RSVP API in the guest page task.
            </p>
            <button
              className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)] focus:ring-offset-2 focus:ring-offset-[var(--surface)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              disabled
              type="button"
            >
              RSVP form arrives next
            </button>
          </div>
        </div>

        <EventDetailsCard context="guest" eventSlug={eventSlug} />
      </section>
    </InviteShell>
  );
}

function EventDetailsCard({
  context,
  eventSlug,
}: {
  context: "guest" | "public";
  eventSlug: string;
}) {
  return (
    <aside
      id="details"
      className="mx-auto grid w-full max-w-xl gap-5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_24px_70px_color-mix(in_srgb,var(--accent)_16%,transparent)] sm:p-7"
      aria-label="Placeholder event details"
    >
      <div className="grid aspect-[4/3] place-items-end rounded-[var(--radius-md)] border border-[var(--border)] bg-[radial-gradient(circle_at_20%_20%,color-mix(in_srgb,var(--accent)_35%,transparent),transparent_32%),linear-gradient(135deg,color-mix(in_srgb,var(--surface-muted)_95%,transparent),color-mix(in_srgb,var(--accent)_24%,transparent))] p-4">
        <span className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-semibold text-[var(--accent-strong)] shadow-sm">
          Asset slot
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {publicDetails.map((item) => (
          <div
            key={item.label}
            className="rounded-[var(--radius-sm)] bg-[var(--surface-muted)] p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
              {item.label}
            </p>
            <p className="mt-2 text-sm leading-6">{item.value}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3 rounded-[var(--radius-sm)] border border-[var(--border)] p-4 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
        <p>
          Route: <span className="font-semibold text-[var(--foreground)]">/e/{eventSlug}</span>
          {context === "guest" ? "/g/[guestToken]" : ""}
        </p>
        {context === "public" ? (
          <Link
            className="font-semibold text-[var(--accent-strong)] underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--focus)]"
            href={`/e/${eventSlug}/g/sample-guest-token-for-preview`}
          >
            Preview guest context
          </Link>
        ) : (
          <Link
            className="font-semibold text-[var(--accent-strong)] underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--focus)]"
            href={`/e/${eventSlug}`}
          >
            View public context
          </Link>
        )}
      </div>
    </aside>
  );
}
