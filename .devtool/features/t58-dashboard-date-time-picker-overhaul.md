---
id: 't58-dashboard-date-time-picker-overhaul'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-10T18:00:00+08:00'
modified: '2026-07-10T19:15:00+08:00'
completedAt: null
labels: ['dashboard', 'shadcn', 'base-ui', 'forms', 'datepicker', 'calendar', 'timezone']
depends_on: ['t56-dashboard-shadcn-foundation', 't43-dashboard-event-edit-flow']
order: 'a58'
---

# t58-dashboard-date-time-picker-overhaul - Replace dashboard date and time controls with Base UI-compatible pickers

## Hierarchy

- Epic: `frontend`
- Dependencies: `t56-dashboard-shadcn-foundation`, `t43-dashboard-event-edit-flow`

## Scope

Replace browser-native-looking date/time fields with polished event-aware pickers assembled from the current shadcn Base UI component set. The interaction must feel contemporary while preserving explicit event timezone semantics.

## Suggested Agent

- Suggested model: `GPT-5.6 Terra (gpt-5.6-terra)`
- Reasoning level: `high`

## Acceptance

- [ ] Create reusable `EventDatePicker`, `EventTimePicker`, and optional `EventDateTimeRange` compositions using the shared shadcn Base UI wrappers.
- [ ] Calendar presentation includes clear month/year controls, readable today/selected/range/disabled/outside-month states, and a stable layout across months.
- [ ] Start and end inputs support optional end time, prevent invalid ranges, and display the event timezone adjacent to the control.
- [ ] Formatting is locale-aware in the UI while API payloads use a documented canonical date/time representation and explicit timezone.
- [ ] Desktop/tablet use an accessible Popover or Dialog; mobile uses the shared responsive Drawer/Dialog pattern rather than a cramped floating calendar.
- [ ] Keyboard operation, focus management, labels, descriptions, validation, reduced motion, and touch target size are verified.
- [ ] No raw `datetime-local` control remains in user-facing dashboard flows unless documented as a deliberate fallback.
- [ ] Tests cover selection, month/year navigation, start/end validation, clearing an optional end date, timezone boundaries, and responsive presentation.

## UI Quality Checklist

- [ ] Uses the project-owned shadcn/ui Base UI components before creating custom controls.
- [ ] Follows Lumiere color, shape, typography, density, motion, and theme locks from `SKILL.md`.
- [ ] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [ ] Works on required mobile, tablet, and desktop viewport widths.
- [ ] Meets keyboard, label, contrast, focus-management, and reduced-motion basics.
- [ ] Avoids browser-default controls, duplicate navigation, and generic AI-dashboard patterns.

## Notes

The date picker is an app composition, not a reason to fork the shared Calendar primitive. Keep domain rules in dashboard-level components and keep the Base UI-backed primitive generic.

## Progress Log

- 2026-07-10T18:00:00+08:00: Original task created.
- 2026-07-10T18:30:00+08:00: Updated to the current shadcn CLI v4 workflow with Base UI primitives and monorepo-aware component placement.
- 2026-07-10T19:15:00+08:00: Scoped shadcn/Base UI to the dashboard only and updated the suggested model to GPT-5.6 Terra with xhigh reasoning.
