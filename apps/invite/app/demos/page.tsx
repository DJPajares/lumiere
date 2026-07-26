import {
  demoEventCatalog,
  type DemoEventCatalogEntry,
  type DemoEventKey,
  type PublicEventSummary,
} from "@lumiere/types";
import type { Metadata } from "next";
import Link from "next/link";

import { InviteImage } from "../../components/invite-image";
import { InviteShell } from "../../components/invite-shell";
import { createInviteApiClient } from "../../lib/invite-api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Lumiere Demo Invitations",
  description: "Explore published Lumiere invitations for a wedding, birthday, and launch.",
  openGraph: {
    description: "Explore published Lumiere invitations for a wedding, birthday, and launch.",
    siteName: "Lumiere Invite",
    title: "Lumiere Demo Invitations",
    type: "website",
  },
  robots: {
    follow: false,
    index: false,
  },
};

type DemoEventState =
  | {
      catalog: DemoEventCatalogEntry;
      event: PublicEventSummary;
      status: "ready";
    }
  | {
      catalog: DemoEventCatalogEntry;
      status: "unavailable";
    };

const demoPresentation = {
  wedding: {
    artifact: "A / T",
    artifactClass:
      "border-[#a36a2f]/35 bg-[#fff9ef] font-serif text-[#76502c] shadow-[0_24px_70px_rgba(118,80,44,0.12)]",
    eyebrow: "01 / Garden wedding",
    rowClass: "bg-[#f2e7d6] text-[#2f241b]",
    signalClass: "bg-[#a36a2f]",
  },
  "kids-birthday": {
    artifact: "08",
    artifactClass:
      "rotate-[-4deg] border-[#ef7b45]/45 bg-[#fff4b8] font-sans text-[#b94d22] shadow-[12px_12px_0_#3f68b5]",
    eyebrow: "02 / Sunroom birthday",
    rowClass: "bg-[#fff2ca] text-[#263238]",
    signalClass: "bg-[#ef7b45]",
  },
  launch: {
    artifact: "18",
    artifactClass:
      "border-[#37e6ff]/45 bg-[#11191f] font-mono text-[#37e6ff] shadow-[0_0_42px_rgba(55,230,255,0.22)]",
    eyebrow: "03 / Night launch",
    rowClass: "bg-[#12191f] text-[#edf9fb]",
    signalClass: "bg-[#37e6ff] shadow-[0_0_18px_rgba(55,230,255,0.7)]",
  },
} satisfies Record<
  DemoEventKey,
  {
    artifact: string;
    artifactClass: string;
    eyebrow: string;
    rowClass: string;
    signalClass: string;
  }
>;

export default async function DemoInvitationsPage() {
  const demos = await loadDemoEvents();

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
          <Link
            className="lumiere-type-control rounded-[var(--radius-sm)] text-[var(--accent-strong)] underline decoration-[var(--border)] underline-offset-4 focus:outline-none focus:ring-2 focus:ring-[var(--focus)]"
            href="/"
          >
            About Lumiere
          </Link>
        </header>

        <section className="mx-auto grid w-full max-w-[90rem] items-end gap-10 px-5 pb-14 pt-14 sm:px-8 sm:pb-18 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.65fr)] lg:gap-16 lg:px-12 lg:pb-20 lg:pt-20">
          <div className="max-w-4xl">
            <p className="lumiere-type-eyebrow text-[var(--accent-strong)]">
              Public invitation gallery
            </p>
            <h1 className="lumiere-type-hero mt-5 max-w-4xl text-balance">
              Three events. Three distinct voices.
            </h1>
            <p className="lumiere-type-description mt-6 max-w-2xl text-[color-mix(in_srgb,var(--foreground)_76%,transparent)]">
              Open a published invitation to experience how theme, typography, section rhythm, and
              event details change with the occasion while the underlying invitation system stays
              consistent.
            </p>
            <a
              className="lumiere-type-control mt-8 inline-flex min-h-12 items-center justify-center gap-3 rounded-[var(--radius-md)] bg-[var(--accent)] px-6 text-[var(--accent-contrast)] shadow-sm transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[var(--focus)] focus:ring-offset-2 focus:ring-offset-[var(--background)] active:scale-[0.99] motion-reduce:transition-none"
              href="#demo-events"
            >
              Choose an invitation
              <span aria-hidden="true">↓</span>
            </a>
          </div>

          <div
            aria-hidden="true"
            className="relative hidden min-h-[24rem] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] lg:block"
          >
            <div className="absolute inset-x-[12%] top-[12%] h-px bg-[var(--border)]" />
            <div className="absolute bottom-[12%] left-[18%] top-[12%] w-px bg-[var(--border)]" />
            <div className="absolute right-[8%] top-[14%] size-48 rounded-full border border-[#a36a2f]/30 bg-[#f2e7d6]" />
            <div className="absolute bottom-[12%] left-[8%] grid size-36 rotate-[-5deg] place-items-center bg-[#fff2ca] text-5xl font-black text-[#b94d22] shadow-[14px_14px_0_#3f68b5]">
              08
            </div>
            <div className="absolute bottom-[8%] right-[7%] h-[46%] w-[44%] bg-[#12191f] p-5 text-[#37e6ff] shadow-[0_18px_60px_rgba(18,25,31,0.24)]">
              <div className="h-full border-l border-[#37e6ff]/60 pl-4 font-mono text-xs uppercase tracking-[0.2em]">
                Signal 18
              </div>
            </div>
            <p className="lumiere-type-caption absolute left-[24%] top-[25%] max-w-40 uppercase tracking-[0.18em] text-[color-mix(in_srgb,var(--foreground)_58%,transparent)]">
              Event-owned art direction
            </p>
          </div>
        </section>

        <section aria-labelledby="demo-events-title" id="demo-events">
          <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-4 px-5 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-8 lg:px-12">
            <div>
              <p className="lumiere-type-eyebrow text-[var(--accent-strong)]">Demo collection</p>
              <h2 className="lumiere-type-title mt-3" id="demo-events-title">
                Choose an invitation to enter
              </h2>
            </div>
            <p className="lumiere-type-caption max-w-md text-[color-mix(in_srgb,var(--foreground)_64%,transparent)]">
              These are public event views. Personalized RSVP controls only appear when a guest
              opens their private invitation link.
            </p>
          </div>

          <ol className="border-y border-[var(--border)]">
            {demos.map((demo) => (
              <DemoEventRow demo={demo} key={demo.catalog.key} />
            ))}
          </ol>
        </section>

        <footer className="border-t border-[var(--border)]">
          <div className="mx-auto flex w-full max-w-[90rem] items-center justify-between gap-4 px-5 py-8 sm:px-8 lg:px-12">
            <p className="lumiere-type-caption text-[color-mix(in_srgb,var(--foreground)_62%,transparent)]">
              End of demo collection
            </p>
            <Link
              className="lumiere-type-control rounded-[var(--radius-sm)] text-[var(--accent-strong)] underline decoration-[var(--border)] underline-offset-4 focus:outline-none focus:ring-2 focus:ring-[var(--focus)]"
              href="/"
            >
              Return to Lumiere
            </Link>
          </div>
        </footer>
      </div>
    </InviteShell>
  );
}

function DemoEventRow({ demo }: { demo: DemoEventState }) {
  const presentation = demoPresentation[demo.catalog.key];
  const content = (
    <article
      className={`relative overflow-hidden px-5 py-9 transition-[filter] group-hover:brightness-[0.97] group-active:brightness-95 motion-reduce:transition-none sm:px-8 sm:py-11 lg:px-12 ${presentation.rowClass}`}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 left-0 w-1 ${presentation.signalClass}`}
      />
      <div className="mx-auto grid w-full max-w-[90rem] gap-7 sm:grid-cols-[8rem_minmax(0,1fr)] sm:items-center lg:grid-cols-[11rem_minmax(0,1fr)_minmax(15rem,0.45fr)] lg:gap-12">
        <div
          aria-hidden="true"
          className={`grid aspect-square w-24 place-items-center rounded-[var(--radius-lg)] border text-3xl font-semibold sm:w-28 lg:w-36 lg:text-5xl ${presentation.artifactClass}`}
        >
          {presentation.artifact}
        </div>

        <div>
          <p className="lumiere-type-eyebrow opacity-70">{presentation.eyebrow}</p>
          <h3 className="lumiere-type-title mt-3 text-balance">{demo.catalog.title}</h3>
          <p className="lumiere-type-description mt-3 max-w-2xl opacity-75">
            {demo.catalog.summary}
          </p>
        </div>

        {demo.status === "ready" ? (
          <div className="grid gap-2 border-t border-current/20 pt-5 sm:col-span-2 lg:col-span-1 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <p className="lumiere-type-label">{formatEventDate(demo.event)}</p>
            <p className="lumiere-type-caption opacity-70">
              {demo.event.venueName ?? "Venue details inside"}
            </p>
            <p className="lumiere-type-control mt-2 inline-flex items-center gap-2">
              Open public invitation <span aria-hidden="true">↗</span>
            </p>
          </div>
        ) : (
          <div className="grid gap-2 border-t border-current/20 pt-5 sm:col-span-2 lg:col-span-1 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <p className="lumiere-type-label">Temporarily unavailable</p>
            <p className="lumiere-type-caption max-w-xs opacity-75">
              This invitation cannot be opened right now. The other available demos remain ready
              to explore.
            </p>
          </div>
        )}
      </div>
    </article>
  );

  if (demo.status === "unavailable") {
    return <li className="border-b border-[var(--border)] last:border-b-0">{content}</li>;
  }

  return (
    <li className="border-b border-[var(--border)] last:border-b-0">
      <Link
        aria-label={`Open ${demo.catalog.title} demo invitation`}
        className="group block focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[var(--focus)]"
        href={`/e/${demo.catalog.publicSlug}`}
      >
        {content}
      </Link>
    </li>
  );
}

async function loadDemoEvents(): Promise<DemoEventState[]> {
  const apiClient = createInviteApiClient();

  return Promise.all(
    demoEventCatalog.map(async (catalog): Promise<DemoEventState> => {
      try {
        const invite = await apiClient.getPublicEvent(catalog.publicSlug);

        return {
          catalog,
          event: invite.event,
          status: "ready",
        };
      } catch {
        return {
          catalog,
          status: "unavailable",
        };
      }
    }),
  );
}

function formatEventDate(event: PublicEventSummary) {
  try {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeZone: event.timezone,
    }).format(new Date(event.startsAt));
  } catch {
    return "Date details inside";
  }
}
