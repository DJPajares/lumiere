---
id: 't78-theme-aware-rsvp-renderer-contract'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-13T09:00:00+08:00'
modified: '2026-07-13T09:00:00+08:00'
completedAt: null
labels: ['invite', 'rsvp', 'themes', 'renderers', 'forms']
depends_on: ['t70-rsvp-response-field-settings', 't76-theme-owned-rsvp-design-copy', 't77-invite-theme-condition-boundary-refactor']
order: 'a78'
---

# t78-theme-aware-rsvp-renderer-contract - Support common and theme-specific RSVP renderers

## Hierarchy

- Epic: `frontend`
- Dependencies: `t70-rsvp-response-field-settings`, `t76-theme-owned-rsvp-design-copy`, `t77-invite-theme-condition-boundary-refactor`

## Scope

Create a theme-owned RSVP rendering contract that uses a robust common form by default while allowing a theme to supply a genuinely different RSVP composition when its design requires it. Preserve one shared data, validation, submission, accessibility, and recovery behavior layer.

## Suggested Agent

- Suggested model: `GPT-5.6 Sol (gpt-5.6-sol)`
- Reasoning level: `xhigh`

## Acceptance

- [ ] The RSVP feature separates shared form state/submission behavior from theme-owned visual composition.
- [ ] Themes without a custom RSVP renderer use the common accessible RSVP design automatically.
- [ ] A theme can provide a custom renderer or presentation slots without reimplementing API calls, validation, disabled states, or submission recovery.
- [ ] Theme renderers receive resolved copy, enabled fields, event/guest context, form state, errors, and safe action callbacks through a typed contract.
- [ ] Custom RSVP designs remain compatible with guest-name/message enablement, max pax, attendance choices, loading, errors, and success states.
- [ ] The invite app selects the resolved renderer through theme metadata/contracts with no concrete theme conditions.
- [ ] At least one premium theme demonstrates a meaningfully customized RSVP composition and another uses the common fallback.
- [ ] Accessibility and integration tests run against both common and custom RSVP renderers.

## UI Quality Checklist

- [ ] Dashboard controls use `@lumiere/dashboard-ui` shadcn/Base UI primitives where applicable.
- [ ] Invite and theme visuals remain fully custom and contain no shadcn/Base UI imports.
- [ ] Loading, empty, error, success, disabled, focus, hover, and active states are handled where relevant.
- [ ] Mobile, tablet, and desktop behavior is explicitly verified.
- [ ] Keyboard, screen-reader, contrast, focus-management, and reduced-motion basics are covered.
- [ ] The result follows `SKILL.md` and avoids generic AI-dashboard or invitation-template patterns.

## Notes

Do not duplicate business logic inside theme modules. Themes own visual composition and theme voice; shared hooks/services own RSVP behavior.

## Progress Log

- 2026-07-13T09:00:00+08:00: Task created from dashboard and invite follow-up review.
