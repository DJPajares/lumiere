---
id: 't17-invite-app-scaffold'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-07T00:00:00+08:00'
completedAt: null
labels: ['frontend', 'invite', 'pwa']
depends_on: ['t04-design-read-skill-and-globals', 't16-api-client-package']
order: 'a17'
---

# t17-invite-app-scaffold - Invite app scaffold and PWA baseline

## Hierarchy

- Epic: `frontend`
- Dependencies: `t04-design-read-skill-and-globals`, `t16-api-client-package`

## Scope

Create the Next.js invite app shell with PWA metadata, public routes, theme provider foundation, and placeholder pages.

## Suggested Agent

- Suggested model: `GPT-5.4-mini`
- Reasoning level: `medium`

## Acceptance

- [ ] Invite app starts with `pnpm dev:invite`.
- [ ] Routes exist for `/e/[eventSlug]` and `/e/[eventSlug]/g/[guestToken]`.
- [ ] PWA manifest and app metadata exist.
- [ ] Theme provider reads selected theme and mode variables.
- [ ] Placeholder pages clearly differentiate generic public and personalized guest contexts.
- [ ] Basic component or route tests cover rendering.

## UI Quality Checklist

- [ ] Uses Tailwind tokens and project-owned primitives before adding a component library.
- [ ] Follows color, shape, and theme locks from `SKILL.md`.
- [ ] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [ ] Works on required mobile and desktop viewport widths.
- [ ] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [ ] Avoids generic AI-slop patterns listed in `SKILL.md`.

## Notes

Main invite app is mobile-first and should not require manager auth.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
