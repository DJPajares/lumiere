---
id: "t15-summary-activity-notification-api"
status: "done"
priority: "medium"
assignee: null
epic: "api"
dueDate: null
created: "2026-07-07T00:00:00+08:00"
modified: "2026-07-07T00:00:00+08:00"
completedAt: "2026-07-08T20:10:00+08:00"
labels: ["api", "dashboard", "notifications"]
depends_on: ["t14-rsvp-api"]
order: "a15"
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

- [x] `GET /events/:eventId/summary` returns attending, not attending, maybe, pending, total groups, and total pax metrics.
- [x] `GET /events/:eventId/activity` returns recent activity ordered by creation time.
- [x] Notification records are created for RSVP submissions.
- [x] Manager-only access is enforced.
- [x] Tests cover summary counts, activity ordering, and notification creation.
- [x] README notes email/SMS as future integrations unless implemented.

## Notes

Keep MVP notifications in-app. Do not introduce an email provider unless promoted into scope.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
- 2026-07-08T20:05:00+08:00: Started manager summary, activity, and in-app notification endpoints. MVP notifications remain in-app; email/SMS stay future integrations.
- 2026-07-08T20:10:00+08:00: Completed summary, activity, and notification endpoints with manager access checks, shared response contracts, RSVP notification creation, and focused tests.
