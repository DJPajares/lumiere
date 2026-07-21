---
id: 't115-invite-link-expiration-policy'
status: 'todo'
priority: 'high'
assignee: null
epic: 'invite-access'
dueDate: null
created: '2026-07-22T01:10:41+08:00'
modified: '2026-07-22T01:10:41+08:00'
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

## Acceptance

- [ ] `PRD.md` documents the two-level policy, terminology, manager use cases, defaults, and precedence among unpublished, deleted, event-expired, guest-disabled, guest-expired, token-rotated, and RSVP-closed states.
- [ ] Event `endsAt` does not silently expire access; the policy defines a separate explicit access-expiration value and whether managers may choose a suggested value based on the event schedule.
- [ ] A nullable event access expiry applies to the public event and all guest links; a nullable guest-link expiry may only shorten that window.
- [ ] Shared contract changes define serialized timestamps, validation rules, timezone/display behavior, boundary equality, and safe error/state codes without leaking event or guest existence.
- [ ] The policy states what managers can clear or extend, how already-open pages behave on the next request, and how expiration interacts with cached metadata and RSVP submission.
- [ ] Migration/backfill behavior preserves every existing event and guest link as non-expiring until a manager explicitly configures expiration.
- [ ] The implementation plan identifies the exact schema, API, dashboard, invite-state, activity, audit, existing verification, and smoke-check surfaces required by t116.

## Notes

The public event can remain useful after its scheduled end, so schedule and access must not be coupled implicitly. Individual disable/regenerate remains available for immediate revocation regardless of expiry settings.

## Progress Log

- 2026-07-22T01:10:41+08:00: Task created and scoped around event-wide expiration with optional earlier per-guest expiration.
