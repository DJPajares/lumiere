---
id: 't61-manager-consolidated-dashboard-root'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-10T18:00:00+08:00'
modified: '2026-07-10T19:15:00+08:00'
completedAt: null
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

- Suggested model: `GPT-5.6 Terra (gpt-5.6-terra)`
- Reasoning level: `xhigh`

## Acceptance

- [ ] The root loads consolidated data directly and never depends on visiting the Events route before metrics populate.
- [ ] The overview includes useful manager-level information such as event counts/status, upcoming milestones, RSVP movement, pending actions, and recent activity where data exists.
- [ ] Loading uses shape-matched skeletons; no fake zero metrics appear before data resolves.
- [ ] No blank event-creation form appears on the root. Provide a clear Create event action and event cards/list entry points instead.
- [ ] First-time managers see an intentional onboarding empty state; managers with events see actionable summaries and recent events.
- [ ] Use `@lumiere/dashboard-ui` primitives without making every metric a generic bordered card; information hierarchy and grouping must follow the dashboard design read.
- [ ] Create/open event flows are keyboard accessible and preserve route state.
- [ ] Tests cover loading, first-run empty state, multi-event data, partial API failure, and create/open event actions.

## UI Quality Checklist

- [ ] Uses the project-owned shadcn/ui Base UI components before creating custom controls.
- [ ] Follows Lumiere color, shape, typography, density, motion, and theme locks from `SKILL.md`.
- [ ] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [ ] Works on required mobile, tablet, and desktop viewport widths.
- [ ] Meets keyboard, label, contrast, focus-management, and reduced-motion basics.
- [ ] Avoids browser-default controls, duplicate navigation, and generic AI-dashboard patterns.

## Notes

The existing root-to-events flow is broken because data appears only after another route loads it. Root fetching and cache keys must be independent and deterministic.

## Progress Log

- 2026-07-10T18:00:00+08:00: Original task created.
- 2026-07-10T18:30:00+08:00: Updated to the current shadcn CLI v4 workflow with Base UI primitives and monorepo-aware component placement.
- 2026-07-10T19:15:00+08:00: Scoped shadcn/Base UI to the dashboard only and updated the suggested model to GPT-5.6 Terra with xhigh reasoning.
