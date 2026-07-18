---
id: 't92-dashboard-event-switcher'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'dashboard-navigation'
dueDate: null
created: '2026-07-18T00:00:00Z'
modified: '2026-07-18T13:12:11+08:00'
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

Add an event switcher to the existing top navigation so managers can move between events returned by the manager-scoped `listEvents` API without returning Home. Event context remains route-derived; do not introduce a second global active-event state.

## Suggested Agent

- Suggested model: `GPT-5.6 Terra (gpt-5.6-terra)`
- Reasoning level: `high`

## Acceptance

- [ ] Desktop/tablet top navigation contains an event switcher that lists only events accessible to the current manager.
- [ ] Mobile navigation exposes the same event-switching capability inside the drawer or a compact top-nav control.
- [ ] Switching events navigates to the same known workspace segment (`overview`, `content`, `theme`, `guests`, `responses`, `activity`, or `settings`) for the selected event.
- [ ] The current event is identified by title; event type may be shown only when it improves disambiguation.
- [ ] The control uses the existing manager event list and does not add recent/frequent ranking or last-event persistence in this task.
- [ ] Loading, empty, inaccessible, and deleted-event states fall back to Home without leaving stale event data visible.
- [ ] The switcher uses dashboard-only shadcn/Base UI components.

## Notes

The current route already defines the active event and workspace. Server authorization remains authoritative after navigation.

## Progress Log

- 2026-07-18T00:00:00Z: Task created.
- 2026-07-18T13:12:11+08:00: Removed speculative active-event persistence and ranking; aligned switching with the existing route-derived dashboard context and manager event list.
