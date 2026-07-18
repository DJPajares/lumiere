---
id: 't105-solar-pop-theme'
status: 'todo'
priority: 'medium'
assignee: null
epic: 'design-system'
dueDate: null
created: '2026-07-18T00:00:00+08:00'
modified: '2026-07-18T00:00:00+08:00'
labels: ['invite', 'themes', 'solar-pop', 'celebration', 'color-blocks']
depends_on: ['t102-non-paper-theme-portfolio-art-direction']
order: 'a105'
---

# t105-solar-pop-theme - Add the Solar Pop invitation theme

## Hierarchy

- Epic: `design-system`
- Dependencies: `t102-non-paper-theme-portfolio-art-direction`

## Scope

Build Solar Pop as a bright, confident celebration theme for birthdays, kids parties, launches, private events, and other daytime gatherings. The experience should feel like a sunlit festival identity: saturated coral, marigold, cobalt, and leaf green; large color planes; playful but controlled type; cutout-like image crops; and a deliberate rhythm of bold transitions.

Use geometric color fields, oversized numerals, crop windows, and directional panels instead of confetti, scrapbook paper, or repeated rounded cards. The RSVP should feel like a festival gate with clear choices and friendly copy while remaining parent- and guest-friendly.

## Acceptance

- [ ] Add an isolated `packages/themes/src/themes/solar-pop/` module with definition, visual effects, assets, and index exports; register the stable ID without changing existing persisted IDs.
- [ ] Solar Pop has a distinct `solar-pop` composition map, bold color-plane section rhythm, expressive sans/condensed label pairing, confident radius system, light-first mode, and a readable dusk variant.
- [ ] Visual treatment uses color blocking, crop windows, oversized date numerals, and restrained geometric motion; it must not resemble Kids through emoji, paper fields, stickers, or confetti.
- [ ] The RSVP treatment is a festival-gate flow with visible labels, attendee-count context, clear validation, closed/disabled states, recoverable errors, success feedback, and a usable keyboard path.
- [ ] Compatibility explicitly covers birthday, kids party, launch, private event, and other blueprints, with every supported section and renderer slot declared.
- [ ] The dashboard preview shows the color-plane composition and a real representative section rather than a decorative card collage.
- [ ] Reduced-motion mode removes wipes and pulses while retaining color hierarchy, reading order, and state feedback.
- [ ] Theme boundaries, registry tests, focused invite tests, typecheck, formatting, and the narrowest relevant lint checks pass.

## Notes

This should be joyful without becoming childish. Do not use emoji-heavy UI, novelty sticker graphics, stock party motifs, or uncontrolled rainbow gradients.

## Progress Log

- 2026-07-18T00:00:00+08:00: Task created as the high-energy daylight direction for the new theme portfolio.

