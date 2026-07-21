---
id: 't108-dashboard-guest-status-regression'
status: 'todo'
priority: 'critical'
assignee: null
epic: 'guest-management'
dueDate: null
created: '2026-07-22T01:10:41+08:00'
modified: '2026-07-22T01:10:41+08:00'
labels: ['dashboard', 'guests', 'status', 'bug', 'regression']
depends_on: ['t101-event-collaboration-and-guest-management-regression']
order: 'a108'
---

# t108-dashboard-guest-status-regression - Fix guest status changes

## Hierarchy

- Epic: `guest-management`
- Dependencies: `t101-event-collaboration-and-guest-management-regression`

## Scope

Reproduce and fix the dashboard regression where changing a guest group's invite status does not reliably persist or appear in guest management. Trace the existing edit form, shared mutation schema, API route, database update, list refresh, filters, cards, and compact list instead of adding a second status-changing path.

## Acceptance

- [ ] The failure is reproduced and documented against the existing dashboard-to-API update path before the fix.
- [ ] Saving a valid status change persists it, closes the editor only after success, updates both card and compact-list presentations, and remains correct after a full reload.
- [ ] Status filters, sorting, summary counts, exports, and public guest-link access reflect the persisted value without stale client state.
- [ ] Disabling a group blocks its guest link, while reactivation follows one documented transition and does not require token regeneration unless the token is unavailable or intentionally rotated.
- [ ] Status changes do not delete or fabricate RSVP response history; conflicts between manager-selected state and system-derived RSVP/open state are prevented or explained clearly.
- [ ] Owner/editor permissions remain enforced, viewers cannot mutate status, and failed saves preserve the selected value with actionable feedback.
- [ ] Relevant existing guest-management and API tests pass together with dashboard typecheck, formatting, lint, and the UI pre-flight review from `SKILL.md`.

## Notes

Treat this as a regression fix, not a guest-status redesign. Keep one authoritative mutation path and document any transition rule that is necessary to preserve RSVP history.

## Progress Log

- 2026-07-22T01:10:41+08:00: Task created from the reported guest status mutation failure.
