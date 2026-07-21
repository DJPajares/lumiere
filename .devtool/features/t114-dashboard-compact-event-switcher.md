---
id: 't114-dashboard-compact-event-switcher'
status: 'todo'
priority: 'high'
assignee: null
epic: 'dashboard-navigation'
dueDate: null
created: '2026-07-22T01:10:41+08:00'
modified: '2026-07-22T01:10:41+08:00'
labels: ['dashboard', 'events', 'navigation', 'event-switcher', 'ux']
depends_on: ['t113-dashboard-navigation-shell-refactor']
order: 'a114'
---

# t114-dashboard-compact-event-switcher - Move event switching to a compact utility control

## Hierarchy

- Epic: `dashboard-navigation`
- Dependencies: `t113-dashboard-navigation-shell-refactor`

## Scope

Replace the title-width event dropdown in the desktop navigation row with a compact icon button in the utility-control cluster near notifications. Keep a popover/menu for choosing events, while showing the active event name in workspace context where it can use available page width.

## Acceptance

- [ ] Desktop/tablet uses an icon-sized event-switch trigger grouped with utility controls near notifications; long event titles no longer consume navigation-row width.
- [ ] The icon has an accessible name that includes the current event when available, a tooltip or equivalent visible hint, clear focus/open/current states, and no reliance on icon shape alone.
- [ ] The event picker still lists only accessible manager events and preserves the current known workspace segment when switching.
- [ ] The active event title remains visible in the workspace header/breadcrumb or equivalent contextual surface, including narrow layouts where the icon trigger cannot communicate it visually.
- [ ] Mobile keeps a touch-friendly event selector in the navigation drawer or another deliberate compact pattern rather than forcing an icon-only discovery problem.
- [ ] Loading, empty, retry, inaccessible, deleted-event, single-event, and many-event states remain functional and keyboard accessible.
- [ ] Relevant existing top-navigation/event-switcher tests, dashboard typecheck, formatting, lint, responsive smoke checks, and the `SKILL.md` UI pre-flight review pass.

## Notes

Reuse the existing route-derived switch logic and event list. The compact trigger changes placement and information density, not the underlying event-selection model.

## Progress Log

- 2026-07-22T01:10:41+08:00: Task created to reclaim navbar space while preserving event switching.
