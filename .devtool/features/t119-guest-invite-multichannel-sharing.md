---
id: 't119-guest-invite-multichannel-sharing'
status: 'todo'
priority: 'medium'
assignee: null
epic: 'guest-management'
dueDate: null
created: '2026-07-22T01:10:41+08:00'
modified: '2026-07-22T01:22:35+08:00'
labels: ['dashboard', 'guests', 'share', 'email', 'whatsapp']
depends_on: ['t117-guest-invite-delivery-and-open-tracking', 't118-dashboard-guest-list-view-refinement']
order: 'a119'
---

# t119-guest-invite-multichannel-sharing - Share guest invite links across channels

## Hierarchy

- Epic: `guest-management`
- Dependencies: `t117-guest-invite-delivery-and-open-tracking`, `t118-dashboard-guest-list-view-refinement`

## Scope

Add one accessible Share action for each active guest invite, available from both guest cards and table rows. Prefer the Web Share API so installed apps such as Messenger can participate, and provide reliable fallbacks for copying, email, and WhatsApp without claiming that the recipient received the message.

## Suggested Agent

- Suggested model: `GPT-5.6 Terra (gpt-5.6-terra)`
- Reasoning level: `high`

## Acceptance

- [ ] Active guest links expose one compact Share action in both list and card views; disabled, expired, rotated-without-recoverable-token, and legacy unavailable links explain how to recover instead.
- [ ] Supported browsers use `navigator.share` with event-appropriate public copy and the exact private guest URL, allowing installed targets such as Messenger where the operating system exposes them.
- [ ] Fallback actions include Copy link, Email, and WhatsApp with correctly encoded subject/body/text; unsupported direct Messenger deep links are not hard-coded as if universally reliable.
- [ ] Share copy is concise, event-appropriate, and reviewed for private guest data; guest tokens never enter analytics, logs, toasts, referrers created by Lumiere, or unrelated UI text.
- [ ] A successful manager-confirmed action records the share channel through t117, while cancellation or opening a chooser does not falsely record provider delivery.
- [ ] Popup blocking, unavailable apps, clipboard denial, share cancellation, offline/error states, keyboard use, and screen-reader labels have clear recovery behavior.
- [ ] Relevant existing share-action and guest-workspace tests pass, together with manual URL-encoding checks for Web Share/fallbacks, dashboard typecheck, formatting, lint, responsive smoke checks, and UI pre-flight review.

## Notes

Browser and operating-system share targets vary. Treat Messenger as a Web Share target when available; do not promise a universal browser-to-Messenger URL without an approved provider integration.

## Progress Log

- 2026-07-22T01:10:41+08:00: Task created for Messenger-capable Web Share plus email, WhatsApp, and copy fallbacks.
