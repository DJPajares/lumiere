---
id: 't16-api-client-package'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'contracts'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-07T00:00:00+08:00'
completedAt: null
labels: ['api-client', 'frontend', 'contracts']
depends_on: ['t10-event-management-api', 't11-theme-and-section-api', 't12-guest-group-api', 't13-public-invite-api', 't14-rsvp-api', 't15-summary-activity-notification-api']
order: 'a16'
---

# t16-api-client-package - Shared API client package

## Hierarchy

- Epic: `contracts`
- Dependencies: `t10-event-management-api`, `t11-theme-and-section-api`, `t12-guest-group-api`, `t13-public-invite-api`, `t14-rsvp-api`, `t15-summary-activity-notification-api`

## Scope

Create `packages/api-client` with typed functions for invite and dashboard apps.

## Suggested Agent

- Suggested model: `GPT-5.5`
- Reasoning level: `high`

## Acceptance

- [ ] API client supports manager auth token injection.
- [ ] Public invite functions do not require Supabase tokens.
- [ ] Functions exist for events, themes, sections, guest groups, public invite data, RSVP, summary, activity, and notifications.
- [ ] Errors normalize to the shared API error shape.
- [ ] Base URL is configurable per app.
- [ ] Vitest covers auth headers, public calls, query params, and error parsing.

## Notes

Keep the client simple. Avoid generated clients unless a deliberate contract tool is adopted later.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
