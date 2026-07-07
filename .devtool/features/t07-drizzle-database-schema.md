---
id: 't07-drizzle-database-schema'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'database'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-07T00:00:00+08:00'
completedAt: null
labels: ['database', 'drizzle', 'postgres']
depends_on: ['t05-shared-types-and-schemas']
order: 'a07'
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

- [ ] `packages/db` contains Drizzle schema and migration config.
- [ ] Tables match the PRD core data model.
- [ ] Indexes support event slug lookup, event ownership, guest token lookup, RSVP lookup, and activity queries.
- [ ] Invite token hashes are stored instead of raw tokens.
- [ ] Local migration commands are documented.
- [ ] Migration generation and test database setup are verified.

## Notes

Use local PostgreSQL for development and Supabase PostgreSQL online. Keep JSON fields validated at API boundaries.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
