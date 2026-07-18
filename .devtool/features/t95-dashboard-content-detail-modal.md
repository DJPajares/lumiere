---
id: 't95-dashboard-content-detail-modal'
status: 'backlog'
priority: 'medium'
assignee: null
epic: 'dashboard-content'
dueDate: null
created: '2026-07-18T00:00:00Z'
modified: '2026-07-18T00:00:00Z'
completedAt: null
labels: ['dashboard', 'content', 'dialog', 'ux']
depends_on: ['t62-dashboard-responsive-modal-workflows']
order: 'a95'
---

# t95-dashboard-content-detail-modal - Dashboard content detail modal

## Hierarchy

- Epic: `dashboard-content`
- Dependencies: `t62-dashboard-responsive-modal-workflows`

## Scope

Add an explicit details action to event-content cards and open the corresponding detailed editor in a responsive modal or mobile drawer. Remove redundant standalone detail cards and preserve direct-link behavior where useful.

## Suggested Agent

- Suggested model: `GPT-5.6 Terra (gpt-5.6-terra)`
- Reasoning level: `high`

## Acceptance

- [ ] Each editable content or section card has a clear Details/Edit action.
- [ ] Desktop opens a shadcn/Base UI dialog and mobile uses the established responsive drawer pattern.
- [ ] The modal renders schema-driven fields rather than raw JSON.
- [ ] Saving updates the card preview without a full-page refresh.
- [ ] Closing with unsaved changes triggers a clear confirmation flow.
- [ ] The active detail view can be represented in the URL or restored after refresh when practical.
- [ ] Keyboard focus is trapped, restored, and labeled correctly.

## Notes

Use the existing dashboard field system. The invitation preview inside the modal must use the custom invite/theme renderer and must not inherit dashboard component styles.

## Progress Log

- 2026-07-18T00:00:00Z: Task created.
