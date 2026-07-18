---
id: 't93-event-collaborator-membership-model'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'access-control'
dueDate: null
created: '2026-07-18T00:00:00Z'
modified: '2026-07-18T13:12:11+08:00'
completedAt: null
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

- [ ] Existing owner memberships and `events.owner_user_id` remain valid and are migrated without duplicate manager rows.
- [ ] A pending invitation can target an email before a local Supabase-backed user record exists and records role, inviter, expiry/status, and audit timestamps.
- [ ] Owner-only APIs support inviting an editor/viewer, accepting or declining an invitation, listing collaborators/invitations, resending or revoking an invitation, and removing a non-owner collaborator.
- [ ] This task does not add ownership transfer or allow removal/demotion of the canonical event owner.
- [ ] Duplicate pending invitations and active memberships for the same event and identity are prevented transactionally.
- [ ] Supabase identities map safely to event memberships without exposing service credentials.
- [ ] Existing auth/API test suites are extended for invitation acceptance, duplicate handling, removal, and owner-only management.

## Notes

This is a future collaboration enhancement in the PRD, not a replacement for the access foundation already in production. Keep roles coarse and continue using `event_managers` as the access source.

## Progress Log

- 2026-07-18T00:00:00Z: Task created.
- 2026-07-18T13:12:11+08:00: Converted the task from a new membership model into an invitation/lifecycle extension of the existing event manager schema; deferred ownership transfer.
