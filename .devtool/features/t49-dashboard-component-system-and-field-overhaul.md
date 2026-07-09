---
id: 't49-dashboard-component-system-and-field-overhaul'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-09T00:00:00+08:00'
modified: '2026-07-09T00:00:00+08:00'
completedAt: null
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

- [ ] Decision note documents whether dashboard adopts HeroUI, another component system, or improved project-owned primitives, and why.
- [ ] Dropdown/select, calendar/date-time, popover, dialog/drawer, tabs, toast/alert, checkbox/switch, and input components are replaced or upgraded.
- [ ] New controls have consistent radius, spacing, labels, helper text, error text, focus rings, disabled states, and keyboard behavior.
- [ ] Date/time controls support event timezone and clear formatting for manager users.
- [ ] Dashboard form field wrappers are reusable across event basics, content sections, theme settings, guests, and RSVP settings.
- [ ] `globals.css` remains simple even if a component library is adopted.
- [ ] Tests or stories cover the upgraded fields in light/dark modes and common error states.

## UI Quality Checklist

- [ ] Uses the selected dashboard or invite component strategy before custom UI.
- [ ] Follows Lumiere color, shape, typography, motion, and theme locks from `SKILL.md`.
- [ ] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [ ] Works on required mobile, tablet, and desktop viewport widths.
- [ ] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [ ] Avoids generic AI-slop patterns listed in `SKILL.md`.


## Notes

The user explicitly called out dropdowns and calendars as poor. This task allows HeroUI if it is the better choice for dashboard productivity, but the invite app should remain theme-led and not become generic dashboard UI.

## Progress Log

- 2026-07-09T00:00:00+08:00: Task created from dashboard and invite UX review concerns.
