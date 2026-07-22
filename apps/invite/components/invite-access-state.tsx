import Link from "next/link";

import { InviteShell } from "./invite-shell";
import { RetryInviteButton } from "./retry-invite-button";

export type InviteAccessState =
  | "guest-disabled"
  | "guest-expired"
  | "guest-invalid"
  | "guest-rsvp-closed"
  | "public-expired"
  | "public-missing"
  | "service-error";

export type GuestInviteAccessState = Exclude<
  InviteAccessState,
  "public-expired" | "public-missing"
>;

type InviteAccessViewProps =
  | {
      context: "guest";
      state: GuestInviteAccessState;
    }
  | {
      context: "public";
      state: "public-expired" | "public-missing" | "service-error";
    };

type AccessStatePresentation = {
  action:
    | { href: "/"; kind: "home"; label: string }
    | { href: string; kind: "contact"; label: string }
    | { kind: "retry"; label: string };
  description: string;
  eyebrow: string;
  guidance: string;
  marker: string;
  title: string;
};

const contactHostHref =
  "mailto:?subject=Lumiere%20invitation%20link&body=Could%20you%20please%20check%20my%20private%20invitation%20link%3F";
const requestLinkHref =
  "mailto:?subject=Request%20for%20a%20new%20Lumiere%20invitation%20link&body=Could%20you%20please%20send%20me%20a%20new%20private%20invitation%20link%3F";

const statePresentations: Record<InviteAccessState, AccessStatePresentation> = {
  "guest-disabled": {
    action: { href: requestLinkHref, kind: "contact", label: "Request another link" },
    description:
      "The host has turned off access for this private invitation link, so it cannot be used to view or update an RSVP.",
    eyebrow: "Private invitation paused",
    guidance: "Ask the host to confirm your invitation and send another link if access should continue.",
    marker: "PAUSED",
    title: "This private link has been disabled.",
  },
  "guest-expired": {
    action: { href: requestLinkHref, kind: "contact", label: "Request a fresh link" },
    description:
      "This private invitation link has reached its access deadline and can no longer open the RSVP.",
    eyebrow: "Private invitation expired",
    guidance: "Ask the host for a fresh link before trying to respond again.",
    marker: "TIME",
    title: "This private link has expired.",
  },
  "guest-invalid": {
    action: { href: contactHostHref, kind: "contact", label: "Contact the host" },
    description:
      "This private invitation link is incomplete, incorrect, or no longer recognized. No guest details were opened.",
    eyebrow: "Private link not recognized",
    guidance: "Check that the full link was copied, then ask the host to verify it if the problem continues.",
    marker: "LINK",
    title: "This private link does not work.",
  },
  "guest-rsvp-closed": {
    action: { href: contactHostHref, kind: "contact", label: "Ask the host" },
    description:
      "The response window for this invitation has closed, so changes cannot be submitted from this link.",
    eyebrow: "Responses closed",
    guidance: "Contact the host directly if your plans changed or you still need to reply.",
    marker: "CLOSED",
    title: "RSVP is closed for this event.",
  },
  "public-missing": {
    action: { href: "/", kind: "home", label: "Explore demo invitations" },
    description:
      "The event may be unpublished, removed, or the address may be incorrect. Private guest information has not been requested.",
    eyebrow: "Public invitation unavailable",
    guidance: "Check the address you received or return to the Lumiere demo gallery.",
    marker: "404",
    title: "This event is not available.",
  },
  "public-expired": {
    action: { href: "/", kind: "home", label: "Explore demo invitations" },
    description:
      "The host's access window for this invitation has ended, so its event details are no longer available.",
    eyebrow: "Invitation access expired",
    guidance: "Contact the host directly if you still need the event details or a renewed invitation.",
    marker: "TIME",
    title: "This invitation has expired.",
  },
  "service-error": {
    action: { kind: "retry", label: "Try again" },
    description:
      "Lumiere could not reach the invitation service. The link may still be valid and no response was changed.",
    eyebrow: "Temporary service interruption",
    guidance: "Wait a moment and retry. If the interruption continues, come back later.",
    marker: "RETRY",
    title: "We could not load the invitation.",
  },
};

const primaryActionClassName =
  "lumiere-type-control inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--foreground)] px-5 py-3 text-[var(--background)] transition-[background-color,transform] hover:bg-[color-mix(in_srgb,var(--foreground)_86%,var(--accent))] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] motion-reduce:transition-none";

export function InviteAccessView({ context, state }: InviteAccessViewProps) {
  const presentation = statePresentations[state];
  const isRetryable = state === "service-error";

  return (
    <InviteShell context={context}>
      <section
        className="relative isolate grid min-h-[100dvh] overflow-hidden px-5 py-12 sm:px-8 sm:py-16 lg:px-12"
        data-invite-access-state={state}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_82%_18%,color-mix(in_srgb,var(--accent)_16%,transparent),transparent_28%),linear-gradient(135deg,var(--background)_0_62%,color-mix(in_srgb,var(--surface-muted)_64%,var(--background))_62%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-2 -z-10 w-px bg-[linear-gradient(transparent,var(--accent)_22%,var(--accent)_78%,transparent)] sm:left-4 lg:left-8"
        />

        <div className="mx-auto grid w-full max-w-6xl content-center gap-12">
          <header className="flex items-center justify-between gap-6 border-b border-[var(--border)] pb-4">
            <Link
              className="lumiere-type-label rounded-sm text-[var(--foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--background)]"
              href="/"
            >
              Lumiere Invite
            </Link>
            <p className="lumiere-type-caption text-right text-[color-mix(in_srgb,var(--foreground)_64%,transparent)]">
              {context === "guest" ? "Private access" : "Public access"}
            </p>
          </header>

          <article className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(17rem,0.48fr)] lg:gap-16">
            <div className="grid min-w-0 content-start gap-6">
              <div
                aria-live={isRetryable ? "assertive" : "polite"}
                className="grid gap-6"
                role={isRetryable ? "alert" : "status"}
              >
                <p className="lumiere-type-eyebrow text-[var(--accent-strong)]">
                  {presentation.eyebrow}
                </p>
                <h1 className="lumiere-type-hero max-w-[12ch] text-balance">
                  {presentation.title}
                </h1>
                <p className="lumiere-type-description max-w-2xl text-[color-mix(in_srgb,var(--foreground)_76%,transparent)]">
                  {presentation.description}
                </p>
              </div>
              <div className="flex flex-col items-start gap-3 pt-2 sm:flex-row sm:items-center">
                <PrimaryAction presentation={presentation} />
                {presentation.action.kind !== "home" ? (
                  <Link
                    className="lumiere-type-control inline-flex min-h-11 items-center rounded-[var(--radius-sm)] px-3 text-[var(--foreground)] underline decoration-[var(--border)] underline-offset-4 transition-colors hover:decoration-[var(--foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] motion-reduce:transition-none"
                    href="/"
                  >
                    Return to invitation home
                  </Link>
                ) : null}
              </div>
            </div>

            <aside className="grid content-between gap-12 border-t border-[var(--border)] pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <p
                aria-hidden="true"
                className="lumiere-type-title break-words text-[color-mix(in_srgb,var(--accent)_54%,var(--foreground))]"
              >
                {presentation.marker}
              </p>
              <div className="grid gap-2">
                <p className="lumiere-type-label text-[var(--accent-strong)]">What to do next</p>
                <p className="lumiere-type-body text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
                  {presentation.guidance}
                </p>
              </div>
            </aside>
          </article>
        </div>
      </section>
    </InviteShell>
  );
}

function PrimaryAction({ presentation }: { presentation: AccessStatePresentation }) {
  if (presentation.action.kind === "retry") {
    return <RetryInviteButton className={primaryActionClassName} />;
  }

  if (presentation.action.kind === "home") {
    return (
      <Link className={primaryActionClassName} href={presentation.action.href}>
        {presentation.action.label}
      </Link>
    );
  }

  return (
    <a className={primaryActionClassName} href={presentation.action.href}>
      {presentation.action.label}
    </a>
  );
}
