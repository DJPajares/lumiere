---
id: "t16-api-client-package"
status: "done"
priority: "high"
assignee: null
epic: "contracts"
dueDate: null
created: "2026-07-07T00:00:00+08:00"
modified: "2026-07-07T00:00:00+08:00"
completedAt: "2026-07-08T20:25:00+08:00"
labels: ["api-client", "frontend", "contracts"]
depends_on:
  [
    "t10-event-management-api",
    "t11-theme-and-section-api",
    "t12-guest-group-api",
    "t13-public-invite-api",
    "t14-rsvp-api",
    "t15-summary-activity-notification-api",
  ]
order: "a16"
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

- [x] API client supports manager auth token injection.
- [x] Public invite functions do not require Supabase tokens.
- [x] Functions exist for events, themes, sections, guest groups, public invite data, RSVP, summary, activity, and notifications.
- [x] Errors normalize to the shared API error shape.
- [x] Base URL is configurable per app.
- [x] Vitest covers auth headers, public calls, query params, and error parsing.

## Notes

Keep the client simple. Avoid generated clients unless a deliberate contract tool is adopted later.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
- 2026-07-08T20:20:00+08:00: Started shared API client implementation with typed methods, auth injection, error normalization, and fetch-mock tests.
- 2026-07-08T20:25:00+08:00: Completed shared API client with typed endpoint functions, configurable base URL, manager auth injection, public no-auth calls, shared error normalization, and Vitest coverage.
