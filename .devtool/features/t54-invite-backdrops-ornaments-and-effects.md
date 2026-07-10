---
id: 't54-invite-backdrops-ornaments-and-effects'
status: 'backlog'
priority: 'medium'
assignee: null
epic: 'design-system'
dueDate: null
created: '2026-07-09T00:00:00+08:00'
modified: '2026-07-10T00:00:00+08:00'
completedAt: null
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

- [ ] Theme registry supports backdrop type, texture/noise policy, ornament set, divider style, frame style, and image treatment.
- [ ] Ornaments can be enabled/disabled per theme and do not interfere with content readability.
- [ ] Backdrops support image, gradient, texture, solid, and editorial whitespace strategies.
- [ ] Effects degrade safely on mobile and reduced-motion contexts.
- [ ] Themes can express event-specific mood without relying on emojis or protected brand artwork.
- [ ] Visual QA checks contrast, cropping, loading, and layout shift for image-heavy sections.

## UI Quality Checklist

- [ ] Uses the selected dashboard or invite component strategy before custom UI.
- [ ] Follows Lumiere color, shape, typography, motion, and theme locks from `SKILL.md`.
- [ ] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [ ] Works on required mobile, tablet, and desktop viewport widths.
- [ ] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [ ] Avoids generic AI-slop patterns listed in `SKILL.md`.


## Notes

This supports premium atmosphere for invite pages while keeping dashboard management surfaces clean and functional.

## Progress Log

- 2026-07-09T00:00:00+08:00: Task created from dashboard and invite UX review concerns.
- 2026-07-10T00:00:00+08:00: Updated suggestion to GPT-5.6 Terra with xhigh reasoning; this bounded design-system task benefits from the balanced model.
