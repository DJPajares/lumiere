---
id: 't97-dashboard-guest-view-modes'
status: 'backlog'
priority: 'medium'
assignee: null
epic: 'guest-management'
dueDate: null
created: '2026-07-18T00:00:00Z'
modified: '2026-07-18T13:12:11+08:00'
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

Add a compact list/table presentation alongside the existing guest cards so managers can choose the useful density for the current task and device. Reuse the filtering state and existing per-group actions; do not introduce bulk selection, pagination, or a separate data-fetching path as part of this presentation task.

## Suggested Agent

- Suggested model: `GPT-5.6 Luna (gpt-5.6-luna)`
- Reasoning level: `medium`

## Acceptance

- [ ] Guest management provides the existing detail card view and one denser list/table view with the fields needed to identify a group and its RSVP/invite status.
- [ ] Both views use the same search, filters, sorting, edit, link, regenerate, and disable handlers.
- [ ] The selected view is persisted per manager or encoded in the URL.
- [ ] Mobile defaults to an appropriate touch-friendly view without losing access to important fields.
- [ ] The views remain responsive without requiring bulk selection or a desktop-only data-table dependency.
- [ ] View controls use dashboard-only shadcn/Base UI components and remain keyboard accessible.

## Notes

The compact mode must be materially denser than the current responsive cards. Keep presentation separate from guest query state.

## Progress Log

- 2026-07-18T00:00:00Z: Task created.
- 2026-07-18T13:12:11+08:00: Kept the requested multi-view behavior while removing generated assumptions about pagination, bulk selection, and a separate data path.
