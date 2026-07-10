const setupTasks = ["Create an event", "Choose a theme", "Add guest groups"];

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

/** @deprecated Event workspace navigation now renders once in DashboardShell. */
export function EventTabs(_props: { active?: string; eventId: string }) {
  return null;
}
