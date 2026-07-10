---
id: 't59-responsive-dashboard-top-navigation'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-10T18:00:00+08:00'
modified: '2026-07-10T19:15:00+08:00'
completedAt: null
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
- Reasoning level: `xhigh`

## Acceptance

- [ ] Use one typed navigation model as the source for desktop/tablet menus and the mobile drawer.
- [ ] Desktop and tablet show manager-level and current event-workspace navigation in the top bar with clear active and disabled states; no permanent side drawer remains.
- [ ] The top bar hides while scrolling down and returns while scrolling up with thresholds that prevent jitter.
- [ ] Focused controls, open menus/dialogs, keyboard navigation, and reduced-motion preference prevent disruptive hide/show behavior.
- [ ] Mobile top bar contains the brand, burger trigger, notification control, and avatar only; route items live in a drawer hidden by default.
- [ ] Use the generated Base UI-backed shadcn menu, dropdown, and drawer/dialog wrappers from `@lumiere/dashboard-ui`; do not introduce a second primitive system.
- [ ] The drawer closes after navigation, on Escape, and on backdrop interaction and restores focus to the trigger.
- [ ] Tests cover route active state, scroll direction behavior, mobile drawer operation, keyboard use, and breakpoint transitions.

## UI Quality Checklist

- [ ] Uses the project-owned shadcn/ui Base UI components before creating custom controls.
- [ ] Follows Lumiere color, shape, typography, density, motion, and theme locks from `SKILL.md`.
- [ ] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [ ] Works on required mobile, tablet, and desktop viewport widths.
- [ ] Meets keyboard, label, contrast, focus-management, and reduced-motion basics.
- [ ] Avoids browser-default controls, duplicate navigation, and generic AI-dashboard patterns.

## Notes

Avoid separate hard-coded menu arrays. Use responsive composition around the same route metadata. Keep scroll state outside React render loops where possible and animate only transform/opacity.

## Progress Log

- 2026-07-10T18:00:00+08:00: Original task created.
- 2026-07-10T18:30:00+08:00: Updated to the current shadcn CLI v4 workflow with Base UI primitives and monorepo-aware component placement.
- 2026-07-10T19:15:00+08:00: Scoped shadcn/Base UI to the dashboard only and updated the suggested model to GPT-5.6 Terra with xhigh reasoning.
