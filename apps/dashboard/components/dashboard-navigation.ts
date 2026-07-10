export type DashboardNavigationScope = "manager" | "workspace";

type ManagerNavigationDefinition = {
  href: `/${string}`;
  id: string;
  label: string;
  scope: "manager";
};

type WorkspaceNavigationDefinition = {
  id: string;
  label: string;
  scope: "workspace";
  segment: string | null;
};

export type DashboardNavigationDefinition =
  ManagerNavigationDefinition | WorkspaceNavigationDefinition;

export const dashboardNavigationModel = [
  { href: "/", id: "manager-overview", label: "Dashboard", scope: "manager" },
  { href: "/events", id: "events", label: "Events", scope: "manager" },
  { id: "event-overview", label: "Overview", scope: "workspace", segment: null },
  { id: "event-content", label: "Content", scope: "workspace", segment: "content" },
  { id: "event-theme", label: "Theme", scope: "workspace", segment: "theme" },
  { id: "event-guests", label: "Guests", scope: "workspace", segment: "guests" },
  { id: "event-responses", label: "Responses", scope: "workspace", segment: "responses" },
  { id: "event-activity", label: "Activity", scope: "workspace", segment: "activity" },
  { id: "event-settings", label: "Settings", scope: "workspace", segment: "settings" },
] as const satisfies readonly DashboardNavigationDefinition[];

export type DashboardNavigationItem = {
  active: boolean;
  disabled: boolean;
  disabledReason?: string;
  href?: string;
  id: (typeof dashboardNavigationModel)[number]["id"];
  label: string;
  scope: DashboardNavigationScope;
};

export type DashboardWorkspaceContext = {
  eventId?: string;
  sectionKey?: string;
  sectionLabel: string;
};

export function getDashboardNavigation(activePath: string) {
  const normalizedPath = normalizePath(activePath);
  const context = getDashboardWorkspaceContext(normalizedPath);

  const items = dashboardNavigationModel.map<DashboardNavigationItem>((definition) => {
    if (definition.scope === "manager") {
      return {
        active:
          normalizedPath === definition.href || normalizedPath.startsWith(`${definition.href}/`),
        disabled: false,
        href: definition.href,
        id: definition.id,
        label: definition.label,
        scope: definition.scope,
      };
    }

    const href = context.eventId
      ? `/events/${encodeURIComponent(context.eventId)}${definition.segment ? `/${definition.segment}` : ""}`
      : undefined;

    return {
      active: href === normalizedPath,
      disabled: !href,
      disabledReason: href ? undefined : "Choose an event before opening its workspace.",
      href,
      id: definition.id,
      label: definition.label,
      scope: definition.scope,
    };
  });

  return {
    context,
    manager: items.filter((item) => item.scope === "manager"),
    workspace: items.filter((item) => item.scope === "workspace"),
  };
}

export function getDashboardWorkspaceContext(activePath: string): DashboardWorkspaceContext {
  const normalizedPath = normalizePath(activePath);
  const match = normalizedPath.match(/^\/events\/([^/]+)(?:\/([^/]+))?/);
  const eventId = match?.[1] ? decodePathSegment(match[1]) : undefined;
  const sectionKey = match?.[2];
  const section = sectionKey
    ? dashboardNavigationModel.find(
        (item) => item.scope === "workspace" && item.segment === sectionKey,
      )
    : undefined;

  return {
    eventId,
    sectionKey,
    sectionLabel: section?.label ?? (eventId ? "Overview" : "Event list"),
  };
}

export function getEventSectionDefinition(section: string) {
  return dashboardNavigationModel.find(
    (item) => item.scope === "workspace" && item.segment === section,
  );
}

function normalizePath(path: string) {
  const pathname = path.split(/[?#]/, 1)[0] || "/";

  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}

function decodePathSegment(segment: string) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}
