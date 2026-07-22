---
id: 't115-invite-link-expiration-policy'
status: 'done'
priority: 'high'
assignee: null
epic: 'invite-access'
dueDate: null
created: '2026-07-22T01:10:41+08:00'
modified: '2026-07-22T20:06:01+08:00'
labels: ['invite', 'expiration', 'access-control', 'contracts', 'product-policy']
depends_on: ['t44-event-slug-and-public-id-policy', 't71-event-deletion-lifecycle', 't73-event-publishing-workflow']
order: 'a115'
---

# t115-invite-link-expiration-policy - Define two-level invite expiration

## Hierarchy

- Epic: `invite-access`
- Dependencies: `t44-event-slug-and-public-id-policy`, `t71-event-deletion-lifecycle`, `t73-event-publishing-workflow`

## Scope

Define the expiration contract before adding schema and UI. Use event-level expiration as the global ceiling for the public event URL and every guest URL, with optional per-guest-link expiration that may end one private link earlier but can never extend access beyond the event. Keep schedule end time, RSVP close time, unpublish, deletion, disable, token rotation, and access expiration as distinct concepts.

## Suggested Agent

- Suggested model: `GPT-5.6 Sol (gpt-5.6-sol)`
- Reasoning level: `xhigh`

## Acceptance

- [x] `PRD.md` documents the two-level policy, terminology, manager use cases, defaults, and precedence among unpublished, deleted, event-expired, guest-disabled, guest-expired, token-rotated, and RSVP-closed states.
- [x] Event `endsAt` does not silently expire access; the policy defines a separate explicit access-expiration value and whether managers may choose a suggested value based on the event schedule.
- [x] A nullable event access expiry applies to the public event and all guest links; a nullable guest-link expiry may only shorten that window.
- [x] Shared contract changes define serialized timestamps, validation rules, timezone/display behavior, boundary equality, and safe error/state codes without leaking event or guest existence.
- [x] The policy states what managers can clear or extend, how already-open pages behave on the next request, and how expiration interacts with cached metadata and RSVP submission.
- [x] Migration/backfill behavior preserves every existing event and guest link as non-expiring until a manager explicitly configures expiration.
- [x] The implementation plan identifies the exact schema, API, dashboard, invite-state, activity, audit, existing verification, and smoke-check surfaces required by t116.

## Notes

The public event can remain useful after its scheduled end, so schedule and access must not be coupled implicitly. Individual disable/regenerate remains available for immediate revocation regardless of expiry settings.

## Progress Log

- 2026-07-22T01:10:41+08:00: Task created and scoped around event-wide expiration with optional earlier per-guest expiration.
- 2026-07-22T20:03:14+08:00: Started policy definition after confirming publishing, soft-deletion, public-slug, guest-token, RSVP-close, and invalid-invite behavior. Scope remains documentation and shared contracts; database, API enforcement, and dashboard controls stay in t116.
- 2026-07-22T20:06:01+08:00: Defined nullable event and guest access deadlines, effective-minimum behavior, exact-equality expiration, explicit schedule independence, event-timezone display, null-preserving migration defaults, manager clear/extend behavior, stale-page handling, no-store requirements, and precedence across publication, deletion, token, disable, expiry, and RSVP-close states in `PRD.md`.
- 2026-07-22T20:06:01+08:00: Added shared RFC 3339 expiry/update/guest-ceiling schemas, effective-expiry and boundary helpers, and the generic `INVITE_EXPIRED` API code mapped to HTTP 410. Extended the existing shared-contract test rather than adding a new test case.
- 2026-07-22T20:06:01+08:00: Documented the exact t116 schema, manager API, public invite, RSVP, API-client, dashboard, invite-state, activity/audit, existing-test, and responsive smoke surfaces. Verification passed with 10 types tests, 8 API-client tests, 100 API tests, affected types/API/API-client/database/dashboard/invite TypeScript checks, theme boundaries, and `git diff --check`; package lint scripts remain repository placeholders and no Prettier command was run per AGENTS.md.
