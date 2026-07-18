---
id: 't100-dashboard-response-view-modes'
status: 'backlog'
priority: 'medium'
assignee: null
epic: 'responses'
dueDate: null
created: '2026-07-18T00:00:00Z'
modified: '2026-07-18T13:52:11+08:00'
completedAt: null
labels: ['dashboard', 'responses', 'views', 'rsvp']
depends_on: ['t90-rsvp-attendee-checkbox-validation']
order: 'a100'
---

# t100-dashboard-response-view-modes - Dashboard response view modes

## Hierarchy

- Epic: `responses`
- Dependencies: `t90-rsvp-attendee-checkbox-validation`

## Scope

Add a second response presentation alongside the existing responsive detailed list. Provide a grouped/card view for scanning responses by status while reusing the current response data, filters, and the event summary totals already computed by the API. Include selected structured attendees in detailed response information.

## Suggested Agent

- Suggested model: `GPT-5.6 Terra (gpt-5.6-terra)`
- Reasoning level: `high`

## Acceptance

- [ ] Response management provides the existing detailed list and a grouped/card view organized by attending, not attending, maybe, pending, and disabled status.
- [ ] Both views reuse one response dataset and the existing status filters; switching views does not refetch or recompute conflicting totals.
- [x] Detailed response information shows guest group, selected attendees, attendee count, message, and submitted time where available.
- [x] Pending and disabled rows continue to come from guest-group state and do not invent attendee selections.
- [ ] Legacy free-text RSVP names remain readable, while structured names are matched to current members where possible.
- [ ] The selected view is represented in the URL and mobile receives a touch-friendly presentation.
- [ ] Existing API and dashboard response tests are extended for view switching, structured selections, legacy names, decline, filters, and event isolation.

## Notes

Event overview already provides attending, declined, maybe, pending, invited, and responded summary cards. Reuse those semantics instead of creating a second definition of response totals or adding charts by default.

## Progress Log

- 2026-07-18T00:00:00Z: Task created.
- 2026-07-18T13:12:11+08:00: Kept the requested multi-view response behavior, grounded it in the existing detailed list and summary semantics, and added the structured-attendee detail required by t90.
- 2026-07-18T13:52:11+08:00: Delivered the authoritative response-detail foundation ahead of the view toggle: added the manager-scoped response list endpoint and showed selected names, pax, message, and submission time in the existing desktop table/mobile cards. Grouped view and URL-persisted switching remain.
