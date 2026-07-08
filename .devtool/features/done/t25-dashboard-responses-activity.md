---
id: 't25-dashboard-responses-activity'
status: 'done'
priority: 'medium'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-09T00:00:00+08:00'
completedAt: '2026-07-09T00:00:00+08:00'
labels: ['frontend', 'responses', 'activity']
depends_on: ['t15-summary-activity-notification-api', 't24-dashboard-guest-management']
order: 'a25'
---

# t25-dashboard-responses-activity - Dashboard responses and activity screens

## Hierarchy

- Epic: `frontend`
- Dependencies: `t15-summary-activity-notification-api`, `t24-dashboard-guest-management`

## Scope

Implement RSVP responses and activity views for event managers.

## Suggested Agent

- Suggested model: `GPT-5.5`
- Reasoning level: `high`

## Acceptance

- [x] Responses view lists guest group, response status, attendee count, submitted time, and message.
- [x] Filters exist for attending, not attending, maybe, pending, and disabled where relevant.
- [x] Activity view lists chronological activity with useful metadata.
- [x] Empty states explain what will appear after guests respond.
- [x] Manager-only access is preserved through the API client.
- [x] Tests cover filters, empty state, and activity rendering.

## UI Quality Checklist

- [x] Uses Tailwind tokens and project-owned primitives before adding a component library.
- [x] Follows color, shape, and theme locks from `SKILL.md`.
- [x] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [x] Works on required mobile and desktop viewport widths.
- [x] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [x] Avoids generic AI-slop patterns listed in `SKILL.md`.

## Notes

Tables are acceptable where they improve scanability. Use grouped list/cards on mobile.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
- 2026-07-09T00:00:00+08:00: Started as the next unblocked dashboard task after guest management completion; promoted from backlog because no lower-order todo tasks were available and dependencies are complete.
- 2026-07-09T00:00:00+08:00: Completed responses/activity workspace using current manager-safe API endpoints: guest groups provide pending/disabled rows, recent activity provides response status/count/submitted time, and notifications provide manager-facing messages. Added filters, empty states, chronological activity rendering, and dashboard tests. Verified with dashboard tests, typecheck, lint placeholder, and targeted Prettier check.
