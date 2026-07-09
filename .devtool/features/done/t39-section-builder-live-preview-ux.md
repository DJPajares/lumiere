---
id: 't39-section-builder-live-preview-ux'
status: 'done'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-09T16:09:12+08:00'
completedAt: '2026-07-09T16:09:12+08:00'
labels: ['dashboard', 'section-builder', 'preview', 'uiux']
depends_on: ['t23-dashboard-section-builder', 't28-invite-section-renderers', 't30-initial-theme-implementations']
order: 'a39'
---

# t39-section-builder-live-preview-ux - Section builder live preview UX

## Hierarchy

- Epic: `frontend`
- Dependencies: `t23-dashboard-section-builder`, `t28-invite-section-renderers`, `t30-initial-theme-implementations`

## Scope

Improve the dashboard section builder with preview-first editing so managers can understand how database-backed section content will appear in the public invitation app.

## Suggested Agent

- Suggested model: `GPT-5.5`
- Reasoning level: `extra high`

## Acceptance

- [x] Section builder shows configured sections in order with clear visibility, required/optional, and validation states.
- [x] Managers can preview selected theme, mode, and section content before publishing or saving final changes.
- [x] Invalid section content explains exactly what is missing and where it appears.
- [x] Preview uses the same renderer contract as the invite app or a documented approximation.
- [x] Empty states help managers add the next useful section for the event type.
- [x] Mobile preview behavior is documented and usable on dashboard tablet/desktop layouts.

## UI Quality Checklist

- [x] Uses Tailwind tokens and project-owned primitives before adding a component library.
- [x] Follows Lumiere color, shape, brand, and theme locks from `SKILL.md`.
- [x] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [x] Works on required mobile and desktop viewport widths.
- [x] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [x] Avoids generic AI-slop patterns listed in `SKILL.md`.

## Notes

This task reduces the risk of database-configured sections becoming hard to reason about for non-technical event managers.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
- 2026-07-09T15:58:32+08:00: Started section builder live preview UX pass by reviewing task scope, `SKILL.md`, dashboard section builder behavior, invite section renderers, theme composition metadata, and existing section builder tests.
- 2026-07-09T16:09:12+08:00: Completed preview-first section builder UX. Added ordered section status map, live guest/public preview rail with theme tokens and mode context, live validation messaging, recommended-next-section empty state, compact renderer-contract approximation notes, and updated dashboard tests.
