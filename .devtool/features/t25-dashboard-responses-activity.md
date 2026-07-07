---
id: 't25-dashboard-responses-activity'
status: 'backlog'
priority: 'medium'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-07T00:00:00+08:00'
completedAt: null
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

- [ ] Responses view lists guest group, response status, attendee count, submitted time, and message.
- [ ] Filters exist for attending, not attending, maybe, pending, and disabled where relevant.
- [ ] Activity view lists chronological activity with useful metadata.
- [ ] Empty states explain what will appear after guests respond.
- [ ] Manager-only access is preserved through the API client.
- [ ] Tests cover filters, empty state, and activity rendering.

## UI Quality Checklist

- [ ] Uses Tailwind tokens and project-owned primitives before adding a component library.
- [ ] Follows color, shape, and theme locks from `SKILL.md`.
- [ ] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [ ] Works on required mobile and desktop viewport widths.
- [ ] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [ ] Avoids generic AI-slop patterns listed in `SKILL.md`.

## Notes

Tables are acceptable where they improve scanability. Use grouped list/cards on mobile.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
