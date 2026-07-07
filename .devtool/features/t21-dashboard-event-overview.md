---
id: 't21-dashboard-event-overview'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-07T00:00:00+08:00'
completedAt: null
labels: ['frontend', 'dashboard', 'summary']
depends_on: ['t15-summary-activity-notification-api', 't20-dashboard-events-list-create']
order: 'a21'
---

# t21-dashboard-event-overview - Dashboard event overview and summary cards

## Hierarchy

- Epic: `frontend`
- Dependencies: `t15-summary-activity-notification-api`, `t20-dashboard-events-list-create`

## Scope

Implement the event overview dashboard with response summary cards, event metadata, and recent activity.

## Suggested Agent

- Suggested model: `GPT-5.5`
- Reasoning level: `high`

## Acceptance

- [ ] Overview shows attending, not attending, maybe, pending, total invited, and max pax where available.
- [ ] Recent activity feed shows RSVP and manager actions.
- [ ] Loading, empty, and error states are implemented.
- [ ] Summary data refreshes after RSVP changes when invalidated.
- [ ] Layout is scannable on desktop and usable on mobile.
- [ ] Tests cover summary rendering and empty activity state.

## UI Quality Checklist

- [ ] Uses Tailwind tokens and project-owned primitives before adding a component library.
- [ ] Follows color, shape, and theme locks from `SKILL.md`.
- [ ] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [ ] Works on required mobile and desktop viewport widths.
- [ ] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [ ] Avoids generic AI-slop patterns listed in `SKILL.md`.

## Notes

Avoid event-theme decoration here. Dashboard should stay clear and operational.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
