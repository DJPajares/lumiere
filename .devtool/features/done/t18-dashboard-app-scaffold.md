---
id: "t18-dashboard-app-scaffold"
status: "done"
priority: "high"
assignee: null
epic: "frontend"
dueDate: null
created: "2026-07-07T00:00:00+08:00"
modified: "2026-07-08T20:39:01+08:00"
completedAt: "2026-07-08T20:39:01+08:00"
labels: ["frontend", "dashboard", "shell"]
depends_on: ["t04-design-read-skill-and-globals", "t16-api-client-package"]
order: "a18"
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

- [x] Dashboard app starts with `pnpm dev:dashboard`.
- [x] Routes exist for login, event list, event detail, content, theme, guests, responses, activity, and settings.
- [x] Responsive dashboard shell supports desktop navigation and mobile collapse.
- [x] Placeholder states exist for authenticated and unauthenticated views.
- [x] No component library is added by default.
- [x] Basic rendering tests cover the shell.

## UI Quality Checklist

- [x] Uses Tailwind tokens and project-owned primitives before adding a component library.
- [x] Follows color, shape, and theme locks from `SKILL.md`.
- [x] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [x] Works on required mobile and desktop viewport widths.
- [x] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [x] Avoids generic AI-slop patterns listed in `SKILL.md`.

## Notes

Use project-owned primitives and Tailwind tokens first.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
- 2026-07-08T20:36:00+08:00: Started dashboard app shell, placeholder management routes, responsive navigation, and rendering tests.
- 2026-07-08T20:39:01+08:00: Completed dashboard shell with responsive desktop/mobile navigation, login and auth placeholders, management route placeholders, rendering tests, dev-server smoke checks, production build, and UI pre-flight review.
