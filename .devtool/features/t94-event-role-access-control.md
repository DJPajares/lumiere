---
id: 't94-event-role-access-control'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'access-control'
dueDate: null
created: '2026-07-18T00:00:00Z'
modified: '2026-07-18T13:12:11+08:00'
completedAt: null
labels: ['api', 'dashboard', 'rbac', 'security']
depends_on: ['t93-event-collaborator-membership-model']
order: 'a94'
---

# t94-event-role-access-control - Event role-based access control

## Hierarchy

- Epic: `access-control`
- Dependencies: `t93-event-collaborator-membership-model`

## Scope

Audit and complete the existing owner/editor/viewer authorization model after collaborator invitations are available. Reuse `managerRoleRank` and `assertEventAccess`, close route or UI gaps, and add an owner-facing collaborator role editor without replacing the current access system.

## Suggested Agent

- Suggested model: `GPT-5.6 Sol (gpt-5.6-sol)`
- Reasoning level: `xhigh`

## Acceptance

- [ ] A documented matrix records the current owner, editor, and viewer capabilities using the existing coarse roles.
- [ ] Every event-scoped API route is audited for `assertEventAccess` and the correct minimum role; identified gaps are fixed.
- [ ] Dashboard routes, menus, buttons, and forms reflect permissions without treating hidden UI as authorization.
- [ ] Owners can change non-owner collaborators between editor and viewer; the canonical owner cannot be changed in this task.
- [ ] Forbidden actions return a consistent 403 response and do not reveal unrelated event data.
- [ ] Existing activity infrastructure records collaborator role changes and removals plus currently supported sensitive event actions.
- [ ] Existing security/API suites are extended for privilege escalation attempts, removed memberships, and cross-event access.

## Notes

Do not introduce an administrator role alias or a custom permission builder. Export authorization is specified in t99 once this matrix is settled.

## Progress Log

- 2026-07-18T00:00:00Z: Task created.
- 2026-07-18T13:12:11+08:00: Reframed RBAC as a coverage audit and collaborator UI over the existing role rank/access checks rather than a new authorization system.
