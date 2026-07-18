import { DashboardBrandLockup } from "../../components/dashboard-brand";
import { SignupForm } from "../../components/login/signup-form";

export default function SignupPage() {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-[var(--background)] px-4 py-10 text-[var(--foreground)]">
      <section className="grid w-full max-w-md gap-5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <DashboardBrandLockup className="text-sm font-semibold text-[var(--accent-strong)]" />
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Create manager account</h1>
          <p className="mt-3 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
            Create your Lumiere login to manage events and collaborate with other hosts.
          </p>
        </div>
        <SignupForm />
      </section>
    </main>
  );
}
