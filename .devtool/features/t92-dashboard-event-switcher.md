---
id: 't92-dashboard-event-switcher'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'dashboard-navigation'
dueDate: null
created: '2026-07-18T00:00:00Z'
modified: '2026-07-18T00:00:00Z'
completedAt: null
labels: ['dashboard', 'events', 'navigation', 'ux']
depends_on: ['t59-responsive-dashboard-top-navigation', 't61-manager-consolidated-dashboard-root']
order: 'a92'
---

# t92-dashboard-event-switcher - Dashboard event switcher

## Hierarchy

- Epic: `dashboard-navigation`
- Dependencies: `t59-responsive-dashboard-top-navigation`, `t61-manager-consolidated-dashboard-root`

## Scope

Add a fast, persistent event switcher to the dashboard so managers can move between managed events without returning to the events index. The selected event context must propagate consistently across dashboard routes and data queries.

## Suggested Agent

- Suggested model: `GPT-5.6 Terra (gpt-5.6-terra)`
- Reasoning level: `high`

## Acceptance

- [ ] Desktop/tablet top navigation contains an event switcher that lists only events accessible to the current manager.
- [ ] Mobile navigation exposes the same event-switching capability inside the drawer or a compact top-nav control.
- [ ] Switching events updates the active event context and navigates to the equivalent destination when supported.
- [ ] The current event is visibly identified by title and optional event-type metadata.
- [ ] Recent or frequently accessed events are easy to reach without hiding the full event list.
- [ ] Loading, empty, inaccessible, and deleted-event states are handled without leaving stale dashboard data visible.
- [ ] The switcher uses dashboard-only shadcn/Base UI components.

## Notes

Persist the last active event per manager where appropriate, but do not let client state override server-side authorization.

## Progress Log

- 2026-07-18T00:00:00Z: Task created.
