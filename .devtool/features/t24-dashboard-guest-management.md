---
id: 't24-dashboard-guest-management'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-07T00:00:00+08:00'
completedAt: null
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

- [ ] Guest groups list supports pending/opened/responded/disabled states.
- [ ] Create/edit form validates label and max pax.
- [ ] Invite link can be copied from a guest group row/detail.
- [ ] Regenerate link action confirms before invalidating the old link.
- [ ] Delete/disable behavior matches API policy.
- [ ] Tests cover create, validation, copy link state, and regenerate confirmation.

## UI Quality Checklist

- [ ] Uses Tailwind tokens and project-owned primitives before adding a component library.
- [ ] Follows color, shape, and theme locks from `SKILL.md`.
- [ ] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [ ] Works on required mobile and desktop viewport widths.
- [ ] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [ ] Avoids generic AI-slop patterns listed in `SKILL.md`.

## Notes

Guest links are sensitive. Avoid exposing raw token internals in UI beyond the shareable URL.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
