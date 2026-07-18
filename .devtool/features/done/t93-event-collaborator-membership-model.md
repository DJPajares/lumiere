---
id: 't93-event-collaborator-membership-model'
status: 'done'
priority: 'high'
assignee: null
epic: 'access-control'
dueDate: null
created: '2026-07-18T00:00:00Z'
modified: '2026-07-18T14:53:06+08:00'
completedAt: '2026-07-18T14:53:06+08:00'
labels: ['api', 'database', 'auth', 'collaboration']
depends_on: []
order: 'a93'
---

# t93-event-collaborator-membership-model - Event collaborator membership model

## Hierarchy

- Epic: `access-control`
- Dependencies: None

## Scope

Complete the collaborator lifecycle on top of the existing `event_managers` table, owner membership created with each event, and owner/editor/viewer access model. Add only the invitation and membership-management state needed for an owner to grant or revoke editor/viewer access. Treat ownership transfer as a separate future decision because `events.owner_user_id` is currently canonical.

## Suggested Agent

- Suggested model: `GPT-5.6 Sol (gpt-5.6-sol)`
- Reasoning level: `xhigh`

## Acceptance

- [x] Existing owner memberships and `events.owner_user_id` remain valid and are migrated without duplicate manager rows.
- [x] A pending invitation can target an email before a local Supabase-backed user record exists and records role, inviter, expiry/status, and audit timestamps.
- [x] Owner-only APIs support inviting an editor/viewer, accepting or declining an invitation, listing collaborators/invitations, resending or revoking an invitation, and removing a non-owner collaborator.
- [x] This task does not add ownership transfer or allow removal/demotion of the canonical event owner.
- [x] Duplicate pending invitations and active memberships for the same event and identity are prevented transactionally.
- [x] Supabase identities map safely to event memberships without exposing service credentials.
- [x] Existing auth/API test suites are extended for invitation acceptance, duplicate handling, removal, and owner-only management.

## Notes

This is a future collaboration enhancement in the PRD, not a replacement for the access foundation already in production. Keep roles coarse and continue using `event_managers` as the access source.

## Progress Log

- 2026-07-18T00:00:00Z: Task created.
- 2026-07-18T13:12:11+08:00: Converted the task from a new membership model into an invitation/lifecycle extension of the existing event manager schema; deferred ownership transfer.
- 2026-07-18T14:30:11+08:00: Started implementation after t92. Extending `event_managers` with a normalized-email invitation lifecycle, owner-only management endpoints, and authenticated invitee acceptance/decline endpoints.
- 2026-07-18T14:53:06+08:00: Added normalized-email collaborator invitations, transactional duplicate/membership protection, owner-only lifecycle management, authenticated email-matched acceptance/decline, typed client contracts, API documentation, and an idempotent owner-membership backfill. Verified all 9 database migrations against disposable PostgreSQL, all 10 workspace TypeScript projects directly, and 114 affected tests.
