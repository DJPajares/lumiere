"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@lumiere/dashboard-ui/components/avatar";
import Link from "next/link";

import { useDashboardAuth } from "../../auth/dashboard-auth-provider";

export function AccountSettingsWorkspace() {
  const { user } = useDashboardAuth();
  const displayName = readDisplayName(user?.user_metadata) ?? "Lumiere manager";
  const avatarUrl = readMetadataString(user?.user_metadata, "avatar_url");

  return (
    <section className="grid gap-5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar size="lg">
            {avatarUrl ? <AvatarImage alt="" src={avatarUrl} /> : null}
            <AvatarFallback>{getInitials(displayName, user?.email)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold tracking-tight">{displayName}</h2>
            <p className="truncate text-sm text-[color-mix(in_srgb,var(--foreground)_64%,transparent)]">
              {user?.email ?? "No manager email available"}
            </p>
          </div>
        </div>
        <Link
          className="inline-flex min-h-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-contrast)] transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--surface)]"
          href="/settings/profile"
        >
          Edit profile
        </Link>
      </div>

      <dl className="grid gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-[color-mix(in_srgb,var(--foreground)_58%,transparent)]">Account ID</dt>
          <dd className="mt-1 break-all font-mono text-xs">{user?.id ?? "Unavailable"}</dd>
        </div>
        <div>
          <dt className="text-[color-mix(in_srgb,var(--foreground)_58%,transparent)]">
            Authentication
          </dt>
          <dd className="mt-1 font-medium">Supabase manager account</dd>
        </div>
      </dl>

      <p className="text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_68%,transparent)]">
        Email and password security are managed by Supabase Auth. Your dashboard display name and
        avatar are stored in the manager profile metadata.
      </p>
    </section>
  );
}

export function readDisplayName(metadata: Record<string, unknown> | undefined) {
  for (const key of ["display_name", "full_name", "name"]) {
    const value = readMetadataString(metadata, key);

    if (value) {
      return value;
    }
  }

  return undefined;
}

export function getInitials(displayName: string | undefined, email: string | undefined) {
  const source = displayName?.trim() || email?.split("@")[0]?.trim() || "Manager";
  const words = source.split(/[\s._-]+/).filter(Boolean);

  return (words.length > 1 ? `${words[0]?.[0] ?? ""}${words.at(-1)?.[0] ?? ""}` : source.slice(0, 2))
    .toUpperCase()
    .slice(0, 2);
}

function readMetadataString(metadata: Record<string, unknown> | undefined, key: string) {
  const value = metadata?.[key];

  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
