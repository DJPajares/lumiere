---
id: 't11-theme-and-section-api'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'api'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-07T00:00:00+08:00'
completedAt: null
labels: ['api', 'themes', 'sections']
depends_on: ['t06-theme-registry-package', 't10-event-management-api']
order: 'a11'
---

# t11-theme-and-section-api - Theme and section configuration API

## Hierarchy

- Epic: `api`
- Dependencies: `t06-theme-registry-package`, `t10-event-management-api`

## Scope

Implement endpoints for available themes, selected event theme, and event section configuration.

## Suggested Agent

- Suggested model: `GPT-5.5`
- Reasoning level: `extra high`

## Acceptance

- [ ] `GET /themes` returns registry-backed theme metadata.
- [ ] `GET /themes/:themeId` returns one theme definition without renderer code.
- [ ] `GET /events/:eventId/theme` and `PUT /events/:eventId/theme` enforce manager access.
- [ ] `GET /events/:eventId/sections` returns ordered configured sections.
- [ ] `PUT /events/:eventId/sections` validates section type, visibility, content, and settings against registry schemas.
- [ ] Tests cover valid and invalid theme/section updates.

## Notes

This task answers the architecture question: database stores configuration and content; code owns renderers and schemas.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
