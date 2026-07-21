---
id: 't117-guest-invite-delivery-and-open-tracking'
status: 'todo'
priority: 'high'
assignee: null
epic: 'guest-management'
dueDate: null
created: '2026-07-22T01:10:41+08:00'
modified: '2026-07-22T01:22:35+08:00'
labels: ['dashboard', 'guests', 'tracking', 'sent', 'opened']
depends_on: ['t108-dashboard-guest-status-regression', 't15-summary-activity-notification-api', 't98-dashboard-guest-invite-link-actions']
order: 'a117'
---

# t117-guest-invite-delivery-and-open-tracking - Track sent and opened guest invites

## Hierarchy

- Epic: `guest-management`
- Dependencies: `t108-dashboard-guest-status-regression`, `t15-summary-activity-notification-api`, `t98-dashboard-guest-invite-link-actions`

## Scope

Add a trustworthy invitation tracker that distinguishes a manager marking or initiating a share from a guest actually opening the private link and from a guest submitting an RSVP. Do not label a browser handoff as delivered or received without provider confirmation.

## Suggested Agent

- Suggested model: `GPT-5.6 Sol (gpt-5.6-sol)`
- Reasoning level: `high`

## Acceptance

- [ ] The data model records first/last sent timestamps, send count, and last known share channel separately from first/last opened timestamps and RSVP status/history.
- [ ] An authorized manager can mark an invite as sent for links shared outside Lumiere, with an optional supported channel and a clear audit/activity record.
- [ ] Opening a valid guest link updates first/last-opened data server-side without blocking page delivery; repeated opens are idempotent and do not downgrade responded, declined, disabled, expired, or rotated state.
- [ ] Dashboard cards and compact rows show plain-language `Not sent`, `Sent`, `Opened`, and RSVP progression with relevant dates, while making clear that `Sent` is manager-confirmed or share-initiated rather than transport-delivered.
- [ ] Status filters, summaries, and exports can distinguish sent/opened tracking from invite-access and RSVP states without overloading the existing guest status enum.
- [ ] Owner/editor permissions, rate/concurrency behavior, privacy, token redaction, and failure recovery are covered; view-only managers cannot record dispatch.
- [ ] Migration/backfill leaves existing records as unknown/not tracked without inventing historical sent timestamps.
- [ ] Database, API, invite-open, dashboard, activity, export, and regression checks pass with typecheck, formatting, lint, and UI pre-flight review.

## Notes

No email, Messenger, or WhatsApp provider integration is required here. Provider-level delivery/read receipts need a later integration with webhook evidence.

## Progress Log

- 2026-07-22T01:10:41+08:00: Task created for a sent/opened tracker with explicit evidence boundaries.
