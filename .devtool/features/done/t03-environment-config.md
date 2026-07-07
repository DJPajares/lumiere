---
id: "t03-environment-config"
status: "done"
priority: "high"
assignee: null
epic: "foundation"
dueDate: null
created: "2026-07-07T00:00:00+08:00"
modified: "2026-07-07T23:59:18+08:00"
completedAt: "2026-07-07T23:59:18+08:00"
labels: ["config", "env", "security"]
depends_on: ["t01-project-scaffold"]
order: "a03"
---

# t03-environment-config - Environment and config management

## Hierarchy

- Epic: `foundation`
- Dependencies: `t01-project-scaffold`

## Scope

Create shared environment configuration for API, invite app, and dashboard app. Add example env files and fail-fast validation for server configuration.

## Suggested Agent

- Suggested model: `GPT-5.4-mini`
- Reasoning level: `medium`

## Acceptance

- [x] `packages/config` exposes typed config helpers.
- [x] API validates required server-only variables at startup.
- [x] Invite and dashboard apps only expose safe `NEXT_PUBLIC_` variables.
- [x] `.env.example` files exist for each app.
- [x] README documents required variables.
- [x] Secrets are not committed or exposed to clients.

## Notes

Use schema validation if a validation dependency is selected. Keep client and server config separated.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
- 2026-07-07T23:55:17+08:00: Started shared environment config with zod-backed validation and per-app env examples.
- 2026-07-07T23:59:18+08:00: Completed environment config. Added typed shared env helpers, API startup validation, app env examples, README notes, and tests for required secrets and public-only client config.
