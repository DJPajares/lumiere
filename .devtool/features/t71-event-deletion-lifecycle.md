---
id: 't71-event-deletion-lifecycle'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'full-stack'
dueDate: null
created: '2026-07-13T09:00:00+08:00'
modified: '2026-07-13T09:00:00+08:00'
completedAt: null
labels: ['events', 'delete', 'dashboard', 'api', 'database', 'security']
depends_on: ['t10-event-management-api', 't43-dashboard-event-edit-flow', 't62-dashboard-responsive-modal-workflows']
order: 'a71'
---

# t71-event-deletion-lifecycle - Add a safe event deletion lifecycle

## Hierarchy

- Epic: `full-stack`
- Dependencies: `t10-event-management-api`, `t43-dashboard-event-edit-flow`, `t62-dashboard-responsive-modal-workflows`

## Scope

Allow authorized managers to delete events through a deliberate, recoverable workflow. Define how deletion affects public URLs, guest links, RSVP data, media, activities, notifications, and related records before implementing the dashboard action and API lifecycle.

## Suggested Agent

- Suggested model: `GPT-5.6 Sol (gpt-5.6-sol)`
- Reasoning level: `xhigh`

## Acceptance

- [ ] A documented deletion policy chooses soft delete/trash as the default unless the product explicitly requires immediate permanent deletion.
- [ ] Only managers with event ownership or the required role can delete or restore an event.
- [ ] Dashboard event settings provide a destructive action with a clear confirmation dialog and event-name confirmation for high-risk deletion.
- [ ] Deleted events disappear from normal manager lists and public/guest invite routes stop serving event content.
- [ ] Guest tokens, publish state, RSVP submission, notifications, and scheduled work are invalidated or suspended consistently.
- [ ] Related data retention, restoration window, and permanent purge behavior are documented and implemented or explicitly deferred.
- [ ] Deletion creates an audit/activity record without leaking guest-sensitive data.
- [ ] Tests cover ownership, active/published events, already-deleted events, public route behavior, restoration if supported, and referential integrity.

## UI Quality Checklist

- [ ] Dashboard controls use `@lumiere/dashboard-ui` shadcn/Base UI primitives where applicable.
- [ ] Invite and theme visuals remain fully custom and contain no shadcn/Base UI imports.
- [ ] Loading, empty, error, success, disabled, focus, hover, and active states are handled where relevant.
- [ ] Mobile, tablet, and desktop behavior is explicitly verified.
- [ ] Keyboard, screen-reader, contrast, focus-management, and reduced-motion basics are covered.
- [ ] The result follows `SKILL.md` and avoids generic AI-dashboard or invitation-template patterns.

## Notes

Use the dashboard responsive modal workflow from `t62`. Avoid a single-click delete action in event cards. If permanent deletion is included, require a separate irreversible step and verify database cascades explicitly.

## Progress Log

- 2026-07-13T09:00:00+08:00: Task created from dashboard and invite follow-up review.
