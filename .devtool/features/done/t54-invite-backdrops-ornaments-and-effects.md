---
id: 't54-invite-backdrops-ornaments-and-effects'
status: 'done'
priority: 'medium'
assignee: null
epic: 'design-system'
dueDate: null
created: '2026-07-09T00:00:00+08:00'
modified: '2026-07-10T15:44:55+08:00'
completedAt: '2026-07-10T15:44:55+08:00'
labels: ['invite', 'visual-design', 'ornaments', 'backdrops']
depends_on: ['t52-premium-theme-expansion-pack', 't53-invite-motion-parallax-system']
order: 'a54'
---

# t54-invite-backdrops-ornaments-and-effects - Invite backdrops, ornaments, and effects system

## Hierarchy

- Epic: `design-system`
- Dependencies: `t52-premium-theme-expansion-pack`, `t53-invite-motion-parallax-system`

## Scope

Build a theme-safe visual layer for premium backdrops, ornaments, texture, halos, frames, dividers, and event-specific accents without hard-coding one look into every invite.

## Suggested Agent

- Suggested model: `GPT-5.6 Terra` (`gpt-5.6-terra`)
- Reasoning level: `xhigh`

## Acceptance

- [x] Theme registry supports backdrop type, texture/noise policy, ornament set, divider style, frame style, and image treatment.
- [x] Ornaments can be enabled/disabled per theme and do not interfere with content readability.
- [x] Backdrops support image, gradient, texture, solid, and editorial whitespace strategies.
- [x] Effects degrade safely on mobile and reduced-motion contexts.
- [x] Themes can express event-specific mood without relying on emojis or protected brand artwork.
- [x] Visual QA checks contrast, cropping, loading, and layout shift for image-heavy sections.

## UI Quality Checklist

- [x] Uses the selected dashboard or invite component strategy before custom UI.
- [x] Follows Lumiere color, shape, typography, motion, and theme locks from `SKILL.md`.
- [x] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [x] Works on required mobile, tablet, and desktop viewport widths.
- [x] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [x] Avoids generic AI-slop patterns listed in `SKILL.md`.


## Notes

This supports premium atmosphere for invite pages while keeping dashboard management surfaces clean and functional.

## Progress Log

- 2026-07-09T00:00:00+08:00: Task created from dashboard and invite UX review concerns.
- 2026-07-10T00:00:00+08:00: Updated suggestion to GPT-5.6 Terra with xhigh reasoning; this bounded design-system task benefits from the balanced model.
- 2026-07-10T15:32:55+08:00: Promoted as the lowest-order unblocked backlog task because no todo tasks were available; began the typed theme-effects registry and invite visual-layer implementation.
- 2026-07-10T15:44:55+08:00: Completed typed theme-owned backdrop, texture, ornament, divider, frame, and image-treatment profiles across all eight themes; added a pointer-transparent two-plane invite effects renderer with cover-image fallback, responsive/reduced-motion CSS, formal specs, and visual QA guidance. Nine package typechecks, all 205 tests, focused formatting, diff checks, and the invite production build pass.
