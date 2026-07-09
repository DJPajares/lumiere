---
id: 't44-event-slug-and-public-id-policy'
status: 'done'
priority: 'high'
assignee: null
epic: 'api'
dueDate: null
created: '2026-07-09T00:00:00+08:00'
modified: '2026-07-09T21:30:20+08:00'
completedAt: '2026-07-09T21:30:20+08:00'
labels: ['api', 'events', 'slug', 'security']
depends_on: ['t07-drizzle-database-schema', 't10-event-management-api', 't13-public-invite-api']
order: 'a44'
---

# t44-event-slug-and-public-id-policy - Event slug and public ID policy

## Hierarchy

- Epic: `api`
- Dependencies: `t07-drizzle-database-schema`, `t10-event-management-api`, `t13-public-invite-api`

## Scope

Formalize how Lumiere creates, stores, validates, and resolves public event URLs. Separate human-readable slugs from security-sensitive guest tokens.

## Suggested Agent

- Suggested model: `GPT-5.5`
- Reasoning level: `extra high`

## Acceptance

- [x] `events.public_slug` has a database unique constraint and API-level collision handling.
- [x] Create/edit APIs validate slug format, reserved words, length, and uniqueness before saving.
- [x] Slug suggestions are generated from the event title and can append a short random suffix on collision.
- [x] PR/API notes clarify that event slugs are identifiers, not secrets.
- [x] Guest-specific URLs continue to use high-entropy random tokens stored hashed or otherwise protected.
- [x] If private/unlisted event URLs are required, design supports an optional random public key or unguessable slug mode without breaking normal readable slugs.
- [x] Tests cover duplicate slugs, slug edits, reserved slugs, public event lookup, and guest-token lookup.

## Notes

Recommended decision: keep public event slugs human-readable and globally unique. Use random high-entropy guest tokens for RSVP access. Only use random public event keys when events need privacy beyond normal noindex/unlisted behavior.

## Progress Log

- 2026-07-09T00:00:00+08:00: Task created from dashboard and invite UX review concerns.
- 2026-07-09T20:55:12+08:00: Started slug policy work by auditing event/public invite/RSVP/guest-token paths. Decision: keep API field `slug` for compatibility while storing it as `events.public_slug` and documenting it as a public identifier, not a secret.
- 2026-07-09T21:30:20+08:00: Completed public slug policy implementation: added `events.public_slug` migration/unique index, reserved slug validation, API-level uniqueness checks, slug suggestion endpoint/client method, policy notes, and tests for duplicate/reserved/edit/public/guest-token paths. Verified with typecheck, lint, format check, tests, and diff check.
