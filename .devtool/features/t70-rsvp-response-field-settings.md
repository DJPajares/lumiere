---
id: 't70-rsvp-response-field-settings'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'full-stack'
dueDate: null
created: '2026-07-13T09:00:00+08:00'
modified: '2026-07-13T09:00:00+08:00'
completedAt: null
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

- [ ] Event RSVP settings include explicit flags for collecting guest names and collecting a guest message, with documented defaults for existing events.
- [ ] Dashboard managers can toggle both settings from the RSVP configuration workflow using dashboard-only shadcn controls.
- [ ] Public invite payload exposes only the RSVP field configuration required by the guest form.
- [ ] The invite RSVP form conditionally renders fields from shared settings and contains no event-theme-specific conditions.
- [ ] Server validation accepts, requires, ignores, or rejects guest-name/message values consistently with the saved settings.
- [ ] Disabling a field does not silently destroy previously submitted data; visibility and retention policy are documented.
- [ ] Theme modules can style the enabled fields but cannot change the server-authoritative field availability.
- [ ] Tests cover all toggle combinations, existing-event defaults, submission validation, dashboard save behavior, and invite rendering.

## UI Quality Checklist

- [ ] Dashboard controls use `@lumiere/dashboard-ui` shadcn/Base UI primitives where applicable.
- [ ] Invite and theme visuals remain fully custom and contain no shadcn/Base UI imports.
- [ ] Loading, empty, error, success, disabled, focus, hover, and active states are handled where relevant.
- [ ] Mobile, tablet, and desktop behavior is explicitly verified.
- [ ] Keyboard, screen-reader, contrast, focus-management, and reduced-motion basics are covered.
- [ ] The result follows `SKILL.md` and avoids generic AI-dashboard or invitation-template patterns.

## Notes

Separate response-field availability from theme presentation. Consider whether guest names are one free-text field, one entry per attending guest, or both; preserve the existing response model unless a migration is required.

## Progress Log

- 2026-07-13T09:00:00+08:00: Task created from dashboard and invite follow-up review.
