---
id: 't13-public-invite-api'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'api'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-07T00:00:00+08:00'
completedAt: null
labels: ['api', 'public', 'invite']
depends_on: ['t11-theme-and-section-api', 't12-guest-group-api']
order: 'a13'
---

# t13-public-invite-api - Public invitation API

## Hierarchy

- Epic: `api`
- Dependencies: `t11-theme-and-section-api`, `t12-guest-group-api`

## Scope

Implement public endpoints for generic event pages and personalized guest invite pages.

## Suggested Agent

- Suggested model: `GPT-5.5`
- Reasoning level: `high`

## Acceptance

- [ ] `GET /public/events/:eventSlug` returns published public event data without RSVP-only guest data.
- [ ] `GET /public/events/:eventSlug/guest/:guestToken` validates token and returns personalized RSVP context.
- [ ] Invalid, disabled, unpublished, or archived events return appropriate errors.
- [ ] Public responses include selected theme, theme mode, public sections, and safe event metadata.
- [ ] Guest responses include guest group label, max pax, RSVP status, and RSVP-enabled sections.
- [ ] Tests cover public event, valid guest token, invalid token, unpublished event, and hidden sections.

## Notes

Carefully avoid leaking other guest groups or manager-only data.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
