---
id: 't36-invite-visual-composition-system'
status: 'done'
priority: 'high'
assignee: null
epic: 'design-system'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-09T16:45:00+08:00'
completedAt: '2026-07-09T16:45:00+08:00'
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

- [x] Composition rules cover hero, details, story, people/profile, gallery, location, RSVP, and outro sections.
- [x] Rules define at least four layout families that can be mixed per theme without repeated-section slop.
- [x] Each layout family documents mobile, tablet, and desktop behavior.
- [x] Image, empty-image, and fallback asset strategies are documented for public invite sections.
- [x] Motion rules cover hero reveals, section entrances, scroll-depth/parallax treatments, sticky/pinned moments, and subtle gallery transitions.
- [x] Parallax and scroll effects use CSS, IntersectionObserver, or requestAnimationFrame patterns that avoid React state updates on every scroll frame.
- [x] Reduced-motion behavior is specified for every non-trivial animation, including disabling parallax and replacing reveals with static hierarchy.
- [x] Composition guidance explicitly avoids making the invite feel like a simple card-based website except for the neutral/basic theme.
- [x] Section rhythm prevents every theme from looking like the same page with different colors.
- [x] A sample wedding and birthday composition map demonstrates how the rules apply to different event types.

## UI Quality Checklist

- [x] Uses Tailwind tokens and project-owned primitives before adding a component library.
- [x] Follows Lumiere color, shape, brand, and theme locks from `SKILL.md`.
- [x] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [x] Works on required mobile and desktop viewport widths.
- [x] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [x] Avoids generic AI-slop patterns listed in `SKILL.md`.

## Notes

This is a design-spec task. It should update theme docs/types and examples before implementation work expands. Treat Reverie as inspiration for quality, motion, and immersion, not as a direct visual clone.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
- 2026-07-09T13:18:44+08:00: Expanded scope to include Reverie-inspired immersive composition, parallax, scroll motion, and reduced-motion guidance so premium themes do not collapse into stacked cards.
- 2026-07-09T16:26:00+08:00: Started visual composition system pass by reviewing `SKILL.md`, current theme composition metadata, invite renderer motion hooks, CSS parallax support, and the Reverie-inspired quality goals captured in this task.
- 2026-07-09T16:45:00+08:00: Added the shared composition system contract and documentation, mapped visual profiles onto each theme, exposed theme-driven motion/parallax hooks in invite markup, added CSS view-timeline parallax with reduced-motion safeguards, and covered the rules with theme and invite renderer tests.
