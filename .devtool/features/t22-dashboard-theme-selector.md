---
id: 't22-dashboard-theme-selector'
status: 'backlog'
priority: 'medium'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-07T00:00:00+08:00'
completedAt: null
labels: ['frontend', 'themes', 'dashboard']
depends_on: ['t11-theme-and-section-api', 't20-dashboard-events-list-create']
order: 'a22'
---

# t22-dashboard-theme-selector - Dashboard theme selector and mode settings

## Hierarchy

- Epic: `frontend`
- Dependencies: `t11-theme-and-section-api`, `t20-dashboard-events-list-create`

## Scope

Implement dashboard UI for selecting event theme, theme mode, and theme-specific settings.

## Suggested Agent

- Suggested model: `GPT-5.5`
- Reasoning level: `high`

## Acceptance

- [ ] Theme list is loaded from `/themes`.
- [ ] Manager can select a theme and supported mode: light, dark, system, or toggleable.
- [ ] Theme-specific settings validate against registry schemas.
- [ ] Preview area shows enough of the theme to make a selection.
- [ ] Save updates the event theme through the API.
- [ ] Tests cover loading themes, selecting a theme, validation, and save.

## UI Quality Checklist

- [ ] Uses Tailwind tokens and project-owned primitives before adding a component library.
- [ ] Follows color, shape, and theme locks from `SKILL.md`.
- [ ] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [ ] Works on required mobile and desktop viewport widths.
- [ ] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [ ] Avoids generic AI-slop patterns listed in `SKILL.md`.

## Notes

Use actual theme metadata and preview components where practical, not fake cards.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
