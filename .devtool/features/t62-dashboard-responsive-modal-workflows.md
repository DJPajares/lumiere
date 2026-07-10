---
id: 't62-dashboard-responsive-modal-workflows'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-10T18:00:00+08:00'
modified: '2026-07-10T19:15:00+08:00'
completedAt: null
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
- Reasoning level: `xhigh`

## Acceptance

- [ ] Event details/settings open from event list and event workspace in Dialog on desktop/tablet and Drawer on mobile.
- [ ] Guest-group create/edit uses the same responsive pattern and supports max pax, members, notes, and invite status.
- [ ] Use generated Base UI-backed components from `@lumiere/dashboard-ui`; remove competing modal libraries and Radix-specific code from these flows.
- [ ] Long multi-section editors stay on dedicated routes/workspaces instead of being forced into oversized modals.
- [ ] Modal forms support dirty-state protection, validation summary, inline errors, loading, retry, save, cancel, and close confirmation.
- [ ] Focus is trapped while open and restored to the invoking control; background scrolling and interaction are blocked.
- [ ] Nested popovers, selects, comboboxes, calendars, and confirmation alerts work correctly inside the modal without clipping or focus conflicts.
- [ ] Tests cover create/edit success, validation, failed save, unsaved-close confirmation, mobile drawer behavior, nested field popups, and focus restoration.

## UI Quality Checklist

- [ ] Uses the project-owned shadcn/ui Base UI components before creating custom controls.
- [ ] Follows Lumiere color, shape, typography, density, motion, and theme locks from `SKILL.md`.
- [ ] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [ ] Works on required mobile, tablet, and desktop viewport widths.
- [ ] Meets keyboard, label, contrast, focus-management, and reduced-motion basics.
- [ ] Avoids browser-default controls, duplicate navigation, and generic AI-dashboard patterns.

## Notes

Build one responsive composition wrapper around the selected shadcn Dialog/Drawer primitives. Do not create separate divergent business forms for desktop and mobile.

## Progress Log

- 2026-07-10T18:00:00+08:00: Original task created.
- 2026-07-10T18:30:00+08:00: Updated to the current shadcn CLI v4 workflow with Base UI primitives and monorepo-aware component placement.
- 2026-07-10T19:15:00+08:00: Scoped shadcn/Base UI to the dashboard only and updated the suggested model to GPT-5.6 Terra with xhigh reasoning.
