---
id: 't48-preview-card-to-detail-editor'
status: 'done'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-09T00:00:00+08:00'
modified: '2026-07-10T02:03:42+08:00'
completedAt: '2026-07-10T01:51:23+08:00'
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

- [x] Section preview/list cards are interactive and expand in place to show the detail editor for that exact section.
- [x] Only one section detail editor is active at a time unless the UX intentionally supports split editing.
- [x] The editor shows the selected section preview context, visibility controls, fields, validation, and save/cancel actions.
- [x] Keyboard users can expand and switch editor cards without losing focus context.
- [x] Unsaved changes show a clear dirty state and confirmation before discard.
- [x] Tests cover clicking a section card, editing fields, save, cancel, validation, and keyboard expansion.

## UI Quality Checklist

- [x] Uses the selected dashboard or invite component strategy before custom UI.
- [x] Follows Lumiere color, shape, typography, motion, and theme locks from `SKILL.md`.
- [x] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [x] Works on required mobile, tablet, and desktop viewport widths.
- [x] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [x] Avoids generic AI-slop patterns listed in `SKILL.md`.


## Notes

This should make the dashboard feel like a real editor instead of a collection of unrelated cards.

## Progress Log

- 2026-07-09T00:00:00+08:00: Task created from dashboard and invite UX review concerns.
- 2026-07-10T01:47:00+08:00: Started preview-card-to-detail-editor work by reviewing the current section-builder structure, t47 field form output, and tests.
- 2026-07-10T01:51:23+08:00: Reworked the section builder so order cards open one focused detail editor, added close/focus handling and dirty cancel confirmation, updated tests, and verified with focused tests, dashboard typecheck, lint placeholder, and format check.
- 2026-07-10T01:57:20+08:00: Corrected the interaction to match the intended accordion model: the existing section card expands in place to reveal editor fields, while the card itself stays the primary control.
- 2026-07-10T02:00:46+08:00: Added same-card collapse behavior and loosened expanded editor spacing so fields render in a wider, less cramped flow.
- 2026-07-10T02:03:42+08:00: Fixed desktop overlap by constraining section-builder grid columns and adding shrink/wrap guards to the section cards and preview pane.
