---
id: 't58-dashboard-date-time-picker-overhaul'
status: 'done'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-10T18:00:00+08:00'
modified: '2026-07-10T23:19:00+08:00'
completedAt: '2026-07-10T23:19:00+08:00'
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

- [x] Create reusable `EventDatePicker`, `EventTimePicker`, and optional `EventDateTimeRange` compositions using the shared shadcn Base UI wrappers.
- [x] Calendar presentation includes clear month/year controls, readable today/selected/range/disabled/outside-month states, and a stable layout across months.
- [x] Start and end inputs support optional end time, prevent invalid ranges, and display the event timezone adjacent to the control.
- [x] Formatting is locale-aware in the UI while API payloads use a documented canonical date/time representation and explicit timezone.
- [x] Desktop/tablet use an accessible Popover or Dialog; mobile uses the shared responsive Drawer/Dialog pattern rather than a cramped floating calendar.
- [x] Keyboard operation, focus management, labels, descriptions, validation, reduced motion, and touch target size are verified.
- [x] No raw `datetime-local` control remains in user-facing dashboard flows unless documented as a deliberate fallback.
- [x] Tests cover selection, month/year navigation, start/end validation, clearing an optional end date, timezone boundaries, and responsive presentation.

## UI Quality Checklist

- [x] Uses the project-owned shadcn/ui Base UI components before creating custom controls.
- [x] Follows Lumiere color, shape, typography, density, motion, and theme locks from `SKILL.md`.
- [x] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [x] Works on required mobile, tablet, and desktop viewport widths.
- [x] Meets keyboard, label, contrast, focus-management, and reduced-motion basics.
- [x] Avoids browser-default controls, duplicate navigation, and generic AI-dashboard patterns.

## Notes

The date picker is an app composition, not a reason to fork the shared Calendar primitive. Keep domain rules in dashboard-level components and keep the Base UI-backed primitive generic.

## Progress Log

- 2026-07-10T18:00:00+08:00: Original task created.
- 2026-07-10T18:30:00+08:00: Updated to the current shadcn CLI v4 workflow with Base UI primitives and monorepo-aware component placement.
- 2026-07-10T19:15:00+08:00: Scoped shadcn/Base UI to the dashboard only and updated the suggested model to GPT-5.6 Terra with xhigh reasoning.
- 2026-07-10T20:00:00+08:00: Started the dashboard date and time picker overhaul.
- 2026-07-10T23:19:00+08:00: Completed reusable date, time, and range compositions with desktop Popover/mobile Drawer presentation; replaced all dashboard `datetime-local` controls in event basics and section date fields; added explicit IANA timezone wall-time conversion, invalid-range prevention, optional-end clearing, and focused selection/navigation/responsive/timezone coverage. Verified 73 dashboard tests, targeted formatting, and `git diff --check`; the combined dashboard typecheck had only two unrelated profile-test fixture cast errors from the concurrent t60 work.
