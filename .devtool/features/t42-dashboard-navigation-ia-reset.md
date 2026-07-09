---
id: 't42-dashboard-navigation-ia-reset'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-09T00:00:00+08:00'
modified: '2026-07-09T00:00:00+08:00'
completedAt: null
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

- [ ] Dashboard has one primary navigation model for manager-level pages and one clear secondary navigation model for event workspace sections.
- [ ] Sidebar and page header no longer repeat the same content unless it adds distinct context.
- [ ] Event list, event workspace, section editor, theme editor, guests, responses, activity, and settings have clear routes and active states.
- [ ] Mobile and tablet dashboard navigation collapses into a usable pattern without duplicate menus or horizontal overflow.
- [ ] Current event context is visible when editing an event, but not shown as a noisy card on pages where it is redundant.
- [ ] Tests or visual stories cover event list route, event workspace route, and a nested editor route.

## UI Quality Checklist

- [ ] Uses the selected dashboard or invite component strategy before custom UI.
- [ ] Follows Lumiere color, shape, typography, motion, and theme locks from `SKILL.md`.
- [ ] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [ ] Works on required mobile, tablet, and desktop viewport widths.
- [ ] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [ ] Avoids generic AI-slop patterns listed in `SKILL.md`.


## Notes

The current layout shows overlapping sidebar and header concepts. This task should simplify the management IA before deeper editor polish.

## Progress Log

- 2026-07-09T00:00:00+08:00: Task created from dashboard and invite UX review concerns.
