---
id: 't09-auth-and-event-access'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'auth'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-07T00:00:00+08:00'
completedAt: null
labels: ['auth', 'supabase', 'security']
depends_on: ['t07-drizzle-database-schema', 't08-api-server-foundation']
order: 'a09'
---

# t09-auth-and-event-access - Supabase auth and event access control

## Hierarchy

- Epic: `auth`
- Dependencies: `t07-drizzle-database-schema`, `t08-api-server-foundation`

## Scope

Integrate Supabase Auth for dashboard manager endpoints and implement event ownership/manager role checks.

## Suggested Agent

- Suggested model: `GPT-5.5`
- Reasoning level: `extra high`

## Acceptance

- [ ] API resolves current manager from a Supabase bearer token.
- [ ] Authenticated access can upsert a local user profile mirror.
- [ ] Event access utility enforces owner/editor/viewer roles.
- [ ] Missing or invalid tokens return 401.
- [ ] Unauthorized event access returns 403 or 404 based on privacy decision.
- [ ] Tests cover auth success, missing token, invalid token, and unauthorized event access.

## Notes

Guest invite flows should not require Supabase accounts.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
