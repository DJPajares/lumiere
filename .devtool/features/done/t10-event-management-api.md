---
id: "t10-event-management-api"
status: "done"
priority: "high"
assignee: null
epic: "api"
dueDate: null
created: "2026-07-07T00:00:00+08:00"
modified: "2026-07-08T14:26:00+08:00"
completedAt: "2026-07-08T14:26:00+08:00"
labels: ["api", "events", "dashboard"]
depends_on: ["t09-auth-and-event-access", "t07-drizzle-database-schema"]
order: "a10"
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

- [x] `GET /events` lists only events managed by the authenticated user.
- [x] `POST /events` creates an event and owner manager relationship.
- [x] `GET /events/:eventId` enforces manager access.
- [x] `PATCH /events/:eventId` validates and updates allowed event fields.
- [x] `DELETE /events/:eventId` archives or deletes based on documented MVP behavior.
- [x] API tests cover CRUD, ownership, validation, and duplicate slug handling.

## Notes

Prefer archive over hard delete unless the implementation intentionally documents hard deletion.

MVP delete behavior archives events by setting status to `archived`; it does not hard delete event data.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
- 2026-07-08T14:12:00+08:00: Started authenticated event CRUD endpoints using the manager auth/access foundation.
- 2026-07-08T14:26:00+08:00: Added shared event update/list contracts, Drizzle event store, authenticated event CRUD routes, archive-on-delete behavior, and focused CRUD/access tests.
- 2026-07-08T14:26:00+08:00: Verified with API tests/typecheck, shared types tests/typecheck, API lint placeholder, focused Prettier check, and `pnpm dev:api` health smoke check on port 4019.
