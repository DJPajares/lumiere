---
id: 't23-dashboard-section-builder'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-07T00:00:00+08:00'
completedAt: null
labels: ['frontend', 'sections', 'dashboard']
depends_on: ['t11-theme-and-section-api', 't22-dashboard-theme-selector']
order: 'a23'
---

# t23-dashboard-section-builder - Dashboard section content builder

## Hierarchy

- Epic: `frontend`
- Dependencies: `t11-theme-and-section-api`, `t22-dashboard-theme-selector`

## Scope

Implement configurable section management for event content, order, visibility, and per-section fields.

## Suggested Agent

- Suggested model: `GPT-5.5`
- Reasoning level: `extra high`

## Acceptance

- [ ] Manager can view sections supported by the selected event type/theme.
- [ ] Manager can enable/disable sections and set public, guest-only, or hidden visibility.
- [ ] Manager can edit validated content fields for each section.
- [ ] Section order can be changed with a simple accessible interaction.
- [ ] Save sends validated section config to the API.
- [ ] Tests cover required fields, visibility behavior, reordering, and save.

## UI Quality Checklist

- [ ] Uses Tailwind tokens and project-owned primitives before adding a component library.
- [ ] Follows color, shape, and theme locks from `SKILL.md`.
- [ ] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [ ] Works on required mobile and desktop viewport widths.
- [ ] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [ ] Avoids generic AI-slop patterns listed in `SKILL.md`.

## Notes

Do not build a full drag-and-drop page builder unless promoted into scope. A simpler reorder UI is enough for MVP.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
