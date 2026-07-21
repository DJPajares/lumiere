---
id: 't113-dashboard-navigation-shell-refactor'
status: 'todo'
priority: 'high'
assignee: null
epic: 'dashboard-navigation'
dueDate: null
created: '2026-07-22T01:10:41+08:00'
modified: '2026-07-22T01:22:35+08:00'
labels: ['dashboard', 'navigation', 'navbar', 'responsive', 'refactor']
depends_on: ['t59-responsive-dashboard-top-navigation', 't60-dashboard-user-menu-and-notifications', 't92-dashboard-event-switcher']
order: 'a113'
---

# t113-dashboard-navigation-shell-refactor - Refactor the dashboard navigation bar

## Hierarchy

- Epic: `dashboard-navigation`
- Dependencies: `t59-responsive-dashboard-top-navigation`, `t60-dashboard-user-menu-and-notifications`, `t92-dashboard-event-switcher`

## Scope

Refactor the dashboard top navigation into a clearer, lower-pressure shell that separates product identity, manager-level destinations, event-workspace context, and utility controls. Reduce horizontal competition without changing route ownership or introducing a second active-event state.

## Suggested Agent

- Suggested model: `GPT-5.6 Sol (gpt-5.6-sol)`
- Reasoning level: `high`

## Acceptance

- [ ] Navigation responsibilities are split into small components with one shared route-derived context and one manager event-list request.
- [ ] Product brand, manager destinations, event workspace destinations, and utility controls have an intentional responsive hierarchy rather than competing in one long row.
- [ ] The active event remains unmistakable on every event workspace even when its full title is moved out of the event-switch control.
- [ ] Desktop/tablet navigation remains single-line at supported widths or deliberately collapses; mobile retains an accessible drawer with the same reachable destinations.
- [ ] Notifications, account controls, scroll visibility, inaccessible/deleted-event fallback, and current-route indicators retain their behavior.
- [ ] The refactor uses only dashboard-scoped shadcn/Base UI wrappers and introduces no dashboard imports into the invite or theme packages.
- [ ] Existing navigation tests continue to pass without losing covered behavior, together with dashboard typecheck, formatting, lint, responsive smoke checks, and the UI pre-flight review.

## Notes

This is a shell and information-architecture refactor, not a redesign of individual dashboard workspaces. Leave the compact event-switcher trigger to t114.

## Progress Log

- 2026-07-22T01:10:41+08:00: Task created for the requested navigation-bar refactor.
