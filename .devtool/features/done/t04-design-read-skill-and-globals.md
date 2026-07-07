---
id: "t04-design-read-skill-and-globals"
status: "done"
priority: "high"
assignee: null
epic: "design-system"
dueDate: null
created: "2026-07-07T00:00:00+08:00"
modified: "2026-07-08T00:08:49+08:00"
completedAt: "2026-07-08T00:08:49+08:00"
labels: ["design-system", "tailwind", "tasteskill"]
depends_on: ["t01-project-scaffold"]
order: "a04"
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

- [x] Both Next.js apps have Tailwind configured.
- [x] Global CSS stays simple and token-based.
- [x] No component library is added by default.
- [x] Public invite and dashboard token needs are represented.
- [x] `SKILL.md` is referenced in app or docs guidance.
- [x] A sample page in each app demonstrates tokens and responsive layout.

## UI Quality Checklist

- [x] Uses Tailwind tokens and project-owned primitives before adding a component library.
- [x] Follows color, shape, and theme locks from `SKILL.md`.
- [x] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [x] Works on required mobile and desktop viewport widths.
- [x] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [x] Avoids generic AI-slop patterns listed in `SKILL.md`.

## Notes

Tailwind is the styling foundation, not a full design system. Add component libraries only in later tasks if justified.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
- 2026-07-08T00:01:31+08:00: Started Tailwind and token-based UI foundation for the invite and dashboard apps using the project SKILL.md guidance.
- 2026-07-08T00:08:49+08:00: Completed UI foundation. Added minimal Next app shells, Tailwind/PostCSS setup, token-based globals, responsive sample pages, app-level design notes, and verified build/typecheck/test/lint/format.
