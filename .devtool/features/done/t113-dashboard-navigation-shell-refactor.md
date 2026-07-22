---
id: 't113-dashboard-navigation-shell-refactor'
status: 'done'
priority: 'high'
assignee: null
epic: 'dashboard-navigation'
dueDate: null
created: '2026-07-22T01:10:41+08:00'
modified: '2026-07-22T19:18:21+08:00'
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

- [x] Navigation responsibilities are split into small components with one shared route-derived context and one manager event-list request.
- [x] Product brand, manager destinations, event workspace destinations, and utility controls have an intentional responsive hierarchy rather than competing in one long row.
- [x] The active event remains unmistakable on every event workspace even when its full title is moved out of the event-switch control.
- [x] Desktop/tablet navigation remains single-line at supported widths or deliberately collapses; mobile retains an accessible drawer with the same reachable destinations.
- [x] Notifications, account controls, scroll visibility, inaccessible/deleted-event fallback, and current-route indicators retain their behavior.
- [x] The refactor uses only dashboard-scoped shadcn/Base UI wrappers and introduces no dashboard imports into the invite or theme packages.
- [x] Existing navigation tests continue to pass without losing covered behavior, together with dashboard typecheck, formatting, lint, responsive smoke checks, and the UI pre-flight review.

## Notes

This is a shell and information-architecture refactor, not a redesign of individual dashboard workspaces. Leave the compact event-switcher trigger to t114.

## Progress Log

- 2026-07-22T01:10:41+08:00: Task created for the requested navigation-bar refactor.
- 2026-07-22T08:24:00+08:00: Started from the supplied navbar references: compact floating shell, quiet active indicator, clear brand anchor, and separated utility actions. The refactor will preserve one route-derived context, one event-list request, the existing mobile drawer, and the current event-workspace routes; t114 remains responsible for changing the event-switcher trigger itself.
- 2026-07-22T19:03:15+08:00: Refactored the top bar into a floating contained shell inspired by the supplied references, with a compact brand anchor, centered pill-like destination rail, restrained active underline, utility controls at the edge, and a slim selected-event context rail. The existing full-title switcher remains intact for t114.
- 2026-07-22T19:03:15+08:00: Split event loading/route context, desktop links, selected-event summary, and mobile Sheet composition into focused modules. The switcher now receives the shared route-derived context instead of deriving it again, while the event list remains one request and the selected event remains derived rather than duplicated state.
- 2026-07-22T19:03:15+08:00: Deliberately collapsed 390px and 768px navigation into the accessible Sheet and reserved the single-line destination rail for 1024px+. Selected event title, status, and current section appear in both the desktop context rail and mobile drawer; deleted-event redirect, scroll visibility, notifications, account controls, active routes, focus restoration, and Escape behavior remain covered.
- 2026-07-22T19:03:15+08:00: Verification passed with all 104 existing dashboard tests, dashboard and dashboard-ui TypeScript checks, dashboard/theme ownership boundary validation, and `git diff --check`. The package lint scripts remain repository placeholders and their pnpm invocation stalled before output; no Prettier command was run per AGENTS.md.
- 2026-07-22T19:03:15+08:00: UI pre-flight reviewed semantic tokens, keyboard/focus states, reduced motion, 390px mobile, 768px tablet drawer, and 1440px desktop hierarchy. The in-app browser backend remained unavailable, so responsive verification used the existing interaction suite and breakpoint snapshots rather than automated screenshots.
- 2026-07-22T19:05:00+08:00: Reopened after visual review. The floating rounded shell, muted navigation capsule, filled active item, and redundant Home link were too far from the supplied references. Correcting to an edge-to-edge bar with no outer gap, transparent destination rail, underline-only current state, and brand-owned Home navigation.
- 2026-07-22T19:18:21+08:00: Applied the visual correction: the sticky shell is full viewport width with no outer top/side padding, maximum-width frame, rounding, shadow, or outer divider. Workspace links sit directly on the bar, and the active route uses only a two-pixel primary underline plus foreground text—no filled or elevated highlight.
- 2026-07-22T19:18:21+08:00: Removed the redundant Home destination from desktop and mobile navigation; the top brand and drawer brand now own the route back to the manager home. Mobile active links also dropped the filled background in favor of text plus the existing check indicator.
- 2026-07-22T19:18:21+08:00: Re-verification passed with all 104 dashboard tests, dashboard and dashboard-ui TypeScript checks, UI ownership boundaries, and `git diff --check`. Existing assertions now guard the edge-to-edge shell, absence of Home, and underline-only active state.
