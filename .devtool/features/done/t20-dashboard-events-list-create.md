---
id: "t20-dashboard-events-list-create"
status: "done"
priority: "high"
assignee: null
epic: "frontend"
dueDate: null
created: "2026-07-07T00:00:00+08:00"
modified: "2026-07-09T00:00:00+08:00"
completedAt: "2026-07-09T00:00:00+08:00"
labels: ["frontend", "dashboard", "events"]
depends_on: ["t10-event-management-api", "t19-dashboard-auth-flow"]
order: "a20"
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

- [x] Event list shows only events returned for the manager.
- [x] Empty state explains how to create the first event.
- [x] Create form captures event title, type, slug, date/time, and venue basics.
- [x] Validation errors are shown near fields.
- [x] Successful creation navigates to the event detail page.
- [x] Tests cover empty state, validation error, and successful create interaction.

## UI Quality Checklist

- [x] Uses Tailwind tokens and project-owned primitives before adding a component library.
- [x] Follows color, shape, and theme locks from `SKILL.md`.
- [x] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [x] Works on required mobile and desktop viewport widths.
- [x] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [x] Avoids generic AI-slop patterns listed in `SKILL.md`.

## Notes

Keep forms label-first and dashboard copy concise.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
- 2026-07-09T00:00:00+08:00: Started dashboard events list and create flow; treating this as next available unblocked task because no lower-order `todo` task exists.
- 2026-07-09T00:00:00+08:00: Completed typed dashboard event list loading, empty/error states, create form validation, create API submission, and navigation to the created event workspace. Verified with dashboard tests, typecheck, lint placeholder, and Prettier check.
