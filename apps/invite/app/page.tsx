const details = [
  { label: "When", value: "Saturday, 6:30 PM" },
  { label: "Where", value: "The Glasshouse" },
  { label: "RSVP", value: "Open for invited guests" },
];

export default function InviteHome() {
  return (
    <main className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)]">
      <section className="grid min-h-[100dvh] gap-10 px-5 py-8 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:px-16">
        <div className="mx-auto flex max-w-2xl flex-col gap-8">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--accent-strong)]">
            Lumiere public invite
          </p>
          <div className="grid gap-5">
            <h1 className="text-5xl font-semibold leading-[0.95] text-balance sm:text-7xl">
              A warmer first light for every invitation.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-[color-mix(in_srgb,var(--foreground)_76%,transparent)]">
              This sample page demonstrates the invite app foundation: luminous tokens, mobile-first
              rhythm, clear public details, and RSVP space reserved for guest links.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--accent-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--background)] active:scale-[0.99]"
              href="#details"
            >
              View event details
            </a>
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] px-5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-55"
              disabled
              type="button"
            >
              RSVP unlocks with invite link
            </button>
          </div>
        </div>

        <aside
          id="details"
          className="mx-auto grid w-full max-w-xl gap-5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_24px_70px_color-mix(in_srgb,var(--accent)_16%,transparent)] sm:p-7"
          aria-label="Sample event details"
        >
          <div className="aspect-[4/3] rounded-[var(--radius-md)] border border-[var(--border)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--accent)_30%,transparent),color-mix(in_srgb,var(--surface-muted)_90%,transparent))]" />
          <div className="grid gap-3 sm:grid-cols-3">
            {details.map((item) => (
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
          <p className="rounded-[var(--radius-sm)] border border-[var(--border)] p-4 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
            Empty, loading, error, and submitted RSVP states will use these same semantic tokens
            when the invite flow task arrives.
          </p>
        </aside>
      </section>
    </main>
  );
}
