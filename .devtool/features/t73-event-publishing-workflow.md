---
id: 't73-event-publishing-workflow'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'full-stack'
dueDate: null
created: '2026-07-13T09:00:00+08:00'
modified: '2026-07-13T09:00:00+08:00'
completedAt: null
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

- [ ] Event overview shows a prominent draft/published state and one consistent primary publish action.
- [ ] A publish-readiness service returns structured blockers and warnings for required event details, sections, theme compatibility, RSVP settings, slug, and dates.
- [ ] Managers can click a blocker to open or navigate directly to the relevant editor.
- [ ] Publishing presents a concise confirmation with public URL, RSVP availability, theme/mode, and any non-blocking warnings.
- [ ] Successful publishing shows a clear success state with copy-link, open-invite, and share actions.
- [ ] Subsequent edits distinguish saved draft changes from the currently published version if the architecture supports staged publishing; otherwise the immediate-update behavior is explicit.
- [ ] Unpublish and republish behavior is defined and protected by appropriate confirmation.
- [ ] Tests cover ready/not-ready events, blocker navigation, concurrent changes, publish failure, successful publish, and unpublish behavior.

## UI Quality Checklist

- [ ] Dashboard controls use `@lumiere/dashboard-ui` shadcn/Base UI primitives where applicable.
- [ ] Invite and theme visuals remain fully custom and contain no shadcn/Base UI imports.
- [ ] Loading, empty, error, success, disabled, focus, hover, and active states are handled where relevant.
- [ ] Mobile, tablet, and desktop behavior is explicitly verified.
- [ ] Keyboard, screen-reader, contrast, focus-management, and reduced-motion basics are covered.
- [ ] The result follows `SKILL.md` and avoids generic AI-dashboard or invitation-template patterns.

## Notes

Prefer a guided readiness panel or focused dialog over a long blank form page. The action should be easy, but the validation rules must remain server-authoritative.

## Progress Log

- 2026-07-13T09:00:00+08:00: Task created from dashboard and invite follow-up review.
