---
id: 't98-dashboard-guest-invite-link-actions'
status: 'done'
priority: 'medium'
assignee: null
epic: 'guest-management'
dueDate: null
created: '2026-07-18T00:00:00Z'
modified: '2026-07-18T17:25:55+08:00'
completedAt: '2026-07-18T17:25:55+08:00'
labels: ['dashboard', 'guests', 'invite-link', 'actions']
depends_on: ['t89-guest-group-member-fields']
order: 'a98'
---

# t98-dashboard-guest-invite-link-actions - Dashboard guest invite link actions

## Hierarchy

- Epic: `guest-management`
- Dependencies: `t89-guest-group-member-fields`

## Scope

Add an Open Link action beside the guest card's existing read-only URL and Copy Link action. Keep the current regenerate/disable behavior and accessible copy feedback; this task should not create a second guest-detail workflow.

## Suggested Agent

- Suggested model: `GPT-5.6 Luna (gpt-5.6-luna)`
- Reasoning level: `medium`

## Acceptance

- [x] Every guest group with an active invite link exposes a clear Open Link action.
- [x] Open Link launches the guest-specific invite in a new tab using safe link behavior.
- [x] The existing Copy Link action retains accessible success and failure feedback.
- [x] Disabled groups and legacy groups without a recoverable full URL show the current unavailable/regenerate explanation instead of an Open action.
- [x] Sensitive invite tokens are not included in analytics, error logs, or unnecessary UI text.
- [x] If t97 is later implemented, both actions reuse the same handlers in its compact view.

## Notes

Opening the real guest link is an inspection action, not an impersonation or response-bypass mode. Do not add manager-preview semantics in this task.

## Progress Log

- 2026-07-18T00:00:00Z: Task created.
- 2026-07-18T13:12:11+08:00: Recognized the existing Copy Link flow and narrowed the task to adding a safe Open Link action without depending on filtering or a nonexistent detail modal.
- 2026-07-18T17:19:53+08:00: Started implementation after confirming both card and compact views share the existing guest link state and action paths.
- 2026-07-18T17:25:55+08:00: Added shared Open link actions for card and compact views with `noopener,noreferrer`, plus explicit unavailable messaging for legacy and disabled groups.
- 2026-07-18T17:25:55+08:00: Verified dashboard tests (98 passed), TypeScript, Prettier, and `git diff --check`.
