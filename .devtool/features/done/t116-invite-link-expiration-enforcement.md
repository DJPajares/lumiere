---
id: 't116-invite-link-expiration-enforcement'
status: 'done'
priority: 'high'
assignee: null
epic: 'invite-access'
dueDate: null
created: '2026-07-22T01:10:41+08:00'
modified: '2026-07-22T20:41:55+08:00'
labels: ['invite', 'expiration', 'dashboard', 'api', 'database']
depends_on: ['t111-invite-invalid-link-experience', 't115-invite-link-expiration-policy']
order: 'a116'
---

# t116-invite-link-expiration-enforcement - Implement event and guest-link expiration

## Hierarchy

- Epic: `invite-access`
- Dependencies: `t111-invite-invalid-link-experience`, `t115-invite-link-expiration-policy`

## Scope

Implement the approved two-level expiration contract across database, shared types, manager API, dashboard settings, public invite lookup, guest invite lookup, RSVP submission, and invitation error views. Make the event-wide ceiling and optional earlier guest expiry visible and safely editable to authorized managers.

## Suggested Agent

- Suggested model: `GPT-5.6 Sol (gpt-5.6-sol)`
- Reasoning level: `xhigh`

## Acceptance

- [x] A reversible migration adds nullable event and guest-link access expiration fields with indexes only where query behavior justifies them; existing rows remain accessible.
- [x] Shared schemas and manager API validate timestamps and enforce that a guest expiry cannot outlive the event expiry when both exist.
- [x] Dashboard event settings manage the global access expiry, while guest management exposes the optional per-link expiry with clear inheritance/effective-expiry text.
- [x] Public event, guest invite, and RSVP endpoints enforce expiration server-side at request time with safe, stable error codes and no cache leakage.
- [x] Event expiry blocks both public and guest access; guest expiry blocks only that guest link; disabled, unpublished, deleted, rotated, and RSVP-closed behavior remains distinct.
- [x] The invite app renders the dedicated expired view from t111 with useful host/contact guidance and private `noindex, nofollow` metadata.
- [x] Activity/audit records capture manager expiration changes without logging tokens, and role checks limit mutations to authorized managers.
- [x] Boundary-time, timezone, precedence, migration, API, dashboard, invite-route, and RSVP regression checks pass with typecheck, formatting, lint, and UI pre-flight review.

## Notes

Do not implement expiration only in the dashboard or client. Public reads and RSVP writes must share the same server-authoritative effective-expiry rule.

## Progress Log

- 2026-07-22T01:10:41+08:00: Task created as the implementation follow-up to the two-level expiration contract.
- 2026-07-22T20:11:55+08:00: Started end-to-end enforcement from the t115 contract. Implementation order is schema/shared types, server-authoritative manager/public/RSVP API, dashboard controls, invite access states, then regression and responsive verification.
- 2026-07-22T20:39:08+08:00: Completed nullable event/guest expiry migration, shared contracts, audited manager mutations, precedence-safe public/guest/RSVP enforcement, dashboard controls, and dedicated invite expired states. All API (100), dashboard (104), invite (37), and affected package (49) tests pass with relevant typechecks and boundary checks. UI pre-flight passed via responsive source/component review; live viewport capture was unavailable because this session exposed no controllable browser.
- 2026-07-22T20:41:55+08:00: Applied the generated migration to the local development database and verified both `access_expires_at` columns are nullable.
