---
id: "t22-dashboard-theme-selector"
status: "done"
priority: "medium"
assignee: null
epic: "frontend"
dueDate: null
created: "2026-07-07T00:00:00+08:00"
modified: "2026-07-09T00:00:00+08:00"
completedAt: "2026-07-09T00:00:00+08:00"
labels: ["frontend", "themes", "dashboard"]
depends_on: ["t11-theme-and-section-api", "t20-dashboard-events-list-create"]
order: "a22"
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

- [x] Theme list is loaded from `/themes`.
- [x] Manager can select a theme and supported mode: light, dark, system, or toggleable.
- [x] Theme-specific settings validate against registry schemas.
- [x] Preview area shows enough of the theme to make a selection.
- [x] Save updates the event theme through the API.
- [x] Tests cover loading themes, selecting a theme, validation, and save.

## UI Quality Checklist

- [x] Uses Tailwind tokens and project-owned primitives before adding a component library.
- [x] Follows color, shape, and theme locks from `SKILL.md`.
- [x] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [x] Works on required mobile and desktop viewport widths.
- [x] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [x] Avoids generic AI-slop patterns listed in `SKILL.md`.

## Notes

Use actual theme metadata and preview components where practical, not fake cards.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
- 2026-07-09T00:00:00+08:00: Started dashboard theme selector as the next unblocked task after event list and theme API dependencies.
- 2026-07-09T00:00:00+08:00: Completed `/events/:eventId/theme` selector with real registry theme loading, selected/current theme state, mode selection, registry metadata preview, JSON settings validation against the current event theme update contract, API save handling, and tests for loading, selection, validation, and save.
