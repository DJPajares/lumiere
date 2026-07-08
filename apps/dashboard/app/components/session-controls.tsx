"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useDashboardAuth } from "../auth/dashboard-auth-provider";

export function DashboardSessionControls() {
  const router = useRouter();
  const { errorMessage, signOut, status, user } = useDashboardAuth();

  if (status === "loading") {
    return (
      <p className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold text-[var(--accent-strong)]">
        Checking session
      </p>
    );
  }

  if (status !== "authenticated") {
    return (
      <Link
        className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold text-[var(--accent-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        href="/login"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className="grid gap-2">
      <p className="max-w-40 truncate text-xs font-semibold text-[var(--accent-strong)]">
        {user?.email ?? "Manager"}
      </p>
      {errorMessage ? <p className="text-xs text-[var(--error)]">{errorMessage}</p> : null}
      <button
        className="inline-flex min-h-9 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] px-3 text-xs font-semibold transition hover:bg-[var(--surface-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] active:scale-[0.99]"
        onClick={async () => {
          const result = await signOut();

          if (result.ok) {
            router.replace("/login");
          }
        }}
        type="button"
      >
        Sign out
      </button>
    </div>
  );
}
