const summary = [
  { label: "Published events", value: "0", state: "Empty" },
  { label: "Open RSVPs", value: "0", state: "Pending setup" },
  { label: "Guest groups", value: "0", state: "Ready for import" },
];

const tasks = ["Create an event", "Choose a theme", "Add guest groups"];

export default function DashboardHome() {
  return (
    <main className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[17rem_1fr] lg:px-8">
        <aside className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 lg:min-h-[calc(100dvh-2.5rem)]">
          <p className="text-sm font-semibold text-[var(--accent-strong)]">Lumiere Dashboard</p>
          <nav className="mt-6 grid gap-1 text-sm" aria-label="Sample dashboard navigation">
            {["Overview", "Events", "Guests", "Responses"].map((item, index) => (
              <a
                className="rounded-[var(--radius-md)] px-3 py-2 font-medium transition hover:bg-[var(--surface-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                href="#overview"
                key={item}
                aria-current={index === 0 ? "page" : undefined}
              >
                {item}
              </a>
            ))}
          </nav>
        </aside>

        <section id="overview" className="grid content-start gap-6">
          <div className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--accent-strong)]">
                  Manager workspace
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Calm controls for event setup.
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
                  This sample page demonstrates dashboard tokens, responsive layout, empty states,
                  and accessible controls before full management flows are built.
                </p>
              </div>
              <button
                className="inline-flex min-h-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--background)] active:scale-[0.99]"
                type="button"
              >
                New event
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {summary.map((item) => (
              <article
                className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5"
                key={item.label}
              >
                <p className="text-sm text-[color-mix(in_srgb,var(--foreground)_68%,transparent)]">
                  {item.label}
                </p>
                <p className="mt-3 text-3xl font-semibold">{item.value}</p>
                <p className="mt-3 rounded-[var(--radius-sm)] bg-[var(--surface-muted)] px-3 py-2 text-sm">
                  {item.state}
                </p>
              </article>
            ))}
          </div>

          <section className="grid gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="text-lg font-semibold">Setup path</h2>
            <div className="grid gap-2">
              {tasks.map((task, index) => (
                <label
                  className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border)] p-3 text-sm hover:bg-[var(--surface-muted)]"
                  key={task}
                >
                  <input
                    className="size-4 accent-[var(--accent)]"
                    disabled={index > 0}
                    type="checkbox"
                  />
                  <span>{task}</span>
                </label>
              ))}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
