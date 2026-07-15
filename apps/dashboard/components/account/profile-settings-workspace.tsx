"use client";

import { toast } from "@lumiere/dashboard-ui/components/sonner";
import { useEffect, useState, type FormEvent } from "react";

import { useDashboardAuth } from "../../auth/dashboard-auth-provider";
import { DashboardButton, DashboardNotice, DashboardTextInput } from "../ui/dashboard-fields";
import { readDisplayName } from "./account-settings-workspace";

type ProfileFormState = {
  avatarError?: string;
  formError?: string;
  success?: string;
};

export function ProfileSettingsWorkspace() {
  const { updateProfile, user } = useDashboardAuth();
  const [displayName, setDisplayName] = useState(() => readDisplayName(user?.user_metadata) ?? "");
  const [avatarUrl, setAvatarUrl] = useState(() => readAvatarUrl(user?.user_metadata));
  const [isSaving, setIsSaving] = useState(false);
  const [formState, setFormState] = useState<ProfileFormState>({});

  useEffect(() => {
    setDisplayName(readDisplayName(user?.user_metadata) ?? "");
    setAvatarUrl(readAvatarUrl(user?.user_metadata));
  }, [user?.user_metadata]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const avatarError = validateAvatarUrl(avatarUrl);

    if (avatarError) {
      setFormState({ avatarError });
      toast.error(avatarError);
      return;
    }

    setFormState({});
    setIsSaving(true);

    const result = await updateProfile({ avatarUrl, displayName });

    setIsSaving(false);

    if (!result.ok) {
      setFormState({ formError: result.error });
      toast.error(result.error);
      return;
    }

    setFormState({ success: "Manager profile saved." });
    toast.success("Manager profile saved.");
  };

  return (
    <form
      className="grid gap-5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6"
      noValidate
      onSubmit={onSubmit}
    >
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Profile details</h2>
        <p className="mt-1 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_66%,transparent)]">
          These details appear in the dashboard account menu. Your sign-in email remains managed by
          Supabase Auth.
        </p>
      </div>

      {formState.formError ? (
        <DashboardNotice tone="error">{formState.formError}</DashboardNotice>
      ) : null}
      {formState.success ? (
        <DashboardNotice tone="success">{formState.success}</DashboardNotice>
      ) : null}

      <DashboardTextInput
        disabled={isSaving}
        id="manager-display-name"
        label="Display name"
        onChange={(event) => setDisplayName(event.target.value)}
        required
        value={displayName}
      />
      <DashboardTextInput
        description="Optional HTTPS image used in the dashboard avatar."
        disabled={isSaving}
        error={formState.avatarError}
        id="manager-avatar-url"
        label="Avatar URL"
        onChange={(event) => setAvatarUrl(event.target.value)}
        type="url"
        value={avatarUrl}
      />

      <div className="flex flex-wrap gap-3">
        <DashboardButton disabled={isSaving} type="submit" variant="primary">
          {isSaving ? "Saving profile..." : "Save profile"}
        </DashboardButton>
      </div>
    </form>
  );
}

function readAvatarUrl(metadata: Record<string, unknown> | undefined) {
  const value = metadata?.avatar_url;

  return typeof value === "string" ? value : "";
}

function validateAvatarUrl(value: string) {
  if (!value.trim()) {
    return undefined;
  }

  try {
    const url = new URL(value);

    return url.protocol === "https:" ? undefined : "Use an HTTPS avatar URL.";
  } catch {
    return "Enter a valid avatar URL.";
  }
}
