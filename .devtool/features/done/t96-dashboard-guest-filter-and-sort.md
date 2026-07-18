---
id: 't96-dashboard-guest-filter-and-sort'
status: 'done'
priority: 'high'
assignee: null
epic: 'guest-management'
dueDate: null
created: '2026-07-18T00:00:00Z'
modified: '2026-07-18T16:40:52+08:00'
completedAt: '2026-07-18T16:40:52+08:00'
labels: ['dashboard', 'guests', 'filtering', 'sorting']
depends_on: ['t89-guest-group-member-fields']
order: 'a96'
---

# t96-dashboard-guest-filter-and-sort - Dashboard guest filtering and sorting

## Hierarchy

- Epic: `guest-management`
- Dependencies: `t89-guest-group-member-fields`

## Scope

Add simple search, status filtering, and sorting to the existing event-scoped guest-group card list. Use the guest groups already loaded by the workspace for the MVP; introduce server-side query parameters and pagination only when a documented list-size threshold or measured performance issue requires them.

## Suggested Agent

- Suggested model: `GPT-5.6 Terra (gpt-5.6-terra)`
- Reasoning level: `high`

## Acceptance

- [x] Managers can search case-insensitively by group label, structured member name, contact email, or the non-secret invite code.
- [x] The initial filter covers the existing guest-group statuses: pending, opened, responded, declined, and disabled.
- [x] Sort options use fields already present on `GuestGroup`: label, created/updated time, last opened time, max pax, and status.
- [x] Filter and sort state is reflected in the URL so views can be refreshed or shared.
- [x] Filtering does not search or expose invite tokens, and all input data remains scoped to the active event by the existing API.
- [x] Clear-all and no-results states are obvious and accessible.
- [x] Existing guest workspace tests are extended for search, status filtering, sort direction, URL restoration, and clear-all behavior.

## Notes

Do not load responses or activity solely to manufacture filters that the guest-group model does not support. A later scale task can add validated API query parameters, indexes, and pagination without changing the UI contract.

## Progress Log

- 2026-07-18T00:00:00Z: Task created.
- 2026-07-18T13:12:11+08:00: Narrowed the task to client-side controls over the existing event-scoped guest list and removed speculative response-completeness and server-pagination requirements.
- 2026-07-18T16:40:01+08:00: Started implementation after confirming t89 is complete; the existing guest workspace already exposes all required event-scoped search and sort fields, so no API changes are needed.
- 2026-07-18T16:40:52+08:00: Completed URL-backed case-insensitive search, status filtering, six existing-field sort modes, clear-all/no-results states, and focused guest workspace coverage. Verified 95 dashboard tests, dashboard typecheck, formatting, and diff checks.
