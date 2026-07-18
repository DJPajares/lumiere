---
id: 't104-tidal-glass-theme'
status: 'todo'
priority: 'high'
assignee: null
epic: 'design-system'
dueDate: null
created: '2026-07-18T00:00:00+08:00'
modified: '2026-07-18T00:00:00+08:00'
labels: ['invite', 'themes', 'tidal-glass', 'coastal', 'fluid']
depends_on: ['t102-non-paper-theme-portfolio-art-direction']
order: 'a104'
---

# t104-tidal-glass-theme - Add the Tidal Glass invitation theme

## Hierarchy

- Epic: `design-system`
- Dependencies: `t102-non-paper-theme-portfolio-art-direction`

## Scope

Build Tidal Glass as a calm, contemporary theme for weddings, dinners, private events, holiday gatherings, and other location-led occasions. The experience should feel like daylight through water: deep ink, sea-glass aqua, softened blue-green, translucent layers, fluid boundaries, wide photography, and soft geometric sans typography.

Use a flowing spatial composition rather than stacked cards. Let sections overlap through translucent bands, tide-line dividers, and large image fields; keep practical details anchored in a readable shoreline rail. The RSVP should feel like entering a calm cove, not filling in a paper form.

## Acceptance

- [ ] Add an isolated `packages/themes/src/themes/tidal-glass/` module with definition, visual effects, assets, and index exports; register the stable ID without changing existing persisted IDs.
- [ ] Tidal Glass has a distinct `tidal-glass` composition map, fluid section rhythm, non-serif display/body pairing, soft radius system, light-first mode, and a considered dark-water variant.
- [ ] Visual treatment uses translucent depth, refracted color, wave or tide-line geometry, and wide media crops; it must not become a generic blur-heavy glassmorphism card gallery or a recolored Porcelain Blue theme.
- [ ] The RSVP treatment uses a spacious shoreline layout with visible labels, guest-count context, field-level errors, closed/disabled states, recoverable errors, and a quiet confirmation state.
- [ ] Compatibility explicitly covers wedding, dinner, private event, holiday, and other blueprints, with every supported section and renderer slot declared.
- [ ] The dashboard preview communicates fluid layers and image-led spacing using real preview data at thumbnail and expanded sizes.
- [ ] Reduced-motion mode freezes drifting layers and uses static translucency with preserved contrast and focus states.
- [ ] Theme boundaries, registry tests, focused invite tests, typecheck, formatting, and the narrowest relevant lint checks pass.

## Notes

The material metaphor is water and light, not frosted UI chrome. Keep blur subordinate to hierarchy, protect text from low-contrast photography, and avoid beach clip art, shells, or resort-brand cues.

## Progress Log

- 2026-07-18T00:00:00+08:00: Task created as the calm, translucent counterpoint to the existing paper and editorial themes.

