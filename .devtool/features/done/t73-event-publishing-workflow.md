---
id: 't73-event-publishing-workflow'
status: 'done'
priority: 'high'
assignee: null
epic: 'full-stack'
dueDate: null
created: '2026-07-13T09:00:00+08:00'
modified: '2026-07-13T16:41:00+08:00'
completedAt: '2026-07-13T16:34:00+08:00'
labels: ['publishing', 'dashboard', 'events', 'validation', 'preview', 'api']
depends_on: ['t21-dashboard-event-overview', 't39-section-builder-live-preview-ux', 't50-event-theme-content-settings-model', 't63-compatible-theme-gallery-live-preview']
order: 'a73'
---

# t73-event-publishing-workflow - Simplify event publishing with a readiness workflow

## Hierarchy

- Epic: `full-stack`
- Dependencies: `t21-dashboard-event-overview`, `t39-section-builder-live-preview-ux`, `t50-event-theme-content-settings-model`, `t63-compatible-theme-gallery-live-preview`

## Scope

Rework publishing into a clear manager workflow that explains readiness, identifies blockers, supports preview, and makes the publish action easy to find without allowing incomplete or unsafe events to go live.

## Suggested Agent

- Suggested model: `GPT-5.6 Sol (gpt-5.6-sol)`
- Reasoning level: `xhigh`

## Acceptance

- [x] Event overview shows a prominent draft/published state and one consistent primary publish action.
- [x] A publish-readiness service returns structured blockers and warnings for required event details, sections, theme compatibility, RSVP settings, slug, and dates.
- [x] Managers can click a blocker to open or navigate directly to the relevant editor.
- [x] Publishing presents a concise confirmation with public URL, RSVP availability, theme/mode, and any non-blocking warnings.
- [x] Successful publishing shows a clear success state with copy-link, open-invite, and share actions.
- [x] Subsequent edits distinguish saved draft changes from the currently published version if the architecture supports staged publishing; otherwise the immediate-update behavior is explicit.
- [x] Unpublish and republish behavior is defined and protected by appropriate confirmation.
- [x] Tests cover ready/not-ready events, blocker navigation, concurrent changes, publish failure, successful publish, and unpublish behavior.

## UI Quality Checklist

- [x] Dashboard controls use `@lumiere/dashboard-ui` shadcn/Base UI primitives where applicable.
- [x] Invite and theme visuals remain fully custom and contain no shadcn/Base UI imports.
- [x] Loading, empty, error, success, disabled, focus, hover, and active states are handled where relevant.
- [x] Mobile, tablet, and desktop behavior is explicitly verified.
- [x] Keyboard, screen-reader, contrast, focus-management, and reduced-motion basics are covered.
- [x] The result follows `SKILL.md` and avoids generic AI-dashboard or invitation-template patterns.

## Notes

Prefer a guided readiness panel or focused dialog over a long blank form page. The action should be easy, but the validation rules must remain server-authoritative.

Publishing uses the current immediate-update architecture: while an event is published, saved event details, theme changes, sections, and RSVP settings affect the live invite. Managers are told to unpublish before making revisions that should remain private. Unpublishing changes the event to draft and stops public and guest routes immediately while retaining the publication record for a later readiness-checked republish. Publish and unpublish mutations carry the readiness event version; event, theme, and section writes advance that version so stale confirmation attempts return a conflict.

## Progress Log

- 2026-07-13T09:00:00+08:00: Task created from dashboard and invite follow-up review.
- 2026-07-13T16:12:00+08:00: Started T73 after confirming all dependencies were complete; prioritizing a server-authoritative readiness contract, explicit immediate-update publishing behavior, and a guided dashboard confirmation flow.
- 2026-07-13T16:34:00+08:00: Completed structured readiness diagnostics and destinations, version-checked publish/unpublish mutations, live-state guidance, preview and blocker navigation, publish confirmation, success/share actions, and protected unpublish/republish behavior.
- 2026-07-13T16:34:00+08:00: Verified full workspace typecheck and tests, API and dashboard production builds, lint placeholders, targeted Prettier, dashboard UI boundary, Next Image policy, and diff checks. Dashboard build required the permitted unsandboxed rerun because Turbopack binds an internal build port.
- 2026-07-13T16:41:00+08:00: Fixed false publish/unpublish conflicts caused by PostgreSQL microsecond timestamps being compared exactly against API event versions serialized to milliseconds; the atomic stale-write guard now compares both values at API precision while preserving real conflict detection.
