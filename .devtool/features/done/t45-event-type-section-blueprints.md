---
id: 't45-event-type-section-blueprints'
status: 'done'
priority: 'high'
assignee: null
epic: 'design-system'
dueDate: null
created: '2026-07-09T00:00:00+08:00'
modified: '2026-07-10T01:20:59+08:00'
completedAt: '2026-07-10T01:20:59+08:00'
labels: ['sections', 'event-types', 'themes', 'dashboard']
depends_on: ['t06-theme-registry-package', 't11-theme-and-section-api', 't23-dashboard-section-builder']
order: 'a45'
---

# t45-event-type-section-blueprints - Event-type section blueprints and enablement rules

## Hierarchy

- Epic: `design-system`
- Dependencies: `t06-theme-registry-package`, `t11-theme-and-section-api`, `t23-dashboard-section-builder`

## Scope

Define event-type-specific section blueprints so weddings, birthdays, and future event types can have their own recommended sections while still rendering through shared compatible theme slots.

## Suggested Agent

- Suggested model: `GPT-5.5`
- Reasoning level: `extra high`

## Acceptance

- [x] Registry defines event types such as wedding, birthday, generic celebration, and future extensible event kinds.
- [x] Each event type has required, recommended, and optional section definitions.
- [x] Managers can enable/disable optional sections and hide supported sections per event.
- [x] Required sections can be disabled only when the registry explicitly allows it or when the event status remains draft.
- [x] Section blueprints include field schemas, validation rules, default labels, and invite renderer slots.
- [x] Dashboard shows event-type-specific section suggestions instead of one generic JSON editor for every event.
- [x] Tests cover wedding defaults, birthday defaults, optional enablement, required validation, and unsupported section behavior.

## UI Quality Checklist

- [x] Uses the selected dashboard or invite component strategy before custom UI.
- [x] Follows Lumiere color, shape, typography, motion, and theme locks from `SKILL.md`.
- [x] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [x] Works on required mobile, tablet, and desktop viewport widths.
- [x] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [x] Avoids generic AI-slop patterns listed in `SKILL.md`.


## Notes

This makes events specific without hard-coding each event instance. Themes should style compatible renderer slots, while event types decide which sections make sense.

## Progress Log

- 2026-07-09T00:00:00+08:00: Task created from dashboard and invite UX review concerns.
- 2026-07-10T00:00:00+08:00: Started event-type blueprint work by reviewing theme section schemas, theme registry validation, and dashboard section-builder integration points.
- 2026-07-10T01:17:43+08:00: Added event-type section blueprints, API validation for required/unsupported sections, dashboard event-type suggestions and published-section disable locks. Verified with focused theme/API/dashboard tests, typecheck, lint, format check, full test suite, and git diff whitespace check.
- 2026-07-10T01:20:59+08:00: Surfaced blueprint validation details in the section builder form-level message so missing published-required sections are visible before save.
