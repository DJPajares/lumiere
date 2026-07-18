---
id: 't106-terrain-line-theme'
status: 'done'
priority: 'medium'
assignee: null
epic: 'design-system'
dueDate: null
created: '2026-07-18T00:00:00+08:00'
modified: '2026-07-18T22:42:50+08:00'
labels: ['invite', 'themes', 'terrain-line', 'outdoor', 'topographic']
depends_on: ['t102-non-paper-theme-portfolio-art-direction']
order: 'a106'
---

# t106-terrain-line-theme - Add the Terrain Line invitation theme

## Hierarchy

- Epic: `design-system`
- Dependencies: `t102-non-paper-theme-portfolio-art-direction`

## Scope

Build Terrain Line as an outdoor and destination theme for weddings, birthdays, private events, dinners, launches, and other gatherings with a strong sense of place. The experience should feel like following a route through a landscape: pine, slate, sand, and ember tones; topographic contour lines; route markers; documentary photography; rugged but refined typography; and a vertically unfolding itinerary.

Use a trail composition with a route-led hero, an itinerary spine, location chapters, an image field, and a basecamp-style RSVP close. Topographic lines should create orientation and atmosphere without turning every section into a literal map or a grid of utility cards.

## Acceptance

- [x] Add an isolated `packages/themes/src/themes/terrain-line/` module with definition, visual effects, assets, and index exports; register the stable ID without changing existing persisted IDs.
- [x] Terrain Line has a distinct `terrain-line` composition map, route-led section rhythm, humanist sans/utility mono pairing, compact radius system, light/dark terrain modes, and explicit reduced-motion behavior.
- [x] Visual treatment uses contour geometry, route markers, natural image crops, and spatial depth; it must not rely on faux paper, archival folios, generic map pins, or a recolored Modern Minimal grid.
- [x] The RSVP treatment is a basecamp reply chapter with visible labels, party-size context, field-level errors, closed/disabled states, recoverable errors, success confirmation, and strong focus visibility.
- [x] Compatibility explicitly covers wedding, birthday, private event, dinner, launch, and other blueprints, with every supported section and renderer slot declared.
- [x] The dashboard preview communicates the route spine and natural image treatment with real preview data at thumbnail and expanded sizes.
- [x] Reduced-motion mode removes route travel and contour movement while retaining static orientation cues and readable transitions.
- [x] Theme boundaries, registry tests, focused invite tests, typecheck, formatting, and the narrowest relevant lint checks pass.

## Notes

Keep the outdoor language contemporary and inclusive. Avoid literal hiking-brand references, national-park marks, adventure clip art, or a default wedding-stationery interpretation.

## Progress Log

- 2026-07-18T00:00:00+08:00: Task created as the place-led, topographic direction for the new theme portfolio.
- 2026-07-18T22:42:40+08:00: Started Terrain Line implementation after completing Solar Pop.
- 2026-07-18T22:42:50+08:00: Completed the isolated theme, Terrain Route composition, contour and documentary visual system, basecamp RSVP renderer, real preview data, terrain modes, and static reduced-motion fallback. Shared typechecks, focused tests, formatting, diff checks, and theme boundaries pass.
