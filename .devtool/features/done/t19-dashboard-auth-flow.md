---
id: "t19-dashboard-auth-flow"
status: "done"
priority: "high"
assignee: null
epic: "frontend"
dueDate: null
created: "2026-07-07T00:00:00+08:00"
modified: "2026-07-08T20:56:38+08:00"
completedAt: "2026-07-08T20:56:38+08:00"
labels: ["frontend", "auth", "dashboard"]
depends_on: ["t09-auth-and-event-access", "t18-dashboard-app-scaffold"]
order: "a19"
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

- [x] Dashboard can sign in and sign out using Supabase Auth.
- [x] Protected routes redirect unauthenticated users to login.
- [x] Authenticated API requests include the Supabase access token.
- [x] Auth errors display friendly messages.
- [x] Session loading state is represented.
- [x] Tests or smoke checks cover signed-out and signed-in states.

## UI Quality Checklist

- [x] Uses Tailwind tokens and project-owned primitives before adding a component library.
- [x] Follows color, shape, and theme locks from `SKILL.md`.
- [x] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [x] Works on required mobile and desktop viewport widths.
- [x] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [x] Avoids generic AI-slop patterns listed in `SKILL.md`.

## Notes

Default to the simplest Supabase auth method unless product scope specifies OAuth providers.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
- 2026-07-08T20:43:24+08:00: Started browser Supabase email/password auth, protected dashboard routes, sign-out, and API access-token forwarding.
- 2026-07-08T20:56:38+08:00: Completed Supabase browser auth provider, login form, sign-out controls, protected-route redirect state, authorized API fetch helper, signed-in/signed-out tests, typecheck, formatting, whitespace check, and UI pre-flight review. Production build still needs a non-sandbox run because Turbopack port binding was blocked and escalation was unavailable due the environment usage limit.
