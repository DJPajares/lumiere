---
id: 't57-dashboard-select-combobox-overhaul'
status: 'done'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-10T18:00:00+08:00'
modified: '2026-07-10T22:53:00+08:00'
completedAt: '2026-07-10T22:53:00+08:00'
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
- Reasoning level: `high`

## Acceptance

- [x] Inventory dashboard dropdowns and classify each as Select, searchable Combobox, multi-select, command/action menu, or another more appropriate pattern.
- [x] Use Base UI-backed shadcn components from `@lumiere/dashboard-ui`; remove native `<select>` controls and obsolete custom dropdown implementations from manager workflows.
- [x] Select triggers use consistent height, horizontal padding, trailing chevron alignment, placeholder, selected value, error, disabled, read-only, and loading states.
- [x] Popup content anchors to the trigger, remains viewport-aware, has usable max height/scrolling, and supports collision handling on narrow screens.
- [x] Large datasets such as timezones, theme catalogs, venue regions, or guest groups use searchable comboboxes with explicit empty and loading states.
- [x] Keyboard navigation, typeahead/search, Escape, focus restoration, form labels, descriptions, and screen-reader announcements work correctly.
- [x] Form state and validation survive responsive Dialog/Drawer open and close cycles.
- [x] Vitest and Testing Library cover mouse selection, keyboard selection, empty search, validation, disabled behavior, and popup positioning assumptions.

## UI Quality Checklist

- [x] Uses the project-owned shadcn/ui Base UI components before creating custom controls.
- [x] Follows Lumiere color, shape, typography, density, motion, and theme locks from `SKILL.md`.
- [x] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [x] Works on required mobile, tablet, and desktop viewport widths.
- [x] Meets keyboard, label, contrast, focus-management, and reduced-motion basics.
- [x] Avoids browser-default controls, duplicate navigation, and generic AI-dashboard patterns.

## Notes

Use the component APIs generated for the selected Base UI preset. Do not copy examples from the Radix documentation tab or introduce Radix-only `asChild`, portal, or event assumptions without checking the Base UI implementation.

## Progress Log

- 2026-07-10T18:00:00+08:00: Original task created.
- 2026-07-10T18:30:00+08:00: Updated to the current shadcn CLI v4 workflow with Base UI primitives and monorepo-aware component placement.
- 2026-07-10T19:15:00+08:00: Scoped shadcn/Base UI to the dashboard only and updated the suggested model to GPT-5.6 Terra with xhigh reasoning.
- 2026-07-10T22:40:00+08:00: Started implementation; inventoried dashboard dropdown patterns and the shared Base UI component foundation.
- 2026-07-10T22:53:00+08:00: Completed the dropdown migration with Base UI-backed Select fields, a searchable IANA timezone Combobox, consistent states and popup behavior, a documented pattern inventory, and interaction coverage for mouse, keyboard, Escape, focus, empty results, validation, disabled/loading states, positioning, and dialog state persistence. Verified both package/app typechecks, 48 dashboard tests, formatting, the dashboard UI boundary, and a production build. The in-app visual pre-flight could not attach because this session exposed no browser backend.
