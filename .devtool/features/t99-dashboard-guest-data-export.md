---
id: 't99-dashboard-guest-data-export'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'guest-management'
dueDate: null
created: '2026-07-18T00:00:00Z'
modified: '2026-07-18T00:00:00Z'
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

Add permission-controlled guest and RSVP data export for event managers. Support CSV as the required format and XLSX as an optional richer format through a server-generated export pipeline.

## Suggested Agent

- Suggested model: `GPT-5.6 Terra (gpt-5.6-terra)`
- Reasoning level: `high`

## Acceptance

- [ ] Authorized managers can export the active event's guest groups, named members, RSVP status, party size, messages, and relevant timestamps.
- [ ] CSV export is supported with stable column names, UTF-8 encoding, and spreadsheet-safe escaping.
- [ ] XLSX export is supported when the selected dependency is justified and tested, otherwise the task documents CSV-only MVP behavior.
- [ ] Current filter and sort state can be applied to the export or managers can explicitly choose all event data.
- [ ] Exports are generated server-side and remain event-scoped and permission-checked.
- [ ] Potential spreadsheet formula injection is neutralized.
- [ ] Large exports use streaming or bounded-memory generation and produce an audit record.

## Notes

Use the latest stable export dependency where practical. Do not expose internal IDs or guest tokens unless explicitly required and reviewed.

## Progress Log

- 2026-07-18T00:00:00Z: Task created.
