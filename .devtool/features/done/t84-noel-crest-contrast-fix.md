---
id: 't84-noel-crest-contrast-fix'
status: 'done'
priority: 'high'
assignee: null
epic: 'design-system'
dueDate: null
created: '2026-07-14T11:18:00+08:00'
modified: '2026-07-14T11:21:37+08:00'
completedAt: '2026-07-14T11:21:37+08:00'
labels: ['invite', 'themes', 'noel', 'ornaments']
depends_on: ['t83-noel-ornament-refinement']
order: 'a84'
---

# t84-noel-crest-contrast-fix - Make the Noel crest crisp in Snowlight

## Scope

Replace the washed, block-like hero crest rendering with a high-contrast ornament that cannot expand into broad gradient fills.

## Acceptance

- [x] The crest uses explicitly sized hairlines and a compact center knot.
- [x] Snowlight uses a darker, clearly visible gold.
- [x] Candlelight remains warm without excessive glow.
- [x] Hero and outro use the same corrected ornament.
- [x] Formatting, focused tests, theme boundaries, and invite build pass.

## Progress Log

- 2026-07-14T11:18:00+08:00: Started from the supplied Snowlight screenshot; removed the SVG-backed crest in favor of tightly sized CSS layers so the line work cannot render as filled blocks.
- 2026-07-14T11:21:37+08:00: Added a deeper Snowlight crest token, matched the hero and outro ornaments, passed 59 focused tests and theme-boundary validation, and completed the invitation production build.
