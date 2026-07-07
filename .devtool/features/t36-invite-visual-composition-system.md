---
id: 't36-invite-visual-composition-system'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'design-system'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-07T00:00:00+08:00'
completedAt: null
labels: ['invite', 'themes', 'visual-design', 'tasteskill']
depends_on: ['t04-design-read-skill-and-globals', 't06-theme-registry-package', 't28-invite-section-renderers']
order: 'a36'
---

# t36-invite-visual-composition-system - Invitation visual composition system

## Hierarchy

- Epic: `design-system`
- Dependencies: `t04-design-read-skill-and-globals`, `t06-theme-registry-package`, `t28-invite-section-renderers`

## Scope

Define reusable composition rules for Lumiere invitation pages so each event theme has a premium section rhythm rather than repeated stacked blocks.

## Suggested Agent

- Suggested model: `GPT-5.5`
- Reasoning level: `extra high`

## Acceptance

- [ ] Composition rules cover hero, details, story, people/profile, gallery, location, RSVP, and outro sections.
- [ ] Rules define at least four layout families that can be mixed per theme without repeated-section slop.
- [ ] Each layout family documents mobile, tablet, and desktop behavior.
- [ ] Image, empty-image, and fallback asset strategies are documented for public invite sections.
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

This is a design-spec task. It should update theme docs/types and examples before implementation work expands.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
