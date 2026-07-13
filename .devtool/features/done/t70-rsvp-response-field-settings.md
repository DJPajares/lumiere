---
id: 't70-rsvp-response-field-settings'
status: 'done'
priority: 'high'
assignee: null
epic: 'full-stack'
dueDate: null
created: '2026-07-13T09:00:00+08:00'
modified: '2026-07-13T15:23:42+08:00'
completedAt: '2026-07-13T15:23:42+08:00'
labels: ['rsvp', 'dashboard', 'invite', 'api', 'database', 'settings']
depends_on: ['t14-rsvp-api', 't29-invite-rsvp-form-flow', 't47-schema-driven-content-field-forms', 't50-event-theme-content-settings-model', 't56-dashboard-shadcn-foundation']
order: 'a70'
---

# t70-rsvp-response-field-settings - Make RSVP guest names and message fields configurable per event

## Hierarchy

- Epic: `full-stack`
- Dependencies: `t14-rsvp-api`, `t29-invite-rsvp-form-flow`, `t47-schema-driven-content-field-forms`, `t50-event-theme-content-settings-model`, `t56-dashboard-shadcn-foundation`

## Scope

Add per-event RSVP response settings that allow managers to enable or disable guest-name collection and the optional guest message field. Carry the settings through database, API, dashboard forms, public invite data, invite rendering, and submission validation.

## Suggested Agent

- Suggested model: `GPT-5.6 Sol (gpt-5.6-sol)`
- Reasoning level: `xhigh`

## Acceptance

- [x] Event RSVP settings include explicit flags for collecting guest names and collecting a guest message, with documented defaults for existing events.
- [x] Dashboard managers can toggle both settings from the RSVP configuration workflow using dashboard-only shadcn controls.
- [x] Public invite payload exposes only the RSVP field configuration required by the guest form.
- [x] The invite RSVP form conditionally renders fields from shared settings and contains no event-theme-specific conditions.
- [x] Server validation accepts, requires, ignores, or rejects guest-name/message values consistently with the saved settings.
- [x] Disabling a field does not silently destroy previously submitted data; visibility and retention policy are documented.
- [x] Theme modules can style the enabled fields but cannot change the server-authoritative field availability.
- [x] Tests cover all toggle combinations, existing-event defaults, submission validation, dashboard save behavior, and invite rendering.

## UI Quality Checklist

- [x] Dashboard controls use `@lumiere/dashboard-ui` shadcn/Base UI primitives where applicable.
- [x] Invite and theme visuals remain fully custom and contain no shadcn/Base UI imports.
- [x] Loading, empty, error, success, disabled, focus, hover, and active states are handled where relevant.
- [x] Mobile, tablet, and desktop behavior is explicitly verified.
- [x] Keyboard, screen-reader, contrast, focus-management, and reduced-motion basics are covered.
- [x] The result follows `SKILL.md` and avoids generic AI-dashboard or invitation-template patterns.

## Notes

Separate response-field availability from theme presentation. Guest names remain one entry per attending guest, preserving the existing response model without a response-data migration.

Both fields default to enabled for new and existing events. When enabled, one guest name is required per attending guest and the message remains optional. When disabled, the public form omits the field and the server rejects injected values. Previously submitted names and messages remain stored and manager-visible; disabling collection affects future guest submissions only.

## Progress Log

- 2026-07-13T09:00:00+08:00: Task created from dashboard and invite follow-up review.
- 2026-07-13T09:30:00+08:00: Promoted as the lowest-order unblocked backlog item because no tasks were marked todo; implementation started.
- 2026-07-13T15:06:31+08:00: Added typed settings and database defaults/backfill, server-authoritative public and submission behavior, dashboard Base UI controls, conditional invite fields, retention safeguards, and coverage for all flag combinations.
- 2026-07-13T15:06:31+08:00: Completed with repository typecheck, lint, tests, dashboard UI-boundary, changed-file formatting, and UI pre-flight checks passing. The repository-wide format check remains blocked by unrelated pre-existing files documented in the handoff.
- 2026-07-13T15:20:00+08:00: Reopened after workflow review to move the response-field controls from event settings into the RSVP content editor and correct the stretched switch layout.
- 2026-07-13T15:23:42+08:00: Moved guest-name and guest-message controls beside dietary and song-request controls in RSVP content, integrated them with section dirty/cancel/save handling, and switched the shared field composition to horizontal so toggles retain their compact width.
- 2026-07-13T15:23:42+08:00: Correction completed with dashboard typecheck, all 86 dashboard tests, lint, changed-file formatting, and dashboard UI-boundary checks passing.
