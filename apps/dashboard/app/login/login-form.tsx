"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { useDashboardAuth } from "../auth/dashboard-auth-provider";

export function LoginForm() {
  const router = useRouter();
  const { errorMessage, signIn, status } = useDashboardAuth();
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [redirectTo, setRedirectTo] = useState("/events");

  useEffect(() => {
    const nextRedirect = new URLSearchParams(window.location.search).get("redirectTo");

    setRedirectTo(toSafeRedirect(nextRedirect));
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(redirectTo);
    }
  }, [redirectTo, router, status]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (!email.trim() || !password) {
      setFormError("Enter the manager email and password.");
      return;
    }

    const result = await signIn({ email, password });

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    router.replace(redirectTo);
  }

  const isSubmitting = status === "loading";
  const visibleError = formError ?? errorMessage;

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <label className="text-sm font-semibold" htmlFor="manager-email">
          Manager email
        </label>
        <input
          autoComplete="email"
          className="min-h-11 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          id="manager-email"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          value={email}
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-semibold" htmlFor="manager-password">
          Password
        </label>
        <input
          autoComplete="current-password"
          className="min-h-11 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          id="manager-password"
          name="password"
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          value={password}
        />
      </div>
      {visibleError ? (
        <p className="rounded-[var(--radius-md)] border border-[var(--error)] bg-[color-mix(in_srgb,var(--error)_10%,var(--surface))] px-3 py-2 text-sm text-[var(--error)]">
          {visibleError}
        </p>
      ) : null}
      {status === "authenticated" ? (
        <p className="rounded-[var(--radius-md)] border border-[var(--success)] bg-[color-mix(in_srgb,var(--success)_10%,var(--surface))] px-3 py-2 text-sm text-[var(--success)]">
          Signed in. Opening the dashboard.
        </p>
      ) : null}
      <button
        className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--surface)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Signing in" : "Sign in"}
      </button>
      <Link
        className="text-sm font-semibold text-[var(--accent-strong)] underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        href="/events"
      >
        Return to dashboard
      </Link>
    </form>
  );
}

function toSafeRedirect(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/events";
  }

  return value;
}
