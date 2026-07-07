---
id: 't04-design-read-skill-and-globals'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'design-system'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-07T00:00:00+08:00'
completedAt: null
labels: ['design-system', 'tailwind', 'tasteskill']
depends_on: ['t01-project-scaffold']
order: 'a04'
---

# t04-design-read-skill-and-globals - Design read, UI skill, and global styles

## Hierarchy

- Epic: `design-system`
- Dependencies: `t01-project-scaffold`

## Scope

Implement the project-specific UI/UX foundation: `SKILL.md`, Tailwind setup, semantic tokens, simple `globals.css`, and design read documentation in the apps.

## Suggested Agent

- Suggested model: `GPT-5.5`
- Reasoning level: `high`

## Acceptance

- [ ] Both Next.js apps have Tailwind configured.
- [ ] Global CSS stays simple and token-based.
- [ ] No component library is added by default.
- [ ] Public invite and dashboard token needs are represented.
- [ ] `SKILL.md` is referenced in app or docs guidance.
- [ ] A sample page in each app demonstrates tokens and responsive layout.

## UI Quality Checklist

- [ ] Uses Tailwind tokens and project-owned primitives before adding a component library.
- [ ] Follows color, shape, and theme locks from `SKILL.md`.
- [ ] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [ ] Works on required mobile and desktop viewport widths.
- [ ] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [ ] Avoids generic AI-slop patterns listed in `SKILL.md`.

## Notes

Tailwind is the styling foundation, not a full design system. Add component libraries only in later tasks if justified.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
