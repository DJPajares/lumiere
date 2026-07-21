---
id: 't111-invite-invalid-link-experience'
status: 'todo'
priority: 'high'
assignee: null
epic: 'invite-access'
dueDate: null
created: '2026-07-22T01:10:41+08:00'
modified: '2026-07-22T01:22:35+08:00'
labels: ['invite', 'invalid-link', 'error-state', 'accessibility', 'frontend']
depends_on: ['t26-invite-public-event-page', 't27-invite-guest-event-page']
order: 'a111'
---

# t111-invite-invalid-link-experience - Give invalid invite links a distinct view

## Hierarchy

- Epic: `invite-access`
- Dependencies: `t26-invite-public-event-page`, `t27-invite-guest-event-page`

## Scope

Replace the shared generic unavailable treatment with clear, purpose-built views for an invalid guest link and a missing/unpublished public event. Preserve separate disabled, expired-ready, and temporary-service-error states so guests understand whether to contact the host, request a new link, retry, or return home.

## Suggested Agent

- Suggested model: `GPT-5.6 Terra (gpt-5.6-terra)`
- Reasoning level: `high`

## Acceptance

- [ ] An invalid guest token renders a dedicated private-link view that is visually and semantically different from a missing public event and from an API outage.
- [ ] Disabled guest links, missing/unpublished events, and retryable service errors have distinct headings, descriptions, primary actions, and status semantics.
- [ ] The state contract has an explicit expired-link variant ready for t116 without classifying every 404 as expired.
- [ ] Retry is offered only for retryable failures; invalid/disabled links direct the guest to the host without exposing internal request IDs, event existence, token fragments, or private guest data.
- [ ] Metadata remains `noindex, nofollow` and does not echo untrusted token or slug content into share metadata.
- [ ] Views meet keyboard, contrast, focus, responsive, and screen-reader expectations at 390px, 768px, and 1440px.
- [ ] Relevant existing public and guest route tests pass, together with invite typecheck, formatting, lint, route smoke checks for the state-to-view mapping, and the UI pre-flight review.

## Notes

Keep the invalid-link experience calm and helpful. Do not render the full event theme when the API has not authorized or returned the event.

## Progress Log

- 2026-07-22T01:10:41+08:00: Task created to separate invalid guest links from generic invitation failures.
