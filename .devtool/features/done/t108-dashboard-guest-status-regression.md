---
id: 't108-dashboard-guest-status-regression'
status: 'done'
priority: 'critical'
assignee: null
epic: 'guest-management'
dueDate: null
created: '2026-07-22T01:10:41+08:00'
modified: '2026-07-22T02:01:00+08:00'
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

## Suggested Agent

- Suggested model: `GPT-5.6 Sol (gpt-5.6-sol)`
- Reasoning level: `high`

## Acceptance

- [x] The failure is reproduced and documented against the existing dashboard-to-API update path before the fix.
- [x] Saving a valid status change persists it, closes the editor only after success, updates both card and compact-list presentations, and remains correct after a full reload.
- [x] Status filters, sorting, summary counts, exports, and public guest-link access reflect the persisted value without stale client state.
- [x] Disabling a group blocks its guest link, while reactivation follows one documented transition and does not require token regeneration unless the token is unavailable or intentionally rotated.
- [x] Status changes do not delete or fabricate RSVP response history; conflicts between manager-selected state and system-derived RSVP/open state are prevented or explained clearly.
- [x] Owner/editor permissions remain enforced, viewers cannot mutate status, and failed saves preserve the selected value with actionable feedback.
- [x] Relevant existing guest-management and API tests pass together with dashboard typecheck, formatting, lint, and the UI pre-flight review from `SKILL.md`.

## Notes

Treat this as a regression fix, not a guest-status redesign. Keep one authoritative mutation path and document any transition rule that is necessary to preserve RSVP history.

## Progress Log

- 2026-07-22T01:10:41+08:00: Task created from the reported guest status mutation failure.
- 2026-07-22T01:36:00+08:00: Started tracing the existing dashboard edit form, shared mutation contract, API persistence, list refresh, filters, exports, and guest-link authorization to reproduce the regression before changing code.
- 2026-07-22T01:45:00+08:00: Reproduced the regression in the existing path: the manager form accepts system-derived `opened`, `responded`, and `declined` values, while the quick-disable handler removes the recoverable invite URL from local state. A later reactivation can therefore show a fabricated/stale status or appear to require token regeneration until reload even though the stored token still exists.
- 2026-07-22T01:50:00+08:00: Focused UI reproduction also confirmed that a status-only save for a legacy group is rejected before the API call because blank max-pax member placeholders are parsed as real members. The form now omits untouched blank placeholders while retaining validation for entered and duplicate member names.
- 2026-07-22T01:55:00+08:00: Completed the fix with one dashboard PATCH mutation path for disable/reactivate, an Active/Disabled access field, retained invite-token state, and canonical reactivation to Responded, Declined, Opened, or Pending from stored RSVP/open history. Manager mutations can no longer fabricate system-derived statuses, and existing response rows are untouched.
- 2026-07-22T01:55:00+08:00: Verified 9 shared-type tests, 100 API tests, 8 API-client tests, 104 dashboard tests, scoped typechecks, focused Prettier, diff checks, and the dashboard/theme boundary check. Lint scripts remain repository placeholders and reported `lint pending`; the UI pre-flight passed by inspection because the change reuses the existing responsive modal, Base UI Select, semantic tokens, focus behavior, and feedback states without introducing a new layout or motion path.
- 2026-07-22T02:00:00+08:00: Reopened after product clarification. Manager-selected status is authoritative: resetting a responded or declined group to Pending must preserve the stored RSVP record while making the guest invitation require a fresh response. The earlier Active/Disabled interpretation was too restrictive.
- 2026-07-22T02:01:00+08:00: Restored all five manager status options. Pending and Disabled are direct manager overrides; Opened, Responded, and Declined require matching open or RSVP history so the dashboard cannot fabricate guest activity. Resetting to Pending retains the RSVP row and stable invite token, excludes the old reply from current summary counts, and returns a fresh-response flag to the guest invite.
- 2026-07-22T02:01:00+08:00: Added a guest-facing “Fresh response requested” notice and a “Response requested again” RSVP state for returning guests. Existing dashboard, API, shared-type, API-client, and invite suites pass (258 tests total), all affected typechecks pass, focused Prettier and diff checks pass, lint commands complete, and the dashboard/theme boundary plus static UI pre-flight are clean.
