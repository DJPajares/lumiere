---
id: 't49-dashboard-component-system-and-field-overhaul'
status: 'done'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-09T00:00:00+08:00'
modified: '2026-07-10T08:13:43+08:00'
completedAt: '2026-07-10T08:13:43+08:00'
labels: ['dashboard', 'component-system', 'forms', 'uiux']
depends_on: ['t18-dashboard-app-scaffold', 't42-dashboard-navigation-ia-reset', 't47-schema-driven-content-field-forms']
order: 'a49'
---

# t49-dashboard-component-system-and-field-overhaul - Dashboard component system and field component overhaul

## Hierarchy

- Epic: `frontend`
- Dependencies: `t18-dashboard-app-scaffold`, `t42-dashboard-navigation-ia-reset`, `t47-schema-driven-content-field-forms`

## Scope

Replace weak custom dashboard form controls with a proper design-component strategy. Evaluate adopting HeroUI for dashboard controls or another accessible component system if it improves dropdowns, date/time pickers, popovers, dialogs, tabs, and form states.

## Suggested Agent

- Suggested model: `GPT-5.5`
- Reasoning level: `extra high`

## Acceptance

- [x] Decision note documents whether dashboard adopts HeroUI, another component system, or improved project-owned primitives, and why.
- [x] Dropdown/select, calendar/date-time, popover, dialog/drawer, tabs, toast/alert, checkbox/switch, and input components are replaced or upgraded.
- [x] New controls have consistent radius, spacing, labels, helper text, error text, focus rings, disabled states, and keyboard behavior.
- [x] Date/time controls support event timezone and clear formatting for manager users.
- [x] Dashboard form field wrappers are reusable across event basics, content sections, theme settings, guests, and RSVP settings.
- [x] `globals.css` remains simple even if a component library is adopted.
- [x] Tests or stories cover the upgraded fields in light/dark modes and common error states.

## UI Quality Checklist

- [x] Uses the selected dashboard or invite component strategy before custom UI.
- [x] Follows Lumiere color, shape, typography, motion, and theme locks from `SKILL.md`.
- [x] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [x] Works on required mobile, tablet, and desktop viewport widths.
- [x] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [x] Avoids generic AI-slop patterns listed in `SKILL.md`.


## Notes

The user explicitly called out dropdowns and calendars as poor. This task allows HeroUI if it is the better choice for dashboard productivity, but the invite app should remain theme-led and not become generic dashboard UI.

## Progress Log

- 2026-07-09T00:00:00+08:00: Task created from dashboard and invite UX review concerns.
- 2026-07-10T02:07:00+08:00: Started dashboard component-system pass by reviewing dashboard control usage, section-builder field output, and the component-library decision surface.
- 2026-07-10T08:13:43+08:00: Completed the dashboard component-system pass with a HeroUI decision note, shared dashboard field primitives, event basics and section-builder rewiring, and focused tests/typecheck/format verification.
