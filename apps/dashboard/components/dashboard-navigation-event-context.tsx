import { Badge, buttonVariants, Separator } from "@lumiere/dashboard-ui";
import type { Event } from "@lumiere/types";
import Link from "next/link";

import type { DashboardEventSwitcherState } from "./dashboard-event-switcher";
import type {
  DashboardNavigationItem,
  DashboardWorkspaceContext,
} from "./dashboard-navigation";

export function DashboardEventContextBar({
  context,
  currentEvent,
  eventListState,
  settingsItem,
}: {
  context: DashboardWorkspaceContext;
  currentEvent?: Event;
  eventListState: DashboardEventSwitcherState;
  settingsItem?: DashboardNavigationItem;
}) {
  if (!context.eventId) {
    return null;
  }

  return (
    <section aria-label="Selected event context" data-slot="event-context-bar">
      <div className="mx-auto flex min-h-12 max-w-7xl items-center gap-3 px-4 py-2 sm:px-6 lg:px-8">
        <div className="min-w-0 flex-1">
          <DashboardSelectedEventSummary
            context={context}
            currentEvent={currentEvent}
            eventListState={eventListState}
          />
        </div>
        {settingsItem?.href ? (
          <Link
            aria-current={settingsItem.active ? "page" : undefined}
            className={buttonVariants({
              size: "lg",
              variant: settingsItem.active ? "secondary" : "ghost",
            })}
            href={settingsItem.href}
          >
            Event settings
          </Link>
        ) : null}
      </div>
      <Separator />
    </section>
  );
}

export function DashboardSelectedEventSummary({
  context,
  currentEvent,
  eventListState,
}: {
  context: DashboardWorkspaceContext;
  currentEvent?: Event;
  eventListState: DashboardEventSwitcherState;
}) {
  return (
    <div className="min-w-0" data-slot="selected-event-context">
      <p className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {context.eventId ? "Selected event" : "Manager workspace"}
      </p>
      <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
        <p className="truncate text-sm font-semibold text-foreground">
          {resolveSelectedEventLabel(context, currentEvent, eventListState.status)}
        </p>
        {currentEvent ? (
          <Badge variant="secondary">
            {currentEvent.status.charAt(0).toUpperCase() + currentEvent.status.slice(1)}
          </Badge>
        ) : null}
        <span className="text-xs text-muted-foreground">{context.sectionLabel}</span>
      </div>
    </div>
  );
}

function resolveSelectedEventLabel(
  context: DashboardWorkspaceContext,
  currentEvent: Event | undefined,
  eventListStatus: DashboardEventSwitcherState["status"],
) {
  if (!context.eventId) {
    return "No event selected";
  }

  if (currentEvent) {
    return currentEvent.title;
  }

  if (eventListStatus === "error") {
    return "Selected event unavailable";
  }

  if (eventListStatus === "ready") {
    return "Event no longer available";
  }

  return "Loading selected event…";
}
