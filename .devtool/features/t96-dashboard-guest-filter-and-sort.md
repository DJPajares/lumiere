---
id: 't96-dashboard-guest-filter-and-sort'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'guest-management'
dueDate: null
created: '2026-07-18T00:00:00Z'
modified: '2026-07-18T00:00:00Z'
completedAt: null
labels: ['dashboard', 'guests', 'filtering', 'sorting']
depends_on: ['t89-guest-group-member-fields']
order: 'a96'
---

# t96-dashboard-guest-filter-and-sort - Dashboard guest filtering and sorting

## Hierarchy

- Epic: `guest-management`
- Dependencies: `t89-guest-group-member-fields`

## Scope

Add practical filtering, searching, and sorting for event guest groups and members. Support server-side query parameters when result size can grow beyond a small local list.

## Suggested Agent

- Suggested model: `GPT-5.6 Terra (gpt-5.6-terra)`
- Reasoning level: `high`

## Acceptance

- [ ] Managers can search by group name, member name, and invite identifier where appropriate.
- [ ] Filters cover RSVP status, invite status, response completeness, and relevant guest-group settings.
- [ ] Sort options include name, creation date, last response/activity, party size, and RSVP status.
- [ ] Filter and sort state is reflected in the URL so views can be refreshed or shared.
- [ ] The API validates supported fields and uses indexed queries for server-side filtering/sorting.
- [ ] Clear-all and no-results states are obvious and accessible.
- [ ] Tests cover combined filters, sort direction, invalid query parameters, and event isolation.

## Notes

Avoid loading all events or all guests into the client. Queries must remain scoped to the active event and current user's access.

## Progress Log

- 2026-07-18T00:00:00Z: Task created.
