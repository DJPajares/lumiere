---
id: 't99-dashboard-guest-data-export'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'guest-management'
dueDate: null
created: '2026-07-18T00:00:00Z'
modified: '2026-07-18T13:12:11+08:00'
completedAt: null
labels: ['dashboard', 'api', 'guests', 'export']
depends_on: ['t94-event-role-access-control', 't96-dashboard-guest-filter-and-sort']
order: 'a99'
---

# t99-dashboard-guest-data-export - Dashboard guest data export

## Hierarchy

- Epic: `guest-management`
- Dependencies: `t94-event-role-access-control`, `t96-dashboard-guest-filter-and-sort`

## Scope

Add permission-controlled guest and RSVP export after the export role is defined. Generate documented, spreadsheet-safe CSV and XLSX files from the same server-side, event-scoped export model without introducing a generic background export framework.

## Suggested Agent

- Suggested model: `GPT-5.6 Terra (gpt-5.6-terra)`
- Reasoning level: `high`

## Acceptance

- [ ] Authorized managers can export the active event's guest groups, named members, RSVP status, party size, messages, and relevant timestamps.
- [ ] CSV export is supported with stable column names, UTF-8 encoding, and spreadsheet-safe escaping.
- [ ] XLSX export presents the same documented dataset with readable headers, sensible column widths, and no executable formulas.
- [ ] The documented row shape handles multiple named/selected attendees without exposing internal IDs or invite credentials.
- [ ] Managers explicitly choose whether to export all event rows or the current supported guest filters; visual sort order does not need to affect CSV semantics.
- [ ] Exports are generated server-side and remain event-scoped and permission-checked.
- [ ] Potential spreadsheet formula injection is neutralized.
- [ ] The response uses bounded-memory generation with a documented row limit or streaming when the current deployment supports it, and records the export in existing activity history.

## Notes

Use one normalized export dataset for both formats and add only a justified XLSX dependency. Never export internal IDs, invite codes, links, or tokens.

## Progress Log

- 2026-07-18T00:00:00Z: Task created.
- 2026-07-18T13:12:11+08:00: Kept the requested CSV and XLSX formats while narrowing both to one permission-checked server dataset and removing a speculative generic export pipeline.
