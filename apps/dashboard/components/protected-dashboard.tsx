"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useDashboardAuth } from "../auth/dashboard-auth-provider";
import { DashboardBrandLockup } from "./dashboard-brand";

type ProtectedDashboardProps = {
  children: ReactNode;
};

export function ProtectedDashboard({ children }: ProtectedDashboardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { errorMessage, status } = useDashboardAuth();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?redirectTo=${encodeURIComponent(pathname || "/")}`);
    }
  }, [pathname, router, status]);

  if (status === "authenticated") {
    return children;
  }

  return (
    <main className="grid min-h-[100dvh] place-items-center bg-[var(--background)] px-4 py-10 text-[var(--foreground)]">
      <section
        className="grid w-full max-w-md gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm"
        aria-live="polite"
      >
        <DashboardBrandLockup className="text-sm font-semibold text-[var(--accent-strong)]" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {status === "loading" ? "Checking manager session" : "Sign in required"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
            {status === "loading"
              ? "Loading your Supabase session before opening the dashboard."
              : "Protected dashboard routes require a manager session."}
          </p>
        </div>
        {status === "error" ? (
          <p className="rounded-[var(--radius-md)] border border-[var(--error)] bg-[color-mix(in_srgb,var(--error)_10%,var(--surface))] px-3 py-2 text-sm text-[var(--error)]">
            {errorMessage ?? "Unable to read the manager session."}
          </p>
        ) : null}
        {status !== "loading" ? (
          <Link
            className="inline-flex min-h-10 w-fit items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-contrast)] transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--surface)] active:scale-[0.99]"
            href="/login"
          >
            Go to sign in
          </Link>
        ) : null}
      </section>
    </main>
  );
}
