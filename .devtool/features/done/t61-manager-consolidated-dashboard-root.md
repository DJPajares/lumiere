---
id: 't61-manager-consolidated-dashboard-root'
status: 'done'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-10T18:00:00+08:00'
modified: '2026-07-11T00:35:00+08:00'
completedAt: '2026-07-11T00:35:00+08:00'
labels: ['dashboard', 'shadcn', 'base-ui', 'overview', 'analytics', 'empty-state']
depends_on: ['t15-summary-activity-notification-api', 't20-dashboard-events-list-create', 't59-responsive-dashboard-top-navigation', 't60-dashboard-user-menu-and-notifications']
order: 'a61'
---

# t61-manager-consolidated-dashboard-root - Rebuild the manager root using the shared shadcn dashboard system

## Hierarchy

- Epic: `frontend`
- Dependencies: `t15-summary-activity-notification-api`, `t20-dashboard-events-list-create`, `t59-responsive-dashboard-top-navigation`, `t60-dashboard-user-menu-and-notifications`

## Scope

Rebuild the dashboard root as a reliable consolidated manager overview rather than an empty event template. Use shared shadcn Base UI primitives for actions, filters, menus, dialogs, skeletons, and feedback while keeping Lumiere-specific overview compositions inside the dashboard app.

## Suggested Agent

- Suggested model: `GPT-5.6 Sol (gpt-5.6-sol)`
- Reasoning level: `xhigh`

## Acceptance

- [x] The root loads consolidated data directly and never depends on visiting the Events route before metrics populate.
- [x] The overview includes useful manager-level information such as event counts/status, upcoming milestones, RSVP movement, pending actions, and recent activity where data exists.
- [x] Loading uses shape-matched skeletons; no fake zero metrics appear before data resolves.
- [x] No blank event-creation form appears on the root. Provide a clear Create event action and event cards/list entry points instead.
- [x] First-time managers see an intentional onboarding empty state; managers with events see actionable summaries and recent events.
- [x] Use `@lumiere/dashboard-ui` primitives without making every metric a generic bordered card; information hierarchy and grouping must follow the dashboard design read.
- [x] Create/open event flows are keyboard accessible and preserve route state.
- [x] Tests cover loading, first-run empty state, multi-event data, partial API failure, and create/open event actions.

## UI Quality Checklist

- [x] Uses the project-owned shadcn/ui Base UI components before creating custom controls.
- [x] Follows Lumiere color, shape, typography, density, motion, and theme locks from `SKILL.md`.
- [x] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [x] Works on required mobile, tablet, and desktop viewport widths.
- [x] Meets keyboard, label, contrast, focus-management, and reduced-motion basics.
- [x] Avoids browser-default controls, duplicate navigation, and generic AI-dashboard patterns.

## Notes

The existing root-to-events flow is broken because data appears only after another route loads it. Root fetching and cache keys must be independent and deterministic.

## Progress Log

- 2026-07-10T18:00:00+08:00: Original task created.
- 2026-07-10T18:30:00+08:00: Updated to the current shadcn CLI v4 workflow with Base UI primitives and monorepo-aware component placement.
- 2026-07-10T19:15:00+08:00: Scoped shadcn/Base UI to the dashboard only and updated the suggested model to GPT-5.6 Terra with xhigh reasoning.
- 2026-07-11T00:35:00+08:00: Started the consolidated manager root after confirming t15, t20, t59, and t60 are complete; the root will own deterministic event, RSVP-summary, and activity loading with partial-failure recovery.
- 2026-07-11T00:35:00+08:00: Completed the direct-loading manager overview with aggregate status and RSVP metrics, upcoming milestones, pending actions, recent activity, filtered event entry points, onboarding, shape-matched skeletons, full and partial failure recovery, and independent request revision guards. Verified 83 dashboard tests, dashboard and shared UI typechecks, the dashboard UI package boundary, formatting, diff checks, and the production build.
