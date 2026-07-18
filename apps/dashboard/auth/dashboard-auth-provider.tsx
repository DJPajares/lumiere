"use client";

import type { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { createDashboardApiClient } from "../lib/dashboard-api";
import {
  createDashboardSupabaseClient,
  type DashboardSupabaseClient,
} from "../lib/supabase-client";

export type DashboardAuthStatus = "authenticated" | "error" | "loading" | "unauthenticated";

export type AuthActionResult = { ok: true } | { error: string; ok: false };

export type SignUpActionResult =
  { ok: true; requiresEmailConfirmation: boolean } | { error: string; ok: false };

export type DashboardProfileInput = {
  avatarUrl: string;
  displayName: string;
};

export type DashboardSignUpInput = {
  displayName: string;
  email: string;
  password: string;
};

export type DashboardApiClient = ReturnType<typeof createDashboardApiClient>;

export type DashboardAuthContextValue = {
  apiClient: DashboardApiClient | null;
  errorMessage: string | null;
  getAccessToken: () => Promise<string | null>;
  session: Session | null;
  signIn: (input: { email: string; password: string }) => Promise<AuthActionResult>;
  signOut: () => Promise<AuthActionResult>;
  signUp: (input: DashboardSignUpInput) => Promise<SignUpActionResult>;
  status: DashboardAuthStatus;
  updateProfile: (input: DashboardProfileInput) => Promise<AuthActionResult>;
  user: User | null;
};

const DashboardAuthContext = createContext<DashboardAuthContextValue | null>(null);

type DashboardAuthProviderProps = {
  children: ReactNode;
  value?: DashboardAuthContextValue;
};

export function DashboardAuthProvider({ children, value }: DashboardAuthProviderProps) {
  const [dependencies] = useState(() => createAuthDependencies());
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<DashboardAuthStatus>(
    dependencies.supabase ? "loading" : "error",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(
    dependencies.errorMessage ?? null,
  );

  useEffect(() => {
    if (!dependencies.supabase) {
      return;
    }

    let isMounted = true;

    dependencies.supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!isMounted) {
          return;
        }

        if (error) {
          setErrorMessage(toFriendlyAuthError(error.message));
          setStatus("error");
          return;
        }

        setSession(data.session);
        setStatus(data.session ? "authenticated" : "unauthenticated");
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return;
        }

        setErrorMessage(toFriendlyAuthError(error));
        setStatus("error");
      });

    const {
      data: { subscription },
    } = dependencies.supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setErrorMessage(null);
      setStatus(nextSession ? "authenticated" : "unauthenticated");
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [dependencies.supabase]);

  const getAccessToken = useCallback(async () => {
    if (!dependencies.supabase) {
      return null;
    }

    const { data, error } = await dependencies.supabase.auth.getSession();

    if (error) {
      setErrorMessage(toFriendlyAuthError(error.message));
      return null;
    }

    return data.session?.access_token ?? null;
  }, [dependencies.supabase]);

  const signIn = useCallback(
    async ({ email, password }: { email: string; password: string }): Promise<AuthActionResult> => {
      if (!dependencies.supabase) {
        const message = dependencies.errorMessage ?? "Dashboard auth is not configured.";
        setErrorMessage(message);
        setStatus("error");

        return { error: message, ok: false };
      }

      setErrorMessage(null);
      setStatus("loading");

      const { data, error } = await dependencies.supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        const message = toFriendlyAuthError(error.message);
        setErrorMessage(message);
        setStatus("unauthenticated");

        return { error: message, ok: false };
      }

      setSession(data.session);
      setStatus(data.session ? "authenticated" : "unauthenticated");

      return { ok: true };
    },
    [dependencies.errorMessage, dependencies.supabase],
  );

  const signOut = useCallback(async (): Promise<AuthActionResult> => {
    if (!dependencies.supabase) {
      const message = dependencies.errorMessage ?? "Dashboard auth is not configured.";
      setErrorMessage(message);

      return { error: message, ok: false };
    }

    setErrorMessage(null);

    const { error } = await dependencies.supabase.auth.signOut();

    if (error) {
      const message = toFriendlyAuthError(error.message);
      setErrorMessage(message);
      setStatus(session ? "authenticated" : "unauthenticated");

      return { error: message, ok: false };
    }

    setSession(null);
    setStatus("unauthenticated");

    return { ok: true };
  }, [dependencies.errorMessage, dependencies.supabase, session]);

  const signUp = useCallback(
    async ({ displayName, email, password }: DashboardSignUpInput): Promise<SignUpActionResult> => {
      if (!dependencies.supabase) {
        const message = dependencies.errorMessage ?? "Dashboard auth is not configured.";
        setErrorMessage(message);
        setStatus("error");

        return { error: message, ok: false };
      }

      const normalizedDisplayName = displayName.trim();

      if (!normalizedDisplayName) {
        return { error: "Enter the manager name shown in the dashboard.", ok: false };
      }

      setErrorMessage(null);
      setStatus("loading");

      const { data, error } = await dependencies.supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            display_name: normalizedDisplayName,
            full_name: normalizedDisplayName,
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) {
        const message = toFriendlyAuthError(error.message);
        setErrorMessage(message);
        setStatus("unauthenticated");

        return { error: message, ok: false };
      }

      setSession(data.session);
      setStatus(data.session ? "authenticated" : "unauthenticated");

      return {
        ok: true,
        requiresEmailConfirmation: !data.session,
      };
    },
    [dependencies.errorMessage, dependencies.supabase],
  );

  const updateProfile = useCallback(
    async ({ avatarUrl, displayName }: DashboardProfileInput): Promise<AuthActionResult> => {
      if (!dependencies.supabase) {
        const message = dependencies.errorMessage ?? "Dashboard auth is not configured.";
        setErrorMessage(message);

        return { error: message, ok: false };
      }

      const normalizedDisplayName = displayName.trim();

      if (!normalizedDisplayName) {
        return { error: "Enter the manager name shown in the dashboard.", ok: false };
      }

      setErrorMessage(null);

      const { data, error } = await dependencies.supabase.auth.updateUser({
        data: {
          ...(session?.user.user_metadata ?? {}),
          avatar_url: avatarUrl.trim() || null,
          display_name: normalizedDisplayName,
          full_name: normalizedDisplayName,
        },
      });

      if (error) {
        const message = toFriendlyAuthError(error.message);
        setErrorMessage(message);

        return { error: message, ok: false };
      }

      if (!data.user) {
        const message = "Supabase did not return the updated manager profile.";
        setErrorMessage(message);

        return { error: message, ok: false };
      }

      setSession((currentSession) =>
        currentSession
          ? {
              ...currentSession,
              user: data.user,
            }
          : currentSession,
      );

      return { ok: true };
    },
    [dependencies.errorMessage, dependencies.supabase, session?.user.user_metadata],
  );

  const contextValue = useMemo<DashboardAuthContextValue>(
    () => ({
      apiClient: dependencies.apiClient ?? null,
      errorMessage,
      getAccessToken,
      session,
      signIn,
      signOut,
      signUp,
      status,
      updateProfile,
      user: session?.user ?? null,
    }),
    [
      dependencies.apiClient,
      errorMessage,
      getAccessToken,
      session,
      signIn,
      signOut,
      signUp,
      status,
      updateProfile,
    ],
  );

  return (
    <DashboardAuthContext.Provider value={value ?? contextValue}>
      {children}
    </DashboardAuthContext.Provider>
  );
}

export function useDashboardAuth() {
  return useContext(DashboardAuthContext) ?? missingProviderValue;
}

export function toFriendlyAuthError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "Email or password did not match a dashboard manager account.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Confirm this manager email before signing in.";
  }

  if (normalized.includes("user already registered")) {
    return "A manager account already exists for this email. Sign in instead.";
  }

  if (normalized.includes("signup") && normalized.includes("disabled")) {
    return "New manager account signup is disabled in Supabase Auth.";
  }

  if (normalized.includes("network") || normalized.includes("fetch")) {
    return "Unable to reach Supabase Auth. Check the connection and try again.";
  }

  return message || "Unable to complete the auth request.";
}

const missingProviderValue: DashboardAuthContextValue = {
  apiClient: null,
  errorMessage: "Dashboard auth is not mounted.",
  getAccessToken: async () => null,
  session: null,
  signIn: async () => ({ error: "Dashboard auth is not mounted.", ok: false }),
  signOut: async () => ({ error: "Dashboard auth is not mounted.", ok: false }),
  signUp: async () => ({ error: "Dashboard auth is not mounted.", ok: false }),
  status: "error",
  updateProfile: async () => ({ error: "Dashboard auth is not mounted.", ok: false }),
  user: null,
};

function createAuthDependencies():
  | {
      apiClient: DashboardApiClient;
      errorMessage?: never;
      supabase: DashboardSupabaseClient;
    }
  | {
      apiClient?: never;
      errorMessage: string;
      supabase?: never;
    } {
  try {
    const supabase = createDashboardSupabaseClient();

    return {
      apiClient: createDashboardApiClient(supabase),
      supabase,
    };
  } catch (error) {
    return {
      errorMessage: toFriendlyAuthError(error),
    };
  }
}
