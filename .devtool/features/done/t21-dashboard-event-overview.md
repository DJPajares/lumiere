---
id: "t21-dashboard-event-overview"
status: "done"
priority: "high"
assignee: null
epic: "frontend"
dueDate: null
created: "2026-07-07T00:00:00+08:00"
modified: "2026-07-09T00:00:00+08:00"
completedAt: "2026-07-09T00:00:00+08:00"
labels: ["frontend", "dashboard", "summary"]
depends_on: ["t15-summary-activity-notification-api", "t20-dashboard-events-list-create"]
order: "a21"
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

- [x] Overview shows attending, not attending, maybe, pending, total invited, and max pax where available.
- [x] Recent activity feed shows RSVP and manager actions.
- [x] Loading, empty, and error states are implemented.
- [x] Summary data refreshes after RSVP changes when invalidated.
- [x] Layout is scannable on desktop and usable on mobile.
- [x] Tests cover summary rendering and empty activity state.

## UI Quality Checklist

- [x] Uses Tailwind tokens and project-owned primitives before adding a component library.
- [x] Follows color, shape, and theme locks from `SKILL.md`.
- [x] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [x] Works on required mobile and desktop viewport widths.
- [x] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [x] Avoids generic AI-slop patterns listed in `SKILL.md`.

## Notes

Avoid event-theme decoration here. Dashboard should stay clear and operational.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
- 2026-07-09T00:00:00+08:00: Started event overview implementation as the next unblocked dashboard task after `t20`.
- 2026-07-09T00:00:00+08:00: Completed event overview with typed event, summary, and activity loading; summary cards; event metadata; empty activity and error states; refresh on focus/manual invalidation. Verified with dashboard tests, typecheck, lint placeholder, and Prettier check.
