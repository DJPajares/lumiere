---
id: 't37-theme-template-design-specs'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'design-system'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-09T13:18:44+08:00'
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

Create formal design specs for the first Lumiere themes so theme implementation is guided by design intent, accessibility, section behavior, motion, media, and ambience, not just color swaps.

## Suggested Agent

- Suggested model: `GPT-5.5`
- Reasoning level: `extra high`

## Acceptance

- [ ] Each initial theme has a design read, event-type fit, mood board notes, and anti-slop constraints.
- [ ] Each theme defines light/dark/system support, tokens, radius, typography, image treatment, and motion level.
- [ ] Premium theme spec uses Reverie as a benchmark for an immersive modern invitation feel: full-viewport opening, layered image treatment, parallax depth, refined section transitions, and emotional pacing.
- [ ] Each theme states whether sections should be full-bleed, framed, editorial, split-layout, cinematic, or card-based, with card-based treatment reserved for intentionally simple/basic themes.
- [ ] Theme specs define ambient media guidance, including whether background music is supported, where controls appear, and how missing media degrades.
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
- 2026-07-09T13:18:44+08:00: Added premium immersive theme criteria, section treatment expectations, and ambient media guidance based on the Reverie reference.
