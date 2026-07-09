---
id: 't43-dashboard-event-edit-flow'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-09T00:00:00+08:00'
modified: '2026-07-09T00:00:00+08:00'
completedAt: null
labels: ['dashboard', 'events', 'editing', 'forms']
depends_on: ['t10-event-management-api', 't20-dashboard-events-list-create', 't21-dashboard-event-overview']
order: 'a43'
---

# t43-dashboard-event-edit-flow - Event edit flow from event list and workspace

## Hierarchy

- Epic: `frontend`
- Dependencies: `t10-event-management-api`, `t20-dashboard-events-list-create`, `t21-dashboard-event-overview`

## Scope

Add a complete event edit experience so managers can update existing event basics from the event list and event workspace, not only create new events.

## Suggested Agent

- Suggested model: `GPT-5.5`
- Reasoning level: `high`

## Acceptance

- [ ] Each event card or row has an obvious Edit action in addition to Open workspace.
- [ ] Event workspace has an event basics/settings form for title, type, slug, dates, timezone, venue name, venue address, and publish status.
- [ ] Edit form reuses the same validation schema as create where possible.
- [ ] Save success updates the event list/workspace state without requiring a full refresh.
- [ ] Dirty state, cancel behavior, validation errors, and save failure are handled clearly.
- [ ] Tests cover opening edit from the event list, editing from workspace, validation failure, and successful save.

## UI Quality Checklist

- [ ] Uses the selected dashboard or invite component strategy before custom UI.
- [ ] Follows Lumiere color, shape, typography, motion, and theme locks from `SKILL.md`.
- [ ] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [ ] Works on required mobile, tablet, and desktop viewport widths.
- [ ] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [ ] Avoids generic AI-slop patterns listed in `SKILL.md`.


## Notes

This addresses the missing path to edit events after creation.

## Progress Log

- 2026-07-09T00:00:00+08:00: Task created from dashboard and invite UX review concerns.
