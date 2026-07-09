---
id: 't36-invite-visual-composition-system'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'design-system'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-09T13:18:44+08:00'
completedAt: null
labels: ['invite', 'themes', 'visual-design', 'tasteskill']
depends_on: ['t04-design-read-skill-and-globals', 't06-theme-registry-package', 't28-invite-section-renderers']
order: 'a36'
---

# t36-invite-visual-composition-system - Invitation visual composition and motion system

## Hierarchy

- Epic: `design-system`
- Dependencies: `t04-design-read-skill-and-globals`, `t06-theme-registry-package`, `t28-invite-section-renderers`

## Scope

Define reusable composition and motion rules for Lumiere invitation pages so each event theme has a premium, immersive section rhythm rather than repeated stacked cards. Use the earlier Reverie invite experience as a quality benchmark: full-bleed atmosphere, layered imagery, scroll depth, tasteful parallax, and a modern editorial feel.

## Suggested Agent

- Suggested model: `GPT-5.5`
- Reasoning level: `extra high`

## Acceptance

- [ ] Composition rules cover hero, details, story, people/profile, gallery, location, RSVP, and outro sections.
- [ ] Rules define at least four layout families that can be mixed per theme without repeated-section slop.
- [ ] Each layout family documents mobile, tablet, and desktop behavior.
- [ ] Image, empty-image, and fallback asset strategies are documented for public invite sections.
- [ ] Motion rules cover hero reveals, section entrances, scroll-depth/parallax treatments, sticky/pinned moments, and subtle gallery transitions.
- [ ] Parallax and scroll effects use CSS, IntersectionObserver, or requestAnimationFrame patterns that avoid React state updates on every scroll frame.
- [ ] Reduced-motion behavior is specified for every non-trivial animation, including disabling parallax and replacing reveals with static hierarchy.
- [ ] Composition guidance explicitly avoids making the invite feel like a simple card-based website except for the neutral/basic theme.
- [ ] Section rhythm prevents every theme from looking like the same page with different colors.
- [ ] A sample wedding and birthday composition map demonstrates how the rules apply to different event types.

## UI Quality Checklist

- [ ] Uses Tailwind tokens and project-owned primitives before adding a component library.
- [ ] Follows Lumiere color, shape, brand, and theme locks from `SKILL.md`.
- [ ] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [ ] Works on required mobile and desktop viewport widths.
- [ ] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [ ] Avoids generic AI-slop patterns listed in `SKILL.md`.

## Notes

This is a design-spec task. It should update theme docs/types and examples before implementation work expands. Treat Reverie as inspiration for quality, motion, and immersion, not as a direct visual clone.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
- 2026-07-09T13:18:44+08:00: Expanded scope to include Reverie-inspired immersive composition, parallax, scroll motion, and reduced-motion guidance so premium themes do not collapse into stacked cards.
