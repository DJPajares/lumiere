"use client";

import { Button, buttonVariants } from "@lumiere/dashboard-ui/components/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@lumiere/dashboard-ui/components/field";
import { Input } from "@lumiere/dashboard-ui/components/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { useDashboardAuth } from "../../auth/dashboard-auth-provider";

export function LoginForm() {
  const router = useRouter();
  const { errorMessage, signIn, status } = useDashboardAuth();
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [redirectTo, setRedirectTo] = useState("/");

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
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      <FieldGroup>
        <Field data-disabled={isSubmitting} data-invalid={Boolean(visibleError)}>
          <FieldLabel htmlFor="manager-email">Manager email</FieldLabel>
          <Input
            aria-describedby={visibleError ? "manager-sign-in-error" : undefined}
            aria-invalid={Boolean(visibleError)}
            autoComplete="email"
            className="min-h-11"
            disabled={isSubmitting}
            id="manager-email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            value={email}
          />
        </Field>
        <Field data-disabled={isSubmitting} data-invalid={Boolean(visibleError)}>
          <FieldLabel htmlFor="manager-password">Password</FieldLabel>
          <Input
            aria-describedby={visibleError ? "manager-sign-in-error" : undefined}
            aria-invalid={Boolean(visibleError)}
            autoComplete="current-password"
            className="min-h-11"
            disabled={isSubmitting}
            id="manager-password"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
        </Field>
        <Field data-invalid={Boolean(visibleError)}>
          <FieldError id="manager-sign-in-error">{visibleError}</FieldError>
        </Field>
      </FieldGroup>
      {status === "authenticated" ? (
        <p
          className="rounded-lg border border-success/40 bg-success/10 px-3 py-2 text-sm text-success"
          role="status"
        >
          Signed in. Opening the dashboard.
        </p>
      ) : null}
      <Button className="min-h-11 w-full" disabled={isSubmitting} size="lg" type="submit">
        {isSubmitting ? "Signing in" : "Sign in"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        New to Lumiere?{" "}
        <Link
          className="font-medium text-foreground underline underline-offset-4"
          href={buildAuthHref("/signup", redirectTo)}
        >
          Create manager account
        </Link>
      </p>
      <Link
        className={buttonVariants({ className: "min-h-11 w-full", size: "lg", variant: "link" })}
        href="/"
      >
        Return to dashboard
      </Link>
    </form>
  );
}

function buildAuthHref(path: string, redirectTo: string) {
  return redirectTo === "/" ? path : `${path}?redirectTo=${encodeURIComponent(redirectTo)}`;
}

function toSafeRedirect(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}
