---
id: 't93-event-collaborator-membership-model'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'access-control'
dueDate: null
created: '2026-07-18T00:00:00Z'
modified: '2026-07-18T00:00:00Z'
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

Introduce event-level collaborator memberships so multiple authenticated administrators can manage the same event. Define invitation, acceptance, removal, ownership-transfer, and membership-status behavior across the database and API.

## Suggested Agent

- Suggested model: `GPT-5.6 Sol (gpt-5.6-sol)`
- Reasoning level: `xhigh`

## Acceptance

- [ ] The data model supports multiple manager memberships per event with one clearly defined owner.
- [ ] Membership records include role, status, inviter, invitation timestamps, and audit timestamps.
- [ ] APIs support inviting an administrator, accepting or declining an invitation, listing collaborators, and removing a collaborator.
- [ ] The last owner cannot be removed without transferring ownership or deleting the event through the approved lifecycle.
- [ ] Duplicate active memberships and invitations are prevented transactionally.
- [ ] Supabase identities map safely to event memberships without exposing service credentials.
- [ ] Migration and API tests cover concurrent invitations, acceptance, removal, and ownership constraints.

## Notes

Use event membership as the source of access rather than copying manager IDs into multiple event-owned records. Preserve a clear audit trail for sensitive changes.

## Progress Log

- 2026-07-18T00:00:00Z: Task created.
