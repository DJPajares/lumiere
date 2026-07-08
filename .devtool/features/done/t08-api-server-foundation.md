---
id: "t08-api-server-foundation"
status: "done"
priority: "high"
assignee: null
epic: "api"
dueDate: null
created: "2026-07-07T00:00:00+08:00"
modified: "2026-07-08T13:56:00+08:00"
completedAt: "2026-07-08T13:56:00+08:00"
labels: ["api", "hono", "foundation"]
depends_on: ["t02-tooling-quality-baseline", "t03-environment-config"]
order: "a08"
---

# t08-api-server-foundation - Hono API foundation

## Hierarchy

- Epic: `api`
- Dependencies: `t02-tooling-quality-baseline`, `t03-environment-config`

## Scope

Create the Hono API service with request IDs, error handling, health endpoint, config loading, and test setup.

## Suggested Agent

- Suggested model: `GPT-5.4-mini`
- Reasoning level: `medium`

## Acceptance

- [x] API starts locally through `pnpm dev:api`.
- [x] `GET /health` returns HTTP 200 and status payload.
- [x] Global error handler returns the shared API error shape.
- [x] Request IDs are generated or propagated.
- [x] Vitest covers health and basic error behavior.
- [x] README documents how to run the API.

## Notes

Keep route groups modular so later tasks can register event, public, RSVP, and theme routes cleanly.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
- 2026-07-08T08:16:44+08:00: Started Hono API foundation with health, request IDs, shared error responses, and tests.
- 2026-07-08T13:56:00+08:00: Verified API tests, API typecheck, and `pnpm dev:api` health smoke check on port 4017; marked task complete.
