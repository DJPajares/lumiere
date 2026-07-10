---
id: 't59-responsive-dashboard-top-navigation'
status: 'done'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-10T18:00:00+08:00'
modified: '2026-07-11T00:20:00+08:00'
completedAt: '2026-07-10T23:17:14+08:00'
labels: ['dashboard', 'shadcn', 'base-ui', 'navigation', 'responsive', 'scroll']
depends_on: ['t42-dashboard-navigation-ia-reset', 't56-dashboard-shadcn-foundation']
order: 'a59'
---

# t59-responsive-dashboard-top-navigation - Implement responsive dashboard navigation with Base UI-backed menus

## Hierarchy

- Epic: `frontend`
- Dependencies: `t42-dashboard-navigation-ia-reset`, `t56-dashboard-shadcn-foundation`

## Scope

Replace duplicated sidebar/header navigation with one responsive model. Desktop and tablet render manager and event-workspace navigation in the top bar. Mobile renders only a compact top bar and opens navigation in a Base UI-backed responsive drawer.

## Suggested Agent

- Suggested model: `GPT-5.6 Terra (gpt-5.6-terra)`
- Reasoning level: `high`

## Acceptance

- [x] Use one typed navigation model as the source for desktop/tablet menus and the mobile drawer.
- [x] Desktop and tablet show manager-level and current event-workspace navigation in the top bar with clear active and disabled states; no permanent side drawer remains.
- [x] The top bar hides while scrolling down and returns while scrolling up with thresholds that prevent jitter.
- [x] Focused controls, open menus/dialogs, keyboard navigation, and reduced-motion preference prevent disruptive hide/show behavior.
- [x] Mobile top bar contains the brand, burger trigger, notification control, and avatar only; route items live in a drawer hidden by default.
- [x] Use the generated Base UI-backed shadcn menu, dropdown, and drawer/dialog wrappers from `@lumiere/dashboard-ui`; do not introduce a second primitive system.
- [x] The drawer closes after navigation, on Escape, and on backdrop interaction and restores focus to the trigger.
- [x] Tests cover route active state, scroll direction behavior, mobile drawer operation, keyboard use, and breakpoint transitions.

## UI Quality Checklist

- [x] Uses the project-owned shadcn/ui Base UI components before creating custom controls.
- [x] Follows Lumiere color, shape, typography, density, motion, and theme locks from `SKILL.md`.
- [x] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [x] Works on required mobile, tablet, and desktop viewport widths.
- [x] Meets keyboard, label, contrast, focus-management, and reduced-motion basics.
- [x] Avoids browser-default controls, duplicate navigation, and generic AI-dashboard patterns.

## Notes

Avoid separate hard-coded menu arrays. Use responsive composition around the same route metadata. Keep scroll state outside React render loops where possible and animate only transform/opacity.

## Progress Log

- 2026-07-10T18:00:00+08:00: Original task created.
- 2026-07-10T18:30:00+08:00: Updated to the current shadcn CLI v4 workflow with Base UI primitives and monorepo-aware component placement.
- 2026-07-10T19:15:00+08:00: Scoped shadcn/Base UI to the dashboard only and updated the suggested model to GPT-5.6 Terra with xhigh reasoning.
- 2026-07-10T23:07:28+08:00: Started the responsive top-navigation overhaul after confirming t42 and t56 are complete; selected one typed route model, Base UI-backed dropdowns and mobile drawer, and thresholded scroll visibility with interaction locks.
- 2026-07-10T23:17:14+08:00: Completed the single-source responsive navigation with desktop/tablet dropdowns, a focus-restoring mobile drawer, event-aware active and disabled states, and interaction-safe scroll visibility. Verified 23 focused navigation/route tests, targeted Prettier, and `git diff --check`; dashboard typecheck reached only two unrelated in-progress profile-test fixture cast errors owned by the combined t60 integration.
- 2026-07-11T00:20:00+08:00: Refined desktop/tablet navigation in response to product feedback: direct event links now render as a centered horizontal row rather than dropdowns, while the mobile drawer trigger moved to the far-left edge of the top bar. Verified route and top-navigation coverage plus dashboard typecheck.
