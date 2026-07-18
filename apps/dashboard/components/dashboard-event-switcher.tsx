"use client";

import {
  Button,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@lumiere/dashboard-ui";
import type { Event } from "@lumiere/types";
import Link from "next/link";
import type { ComponentProps } from "react";

import { formatEventType } from "./events/event-basics-form";
import { getDashboardWorkspaceContext } from "./dashboard-navigation";

export type DashboardEventSwitcherState = {
  error: string | null;
  events: Event[];
  status: "error" | "idle" | "loading" | "ready";
};

type DashboardEventSwitcherProps = {
  activePath: string;
  className?: string;
  eventListState: DashboardEventSwitcherState;
  mobile?: boolean;
  onNavigate?: () => void;
  onRetry: () => void;
};

export function DashboardEventSwitcher({
  activePath,
  className,
  eventListState,
  mobile = false,
  onNavigate,
  onRetry,
}: DashboardEventSwitcherProps) {
  if (eventListState.status === "idle") {
    return null;
  }

  if (eventListState.status === "loading") {
    return (
      <Button
        aria-busy="true"
        aria-label="Loading events"
        className={className}
        disabled
        size={mobile ? "lg" : "default"}
        variant="outline"
      >
        Loading events…
      </Button>
    );
  }

  const context = getDashboardWorkspaceContext(activePath);
  const currentEvent = eventListState.events.find((event) => event.id === context.eventId);
  const triggerLabel =
    currentEvent?.title ?? (context.eventId ? "Event unavailable" : "Choose an event");

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            aria-label={`Switch event${currentEvent ? `, ${currentEvent.title}` : ""}`}
            className={`${mobile ? "max-w-none" : "max-w-56"} ${className ?? ""}`}
            size={mobile ? "lg" : "default"}
            variant="outline"
          />
        }
      >
        <span className="min-w-0 truncate">{triggerLabel}</span>
        <ChevronDownIcon />
      </PopoverTrigger>
      <PopoverContent
        align={mobile ? "center" : "start"}
        aria-label="Select dashboard event"
        className="w-[min(22rem,calc(100vw-2rem))] p-0"
        sideOffset={8}
      >
        <PopoverHeader className="border-b border-border px-4 py-3">
          <PopoverTitle>Switch event</PopoverTitle>
          <PopoverDescription>
            Keep the current {context.sectionLabel.toLowerCase()} workspace open.
          </PopoverDescription>
        </PopoverHeader>
        {eventListState.status === "error" ? (
          <EventSwitcherError error={eventListState.error} onRetry={onRetry} />
        ) : eventListState.events.length > 0 ? (
          <div className="grid max-h-72 gap-1 overflow-y-auto p-2" role="list">
            {eventListState.events.map((event) => (
              <EventSwitcherOption
                context={context}
                event={event}
                isCurrent={event.id === currentEvent?.id}
                key={event.id}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 px-4 py-4 text-sm">
            <p className="text-muted-foreground">No managed events are available.</p>
            <Button nativeButton={false} render={<Link href="/" />} size="sm" variant="outline">
              Go to Home
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function EventSwitcherOption({
  context,
  event,
  isCurrent,
  onNavigate,
}: {
  context: ReturnType<typeof getDashboardWorkspaceContext>;
  event: Event;
  isCurrent: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Button
      aria-current={isCurrent ? "page" : undefined}
      className="h-auto min-h-12 w-full justify-start gap-3 px-3 py-2 text-left"
      nativeButton={false}
      render={<Link href={eventWorkspaceHref(event.id, context)} onClick={onNavigate} />}
      variant={isCurrent ? "secondary" : "ghost"}
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{event.title}</span>
        <span className="block truncate text-xs font-normal text-muted-foreground">
          {formatEventType(event.eventType)}
        </span>
      </span>
      {isCurrent ? <CheckIcon /> : null}
    </Button>
  );
}

function EventSwitcherError({ error, onRetry }: { error: string | null; onRetry: () => void }) {
  return (
    <div className="grid gap-3 px-4 py-4 text-sm">
      <p className="text-muted-foreground">{error || "Unable to load your events."}</p>
      <Button onClick={onRetry} size="sm" variant="outline">
        Try again
      </Button>
    </div>
  );
}

function eventWorkspaceHref(
  eventId: string,
  context: ReturnType<typeof getDashboardWorkspaceContext>,
) {
  const basePath = `/events/${encodeURIComponent(eventId)}`;
  const knownSection =
    context.sectionKey &&
    ["content", "theme", "guests", "responses", "activity", "settings"].includes(context.sectionKey)
      ? context.sectionKey
      : null;

  return knownSection ? `${basePath}/${knownSection}` : basePath;
}

function ChevronDownIcon(props: ComponentProps<"svg">) {
  return (
    <svg aria-hidden="true" className="size-4 shrink-0" fill="none" viewBox="0 0 24 24" {...props}>
      <path
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4 shrink-0 text-primary"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="m5 12 4.5 4.5L19 7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}
