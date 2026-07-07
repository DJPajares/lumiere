---
id: 't06-theme-registry-package'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'design-system'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-07T00:00:00+08:00'
completedAt: null
labels: ['themes', 'registry', 'sections']
depends_on: ['t05-shared-types-and-schemas', 't04-design-read-skill-and-globals']
order: 'a06'
---

# t06-theme-registry-package - Theme registry package

## Hierarchy

- Epic: `design-system`
- Dependencies: `t05-shared-types-and-schemas`, `t04-design-read-skill-and-globals`

## Scope

Create `packages/themes` with theme metadata, section type definitions, allowed section schemas, and renderer contracts for the invite app.

## Suggested Agent

- Suggested model: `GPT-5.5`
- Reasoning level: `extra high`

## Acceptance

- [ ] Theme registry exports available theme IDs, labels, supported event types, modes, and section capabilities.
- [ ] Section registry defines supported section types and validation schemas.
- [ ] Initial theme metadata includes Premium, Kids, Noel, and one neutral default design.
- [ ] Registry does not execute database-provided code.
- [ ] Dashboard and invite app can both consume the registry.
- [ ] Tests verify that sample event sections validate against registry schemas.

## UI Quality Checklist

- [ ] Uses Tailwind tokens and project-owned primitives before adding a component library.
- [ ] Follows color, shape, and theme locks from `SKILL.md`.
- [ ] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [ ] Works on required mobile and desktop viewport widths.
- [ ] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [ ] Avoids generic AI-slop patterns listed in `SKILL.md`.

## Notes

Design templates live in code. Database stores selected IDs, settings, order, visibility, and content.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
