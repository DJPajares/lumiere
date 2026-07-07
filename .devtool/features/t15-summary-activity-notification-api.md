---
id: 't15-summary-activity-notification-api'
status: 'backlog'
priority: 'medium'
assignee: null
epic: 'api'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-07T00:00:00+08:00'
completedAt: null
labels: ['api', 'dashboard', 'notifications']
depends_on: ['t14-rsvp-api']
order: 'a15'
---

# t15-summary-activity-notification-api - Summary, activity, and notification API

## Hierarchy

- Epic: `api`
- Dependencies: `t14-rsvp-api`

## Scope

Implement manager-facing summary, activity, and simple in-app notification endpoints.

## Suggested Agent

- Suggested model: `GPT-5.5`
- Reasoning level: `high`

## Acceptance

- [ ] `GET /events/:eventId/summary` returns attending, not attending, maybe, pending, total groups, and total pax metrics.
- [ ] `GET /events/:eventId/activity` returns recent activity ordered by creation time.
- [ ] Notification records are created for RSVP submissions.
- [ ] Manager-only access is enforced.
- [ ] Tests cover summary counts, activity ordering, and notification creation.
- [ ] README notes email/SMS as future integrations unless implemented.

## Notes

Keep MVP notifications in-app. Do not introduce an email provider unless promoted into scope.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
