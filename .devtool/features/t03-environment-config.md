---
id: 't03-environment-config'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'foundation'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-07T00:00:00+08:00'
completedAt: null
labels: ['config', 'env', 'security']
depends_on: ['t01-project-scaffold']
order: 'a03'
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

- [ ] `packages/config` exposes typed config helpers.
- [ ] API validates required server-only variables at startup.
- [ ] Invite and dashboard apps only expose safe `NEXT_PUBLIC_` variables.
- [ ] `.env.example` files exist for each app.
- [ ] README documents required variables.
- [ ] Secrets are not committed or exposed to clients.

## Notes

Use schema validation if a validation dependency is selected. Keep client and server config separated.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
