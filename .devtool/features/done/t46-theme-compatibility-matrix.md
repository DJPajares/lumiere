---
id: 't46-theme-compatibility-matrix'
status: 'done'
priority: 'high'
assignee: null
epic: 'design-system'
dueDate: null
created: '2026-07-09T00:00:00+08:00'
modified: '2026-07-10T01:30:41+08:00'
completedAt: '2026-07-10T01:30:41+08:00'
labels: ['themes', 'event-types', 'compatibility', 'invite']
depends_on: ['t06-theme-registry-package', 't30-initial-theme-implementations', 't45-event-type-section-blueprints']
order: 'a46'
---

# t46-theme-compatibility-matrix - Theme compatibility matrix across event types

## Hierarchy

- Epic: `design-system`
- Dependencies: `t06-theme-registry-package`, `t30-initial-theme-implementations`, `t45-event-type-section-blueprints`

## Scope

Add a compatibility layer proving that every public theme can render every supported event type through shared section slots, with graceful fallback for unsupported decorative variants.

## Suggested Agent

- Suggested model: `GPT-5.5`
- Reasoning level: `extra high`

## Acceptance

- [x] Theme registry declares supported event types, modes, motion levels, fonts, backdrop strategy, ornaments, and renderer slot coverage.
- [x] Every MVP theme can render wedding, birthday, and generic celebration blueprints without missing critical sections.
- [x] Dashboard prevents or warns when a selected theme cannot fully support an event type.
- [x] Invite app uses fallback renderers when a theme lacks a specialized section variant.
- [x] Automated tests or stories render a matrix of event type x theme x light/dark mode for representative sections.
- [x] Compatibility failures are visible during development and do not silently break public pages.

## UI Quality Checklist

- [x] Uses the selected dashboard or invite component strategy before custom UI.
- [x] Follows Lumiere color, shape, typography, motion, and theme locks from `SKILL.md`.
- [x] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [x] Works on required mobile, tablet, and desktop viewport widths.
- [x] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [x] Avoids generic AI-slop patterns listed in `SKILL.md`.


## Notes

The goal is not that every theme looks identical for every event. The goal is that every theme remains functional, premium, and complete across supported event types.

## Progress Log

- 2026-07-09T00:00:00+08:00: Task created from dashboard and invite UX review concerns.
- 2026-07-10T01:23:35+08:00: Started compatibility matrix work by reviewing theme registry metadata, event-type blueprints, API theme validation, dashboard theme selector, and invite renderer fallback paths.
- 2026-07-10T01:30:41+08:00: Added explicit theme compatibility profiles, shared compatibility matrix/evaluator, API compatibility validation, dashboard warnings and blocked theme choices, invite renderer fallback diagnostics, and matrix/UI/SSR tests. Verified with focused theme/API/invite/dashboard tests, typecheck, lint, format check, full test suite, and git diff whitespace check.
