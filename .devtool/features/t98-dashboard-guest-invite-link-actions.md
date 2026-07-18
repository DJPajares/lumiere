---
id: 't98-dashboard-guest-invite-link-actions'
status: 'backlog'
priority: 'medium'
assignee: null
epic: 'guest-management'
dueDate: null
created: '2026-07-18T00:00:00Z'
modified: '2026-07-18T00:00:00Z'
completedAt: null
labels: ['dashboard', 'guests', 'invite-link', 'actions']
depends_on: ['t96-dashboard-guest-filter-and-sort']
order: 'a98'
---

# t98-dashboard-guest-invite-link-actions - Dashboard guest invite link actions

## Hierarchy

- Epic: `guest-management`
- Dependencies: `t96-dashboard-guest-filter-and-sort`

## Scope

Add direct Open Link and Copy Link actions to guest-group rows/cards and detail workflows. Ensure managers can inspect the guest-facing invitation without exposing or logging sensitive token material unnecessarily.

## Suggested Agent

- Suggested model: `GPT-5.6 Luna (gpt-5.6-luna)`
- Reasoning level: `medium`

## Acceptance

- [ ] Every guest group with an active invite link exposes a clear Open Link action.
- [ ] Open Link launches the guest-specific invite in a new tab using safe link behavior.
- [ ] Copy Link provides accessible success and failure feedback.
- [ ] Revoked, expired, or unpublished links show an appropriate disabled state and explanation.
- [ ] Sensitive invite tokens are not included in analytics, error logs, or unnecessary UI text.
- [ ] Actions are available consistently in supported guest view modes and the guest detail modal.

## Notes

Consider a separate Preview as Manager action only if it can avoid recording a real guest response or activity event.

## Progress Log

- 2026-07-18T00:00:00Z: Task created.
