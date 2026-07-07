---
id: 't10-event-management-api'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'api'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-07T00:00:00+08:00'
completedAt: null
labels: ['api', 'events', 'dashboard']
depends_on: ['t09-auth-and-event-access', 't07-drizzle-database-schema']
order: 'a10'
---

# t10-event-management-api - Event management API

## Hierarchy

- Epic: `api`
- Dependencies: `t09-auth-and-event-access`, `t07-drizzle-database-schema`

## Scope

Implement authenticated event CRUD endpoints for dashboard managers.

## Suggested Agent

- Suggested model: `GPT-5.5`
- Reasoning level: `high`

## Acceptance

- [ ] `GET /events` lists only events managed by the authenticated user.
- [ ] `POST /events` creates an event and owner manager relationship.
- [ ] `GET /events/:eventId` enforces manager access.
- [ ] `PATCH /events/:eventId` validates and updates allowed event fields.
- [ ] `DELETE /events/:eventId` archives or deletes based on documented MVP behavior.
- [ ] API tests cover CRUD, ownership, validation, and duplicate slug handling.

## Notes

Prefer archive over hard delete unless the implementation intentionally documents hard deletion.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
