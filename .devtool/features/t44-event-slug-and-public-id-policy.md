---
id: 't44-event-slug-and-public-id-policy'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'api'
dueDate: null
created: '2026-07-09T00:00:00+08:00'
modified: '2026-07-09T00:00:00+08:00'
completedAt: null
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

- [ ] `events.public_slug` has a database unique constraint and API-level collision handling.
- [ ] Create/edit APIs validate slug format, reserved words, length, and uniqueness before saving.
- [ ] Slug suggestions are generated from the event title and can append a short random suffix on collision.
- [ ] PR/API notes clarify that event slugs are identifiers, not secrets.
- [ ] Guest-specific URLs continue to use high-entropy random tokens stored hashed or otherwise protected.
- [ ] If private/unlisted event URLs are required, design supports an optional random public key or unguessable slug mode without breaking normal readable slugs.
- [ ] Tests cover duplicate slugs, slug edits, reserved slugs, public event lookup, and guest-token lookup.

## Notes

Recommended decision: keep public event slugs human-readable and globally unique. Use random high-entropy guest tokens for RSVP access. Only use random public event keys when events need privacy beyond normal noindex/unlisted behavior.

## Progress Log

- 2026-07-09T00:00:00+08:00: Task created from dashboard and invite UX review concerns.
