---
id: 't60-dashboard-user-menu-and-notifications'
status: 'done'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-10T18:00:00+08:00'
modified: '2026-07-11T00:20:00+08:00'
completedAt: '2026-07-11T00:20:00+08:00'
labels: ['dashboard', 'shadcn', 'base-ui', 'avatar', 'notifications', 'profile']
depends_on: ['t15-summary-activity-notification-api', 't19-dashboard-auth-flow', 't59-responsive-dashboard-top-navigation']
order: 'a60'
---

# t60-dashboard-user-menu-and-notifications - Add Base UI-backed account and notification controls

## Hierarchy

- Epic: `frontend`
- Dependencies: `t15-summary-activity-notification-api`, `t19-dashboard-auth-flow`, `t59-responsive-dashboard-top-navigation`

## Scope

Add a notification bell immediately left of the right-aligned avatar. Use the avatar as the account-menu trigger and use the selected shadcn Base UI wrappers for dropdown/popover behavior.

## Suggested Agent

- Suggested model: `GPT-5.6 Luna (gpt-5.6-luna)`
- Reasoning level: `medium`

## Acceptance

- [x] The top bar places the notification bell immediately left of the avatar on mobile, tablet, and desktop.
- [x] Avatar renders the manager image when available and a deterministic initials fallback otherwise.
- [x] Account dropdown includes concise identity details, Edit profile, Account/settings, and Sign out actions.
- [x] Notification control supports unread state/count and opens a useful list, loading state, error state, and empty state.
- [x] Use Base UI-backed Dropdown Menu or Popover components from `@lumiere/dashboard-ui`; no Radix-specific imports remain.
- [x] Profile and sign-out actions have clear loading, failure, success, and confirmation behavior where appropriate.
- [x] Menus are keyboard-accessible, collision-aware, and restore focus to their trigger when closed.
- [x] Tests cover avatar fallback, menu actions, unread state, notification states, and sign-out failure.

## UI Quality Checklist

- [x] Uses the project-owned shadcn/ui Base UI components before creating custom controls.
- [x] Follows Lumiere color, shape, typography, density, motion, and theme locks from `SKILL.md`.
- [x] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [x] Works on required mobile, tablet, and desktop viewport widths.
- [x] Meets keyboard, label, contrast, focus-management, and reduced-motion basics.
- [x] Avoids browser-default controls, duplicate navigation, and generic AI-dashboard patterns.

## Notes

Keep notifications lightweight in this task. Real-time delivery can remain a later backend concern; this task focuses on reliable manager UI and interaction states.

## Progress Log

- 2026-07-10T18:00:00+08:00: Original task created.
- 2026-07-10T18:30:00+08:00: Updated to the current shadcn CLI v4 workflow with Base UI primitives and monorepo-aware component placement.
- 2026-07-10T19:15:00+08:00: Scoped shadcn/Base UI to the dashboard only and updated the suggested model to GPT-5.6 Terra with xhigh reasoning.
- 2026-07-10T23:20:00+08:00: Started t60 integration after completing the t59 top navigation dependency; wired the event-scoped notification and account controls into the shared top bar and added live protected account/profile routes.
- 2026-07-11T00:20:00+08:00: Completed account and notification controls with avatar metadata/fallback, eager event notifications with loading/error/empty/unread states, profile save feedback, and sign-out loading/failure/success handling. Verified dashboard route, control, and profile tests, typecheck, and the shared UI package boundary.
