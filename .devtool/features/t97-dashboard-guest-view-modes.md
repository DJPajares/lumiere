---
id: 't97-dashboard-guest-view-modes'
status: 'backlog'
priority: 'medium'
assignee: null
epic: 'guest-management'
dueDate: null
created: '2026-07-18T00:00:00Z'
modified: '2026-07-18T00:00:00Z'
completedAt: null
labels: ['dashboard', 'guests', 'views', 'responsive']
depends_on: ['t96-dashboard-guest-filter-and-sort']
order: 'a97'
---

# t97-dashboard-guest-view-modes - Dashboard guest view modes

## Hierarchy

- Epic: `guest-management`
- Dependencies: `t96-dashboard-guest-filter-and-sort`

## Scope

Add view-mode controls for the guest directory so managers can choose the most useful presentation for the device and task. Provide at least table/list and card/compact modes without duplicating business logic.

## Suggested Agent

- Suggested model: `GPT-5.6 Luna (gpt-5.6-luna)`
- Reasoning level: `medium`

## Acceptance

- [ ] Guest management supports at least a data-table/list view and a responsive card or compact view.
- [ ] Both views use the same filters, sorting, pagination, selection, and action contracts.
- [ ] The selected view is persisted per manager or encoded in the URL.
- [ ] Mobile defaults to an appropriate touch-friendly view without losing access to important fields.
- [ ] Bulk-selection behavior is consistent across supported views.
- [ ] View controls use dashboard-only shadcn/Base UI components and remain keyboard accessible.

## Notes

Do not build separate data-fetching paths per view. Keep presentation separate from guest query state.

## Progress Log

- 2026-07-18T00:00:00Z: Task created.
