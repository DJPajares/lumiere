---
id: 't62-dashboard-responsive-modal-workflows'
status: 'done'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-10T18:00:00+08:00'
modified: '2026-07-11T00:59:56+08:00'
completedAt: '2026-07-11T00:53:53+08:00'
labels: ['dashboard', 'shadcn', 'base-ui', 'dialog', 'drawer', 'forms']
depends_on: ['t43-dashboard-event-edit-flow', 't24-dashboard-guest-management', 't56-dashboard-shadcn-foundation', 't58-dashboard-date-time-picker-overhaul']
order: 'a62'
---

# t62-dashboard-responsive-modal-workflows - Move bounded edits into Base UI-backed responsive modal workflows

## Hierarchy

- Epic: `frontend`
- Dependencies: `t43-dashboard-event-edit-flow`, `t24-dashboard-guest-management`, `t56-dashboard-shadcn-foundation`, `t58-dashboard-date-time-picker-overhaul`

## Scope

Use shadcn Base UI-backed Dialog on desktop/tablet and the project responsive Drawer/Dialog composition on mobile for bounded editing. Start with event details/settings and guest-group creation/editing.

## Suggested Agent

- Suggested model: `GPT-5.6 Terra (gpt-5.6-terra)`
- Reasoning level: `high`

## Acceptance

- [x] Event details/settings open from event list and event workspace in Dialog on desktop/tablet and Drawer on mobile.
- [x] Guest-group create/edit uses the same responsive pattern and supports max pax, members, notes, and invite status.
- [x] Use generated Base UI-backed components from `@lumiere/dashboard-ui`; remove competing modal libraries and Radix-specific code from these flows.
- [x] Long multi-section editors stay on dedicated routes/workspaces instead of being forced into oversized modals.
- [x] Modal forms support dirty-state protection, validation summary, inline errors, loading, retry, save, cancel, and close confirmation.
- [x] Focus is trapped while open and restored to the invoking control; background scrolling and interaction are blocked.
- [x] Nested popovers, selects, comboboxes, calendars, and confirmation alerts work correctly inside the modal without clipping or focus conflicts.
- [x] Tests cover create/edit success, validation, failed save, unsaved-close confirmation, mobile drawer behavior, nested field popups, and focus restoration.

## UI Quality Checklist

- [x] Uses the project-owned shadcn/ui Base UI components before creating custom controls.
- [x] Follows Lumiere color, shape, typography, density, motion, and theme locks from `SKILL.md`.
- [x] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [x] Works on required mobile, tablet, and desktop viewport widths.
- [x] Meets keyboard, label, contrast, focus-management, and reduced-motion basics.
- [x] Avoids browser-default controls, duplicate navigation, and generic AI-dashboard patterns.

## Notes

Build one responsive composition wrapper around the selected shadcn Dialog/Drawer primitives. Do not create separate divergent business forms for desktop and mobile.

## Progress Log

- 2026-07-10T18:00:00+08:00: Original task created.
- 2026-07-10T18:30:00+08:00: Updated to the current shadcn CLI v4 workflow with Base UI primitives and monorepo-aware component placement.
- 2026-07-10T19:15:00+08:00: Scoped shadcn/Base UI to the dashboard only and updated the suggested model to GPT-5.6 Terra with xhigh reasoning.
- 2026-07-11T00:50:00+08:00: Started t62 with product direction to rename the manager destination to Home, remove Events from primary navigation, and move event plus guest-group create/edit flows into one responsive Dialog/Drawer composition.
- 2026-07-11T00:53:53+08:00: Completed the shared Base UI responsive modal composition, migrated event and guest-group create/edit workflows, added dirty-close confirmation and focus restoration, updated manager navigation to Home without an Events tab, and verified 89 dashboard tests, dashboard and dashboard-ui typechecks, formatting, and a production dashboard build.
- 2026-07-11T00:59:56+08:00: Follow-up: replaced Home navigation actions that rendered links through Base UI Button with semantic styled links, eliminating nativeButton warnings; redirected the redundant `/events` index to Home and removed its unused workspace implementation.
