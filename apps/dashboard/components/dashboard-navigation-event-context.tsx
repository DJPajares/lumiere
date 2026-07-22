import { Badge } from "@lumiere/dashboard-ui";
import type { Event } from "@lumiere/types";

import type { DashboardEventSwitcherState } from "./dashboard-event-switcher";
import type { DashboardWorkspaceContext } from "./dashboard-navigation";

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
