---
id: 't71-event-deletion-lifecycle'
status: 'done'
priority: 'high'
assignee: null
epic: 'full-stack'
dueDate: null
created: '2026-07-13T09:00:00+08:00'
modified: '2026-07-13T15:58:06+08:00'
completedAt: '2026-07-13T15:58:06+08:00'
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

- [x] A documented deletion policy chooses soft delete/trash as the default unless the product explicitly requires immediate permanent deletion.
- [x] Only managers with event ownership or the required role can delete or restore an event.
- [x] Dashboard event settings provide a destructive action with a clear confirmation dialog and event-name confirmation for high-risk deletion.
- [x] Deleted events disappear from normal manager lists and public/guest invite routes stop serving event content.
- [x] Guest tokens, publish state, RSVP submission, notifications, and scheduled work are invalidated or suspended consistently.
- [x] Related data retention, restoration window, and permanent purge behavior are documented and implemented or explicitly deferred.
- [x] Deletion creates an audit/activity record without leaking guest-sensitive data.
- [x] Tests cover ownership, active/published events, already-deleted events, public route behavior, restoration if supported, and referential integrity.

## UI Quality Checklist

- [x] Dashboard controls use `@lumiere/dashboard-ui` shadcn/Base UI primitives where applicable.
- [x] Invite and theme visuals remain fully custom and contain no shadcn/Base UI imports.
- [x] Loading, empty, error, success, disabled, focus, hover, and active states are handled where relevant.
- [x] Mobile, tablet, and desktop behavior is explicitly verified.
- [x] Keyboard, screen-reader, contrast, focus-management, and reduced-motion basics are covered.
- [x] The result follows `SKILL.md` and avoids generic AI-dashboard or invitation-template patterns.

## Notes

Use the dashboard responsive modal workflow from `t62`. Avoid a single-click delete action in event cards. If permanent deletion is included, require a separate irreversible step and verify database cascades explicitly.

## Deletion Policy

- Deletion is a soft-delete tombstone, not an archive label or immediate hard delete. Only an event owner can delete or restore it.
- Deletion records the manager, deletion time, and a purge-eligibility time 30 days later; the public status becomes `archived` immediately.
- Tombstoned events are excluded from normal manager access and lists. Public invite routes, guest links, RSVP writes, notification access, and any future scheduled work must treat the tombstone as unavailable even if another state is stale.
- Guest groups and tokens, RSVP responses, settings, publication snapshots, sections, activity, notifications, database media references, aliases, and manager relationships are retained unchanged during the restoration window. Slugs remain reserved.
- Restoration is owner-only and allowed before `purgeAfter`. It clears the tombstone and restores the event as `draft`; publication requires a fresh deliberate publish action.
- Deletion and restoration append manager activity records containing lifecycle state only. They do not copy guest names, contact details, invite tokens, or RSVP content into audit metadata.
- Permanent purge is explicitly deferred. A follow-up purge worker must delete eligible event rows transactionally, rely on the existing database cascades for related rows, remove external media objects separately, and record operational evidence without exposing guest-sensitive data.
- No scheduled-work table or delivery queue exists today. Tombstone-aware event access is the suspension boundary future schedulers must use.

## Progress Log

- 2026-07-13T09:00:00+08:00: Task created from dashboard and invite follow-up review.
- 2026-07-13T15:49:52+08:00: Started the recoverable event deletion lifecycle after confirming all dependencies were complete; using soft delete with an explicit restoration window and deferring irreversible purge unless existing infrastructure supports it safely.
- 2026-07-13T15:58:06+08:00: Completed 30-day tombstones, owner-only confirmed deletion and restoration, lifecycle audit events, public/guest/RSVP suspension, active/trash manager queries, responsive dashboard delete and restore workflows, and migration `0006_chunky_micromax.sql`.
- 2026-07-13T15:58:06+08:00: Verified full typecheck and test suites, API and dashboard builds, Drizzle migration consistency, dashboard UI boundary, lint placeholders, targeted formatting, and diff checks; restored the existing RSVP attendance focus ring required by the full-suite accessibility regression check.
