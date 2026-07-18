---
id: 't92-dashboard-event-switcher'
status: 'done'
priority: 'high'
assignee: null
epic: 'dashboard-navigation'
dueDate: null
created: '2026-07-18T00:00:00Z'
modified: '2026-07-18T14:24:16+08:00'
completedAt: '2026-07-18T14:24:16+08:00'
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

- [x] Desktop/tablet top navigation contains an event switcher that lists only events accessible to the current manager.
- [x] Mobile navigation exposes the same event-switching capability inside the drawer or a compact top-nav control.
- [x] Switching events navigates to the same known workspace segment (`overview`, `content`, `theme`, `guests`, `responses`, `activity`, or `settings`) for the selected event.
- [x] The current event is identified by title; event type may be shown only when it improves disambiguation.
- [x] The control uses the existing manager event list and does not add recent/frequent ranking or last-event persistence in this task.
- [x] Loading, empty, inaccessible, and deleted-event states fall back to Home without leaving stale event data visible.
- [x] The switcher uses dashboard-only shadcn/Base UI components.

## Notes

The current route already defines the active event and workspace. Server authorization remains authoritative after navigation.

## Progress Log

- 2026-07-18T00:00:00Z: Task created.
- 2026-07-18T13:12:11+08:00: Removed speculative active-event persistence and ranking; aligned switching with the existing route-derived dashboard context and manager event list.
- 2026-07-18T14:15:31+08:00: Started implementation after moving t91 to last priority; the switcher will share one manager-scoped event-list request across desktop and mobile navigation.
- 2026-07-18T14:24:16+08:00: Added a shared manager event-list request, responsive Base UI popover switcher, workspace-preserving event links, retry/empty states, and Home fallback for inaccessible or deleted event routes. Verified with dashboard typecheck, Prettier, and the existing top-navigation suite (8 tests passed).
