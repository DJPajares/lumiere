"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@lumiere/dashboard-ui/components/avatar";
import { Badge } from "@lumiere/dashboard-ui/components/badge";
import { Button, buttonVariants } from "@lumiere/dashboard-ui/components/button";
import { XIcon } from "@lumiere/dashboard-ui/components/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@lumiere/dashboard-ui/components/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@lumiere/dashboard-ui/components/popover";
import { ScrollArea } from "@lumiere/dashboard-ui/components/scroll-area";
import { Skeleton } from "@lumiere/dashboard-ui/components/skeleton";
import { toast } from "@lumiere/dashboard-ui/components/sonner";
import { cn } from "@lumiere/dashboard-ui/utils";
import type { Notification } from "@lumiere/types";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useDashboardAuth } from "../auth/dashboard-auth-provider";
import { getNotificationDestination } from "../lib/notification-destinations";

type DashboardTopBarControlsProps = {
  className?: string;
  eventId?: string;
};

type ManagerIdentity = {
  avatarUrl?: string;
  displayName: string;
  email: string;
  initials: string;
};

type NotificationState =
  | { status: "empty"; notifications: Notification[] }
  | { status: "error"; error: string; notifications: Notification[] }
  | { status: "loading"; notifications: Notification[] }
  | { status: "ready"; notifications: Notification[] };

type NotificationAction =
  { id: string; type: "dismiss" | "read" } | { type: "mark-all-read" } | null;

export function DashboardTopBarControls({ className, eventId }: DashboardTopBarControlsProps) {
  const { apiClient, signOut, status, user } = useDashboardAuth();
  const router = useRouter();
  const [notificationRevision, setNotificationRevision] = useState(0);
  const [notificationAction, setNotificationAction] = useState<NotificationAction>(null);
  const [notificationState, setNotificationState] = useState<NotificationState>(() =>
    eventId ? { notifications: [], status: "loading" } : { notifications: [], status: "empty" },
  );
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const identity = useMemo(() => getManagerIdentity(user), [user]);

  useEffect(() => {
    if (!eventId) {
      setNotificationState({ notifications: [], status: "empty" });
      return;
    }

    if (!apiClient) {
      setNotificationState({
        error: "Notifications are unavailable until the dashboard connection is restored.",
        notifications: [],
        status: "error",
      });
      return;
    }

    let isCurrent = true;

    setNotificationState((current) => ({
      notifications: current.notifications,
      status: "loading",
    }));

    apiClient
      .listEventNotifications(eventId)
      .then(({ notifications }) => {
        if (!isCurrent) {
          return;
        }

        setNotificationState({
          notifications,
          status: notifications.length === 0 ? "empty" : "ready",
        });
      })
      .catch((error: unknown) => {
        if (!isCurrent) {
          return;
        }

        setNotificationState({
          error: toNotificationError(error),
          notifications: [],
          status: "error",
        });
      });

    return () => {
      isCurrent = false;
    };
  }, [apiClient, eventId, notificationRevision]);

  if (status === "loading") {
    return (
      <div
        aria-label="Checking manager session"
        className={cn("flex items-center gap-2", className)}
        role="status"
      >
        <span className="size-8 animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />
        <span className="size-8 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <Link
        className={cn(buttonVariants({ size: "sm", variant: "outline" }), className)}
        href="/login"
      >
        Sign in
      </Link>
    );
  }

  const unreadCount = notificationState.notifications.filter(
    (notification) => !notification.readAt,
  ).length;

  const handleNotificationOpen = async (notification: Notification) => {
    const destination = getNotificationDestination(notification);

    if (!notification.readAt) {
      if (!eventId || !apiClient) {
        toast.error("Notifications are unavailable until the dashboard connection is restored.");
        return;
      }

      const previousNotifications = notificationState.notifications;
      const optimisticReadAt = new Date().toISOString();

      setNotificationAction({ id: notification.id, type: "read" });
      setNotificationState({
        notifications: previousNotifications.map((item) =>
          item.id === notification.id ? { ...item, readAt: optimisticReadAt } : item,
        ),
        status: "ready",
      });

      try {
        await apiClient.markEventNotificationRead(eventId, notification.id);
      } catch (error: unknown) {
        setNotificationState({
          notifications: previousNotifications,
          status: previousNotifications.length > 0 ? "ready" : "empty",
        });
        toast.error(toNotificationMutationError(error, "mark notification as read"), {
          action: {
            label: "Retry",
            onClick: () => void handleNotificationOpen(notification),
          },
        });
        setNotificationAction(null);
        return;
      }

      setNotificationAction(null);
    }

    router.push(destination.href);
  };

  const handleNotificationDismiss = async (notification: Notification) => {
    if (!eventId || !apiClient) {
      toast.error("Notifications are unavailable until the dashboard connection is restored.");
      return;
    }

    const previousNotifications = notificationState.notifications;

    setNotificationAction({ id: notification.id, type: "dismiss" });
    setNotificationState({
      notifications: previousNotifications.filter((item) => item.id !== notification.id),
      status: previousNotifications.length > 1 ? "ready" : "empty",
    });

    try {
      await apiClient.dismissEventNotification(eventId, notification.id);
    } catch (error: unknown) {
      setNotificationState({
        notifications: previousNotifications,
        status: previousNotifications.length > 0 ? "ready" : "empty",
      });
      toast.error(toNotificationMutationError(error, "dismiss notification"), {
        action: {
          label: "Retry",
          onClick: () => void handleNotificationDismiss(notification),
        },
      });
    } finally {
      setNotificationAction(null);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    if (!eventId || !apiClient || unreadCount === 0) {
      return;
    }

    const previousNotifications = notificationState.notifications;

    setNotificationAction({ type: "mark-all-read" });
    setNotificationState({
      notifications: previousNotifications.map((notification) =>
        notification.readAt ? notification : { ...notification, readAt: new Date().toISOString() },
      ),
      status: "ready",
    });

    try {
      await apiClient.markAllEventNotificationsRead(eventId);
    } catch (error: unknown) {
      setNotificationState({
        notifications: previousNotifications,
        status: previousNotifications.length > 0 ? "ready" : "empty",
      });
      toast.error(toNotificationMutationError(error, "mark all notifications as read"), {
        action: {
          label: "Retry",
          onClick: () => void handleMarkAllNotificationsRead(),
        },
      });
    } finally {
      setNotificationAction(null);
    }
  };

  const handleSignOut = async () => {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);
    setSignOutError(null);
    const result = await signOut();

    if (!result.ok) {
      setSignOutError(result.error);
      setIsSigningOut(false);
      toast.error(result.error);
      return;
    }

    toast.success("Signed out successfully.");
    router.replace("/login");
    router.refresh();
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <NotificationControl
        eventId={eventId}
        isMarkingAllRead={notificationAction?.type === "mark-all-read"}
        onDismiss={handleNotificationDismiss}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onOpen={handleNotificationOpen}
        onRetry={() => setNotificationRevision((revision) => revision + 1)}
        pendingNotificationId={
          notificationAction && "id" in notificationAction ? notificationAction.id : undefined
        }
        state={notificationState}
        unreadCount={unreadCount}
      />

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              aria-label={`Open account menu for ${identity.displayName}`}
              className="rounded-full"
              size="icon-lg"
              variant="ghost"
            />
          }
        >
          <ManagerAvatar identity={identity} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64" sideOffset={8}>
          <DropdownMenuGroup>
            <DropdownMenuLabel className="grid gap-0.5 px-2 py-2 normal-case">
              <span className="truncate text-sm font-semibold text-foreground">
                {identity.displayName}
              </span>
              <span className="truncate text-xs font-normal text-muted-foreground">
                {identity.email}
              </span>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem render={<Link href="/settings/profile" />}>
              <EditProfileIcon />
              Edit profile
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/settings" />}>
              <SettingsIcon />
              Account settings
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              closeOnClick={false}
              disabled={isSigningOut}
              onClick={handleSignOut}
              variant="destructive"
            >
              <SignOutIcon />
              {isSigningOut ? "Signing out…" : "Sign out"}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          {signOutError ? (
            <p
              aria-live="polite"
              className="px-2 py-1.5 text-xs leading-5 text-destructive"
              role="alert"
            >
              {signOutError}
            </p>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function NotificationControl({
  eventId,
  isMarkingAllRead,
  onDismiss,
  onMarkAllRead,
  onOpen,
  onRetry,
  pendingNotificationId,
  state,
  unreadCount,
}: {
  eventId?: string;
  isMarkingAllRead?: boolean;
  onDismiss: (notification: Notification) => void;
  onMarkAllRead: () => void;
  onOpen: (notification: Notification) => void;
  onRetry: () => void;
  pendingNotificationId?: string;
  state: NotificationState;
  unreadCount: number;
}) {
  const unreadLabel = unreadCount === 1 ? "1 unread" : `${unreadCount} unread`;

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            aria-label={unreadCount > 0 ? `Notifications, ${unreadLabel}` : "Notifications"}
            className="relative"
            size="icon-lg"
            variant="ghost"
          />
        }
      >
        <BellIcon />
        {unreadCount > 0 ? (
          <Badge
            aria-hidden="true"
            className="absolute -top-0.5 -right-0.5 min-w-4 px-1 text-[0.625rem] leading-4 ring-2 ring-background"
            variant="destructive"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        ) : null}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        aria-label="Event notifications"
        className="w-[min(22rem,calc(100vw-2rem))] gap-0 overflow-hidden p-0"
        sideOffset={8}
      >
        <PopoverHeader className="border-b border-border px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <PopoverTitle className="min-w-0 flex-1 font-semibold">Notifications</PopoverTitle>
            {unreadCount > 0 ? (
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant="secondary">{unreadLabel}</Badge>
                <Button
                  disabled={isMarkingAllRead}
                  onClick={onMarkAllRead}
                  size="xs"
                  variant="ghost"
                >
                  {isMarkingAllRead ? "Marking…" : "Mark all read"}
                </Button>
              </div>
            ) : null}
          </div>
          <PopoverDescription>
            {eventId ? "Recent updates for this event." : "Open an event to see its updates."}
          </PopoverDescription>
        </PopoverHeader>
        <NotificationContent
          eventId={eventId}
          onDismiss={onDismiss}
          onOpen={onOpen}
          onRetry={onRetry}
          pendingNotificationId={pendingNotificationId}
          state={state}
        />
      </PopoverContent>
    </Popover>
  );
}

function NotificationContent({
  eventId,
  onDismiss,
  onOpen,
  onRetry,
  pendingNotificationId,
  state,
}: {
  eventId?: string;
  onDismiss: (notification: Notification) => void;
  onOpen: (notification: Notification) => void;
  onRetry: () => void;
  pendingNotificationId?: string;
  state: NotificationState;
}) {
  if (state.status === "loading") {
    return (
      <div aria-label="Loading notifications" aria-live="polite" className="grid gap-3 p-4">
        {[0, 1, 2].map((item) => (
          <div className="grid gap-2" key={item}>
            <Skeleton className="h-3 w-2/5" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="grid justify-items-start gap-3 p-4" role="alert">
        <div className="grid gap-1">
          <p className="text-sm font-semibold">Unable to load notifications</p>
          <p className="text-xs leading-5 text-muted-foreground">{state.error}</p>
        </div>
        <Button onClick={onRetry} size="sm" variant="outline">
          Try again
        </Button>
      </div>
    );
  }

  if (state.status === "empty") {
    return (
      <div className="grid justify-items-center gap-1 px-5 py-8 text-center">
        <span
          aria-hidden="true"
          className="mb-1 flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground"
        >
          <BellIcon />
        </span>
        <p className="text-sm font-semibold">
          {eventId ? "You’re all caught up" : "No event selected"}
        </p>
        <p className="max-w-64 text-xs leading-5 text-muted-foreground">
          {eventId
            ? "New RSVP and invitation updates will appear here."
            : "Choose an event to view its manager notifications."}
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="max-h-80" data-slot="notification-scroll-area">
      <ul aria-label="Notification list">
        {state.notifications.map((notification) => {
          const isPending = pendingNotificationId === notification.id;

          return (
            <li
              className={cn(
                "border-b border-border px-4 py-3 last:border-b-0",
                !notification.readAt && "bg-primary/5",
              )}
              key={notification.id}
            >
              <div className="flex min-w-0 items-start gap-2">
                <span
                  aria-label={notification.readAt ? undefined : "Unread"}
                  aria-hidden={notification.readAt ? "true" : undefined}
                  className={cn(
                    "mt-2 size-1.5 shrink-0 rounded-full",
                    notification.readAt ? "bg-transparent" : "bg-primary",
                  )}
                  role={notification.readAt ? undefined : "img"}
                />
                <Button
                  aria-label={`Open notification: ${notification.title}`}
                  className="h-auto min-w-0 flex-1 justify-start rounded-md px-1 py-0.5 text-left whitespace-normal"
                  disabled={isPending}
                  onClick={() => onOpen(notification)}
                  variant="ghost"
                >
                  <span className="grid min-w-0 flex-1 gap-1">
                    <span className="flex min-w-0 items-start justify-between gap-3">
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold leading-5">
                        {notification.title}
                      </span>
                      <time
                        className="shrink-0 text-[0.6875rem] leading-5 text-muted-foreground"
                        dateTime={notification.createdAt}
                      >
                        {formatNotificationDate(notification.createdAt)}
                      </time>
                    </span>
                    <span className="break-words text-xs leading-5 text-muted-foreground">
                      {notification.message}
                    </span>
                  </span>
                </Button>
                <Button
                  aria-label={`Dismiss notification: ${notification.title}`}
                  disabled={isPending}
                  onClick={() => onDismiss(notification)}
                  size="icon-sm"
                  variant="ghost"
                >
                  <XIcon />
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </ScrollArea>
  );
}

function ManagerAvatar({ identity }: { identity: ManagerIdentity }) {
  return (
    <Avatar aria-label={`${identity.displayName} avatar`}>
      {identity.avatarUrl ? (
        <AvatarImage alt={`${identity.displayName} profile image`} src={identity.avatarUrl} />
      ) : null}
      <AvatarFallback>{identity.initials}</AvatarFallback>
    </Avatar>
  );
}

export function getManagerIdentity(user: User | null): ManagerIdentity {
  const emailAddress = readNonEmptyString(user?.email);
  const email = emailAddress ?? "No email address";
  const displayName =
    readUserMetadata(user, ["full_name", "display_name", "name"]) ?? "Lumiere manager";
  const avatarUrl = readUserMetadata(user, ["avatar_url", "picture"]);
  const initialsSource =
    displayName === "Lumiere manager" ? emailAddress?.split("@", 1)[0] || displayName : displayName;

  return {
    ...(avatarUrl ? { avatarUrl } : {}),
    displayName,
    email,
    initials: toInitials(initialsSource),
  };
}

function readUserMetadata(user: User | null, keys: string[]) {
  for (const key of keys) {
    const value = readNonEmptyString(user?.user_metadata?.[key]);

    if (value) {
      return value;
    }
  }

  return undefined;
}

function readNonEmptyString(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();

  return normalized || undefined;
}

function toInitials(value: string) {
  const words = value.match(/[\p{L}\p{N}]+/gu) ?? [];

  if (words.length === 0) {
    return "LM";
  }

  if (words.length === 1) {
    return Array.from(words[0] ?? "")
      .slice(0, 2)
      .join("")
      .toLocaleUpperCase();
  }

  const firstInitial = Array.from(words[0] ?? "")[0] ?? "";
  const lastInitial = Array.from(words.at(-1) ?? "")[0] ?? "";

  return `${firstInitial}${lastInitial}`.toLocaleUpperCase();
}

function formatNotificationDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recent";
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function toNotificationError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  return message || "The event notification feed could not be loaded.";
}

function toNotificationMutationError(error: unknown, action: string) {
  const message = error instanceof Error ? error.message : String(error);

  return message || `Could not ${action}. Try again.`;
}

function BellIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path
        d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EditProfileIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path
        d="M15 4.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM4.5 20a7.5 7.5 0 0 1 10.8-6.75M16 19l4.5-4.5M18.5 12.5l3 3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <path
        d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.09A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.09A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.09A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.13.37.34.7.6 1 .3.27.69.42 1.1.4h.09v4h-.09a1.7 1.7 0 0 0-1.7.6Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SignOutIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path
        d="M10 17l5-5-5-5M15 12H3M14 3h4a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
