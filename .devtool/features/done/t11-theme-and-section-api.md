---
id: "t11-theme-and-section-api"
status: "done"
priority: "high"
assignee: null
epic: "api"
dueDate: null
created: "2026-07-07T00:00:00+08:00"
modified: "2026-07-08T14:44:00+08:00"
completedAt: "2026-07-08T14:44:00+08:00"
labels: ["api", "themes", "sections"]
depends_on: ["t06-theme-registry-package", "t10-event-management-api"]
order: "a11"
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

- [x] `GET /themes` returns registry-backed theme metadata.
- [x] `GET /themes/:themeId` returns one theme definition without renderer code.
- [x] `GET /events/:eventId/theme` and `PUT /events/:eventId/theme` enforce manager access.
- [x] `GET /events/:eventId/sections` returns ordered configured sections.
- [x] `PUT /events/:eventId/sections` validates section type, visibility, content, and settings against registry schemas.
- [x] Tests cover valid and invalid theme/section updates.

## Notes

This task answers the architecture question: database stores configuration and content; code owns renderers and schemas.

Theme responses expose registry metadata only. Section renderer keys and validation schemas remain code-owned and are not persisted as executable database content.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
- 2026-07-08T14:32:00+08:00: Started theme registry and event section configuration API work.
- 2026-07-08T14:44:00+08:00: Added registry-backed theme endpoints, event theme read/update endpoints, ordered section read/replace endpoints, and registry validation for section content/settings.
- 2026-07-08T14:44:00+08:00: Verified with API tests/typecheck, theme package tests/typecheck, shared types tests/typecheck, API lint placeholder, focused Prettier check, and `pnpm dev:api` health smoke check on port 4020.
