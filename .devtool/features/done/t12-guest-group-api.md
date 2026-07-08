---
id: "t12-guest-group-api"
status: "done"
priority: "high"
assignee: null
epic: "api"
dueDate: null
created: "2026-07-07T00:00:00+08:00"
modified: "2026-07-08T14:53:00+08:00"
completedAt: "2026-07-08T14:53:00+08:00"
labels: ["api", "guests", "links"]
depends_on: ["t10-event-management-api"]
order: "a12"
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

- [x] Managers can list, create, update, and delete guest groups for their events.
- [x] Guest groups include label, contact fields, max pax, status, and notes.
- [x] Create/regenerate flows produce high-entropy invite tokens and store only hashes.
- [x] Invite links include event slug and guest token or documented short invite code.
- [x] Max pax is validated as a positive integer.
- [x] Tests cover group CRUD, token generation, token hashing, and ownership checks.

## Notes

Do not use predictable guest group IDs as invite secrets.

MVP delete behavior disables guest groups by setting status to `disabled`; it does not hard delete guest data.

Create and regenerate responses return the raw guest token only inside the shareable URL. The database stores `invite_token_hash` plus a non-secret `invite_code`.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
- 2026-07-08T14:50:00+08:00: Started guest group CRUD and secure invite link generation API work.
- 2026-07-08T14:53:00+08:00: Added guest group list/create/update/disable/regenerate endpoints, HMAC invite token hashing, high-entropy token generation, and invite URL responses.
- 2026-07-08T14:53:00+08:00: Verified with API tests/typecheck, shared types tests/typecheck, API lint placeholder, focused Prettier check, and `pnpm dev:api` health smoke check on port 4021.
