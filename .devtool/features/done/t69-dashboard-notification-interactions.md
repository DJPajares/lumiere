---
id: 't69-dashboard-notification-interactions'
status: 'done'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-13T09:00:00+08:00'
modified: '2026-07-13T11:21:12+08:00'
completedAt: '2026-07-13T11:19:00+08:00'
labels: ['dashboard', 'notifications', 'navigation', 'shadcn', 'api']
depends_on: ['t15-summary-activity-notification-api', 't60-dashboard-user-menu-and-notifications']
order: 'a69'
---

# t69-dashboard-notification-interactions - Make dashboard notifications actionable and dismissible

## Hierarchy

- Epic: `frontend`
- Dependencies: `t15-summary-activity-notification-api`, `t60-dashboard-user-menu-and-notifications`

## Scope

Turn the dashboard notification menu into a complete interaction flow. Notifications should navigate managers to the relevant event, guest group, RSVP response, or activity detail and support persistent dismiss/read behavior.

## Suggested Agent

- Suggested model: `GPT-5.6 Terra (gpt-5.6-terra)`
- Reasoning level: `high`

## Acceptance

- [x] Each notification type defines a safe destination route and optional entity context rather than embedding arbitrary URLs.
- [x] Clicking a notification marks it read and navigates to the relevant dashboard destination.
- [x] Each notification has a keyboard-accessible dismiss action that removes it from the visible list and persists the state.
- [x] The API supports mark-read, dismiss, and optional bulk mark-all-read operations with manager ownership checks.
- [x] The bell unread count updates immediately after click, dismiss, or mark-all-read actions.
- [x] Failed actions restore or reconcile optimistic UI state and show an actionable error.
- [x] Tests cover click navigation, unread counts, dismissal persistence, empty state, unauthorized access, and failed mutation recovery.

## UI Quality Checklist

- [ ] Dashboard controls use `@lumiere/dashboard-ui` shadcn/Base UI primitives where applicable.
- [ ] Invite and theme visuals remain fully custom and contain no shadcn/Base UI imports.
- [ ] Loading, empty, error, success, disabled, focus, hover, and active states are handled where relevant.
- [ ] Mobile, tablet, and desktop behavior is explicitly verified.
- [ ] Keyboard, screen-reader, contrast, focus-management, and reduced-motion basics are covered.
- [ ] The result follows `SKILL.md` and avoids generic AI-dashboard or invitation-template patterns.

## Notes

Use dashboard-only shadcn/Base UI dropdown, menu, button, badge, and scroll-area primitives. Dismissal should not delete the underlying event activity record unless the existing notification model intentionally treats them as the same entity.

## Progress Log

- 2026-07-13T09:00:00+08:00: Task created from dashboard and invite follow-up review.
- 2026-07-13T11:19:00+08:00: Added fixed notification destination mapping for RSVP, invite-opened, and system events with encoded entity context.
- 2026-07-13T11:19:00+08:00: Added manager-owned API mutations for read, dismiss, and mark-all-read; dismissal removes only the notification row and preserves activity history.
- 2026-07-13T11:19:00+08:00: Added optimistic dashboard interactions, accessible dismiss controls, unread badges, retryable mutation errors, and the shared Base UI ScrollArea wrapper.
- 2026-07-13T11:19:00+08:00: Verified workspace typecheck, API tests (87), dashboard tests (86), API client tests (6), and dashboard/API production builds.
- 2026-07-13T11:21:12+08:00: Final verification passed formatting, dashboard-boundary, raw-image guard, API tests (87), dashboard tests (86), workspace typecheck, and production builds.
