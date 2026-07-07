---
id: 't12-guest-group-api'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'api'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-07T00:00:00+08:00'
completedAt: null
labels: ['api', 'guests', 'links']
depends_on: ['t10-event-management-api']
order: 'a12'
---

# t12-guest-group-api - Guest group and invite link API

## Hierarchy

- Epic: `api`
- Dependencies: `t10-event-management-api`

## Scope

Implement guest group management endpoints and secure unique invite link generation.

## Suggested Agent

- Suggested model: `GPT-5.5`
- Reasoning level: `extra high`

## Acceptance

- [ ] Managers can list, create, update, and delete guest groups for their events.
- [ ] Guest groups include label, contact fields, max pax, status, and notes.
- [ ] Create/regenerate flows produce high-entropy invite tokens and store only hashes.
- [ ] Invite links include event slug and guest token or documented short invite code.
- [ ] Max pax is validated as a positive integer.
- [ ] Tests cover group CRUD, token generation, token hashing, and ownership checks.

## Notes

Do not use predictable guest group IDs as invite secrets.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
