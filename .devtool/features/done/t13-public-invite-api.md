---
id: "t13-public-invite-api"
status: "done"
priority: "high"
assignee: null
epic: "api"
dueDate: null
created: "2026-07-07T00:00:00+08:00"
modified: "2026-07-07T00:00:00+08:00"
completedAt: "2026-07-08T15:20:00+08:00"
labels: ["api", "public", "invite"]
depends_on: ["t11-theme-and-section-api", "t12-guest-group-api"]
order: "a13"
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

- [x] `GET /public/events/:eventSlug` returns published public event data without RSVP-only guest data.
- [x] `GET /public/events/:eventSlug/guest/:guestToken` validates token and returns personalized RSVP context.
- [x] Invalid, disabled, unpublished, or archived events return appropriate errors.
- [x] Public responses include selected theme, theme mode, public sections, and safe event metadata.
- [x] Guest responses include guest group label, max pax, RSVP status, and RSVP-enabled sections.
- [x] Tests cover public event, valid guest token, invalid token, unpublished event, and hidden sections.

## Notes

Carefully avoid leaking other guest groups or manager-only data.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
- 2026-07-08T00:00:00+08:00: Started public invitation API endpoints, response contracts, store, and route tests.
- 2026-07-08T15:20:00+08:00: Completed public invite routes and store with focused tests, typechecks, and format check passing. Live HTTP smoke was blocked by sandbox listen permissions.
