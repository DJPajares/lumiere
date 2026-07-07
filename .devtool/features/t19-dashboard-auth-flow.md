---
id: 't19-dashboard-auth-flow'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-07T00:00:00+08:00'
completedAt: null
labels: ['frontend', 'auth', 'dashboard']
depends_on: ['t09-auth-and-event-access', 't18-dashboard-app-scaffold']
order: 'a19'
---

# t19-dashboard-auth-flow - Dashboard Supabase auth flow

## Hierarchy

- Epic: `frontend`
- Dependencies: `t09-auth-and-event-access`, `t18-dashboard-app-scaffold`

## Scope

Implement dashboard sign-in, sign-out, session state, protected routes, and API client token forwarding.

## Suggested Agent

- Suggested model: `GPT-5.5`
- Reasoning level: `high`

## Acceptance

- [ ] Dashboard can sign in and sign out using Supabase Auth.
- [ ] Protected routes redirect unauthenticated users to login.
- [ ] Authenticated API requests include the Supabase access token.
- [ ] Auth errors display friendly messages.
- [ ] Session loading state is represented.
- [ ] Tests or smoke checks cover signed-out and signed-in states.

## UI Quality Checklist

- [ ] Uses Tailwind tokens and project-owned primitives before adding a component library.
- [ ] Follows color, shape, and theme locks from `SKILL.md`.
- [ ] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [ ] Works on required mobile and desktop viewport widths.
- [ ] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [ ] Avoids generic AI-slop patterns listed in `SKILL.md`.

## Notes

Default to the simplest Supabase auth method unless product scope specifies OAuth providers.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
