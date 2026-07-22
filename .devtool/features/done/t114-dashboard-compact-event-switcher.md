---
id: 't114-dashboard-compact-event-switcher'
status: 'done'
priority: 'high'
assignee: null
epic: 'dashboard-navigation'
dueDate: null
created: '2026-07-22T01:10:41+08:00'
modified: '2026-07-22T19:56:04+08:00'
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

## Suggested Agent

- Suggested model: `GPT-5.6 Terra (gpt-5.6-terra)`
- Reasoning level: `high`

## Acceptance

- [x] Desktop/tablet uses an icon-sized event-switch trigger grouped with utility controls near notifications; long event titles no longer consume navigation-row width.
- [x] The icon has an accessible name that includes the current event when available, a tooltip or equivalent visible hint, clear focus/open/current states, and no reliance on icon shape alone.
- [x] The event picker still lists only accessible manager events and preserves the current known workspace segment when switching.
- [x] The active event title remains visible in the workspace header/breadcrumb or equivalent contextual surface, including narrow layouts where the icon trigger cannot communicate it visually.
- [x] Mobile keeps a touch-friendly event selector in the navigation drawer or another deliberate compact pattern rather than forcing an icon-only discovery problem.
- [x] Loading, empty, retry, inaccessible, deleted-event, single-event, and many-event states remain functional and keyboard accessible.
- [x] Relevant existing top-navigation/event-switcher tests, dashboard typecheck, formatting, lint, responsive smoke checks, and the `SKILL.md` UI pre-flight review pass.

## Notes

Reuse the existing route-derived switch logic and event list. The compact trigger changes placement and information density, not the underlying event-selection model.

## Progress Log

- 2026-07-22T01:10:41+08:00: Task created to reclaim navbar space while preserving event switching.
- 2026-07-22T19:47:59+08:00: Started implementation using the existing route-derived event list and switch logic; compact placement is scoped to the utility cluster while the mobile drawer keeps its full selector.
- 2026-07-22T19:56:04+08:00: Moved event switching into the authenticated utility cluster immediately before notifications using a ghost icon button, current-event accessible name, focus/hover tooltip, and the existing Popover list. The desktop context rail continues to show the active event title and section, while the mobile drawer retains its full-width labeled selector.
- 2026-07-22T19:56:04+08:00: Preserved route-segment switching, accessible-event filtering, current-item state, retry/empty/loading behavior, and shared event-list ownership. Updated the existing navigation interaction test to cover compact sizing and the visible hint without adding a new test case.
- 2026-07-22T19:56:04+08:00: Verification passed with all 104 dashboard tests, dashboard and dashboard-ui TypeScript checks, dashboard/theme ownership boundaries, and `git diff --check`. Package lint remains a repository placeholder, no Prettier command was run per AGENTS.md, and the previously unavailable in-app browser meant responsive review used the existing 390px/768px/1440px breakpoint assertions plus static UI pre-flight inspection.
