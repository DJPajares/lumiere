---
id: 't50-event-theme-content-settings-model'
status: 'done'
priority: 'high'
assignee: null
epic: 'backend'
dueDate: null
created: '2026-07-09T00:00:00+08:00'
modified: '2026-07-10T10:20:19+08:00'
completedAt: '2026-07-10T10:20:19+08:00'
labels: ['database', 'api', 'settings', 'sections']
depends_on: ['t07-drizzle-database-schema', 't11-theme-and-section-api', 't14-rsvp-api', 't45-event-type-section-blueprints']
order: 'a50'
---

# t50-event-theme-content-settings-model - Unified event settings model for theme, sections, content, and RSVP

## Hierarchy

- Epic: `backend`
- Dependencies: `t07-drizzle-database-schema`, `t11-theme-and-section-api`, `t14-rsvp-api`, `t45-event-type-section-blueprints`

## Scope

Refine the backend model so each event has a coherent settings model for theme selection, mode, section enablement, section content, RSVP visibility, and draft/published state.

## Suggested Agent

- Suggested model: `GPT-5.6 Sol` (`gpt-5.6-sol`)
- Reasoning level: `xhigh`

## Acceptance

- [x] Data model distinguishes event basics, event theme settings, event section settings, section content, guest group settings, and RSVP settings.
- [x] Per-event section enablement and visibility are persisted separately from theme definitions.
- [x] APIs return manager-editable forms data and invite-renderable public data from the same source of truth.
- [x] Draft versus published behavior is explicit for content and theme changes.
- [x] Validation prevents publishing when required event-type sections are missing required content.
- [x] Tests cover creating event defaults, changing event type, enabling/disabling sections, saving content, and publishing readiness.

## Notes

This supports manager-friendly forms while keeping public invite rendering safe and deterministic.

## Progress Log

- 2026-07-09T00:00:00+08:00: Task created from dashboard and invite UX review concerns.
- 2026-07-10T00:00:00+08:00: Updated suggestion to GPT-5.6 Sol with xhigh reasoning; this task requires the flagship model for cross-cutting data and API design.
- 2026-07-10T09:59:03+08:00: Promoted as the lowest-order unblocked backlog task because no todo tasks were available; began auditing the existing event, theme, section, RSVP, and public-invite data flow.
- 2026-07-10T10:20:19+08:00: Completed normalized theme, RSVP, section-setting, and section-content persistence; blueprint defaults and event-type reconciliation; atomic validated publication snapshots; public invite/RSVP snapshot reads; publish-readiness API/client contracts; data-preserving migration and seed updates; and focused coverage. All package/API tests (126), frontend tests (194), workspace typechecks, formatting, and whitespace checks pass.
