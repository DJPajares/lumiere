---
id: 't37-theme-template-design-specs'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'design-system'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-07T00:00:00+08:00'
completedAt: null
labels: ['themes', 'uiux', 'tokens', 'frontend']
depends_on: ['t06-theme-registry-package', 't30-initial-theme-implementations']
order: 'a37'
---

# t37-theme-template-design-specs - Theme template design specs

## Hierarchy

- Epic: `design-system`
- Dependencies: `t06-theme-registry-package`, `t30-initial-theme-implementations`

## Scope

Create formal design specs for the first Lumiere themes so theme implementation is guided by design intent, accessibility, and section behavior, not just color swaps.

## Suggested Agent

- Suggested model: `GPT-5.5`
- Reasoning level: `extra high`

## Acceptance

- [ ] Each initial theme has a design read, event-type fit, mood board notes, and anti-slop constraints.
- [ ] Each theme defines light/dark/system support, tokens, radius, typography, image treatment, and motion level.
- [ ] Each theme includes RSVP form styling guidance and success/closed/error state styling.
- [ ] Each theme includes dashboard preview thumbnail requirements and sample preview data.
- [ ] Theme specs avoid trademarked naming or direct imitation of protected brands.
- [ ] Theme specs are linked from `packages/themes` documentation or equivalent.

## UI Quality Checklist

- [ ] Uses Tailwind tokens and project-owned primitives before adding a component library.
- [ ] Follows Lumiere color, shape, brand, and theme locks from `SKILL.md`.
- [ ] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [ ] Works on required mobile and desktop viewport widths.
- [ ] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [ ] Avoids generic AI-slop patterns listed in `SKILL.md`.

## Notes

Examples can include Premium, Kids, Noel, Ocean/Adventure, and Neutral. Avoid using protected brand names as theme names unless licensing is resolved.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
