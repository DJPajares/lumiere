---
id: 't100-dashboard-response-view-modes'
status: 'backlog'
priority: 'medium'
assignee: null
epic: 'responses'
dueDate: null
created: '2026-07-18T00:00:00Z'
modified: '2026-07-18T00:00:00Z'
completedAt: null
labels: ['dashboard', 'responses', 'views', 'analytics']
depends_on: ['t96-dashboard-guest-filter-and-sort']
order: 'a100'
---

# t100-dashboard-response-view-modes - Dashboard response view modes

## Hierarchy

- Epic: `responses`
- Dependencies: `t96-dashboard-guest-filter-and-sort`

## Scope

Add multiple response presentations for different management tasks. Provide a detailed table/list view and a summary-oriented grouped or card view while preserving one source of response data and filtering state.

## Suggested Agent

- Suggested model: `GPT-5.6 Terra (gpt-5.6-terra)`
- Reasoning level: `high`

## Acceptance

- [ ] Response management supports at least detailed table/list and summary/grouped views.
- [ ] Summary view communicates attending, not attending, pending, total guests, and incomplete-response counts without misleading totals.
- [ ] Detailed view exposes guest group, selected attendees, party size, message, submitted time, and latest activity where available.
- [ ] Filters and sorting remain consistent when switching views.
- [ ] The selected response view is persisted or represented in the URL.
- [ ] Mobile receives a readable touch-friendly layout instead of a compressed desktop table.
- [ ] Automated tests verify totals, view switching, event isolation, and filtered result consistency.

## Notes

Prefer clear information hierarchy over adding charts by default. Add visualization only when it improves a concrete manager decision.

## Progress Log

- 2026-07-18T00:00:00Z: Task created.
