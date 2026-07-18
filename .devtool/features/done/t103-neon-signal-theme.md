---
id: 't103-neon-signal-theme'
status: 'done'
priority: 'high'
assignee: null
epic: 'design-system'
dueDate: null
created: '2026-07-18T00:00:00+08:00'
modified: '2026-07-18T22:41:59+08:00'
labels: ['invite', 'themes', 'neon-signal', 'nightlife', 'launch']
depends_on: ['t102-non-paper-theme-portfolio-art-direction']
order: 'a103'
---

# t103-neon-signal-theme - Add the Neon Signal invitation theme

## Hierarchy

- Epic: `design-system`
- Dependencies: `t102-non-paper-theme-portfolio-art-direction`

## Scope

Build Neon Signal as an urban night theme for launches, dinners, birthdays, private events, and other high-energy gatherings. The experience should feel like a live signal moving through a city: charcoal space, electric cyan and coral accents, directional light, oversized grotesk type, compact mono labels, and media that feels edge-lit rather than printed.

Use a signal-route composition instead of a stationery page: a full-viewport hero, a time-and-place readout, a sequential event program, an image contact strip, and a final check-in style RSVP chapter. Treat motion as short light sweeps, reveal timing, and controlled route progress; do not create a continuously animated cyberpunk backdrop.

## Acceptance

- [x] Add an isolated `packages/themes/src/themes/neon-signal/` module with definition, visual effects, assets, and index exports; register the stable ID without changing existing persisted IDs.
- [x] Neon Signal has a materially distinct `neon-signal` composition map, specialized section rhythm, grotesk/mono typography pairing, sharp radius language, dark-first mode behavior, and an explicit light fallback.
- [x] Visual treatment uses luminous signal bands, scanline or grid cues, and edge-lit media without paper texture, folio borders, faux print grain, or generic glassmorphism card stacks.
- [x] The RSVP treatment is a check-in console with clear labels, field-level errors, disabled/closed states, recovery, success confirmation, and WCAG AA-readable controls.
- [x] Compatibility explicitly covers launch, dinner, birthday, private event, and other blueprints, with every supported section and renderer slot declared.
- [x] The dashboard preview uses real theme preview data and communicates the dark signal-route composition at thumbnail and expanded sizes.
- [x] Reduced-motion mode removes sweeps and route movement while preserving hierarchy, focus, and readable state changes.
- [x] Theme boundaries, registry tests, focused invite tests, typecheck, formatting, and the narrowest relevant lint checks pass.

## Notes

Keep the theme original and generic. Avoid literal cyberpunk franchise references, branded city signage, neon-gradient overload, and decorative code that does not help guests understand the event.

## Progress Log

- 2026-07-18T00:00:00+08:00: Task created as the first implementation direction in the non-paper theme portfolio.
- 2026-07-18T22:10:00+08:00: Started shared-contract preparation and Neon Signal implementation.
- 2026-07-18T22:41:59+08:00: Completed the isolated theme, Signal Route composition, edge-lit visual system, metadata-driven check-in renderer, real preview data, accessibility states, and reduced-motion treatment. Theme/invite/dashboard typechecks, focused tests, formatting, diff checks, and theme boundaries pass; package lint scripts remain repository placeholders.
