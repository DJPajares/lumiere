import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-[var(--background)] px-4 py-10 text-[var(--foreground)]">
      <section className="grid w-full max-w-md gap-5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <p className="text-sm font-semibold text-[var(--accent-strong)]">Lumiere Dashboard</p>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Manager sign in</h1>
          <p className="mt-3 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
            Supabase authentication will be connected in the dashboard auth task. This placeholder
            keeps the unauthenticated view explicit.
          </p>
        </div>
        <button
          className="inline-flex min-h-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--surface)] disabled:cursor-not-allowed disabled:opacity-60"
          disabled
          type="button"
        >
          Sign in arrives next
        </button>
        <Link
          className="text-sm font-semibold text-[var(--accent-strong)] underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          href="/events"
        >
          View authenticated shell placeholder
        </Link>
      </section>
    </main>
  );
}
