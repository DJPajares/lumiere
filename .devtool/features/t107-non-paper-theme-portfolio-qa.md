---
id: 't107-non-paper-theme-portfolio-qa'
status: 'todo'
priority: 'high'
assignee: null
epic: 'quality'
dueDate: null
created: '2026-07-18T00:00:00+08:00'
modified: '2026-07-18T00:00:00+08:00'
labels: ['invite', 'themes', 'visual-qa', 'accessibility', 'regression']
depends_on: ['t103-neon-signal-theme', 't104-tidal-glass-theme', 't105-solar-pop-theme', 't106-terrain-line-theme']
order: 'a107'
---

# t107-non-paper-theme-portfolio-qa - Validate the non-paper theme portfolio

## Hierarchy

- Epic: `quality`
- Dependencies: `t103-neon-signal-theme`, `t104-tidal-glass-theme`, `t105-solar-pop-theme`, `t106-terrain-line-theme`

## Scope

Run the final portfolio review after the four new themes ship. Prove that the additions create new guest experiences, remain compatible with the current invitation architecture, and do not quietly reproduce the existing paper/editorial pattern through shared fallbacks or dashboard-only previews.

## Acceptance

- [ ] Registry and compatibility tests cover all four new IDs, supported event types, supported sections, mode declarations, renderer slots, preview data, and unique composition maps.
- [ ] Invite visual QA covers 390px, 768px, and 1440px widths; cover image and no-cover fallback; light, dark, and system/toggleable behavior where supported; and reduced-motion behavior.
- [ ] RSVP QA covers loading, editable, validation error, recoverable request error, disabled, closed, success, and keyboard/focus states for each new RSVP treatment.
- [ ] Dashboard gallery QA shows the real preview renderer, compatible-first filtering, thumbnail differentiation, expanded preview behavior, and clear mode labels for every new theme.
- [ ] A visual comparison confirms that the four new themes differ by composition, material metaphor, typography, image treatment, section rhythm, and RSVP structure, not only by tokens.
- [ ] Theme boundary checks confirm no dashboard UI, shadcn, Base UI, or concrete theme-ID branches leak into invite/theme production code.
- [ ] Focused tests, typecheck, formatting, lint, theme boundary checks, and the narrowest relevant app smoke checks pass; unresolved visual limitations are documented in the task log.

## Notes

Use this as the release gate for the theme wave. Keep the review focused on invitation experience and theme compatibility; do not expand it into a general dashboard redesign.

## Progress Log

- 2026-07-18T00:00:00+08:00: Task created as the release gate for the four-theme non-paper portfolio.
