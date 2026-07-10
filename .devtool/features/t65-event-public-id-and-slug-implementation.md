---
id: 't65-event-public-id-and-slug-implementation'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'api'
dueDate: null
created: '2026-07-10T18:00:00+08:00'
modified: '2026-07-10T19:15:00+08:00'
completedAt: null
labels: ['api', 'database', 'slug', 'identifier', 'security']
depends_on: ['t44-event-slug-and-public-id-policy']
order: 'a65'
---

# t65-event-public-id-and-slug-implementation - Implement separate internal ID, readable slug, and private access tokens

## Hierarchy

- Epic: `api`
- Dependencies: `t44-event-slug-and-public-id-policy`

## Scope

Implement the identifier strategy decided in the earlier policy task. Keep the database primary identifier separate from the public readable URL slug and from any security-sensitive invite token.

## Suggested Agent

- Suggested model: `GPT-5.6 Terra (gpt-5.6-terra)`
- Reasoning level: `xhigh`

## Acceptance

- [ ] Event records use an immutable internal UUID/ULID-style primary identifier that is never derived from the title.
- [ ] Public event URLs use a globally unique readable slug with normalized validation, reserved-word checks, and database uniqueness.
- [ ] Automatic slug generation appends a short collision-resistant suffix only when needed and allows manager customization before publish.
- [ ] Slug changes create a redirect/alias strategy or are explicitly restricted after publish so existing links do not silently break.
- [ ] Guest-group RSVP URLs use separate high-entropy random tokens; readable event slugs never grant guest-specific access.
- [ ] Optional unlisted/private public invites may use a random public access code in addition to the readable slug without replacing the internal ID.
- [ ] API responses expose only the identifiers needed by each client context.
- [ ] Tests cover collisions, concurrent creation, reserved words, slug update behavior, alias resolution, guest token separation, and private/unlisted access.
## Notes

This API task is independent of the dashboard component system. Recommended answer: do not replace the readable slug with a random code for normal public event URLs. Use three separate concepts: internal immutable ID, readable globally unique slug, and random high-entropy guest/private token. A random code is useful only for unlisted/private access, not as the sole identifier.

## Progress Log

- 2026-07-10T18:00:00+08:00: Task created from the second dashboard, invite theme, and public URL UX review.

- 2026-07-10T18:30:00+08:00: Reviewed during shadcn Base UI update; no component-system changes required for this task.
- 2026-07-10T19:15:00+08:00: Scoped shadcn/Base UI to the dashboard only and updated the suggested model to GPT-5.6 Terra with xhigh reasoning.
