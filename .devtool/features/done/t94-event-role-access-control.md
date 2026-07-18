---
id: 't94-event-role-access-control'
status: 'done'
priority: 'high'
assignee: null
epic: 'access-control'
dueDate: null
created: '2026-07-18T00:00:00Z'
modified: '2026-07-18T15:29:00+08:00'
completedAt: '2026-07-18T15:29:00+08:00'
labels: ['api', 'dashboard', 'rbac', 'security']
depends_on: ['t93-event-collaborator-membership-model']
order: 'a94'
---

# t94-event-role-access-control - Event role-based access control

## Hierarchy

- Epic: `access-control`
- Dependencies: `t93-event-collaborator-membership-model`

## Scope

Audit and complete the existing owner/editor/viewer authorization model after collaborator invitations are available. Reuse `managerRoleRank` and `assertEventAccess`, close route or UI gaps, and add an owner-facing collaborator management surface without replacing the current access system. The UI must cover inviting editors or viewers, pending-invitation actions, role changes, and collaborator removal.

## Suggested Agent

- Suggested model: `GPT-5.6 Sol (gpt-5.6-sol)`
- Reasoning level: `xhigh`

## Acceptance

- [x] A documented matrix records the current owner, editor, and viewer capabilities using the existing coarse roles.
- [x] Every event-scoped API route is audited for `assertEventAccess` and the correct minimum role; identified gaps are fixed.
- [x] Dashboard routes, menus, buttons, and forms reflect permissions without treating hidden UI as authorization.
- [x] Event settings includes a complete owner-facing collaborator UI for inviting editors or viewers, reviewing and resending or revoking pending invitations, changing non-owner collaborators between editor and viewer, and removing collaborators.
- [x] The canonical owner is clearly identified and cannot be changed or removed in this task; no separate administrator role is introduced.
- [x] Forbidden actions return a consistent 403 response and do not reveal unrelated event data.
- [x] Existing activity infrastructure records collaborator role changes and removals plus currently supported sensitive event actions.
- [x] Existing security/API suites are extended for privilege escalation attempts, removed memberships, and cross-event access.

## Notes

Do not introduce an administrator role alias or a custom permission builder. Export authorization is specified in t99 once this matrix is settled.

## Progress Log

- 2026-07-18T00:00:00Z: Task created.
- 2026-07-18T13:12:11+08:00: Reframed RBAC as a coverage audit and collaborator UI over the existing role rank/access checks rather than a new authorization system.
- 2026-07-18T15:04:00+08:00: Started implementation and expanded the collaborator UI to cover the full owner management lifecycle requested after t93.
- 2026-07-18T15:29:00+08:00: Completed the role matrix and route audit, added owner-only collaborator management in Event Settings, exposed event access roles to permission-aware dashboard workspaces, added role-change/removal activity records, and covered owner protection, removed memberships, and cross-event escalation. Verified 10 migrations, all 10 TypeScript projects, 272 tests, dashboard/theme boundaries, and focused formatting.
