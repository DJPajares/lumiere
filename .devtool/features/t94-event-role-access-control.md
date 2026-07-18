---
id: 't94-event-role-access-control'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'access-control'
dueDate: null
created: '2026-07-18T00:00:00Z'
modified: '2026-07-18T00:00:00Z'
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

Define and enforce event-scoped roles and permissions across the API and dashboard. Provide a manager-facing role editor while keeping authorization decisions on the server.

## Suggested Agent

- Suggested model: `GPT-5.6 Sol (gpt-5.6-sol)`
- Reasoning level: `xhigh`

## Acceptance

- [ ] A documented permission matrix defines at least owner, administrator/editor, and viewer roles.
- [ ] Every event-scoped API action checks the authenticated membership and required permission server-side.
- [ ] Dashboard routes, menus, buttons, and forms reflect permissions without treating hidden UI as authorization.
- [ ] Owners can change collaborator roles subject to ownership and last-owner constraints.
- [ ] Forbidden actions return a consistent 403 response and do not reveal unrelated event data.
- [ ] Audit records capture role changes, collaborator removals, publishing, exports, and destructive actions.
- [ ] Security tests cover privilege escalation attempts, stale memberships, and cross-event access.

## Notes

Keep roles coarse for MVP. Avoid a fully custom permission-builder unless future requirements justify it.

## Progress Log

- 2026-07-18T00:00:00Z: Task created.
