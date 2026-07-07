---
id: "t07-drizzle-database-schema"
status: "done"
priority: "high"
assignee: null
epic: "database"
dueDate: null
created: "2026-07-07T00:00:00+08:00"
modified: "2026-07-08T00:45:07+08:00"
completedAt: "2026-07-08T00:45:07+08:00"
labels: ["database", "drizzle", "postgres"]
depends_on: ["t05-shared-types-and-schemas"]
order: "a07"
---

# t07-drizzle-database-schema - Drizzle database schema and migrations

## Hierarchy

- Epic: `database`
- Dependencies: `t05-shared-types-and-schemas`

## Scope

Set up Drizzle with PostgreSQL and implement the MVP schema for users, events, managers, sections, assets, guest groups, RSVP responses, activity, and notifications.

## Suggested Agent

- Suggested model: `GPT-5.5`
- Reasoning level: `extra high`

## Acceptance

- [x] `packages/db` contains Drizzle schema and migration config.
- [x] Tables match the PRD core data model.
- [x] Indexes support event slug lookup, event ownership, guest token lookup, RSVP lookup, and activity queries.
- [x] Invite token hashes are stored instead of raw tokens.
- [x] Local migration commands are documented.
- [x] Migration generation and test database setup are verified.

## Notes

Use local PostgreSQL for development and Supabase PostgreSQL online. Keep JSON fields validated at API boundaries.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
- 2026-07-08T00:33:11+08:00: Started Drizzle schema and migration setup for the database package.
- 2026-07-08T00:45:07+08:00: Added Drizzle schema, client helpers, migration config, generated initial SQL migration, and documented local/test migration commands.
- 2026-07-08T00:45:07+08:00: Verified with DB package typecheck, schema tests, migration generation, Docker Compose test database SQL apply, table/index smoke queries, and workspace Vitest. Full Turbo typecheck was not completed because pnpm attempted a no-TTY dependency reinstall in this sandbox.
