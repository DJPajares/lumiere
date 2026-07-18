---
id: 't95-dashboard-content-detail-modal'
status: 'done'
priority: 'medium'
assignee: null
epic: 'dashboard-content'
dueDate: null
created: '2026-07-18T00:00:00Z'
modified: '2026-07-18T16:13:17+08:00'
completedAt: '2026-07-18T16:13:17+08:00'
labels: ['dashboard', 'content', 'dialog', 'ux']
depends_on: ['t62-dashboard-responsive-modal-workflows']
order: 'a95'
---

# t95-dashboard-content-detail-modal - Dashboard content detail modal

## Hierarchy

- Epic: `dashboard-content`
- Dependencies: `t62-dashboard-responsive-modal-workflows`

## Scope

Move the existing per-section editor from inline expansion into the established responsive modal/drawer while preserving the section-order list, selected live preview, schema-driven field controls, developer JSON fallback, and single save/cancel model. This is a presentation refactor of the current content workspace, not a second content editor.

## Suggested Agent

- Suggested model: `GPT-5.6 Terra (gpt-5.6-terra)`
- Reasoning level: `high`

## Acceptance

- [x] Each section row has a clear Edit action that opens its existing editor controls.
- [x] Desktop opens a shadcn/Base UI dialog and mobile uses the established responsive drawer pattern.
- [x] The modal reuses the current schema-driven fields and keeps the developer JSON editor as the existing advanced fallback.
- [x] Saving updates the card preview without a full-page refresh.
- [x] Closing with unsaved section changes uses the established dirty-close confirmation and does not discard edits silently.
- [x] Section order, enablement, visibility, validation reveal, and sticky preview behavior remain available outside the modal.
- [x] Keyboard focus is trapped, restored, and labeled correctly.

## Notes

Use `ResponsiveModal` from the existing dashboard workflow. Keep the invitation preview in its current dedicated panel; do not duplicate or squeeze the full preview into the editor modal.

## Progress Log

- 2026-07-18T00:00:00Z: Task created.
- 2026-07-18T13:12:11+08:00: Aligned the task with the existing inline schema editor/live-preview workspace and removed assumptions about raw-JSON-only or redundant detail cards.
- 2026-07-18T16:05:24+08:00: Started implementation after confirming the responsive modal dependency is complete and this is the lowest-order ready task.
- 2026-07-18T16:13:17+08:00: Completed the responsive section editor modal/drawer, separated preview selection from editing, retained row-level ordering/enablement/visibility controls, added section-scoped dirty discard behavior, and updated existing coverage. Verified all 93 dashboard tests, dashboard typecheck, formatting, and diff checks.
