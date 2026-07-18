"use client";

import { Button, buttonVariants } from "@lumiere/dashboard-ui/components/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@lumiere/dashboard-ui/components/field";
import { Input } from "@lumiere/dashboard-ui/components/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { useDashboardAuth } from "../../auth/dashboard-auth-provider";

export function SignupForm() {
  const router = useRouter();
  const { errorMessage, signUp, status } = useDashboardAuth();
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
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

    if (!displayName.trim() || !email.trim() || !password || !confirmPassword) {
      setFormError("Complete all manager account fields.");
      return;
    }

    if (password.length < 8) {
      setFormError("Use a password with at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    const normalizedEmail = email.trim();
    const result = await signUp({
      displayName: displayName.trim(),
      email: normalizedEmail,
      password,
    });

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    if (result.requiresEmailConfirmation) {
      setConfirmationEmail(normalizedEmail);
      return;
    }

    router.replace(redirectTo);
  }

  if (confirmationEmail) {
    return (
      <div className="flex flex-col gap-5" role="status">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Check your email</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            We sent a confirmation link to {confirmationEmail}. Confirm the address, then sign in to
            open your dashboard.
          </p>
        </div>
        <Link
          className={buttonVariants({ className: "min-h-11 w-full", size: "lg" })}
          href={buildAuthHref("/login", redirectTo)}
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  const isSubmitting = status === "loading";
  const visibleError = formError ?? errorMessage;

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      <FieldGroup>
        <Field data-disabled={isSubmitting} data-invalid={Boolean(visibleError)}>
          <FieldLabel htmlFor="manager-name">Manager name</FieldLabel>
          <Input
            aria-describedby={visibleError ? "manager-signup-error" : undefined}
            aria-invalid={Boolean(visibleError)}
            autoComplete="name"
            className="min-h-11"
            disabled={isSubmitting}
            id="manager-name"
            name="name"
            onChange={(event) => setDisplayName(event.target.value)}
            type="text"
            value={displayName}
          />
        </Field>
        <Field data-disabled={isSubmitting} data-invalid={Boolean(visibleError)}>
          <FieldLabel htmlFor="manager-signup-email">Manager email</FieldLabel>
          <Input
            aria-describedby={visibleError ? "manager-signup-error" : undefined}
            aria-invalid={Boolean(visibleError)}
            autoComplete="email"
            className="min-h-11"
            disabled={isSubmitting}
            id="manager-signup-email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            value={email}
          />
        </Field>
        <Field data-disabled={isSubmitting} data-invalid={Boolean(visibleError)}>
          <FieldLabel htmlFor="manager-signup-password">Password</FieldLabel>
          <Input
            aria-describedby="manager-password-requirements"
            aria-invalid={Boolean(visibleError)}
            autoComplete="new-password"
            className="min-h-11"
            disabled={isSubmitting}
            id="manager-signup-password"
            minLength={8}
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
          <FieldDescription id="manager-password-requirements">
            Use at least 8 characters.
          </FieldDescription>
        </Field>
        <Field data-disabled={isSubmitting} data-invalid={Boolean(visibleError)}>
          <FieldLabel htmlFor="manager-confirm-password">Confirm password</FieldLabel>
          <Input
            aria-describedby={visibleError ? "manager-signup-error" : undefined}
            aria-invalid={Boolean(visibleError)}
            autoComplete="new-password"
            className="min-h-11"
            disabled={isSubmitting}
            id="manager-confirm-password"
            minLength={8}
            name="confirmPassword"
            onChange={(event) => setConfirmPassword(event.target.value)}
            type="password"
            value={confirmPassword}
          />
        </Field>
        <Field data-invalid={Boolean(visibleError)}>
          <FieldError id="manager-signup-error">{visibleError}</FieldError>
        </Field>
      </FieldGroup>
      <Button className="min-h-11 w-full" disabled={isSubmitting} size="lg" type="submit">
        {isSubmitting ? "Creating account" : "Create manager account"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          className="font-medium text-foreground underline underline-offset-4"
          href={buildAuthHref("/login", redirectTo)}
        >
          Sign in
        </Link>
      </p>
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
