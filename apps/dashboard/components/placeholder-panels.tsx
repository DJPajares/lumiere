import Link from "next/link";

import { eventTabs } from "./dashboard-shell";

const metrics = [
  { label: "Published events", value: "0", state: "Empty" },
  { label: "Open RSVPs", value: "0", state: "Pending setup" },
  { label: "Guest groups", value: "0", state: "Ready for import" },
];

const setupTasks = ["Create an event", "Choose a theme", "Add guest groups"];

export function EventListPlaceholder() {
  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((item) => (
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Event list placeholder</h2>
            <p className="mt-1 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_70%,transparent)]">
              Empty state for upcoming event cards, filters, and creation flow.
            </p>
          </div>
          <button
            className="inline-flex min-h-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--surface)] active:scale-[0.99]"
            type="button"
          >
            New event
          </button>
        </div>
      </section>
    </div>
  );
}

export function EventDetailPlaceholder({ eventId }: { eventId: string }) {
  return (
    <div className="grid gap-5">
      <EventTabs eventId={eventId} />
      <section className="grid gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-lg font-semibold">Setup path</h2>
        <div className="grid gap-2">
          {setupTasks.map((task, index) => (
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
    </div>
  );
}

export function ManagementPlaceholder({ eventId, section }: { eventId: string; section: string }) {
  return (
    <div className="grid gap-5">
      <EventTabs active={section.toLowerCase()} eventId={eventId} />
      <section className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
        <p className="text-sm font-semibold text-[var(--accent-strong)]">{section}</p>
        <h2 className="text-2xl font-semibold">{section} workspace placeholder</h2>
        <p className="max-w-2xl text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
          This route reserves the management structure for event{" "}
          <span className="font-semibold text-[var(--foreground)]">{eventId}</span>. Data loading,
          empty, error, and save states will be wired in the dedicated dashboard workflow tasks.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {["Loading", "Empty", "Error"].map((state) => (
            <div
              className="rounded-[var(--radius-md)] bg-[var(--surface-muted)] p-4 text-sm"
              key={state}
            >
              <p className="font-semibold">{state}</p>
              <p className="mt-2 text-[color-mix(in_srgb,var(--foreground)_68%,transparent)]">
                Reserved state treatment.
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function EventTabs({ active, eventId }: { active?: string; eventId: string }) {
  const activeLabel = active
    ? (eventTabs.find((tab) => tab.href === active)?.label ?? active)
    : "Overview";

  return (
    <section className="grid gap-2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-2">
      <div className="flex flex-col gap-1 px-2 py-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color-mix(in_srgb,var(--foreground)_58%,transparent)]">
          Event sections
        </p>
        <p className="text-xs text-[color-mix(in_srgb,var(--foreground)_68%,transparent)]">
          Current: <span className="font-semibold text-[var(--accent-strong)]">{activeLabel}</span>
        </p>
      </div>
      <nav
        className="flex gap-2 overflow-x-auto pb-1 text-sm [-webkit-overflow-scrolling:touch]"
        aria-label={`Event management sections for ${eventId}`}
      >
        <Link
          aria-current={!active ? "page" : undefined}
          className="shrink-0 whitespace-nowrap rounded-[var(--radius-md)] px-3 py-2 font-medium hover:bg-[var(--surface-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] aria-[current=page]:bg-[var(--surface-muted)] aria-[current=page]:text-[var(--accent-strong)]"
          href={`/events/${eventId}`}
        >
          Overview
        </Link>
        {eventTabs.map((tab) => (
          <Link
            aria-current={active === tab.href ? "page" : undefined}
            className="shrink-0 whitespace-nowrap rounded-[var(--radius-md)] px-3 py-2 font-medium hover:bg-[var(--surface-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] aria-[current=page]:bg-[var(--surface-muted)] aria-[current=page]:text-[var(--accent-strong)]"
            href={`/events/${eventId}/${tab.href}`}
            key={tab.href}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </section>
  );
}
