---
id: 't118-dashboard-guest-list-view-refinement'
status: 'todo'
priority: 'medium'
assignee: null
epic: 'guest-management'
dueDate: null
created: '2026-07-22T01:10:41+08:00'
modified: '2026-07-22T01:22:35+08:00'
labels: ['dashboard', 'guests', 'list-view', 'table', 'responsive']
depends_on: ['t108-dashboard-guest-status-regression', 't117-guest-invite-delivery-and-open-tracking']
order: 'a118'
---

# t118-dashboard-guest-list-view-refinement - Refine guests into a table-row list

## Hierarchy

- Epic: `guest-management`
- Dependencies: `t108-dashboard-guest-status-regression`, `t117-guest-invite-delivery-and-open-tracking`

## Scope

Refine the compact mode delivered in t97 into the primary desktop guest list: dense, scan-friendly rows with stable columns and shared actions. Keep cards available where useful, and use a touch-friendly stacked row treatment on narrow screens rather than introducing a heavy data-table dependency.

## Suggested Agent

- Suggested model: `GPT-5.6 Terra (gpt-5.6-terra)`
- Reasoning level: `high`

## Acceptance

- [ ] Desktop defaults to a row-based list with clear columns for guest/group identity, party size, sent/opened tracking, invite access, RSVP state, and contextual actions.
- [ ] The row layout is materially denser than cards, aligns values across records, handles long names and missing contact data, and uses table semantics when they improve accessibility.
- [ ] Search, status filters, sorting, view persistence, edit, disable/reactivate, regenerate, copy, open, and tracking actions reuse one state and handler path across list and cards.
- [ ] Mobile presents each row as a labeled, touch-friendly stack without horizontal page overflow or hidden critical actions.
- [ ] Loading, empty, filtered-empty, error, busy, optimistic, and permission-restricted states preserve row structure and useful feedback.
- [ ] Keyboard navigation, accessible action names, focus restoration after dialogs/menus, status text beyond color, and screen-reader row context are verified.
- [ ] Existing t97 behavior is migrated rather than duplicated, and relevant existing guest workspace tests, typecheck, formatting, lint, responsive smoke checks, and the UI pre-flight review pass.

## Notes

This task acknowledges that a compact mode already exists. Improve its hierarchy and discoverability instead of creating a third guest presentation.

## Progress Log

- 2026-07-22T01:10:41+08:00: Task created as a refinement of the existing compact guest view into the requested table-row experience.
