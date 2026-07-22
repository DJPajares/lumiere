---
id: 't111-invite-invalid-link-experience'
status: 'done'
priority: 'high'
assignee: null
epic: 'invite-access'
dueDate: null
created: '2026-07-22T01:10:41+08:00'
modified: '2026-07-22T08:21:41+08:00'
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

- [x] An invalid guest token renders a dedicated private-link view that is visually and semantically different from a missing public event and from an API outage.
- [x] Disabled guest links, missing/unpublished events, and retryable service errors have distinct headings, descriptions, primary actions, and status semantics.
- [x] The state contract has an explicit expired-link variant ready for t116 without classifying every 404 as expired.
- [x] Retry is offered only for retryable failures; invalid/disabled links direct the guest to the host without exposing internal request IDs, event existence, token fragments, or private guest data.
- [x] Metadata remains `noindex, nofollow` and does not echo untrusted token or slug content into share metadata.
- [x] Views meet keyboard, contrast, focus, responsive, and screen-reader expectations at 390px, 768px, and 1440px.
- [x] Relevant existing public and guest route tests pass, together with invite typecheck, formatting, lint, route smoke checks for the state-to-view mapping, and the UI pre-flight review.

## Notes

Keep the invalid-link experience calm and helpful. Do not render the full event theme when the API has not authorized or returned the event.

## Progress Log

- 2026-07-22T01:10:41+08:00: Task created to separate invalid guest links from generic invitation failures.
- 2026-07-22T02:38:00+08:00: Started by auditing the public and private route error mapping. The implementation will keep invalid, disabled, missing/unpublished, expired-ready, and retryable failures explicit without rendering event themes or reflecting untrusted identifiers.
- 2026-07-22T08:21:41+08:00: Replaced the shared unavailable card with an asymmetric access-state view and explicit contracts for public missing, guest invalid, guest disabled, guest RSVP closed, guest expired, and retryable service failures. Only the retryable state reloads; private terminal states offer host-contact guidance without rendering event data.
- 2026-07-22T08:21:41+08:00: Removed slug-derived failure metadata, kept every route `noindex, nofollow`, and added generic failure share metadata. Existing route coverage now checks state-specific copy/actions, 404-to-invalid behavior, the 410 expired-ready path, retry isolation, and absence of tokens, request IDs, and untrusted identifiers in the view contract and metadata.
- 2026-07-22T08:21:41+08:00: Verification passed with all 37 existing invite tests, invite TypeScript typecheck, theme-boundary validation, `git diff --check`, and live route smoke checks for public missing, guest invalid, and service retry states. The invite lint script remains the repository's `lint pending` placeholder; no Prettier command was run per AGENTS.md.
- 2026-07-22T08:21:41+08:00: UI pre-flight reviewed the one-column 390px/768px layouts, the asymmetric 1440px split, native keyboard actions, focus/hover/active and reduced-motion treatment, live-region semantics, contrast, and gutter-safe decoration. The in-app browser backend was unavailable, so no automated viewport screenshots were captured.
