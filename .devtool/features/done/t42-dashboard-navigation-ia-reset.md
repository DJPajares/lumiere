---
id: 't42-dashboard-navigation-ia-reset'
status: 'done'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-09T00:00:00+08:00'
modified: '2026-07-09T20:31:42+08:00'
completedAt: '2026-07-09T20:31:42+08:00'
labels: ['dashboard', 'navigation', 'information-architecture', 'uiux']
depends_on: ['t18-dashboard-app-scaffold', 't20-dashboard-events-list-create', 't21-dashboard-event-overview']
order: 'a42'
---

# t42-dashboard-navigation-ia-reset - Dashboard navigation and information architecture reset

## Hierarchy

- Epic: `frontend`
- Dependencies: `t18-dashboard-app-scaffold`, `t20-dashboard-events-list-create`, `t21-dashboard-event-overview`

## Scope

Redesign the dashboard shell so the sidebar, top header, breadcrumbs, tabs, and current-context block each have a clear non-overlapping job. Remove duplicate navigation labels and make the active manager/event/editing context obvious without wasting space.

## Suggested Agent

- Suggested model: `GPT-5.5`
- Reasoning level: `extra high`

## Acceptance

- [x] Dashboard has one primary navigation model for manager-level pages and one clear secondary navigation model for event workspace sections.
- [x] Sidebar and page header no longer repeat the same content unless it adds distinct context.
- [x] Event list, event workspace, section editor, theme editor, guests, responses, activity, and settings have clear routes and active states.
- [x] Mobile and tablet dashboard navigation collapses into a usable pattern without duplicate menus or horizontal overflow.
- [x] Current event context is visible when editing an event, but not shown as a noisy card on pages where it is redundant.
- [x] Tests or visual stories cover event list route, event workspace route, and a nested editor route.

## UI Quality Checklist

- [x] Uses the selected dashboard or invite component strategy before custom UI.
- [x] Follows Lumiere color, shape, typography, motion, and theme locks from `SKILL.md`.
- [x] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [x] Works on required mobile, tablet, and desktop viewport widths.
- [x] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [x] Avoids generic AI-slop patterns listed in `SKILL.md`.


## Notes

The current layout shows overlapping sidebar and header concepts. This task should simplify the management IA before deeper editor polish.

## Progress Log

- 2026-07-09T00:00:00+08:00: Task created from dashboard and invite UX review concerns.
- 2026-07-09T20:27:31+08:00: Started IA reset by reviewing `SKILL.md`, dashboard design notes, shell/sidebar/header behavior, current event tabs, and dashboard route tests.
- 2026-07-09T20:31:42+08:00: Completed dashboard IA reset by making the sidebar manager-only, replacing repeated context cards with breadcrumbs/header context, turning event tabs into the sole secondary workspace nav with mobile disclosure and desktop wrapping tabs, and updating route coverage. Verified with dashboard focused checks plus workspace typecheck, tests, lint, format check, and `git diff --check`.
