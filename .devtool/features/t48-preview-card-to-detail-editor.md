---
id: 't48-preview-card-to-detail-editor'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-09T00:00:00+08:00'
modified: '2026-07-09T00:00:00+08:00'
completedAt: null
labels: ['dashboard', 'section-builder', 'preview', 'editing']
depends_on: ['t39-section-builder-live-preview-ux', 't47-schema-driven-content-field-forms']
order: 'a48'
---

# t48-preview-card-to-detail-editor - Preview card opens detail editor

## Hierarchy

- Epic: `frontend`
- Dependencies: `t39-section-builder-live-preview-ux`, `t47-schema-driven-content-field-forms`

## Scope

Change the section builder interaction model so clicking a preview/list card opens the detailed editor for that section. Remove the separate disconnected card/editor pattern.

## Suggested Agent

- Suggested model: `GPT-5.5`
- Reasoning level: `high`

## Acceptance

- [ ] Section preview/list cards are interactive and open a detail editor panel, drawer, modal, or route for that exact section.
- [ ] Only one section detail editor is active at a time unless the UX intentionally supports split editing.
- [ ] The editor shows the selected section preview context, visibility controls, fields, validation, and save/cancel actions.
- [ ] Keyboard users can open, close, and navigate the editor without losing focus context.
- [ ] Unsaved changes show a clear dirty state and confirmation before discard.
- [ ] Tests cover clicking a section card, editing fields, save, cancel, validation, and keyboard open/close.

## UI Quality Checklist

- [ ] Uses the selected dashboard or invite component strategy before custom UI.
- [ ] Follows Lumiere color, shape, typography, motion, and theme locks from `SKILL.md`.
- [ ] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [ ] Works on required mobile, tablet, and desktop viewport widths.
- [ ] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [ ] Avoids generic AI-slop patterns listed in `SKILL.md`.


## Notes

This should make the dashboard feel like a real editor instead of a collection of unrelated cards.

## Progress Log

- 2026-07-09T00:00:00+08:00: Task created from dashboard and invite UX review concerns.
