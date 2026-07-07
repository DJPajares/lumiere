---
id: 't18-dashboard-app-scaffold'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-07T00:00:00+08:00'
completedAt: null
labels: ['frontend', 'dashboard', 'shell']
depends_on: ['t04-design-read-skill-and-globals', 't16-api-client-package']
order: 'a18'
---

# t18-dashboard-app-scaffold - Dashboard app scaffold

## Hierarchy

- Epic: `frontend`
- Dependencies: `t04-design-read-skill-and-globals`, `t16-api-client-package`

## Scope

Create the Next.js dashboard app shell with authenticated layout placeholders, navigation, and responsive management structure.

## Suggested Agent

- Suggested model: `GPT-5.4-mini`
- Reasoning level: `medium`

## Acceptance

- [ ] Dashboard app starts with `pnpm dev:dashboard`.
- [ ] Routes exist for login, event list, event detail, content, theme, guests, responses, activity, and settings.
- [ ] Responsive dashboard shell supports desktop navigation and mobile collapse.
- [ ] Placeholder states exist for authenticated and unauthenticated views.
- [ ] No component library is added by default.
- [ ] Basic rendering tests cover the shell.

## UI Quality Checklist

- [ ] Uses Tailwind tokens and project-owned primitives before adding a component library.
- [ ] Follows color, shape, and theme locks from `SKILL.md`.
- [ ] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [ ] Works on required mobile and desktop viewport widths.
- [ ] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [ ] Avoids generic AI-slop patterns listed in `SKILL.md`.

## Notes

Use project-owned primitives and Tailwind tokens first.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
