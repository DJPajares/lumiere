---
id: 't32-integration-smoke-tests'
status: 'done'
priority: 'high'
assignee: null
epic: 'testing'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-09T14:43:39+08:00'
completedAt: '2026-07-09T14:43:39+08:00'
labels: ['testing', 'integration', 'smoke']
depends_on: ['t21-dashboard-event-overview', 't23-dashboard-section-builder', 't24-dashboard-guest-management', 't29-invite-rsvp-form-flow']
order: 'a32'
---

# t32-integration-smoke-tests - Integration and smoke tests

## Hierarchy

- Epic: `testing`
- Dependencies: `t21-dashboard-event-overview`, `t23-dashboard-section-builder`, `t24-dashboard-guest-management`, `t29-invite-rsvp-form-flow`

## Scope

Add cross-layer tests for the MVP happy path and critical failure states.

## Suggested Agent

- Suggested model: `GPT-5.5`
- Reasoning level: `extra high`

## Acceptance

- [x] Test flow covers create event, set theme, configure sections, create guest group, open public page, open guest page, submit RSVP, and view dashboard summary.
- [x] External auth is mocked or uses a documented test strategy.
- [x] Database tests run against isolated local/test PostgreSQL or documented test containers.
- [x] API contract tests verify response shapes used by both apps.
- [x] Failure tests cover invalid guest token and unauthorized dashboard access.
- [x] `pnpm test` or documented scoped commands run the suite.

## Notes

Prefer deterministic fixtures and isolated test data.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
- 2026-07-09T14:35:39+08:00: Started integration smoke coverage by auditing existing Vitest route/API tests and the documented disposable PostgreSQL strategy.
- 2026-07-09T14:43:39+08:00: Completed stateful API route smoke tests for the full MVP happy path, critical failure states, shared response-schema contracts, mocked Supabase auth, and documented smoke/DB strategy.
