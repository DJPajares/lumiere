---
id: 't57-dashboard-select-combobox-overhaul'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-10T18:00:00+08:00'
modified: '2026-07-10T19:15:00+08:00'
completedAt: null
labels: ['dashboard', 'shadcn', 'base-ui', 'forms', 'select', 'combobox']
depends_on: ['t56-dashboard-shadcn-foundation', 't47-schema-driven-content-field-forms']
order: 'a57'
---

# t57-dashboard-select-combobox-overhaul - Replace dashboard selects and comboboxes with Base UI variants

## Hierarchy

- Epic: `frontend`
- Dependencies: `t56-dashboard-shadcn-foundation`, `t47-schema-driven-content-field-forms`

## Scope

Replace every native or weak custom dashboard dropdown with the shadcn Base UI Select or Combobox variant. Fix trigger anatomy, chevron placement, floating content, option hierarchy, search, scrolling, validation, and keyboard behavior without relying on Radix-specific props.

## Suggested Agent

- Suggested model: `GPT-5.6 Terra (gpt-5.6-terra)`
- Reasoning level: `xhigh`

## Acceptance

- [ ] Inventory dashboard dropdowns and classify each as Select, searchable Combobox, multi-select, command/action menu, or another more appropriate pattern.
- [ ] Use Base UI-backed shadcn components from `@lumiere/dashboard-ui`; remove native `<select>` controls and obsolete custom dropdown implementations from manager workflows.
- [ ] Select triggers use consistent height, horizontal padding, trailing chevron alignment, placeholder, selected value, error, disabled, read-only, and loading states.
- [ ] Popup content anchors to the trigger, remains viewport-aware, has usable max height/scrolling, and supports collision handling on narrow screens.
- [ ] Large datasets such as timezones, theme catalogs, venue regions, or guest groups use searchable comboboxes with explicit empty and loading states.
- [ ] Keyboard navigation, typeahead/search, Escape, focus restoration, form labels, descriptions, and screen-reader announcements work correctly.
- [ ] Form state and validation survive responsive Dialog/Drawer open and close cycles.
- [ ] Vitest and Testing Library cover mouse selection, keyboard selection, empty search, validation, disabled behavior, and popup positioning assumptions.

## UI Quality Checklist

- [ ] Uses the project-owned shadcn/ui Base UI components before creating custom controls.
- [ ] Follows Lumiere color, shape, typography, density, motion, and theme locks from `SKILL.md`.
- [ ] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [ ] Works on required mobile, tablet, and desktop viewport widths.
- [ ] Meets keyboard, label, contrast, focus-management, and reduced-motion basics.
- [ ] Avoids browser-default controls, duplicate navigation, and generic AI-dashboard patterns.

## Notes

Use the component APIs generated for the selected Base UI preset. Do not copy examples from the Radix documentation tab or introduce Radix-only `asChild`, portal, or event assumptions without checking the Base UI implementation.

## Progress Log

- 2026-07-10T18:00:00+08:00: Original task created.
- 2026-07-10T18:30:00+08:00: Updated to the current shadcn CLI v4 workflow with Base UI primitives and monorepo-aware component placement.
- 2026-07-10T19:15:00+08:00: Scoped shadcn/Base UI to the dashboard only and updated the suggested model to GPT-5.6 Terra with xhigh reasoning.
