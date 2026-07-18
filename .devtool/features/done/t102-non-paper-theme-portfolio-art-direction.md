---
id: 't102-non-paper-theme-portfolio-art-direction'
status: 'done'
priority: 'high'
assignee: null
epic: 'design-system'
dueDate: null
created: '2026-07-18T00:00:00+08:00'
modified: '2026-07-18T22:05:33+08:00'
labels: ['invite', 'themes', 'art-direction', 'portfolio', 'non-paper']
depends_on: ['t46-theme-compatibility-matrix', 't63-compatible-theme-gallery-live-preview', 't64-invite-theme-module-directory-refactor', 't80-follow-up-integration-and-regression-suite', 't87-theme-typography-tokens']
order: 'a102'
---

# t102-non-paper-theme-portfolio-art-direction - Define the non-paper theme portfolio and shared visual requirements

## Hierarchy

- Epic: `design-system`
- Dependencies: `t46-theme-compatibility-matrix`, `t63-compatible-theme-gallery-live-preview`, `t64-invite-theme-module-directory-refactor`, `t80-follow-up-integration-and-regression-suite`, `t87-theme-typography-tokens`

## Scope

Create a decision-ready art-direction and implementation brief for the next theme wave. The current catalog has 13 themes, but many rely on paper, folio, vellum, porcelain, stationery, or editorial-print cues. Establish a visibly different portfolio built around light, atmosphere, material, movement, and spatial systems instead of another collection of paper surfaces.

The portfolio should contain four directions: Neon Signal, Tidal Glass, Solar Pop, and Terrain Line. Define their event-type fit, palette, typography, section rhythm, image treatment, mode support, RSVP treatment, motion profile, accessibility constraints, dashboard preview read, and anti-overlap rules against the existing catalog.

## Acceptance

- [x] `packages/themes/THEME_SPECS.md` documents the four directions and clearly separates them from the existing paper/editorial, botanical, porcelain, celestial, velvet, and minimal themes.
- [x] Each direction has a named composition map, hero approach, section rhythm, image treatment, RSVP treatment, mode strategy, motion/reduced-motion strategy, and dashboard thumbnail brief.
- [x] The brief identifies which event types each theme serves and does not force universal compatibility where the art direction would be inappropriate.
- [x] The four directions use at least three distinct material or spatial metaphors: luminous signage, translucent fluid layers, bold color planes, and topographic route space.
- [x] Anti-slop constraints prohibit stationery, faux paper grain, folio borders, generic glassmorphism card stacks, emoji-heavy celebration UI, and palette-only differentiation.
- [x] Any missing shared contract capability is recorded as a small follow-up implementation item; theme modules remain isolated from dashboard UI and concrete theme branches in app code.

## Notes

This is the portfolio gate before implementation. It should resolve overlap and shared-contract questions without adding a theme module itself. Keep Lumiere brand identity in the app shell; the event themes should not all become gold luxury variants.

## Progress Log

- 2026-07-18T00:00:00+08:00: Task created after reviewing the 13-theme catalog and identifying an over-concentration of paper, folio, vellum, porcelain, and editorial-print metaphors.
- 2026-07-18T00:00:00+08:00: Started the portfolio art-direction and shared-contract review.
- 2026-07-18T22:05:33+08:00: Completed the decision-ready portfolio brief, including intentional event-fit boundaries, composition and RSVP direction, accessibility and reduced-motion rules, dashboard preview reads, anti-overlap constraints, and the scoped shared-contract follow-up. Prettier and `git diff --check` pass.
