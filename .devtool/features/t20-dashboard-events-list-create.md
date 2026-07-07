---
id: 't20-dashboard-events-list-create'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-07T00:00:00+08:00'
completedAt: null
labels: ['frontend', 'dashboard', 'events']
depends_on: ['t10-event-management-api', 't19-dashboard-auth-flow']
order: 'a20'
---

# t20-dashboard-events-list-create - Dashboard events list and create flow

## Hierarchy

- Epic: `frontend`
- Dependencies: `t10-event-management-api`, `t19-dashboard-auth-flow`

## Scope

Implement dashboard event list, empty state, and create event flow connected to the API.

## Suggested Agent

- Suggested model: `GPT-5.5`
- Reasoning level: `high`

## Acceptance

- [ ] Event list shows only events returned for the manager.
- [ ] Empty state explains how to create the first event.
- [ ] Create form captures event title, type, slug, date/time, and venue basics.
- [ ] Validation errors are shown near fields.
- [ ] Successful creation navigates to the event detail page.
- [ ] Tests cover empty state, validation error, and successful create interaction.

## UI Quality Checklist

- [ ] Uses Tailwind tokens and project-owned primitives before adding a component library.
- [ ] Follows color, shape, and theme locks from `SKILL.md`.
- [ ] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [ ] Works on required mobile and desktop viewport widths.
- [ ] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [ ] Avoids generic AI-slop patterns listed in `SKILL.md`.

## Notes

Keep forms label-first and dashboard copy concise.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
