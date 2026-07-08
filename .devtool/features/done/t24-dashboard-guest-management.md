---
id: 't24-dashboard-guest-management'
status: 'done'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-09T00:00:00+08:00'
completedAt: '2026-07-09T00:00:00+08:00'
labels: ['frontend', 'guests', 'dashboard']
depends_on: ['t12-guest-group-api', 't20-dashboard-events-list-create']
order: 'a24'
---

# t24-dashboard-guest-management - Dashboard guest group management

## Hierarchy

- Epic: `frontend`
- Dependencies: `t12-guest-group-api`, `t20-dashboard-events-list-create`

## Scope

Implement guest group list, create/edit flow, max pax fields, invite link copy, disable/delete, and regenerate link actions.

## Suggested Agent

- Suggested model: `GPT-5.5`
- Reasoning level: `high`

## Acceptance

- [x] Guest groups list supports pending/opened/responded/disabled states.
- [x] Create/edit form validates label and max pax.
- [x] Invite link can be copied from a guest group row/detail.
- [x] Regenerate link action confirms before invalidating the old link.
- [x] Delete/disable behavior matches API policy.
- [x] Tests cover create, validation, copy link state, and regenerate confirmation.

## UI Quality Checklist

- [x] Uses Tailwind tokens and project-owned primitives before adding a component library.
- [x] Follows color, shape, and theme locks from `SKILL.md`.
- [x] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [x] Works on required mobile and desktop viewport widths.
- [x] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [x] Avoids generic AI-slop patterns listed in `SKILL.md`.

## Notes

Guest links are sensitive. Avoid exposing raw token internals in UI beyond the shareable URL.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
- 2026-07-09T00:00:00+08:00: Started as the next unblocked dashboard task after section builder completion; promoted from backlog because no lower-order todo tasks were available and dependencies are complete.
- 2026-07-09T00:00:00+08:00: Completed guest management workspace with event-aware loading, status summary, create/edit validation, local copyable invite links from create/regenerate responses, confirmed regenerate and disable actions, and dashboard tests for statuses, validation, copy, regenerate, and disable behavior. Verified with dashboard tests, typecheck, lint placeholder, and targeted Prettier check.
