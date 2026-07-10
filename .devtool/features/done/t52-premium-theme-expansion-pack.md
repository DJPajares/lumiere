---
id: 't52-premium-theme-expansion-pack'
status: 'done'
priority: 'high'
assignee: null
epic: 'design-system'
dueDate: null
created: '2026-07-09T00:00:00+08:00'
modified: '2026-07-10T13:51:18+08:00'
completedAt: '2026-07-10T13:51:18+08:00'
labels: ['invite', 'themes', 'fonts', 'premium']
depends_on: ['t46-theme-compatibility-matrix', 't51-reverie-inspired-invite-modernization']
order: 'a52'
---

# t52-premium-theme-expansion-pack - Premium theme expansion pack

## Hierarchy

- Epic: `design-system`
- Dependencies: `t46-theme-compatibility-matrix`, `t51-reverie-inspired-invite-modernization`

## Scope

Add more premium invite themes with distinct typography, layout rhythm, backdrop strategy, ornaments, light/dark variants, and event-type compatibility.

## Suggested Agent

- Suggested model: `GPT-5.6 Sol` (`gpt-5.6-sol`)
- Reasoning level: `xhigh`

## Acceptance

- [x] Adds at least four additional theme directions beyond the initial set, such as Luxe Noir, Editorial Ivory, Garden Light, Modern Minimal, Celestial Gold, or Playful Celebration.
- [x] Each theme defines premium font pairing guidance, tokens, radius language, mode support, ornament strategy, backdrop strategy, and motion dial defaults.
- [x] Themes avoid trademarked names and protected visual identities unless licensing is resolved.
- [x] Each theme renders wedding, birthday, and generic celebration blueprints through the compatibility matrix.
- [x] Theme previews in dashboard show real section samples, not fake decorative cards.
- [x] Visual QA verifies no two themes feel like recolors of the same layout.

## UI Quality Checklist

- [x] Uses the selected dashboard or invite component strategy before custom UI.
- [x] Follows Lumiere color, shape, typography, motion, and theme locks from `SKILL.md`.
- [x] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [x] Works on required mobile, tablet, and desktop viewport widths.
- [x] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [x] Avoids generic AI-slop patterns listed in `SKILL.md`.


## Notes

Use premium fonts and layouts as a design requirement. Do not simply change color tokens and call it a new theme.

## Progress Log

- 2026-07-09T00:00:00+08:00: Task created from dashboard and invite UX review concerns.
- 2026-07-10T00:00:00+08:00: Updated suggestion to GPT-5.6 Sol with xhigh reasoning; this task needs flagship-level design judgment across multiple compatible themes.
- 2026-07-10T13:33:29+08:00: Promoted as the lowest-order unblocked backlog task because no todo tasks were available; began the registry, compatibility-matrix, invite-renderer, and dashboard-preview audit for four complete theme directions.
- 2026-07-10T13:51:18+08:00: Added Editorial Ivory, Garden Light, Modern Minimal, and Celestial Gold with complete registry/spec/composition metadata, distinct invite treatments, real dashboard samples, and wedding/birthday/generic compatibility coverage. UI pre-flight, nine project typechecks, 198 tests, focused formatting, diff checks, and invite/dashboard production builds pass.
