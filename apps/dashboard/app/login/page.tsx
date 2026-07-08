import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-[var(--background)] px-4 py-10 text-[var(--foreground)]">
      <section className="grid w-full max-w-md gap-5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <p className="text-sm font-semibold text-[var(--accent-strong)]">Lumiere Dashboard</p>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Manager sign in</h1>
          <p className="mt-3 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
            Sign in with the manager email and password configured in Supabase Auth.
          </p>
        </div>
        <LoginForm />
      </section>
    </main>
  );
}
