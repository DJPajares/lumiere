---
id: 't37-theme-template-design-specs'
status: 'done'
priority: 'high'
assignee: null
epic: 'design-system'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-09T17:25:00+08:00'
completedAt: '2026-07-09T17:25:00+08:00'
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

- [x] Each initial theme has a design read, event-type fit, mood board notes, and anti-slop constraints.
- [x] Each theme defines light/dark/system support, tokens, radius, typography, image treatment, and motion level.
- [x] Premium theme spec uses Reverie as a benchmark for an immersive modern invitation feel: full-viewport opening, layered image treatment, parallax depth, refined section transitions, and emotional pacing.
- [x] Each theme states whether sections should be full-bleed, framed, editorial, split-layout, cinematic, or card-based, with card-based treatment reserved for intentionally simple/basic themes.
- [x] Theme specs define ambient media guidance, including whether background music is supported, where controls appear, and how missing media degrades.
- [x] Each theme includes RSVP form styling guidance and success/closed/error state styling.
- [x] Each theme includes dashboard preview thumbnail requirements and sample preview data.
- [x] Theme specs avoid trademarked naming or direct imitation of protected brands.
- [x] Theme specs are linked from `packages/themes` documentation or equivalent.

## UI Quality Checklist

- [x] Uses Tailwind tokens and project-owned primitives before adding a component library.
- [x] Follows Lumiere color, shape, brand, and theme locks from `SKILL.md`.
- [x] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [x] Works on required mobile and desktop viewport widths.
- [x] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [x] Avoids generic AI-slop patterns listed in `SKILL.md`.

## Notes

Examples can include Premium, Kids, Noel, Ocean/Adventure, and Neutral. Avoid using protected brand names as theme names unless licensing is resolved.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
- 2026-07-09T13:18:44+08:00: Added premium immersive theme criteria, section treatment expectations, and ambient media guidance based on the Reverie reference.
- 2026-07-09T17:05:00+08:00: Started theme template spec pass after reading `SKILL.md`, the t36 composition system, current theme registry metadata, and the Reverie reference repository structure for theme-owned section variants, motion profiles, ambient audio, and RSVP state guidance.
- 2026-07-09T17:25:00+08:00: Added typed theme template specs for Default, Premium, Kids, and Noel; linked package documentation; captured Reverie as a Premium benchmark without direct imitation; and covered spec completeness, section treatments, and registry alignment with theme package tests.
