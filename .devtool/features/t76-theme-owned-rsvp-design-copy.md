---
id: 't76-theme-owned-rsvp-design-copy'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-13T09:00:00+08:00'
modified: '2026-07-13T09:00:00+08:00'
completedAt: null
labels: ['invite', 'rsvp', 'themes', 'copy', 'architecture']
depends_on: ['t29-invite-rsvp-form-flow', 't64-invite-theme-module-directory-refactor']
order: 'a76'
---

# t76-theme-owned-rsvp-design-copy - Move RSVP design copy into packages/themes

## Hierarchy

- Epic: `frontend`
- Dependencies: `t29-invite-rsvp-form-flow`, `t64-invite-theme-module-directory-refactor`

## Scope

Remove `getRsvpDesignCopy()` and any equivalent theme-copy mapping from `apps/invite/components/rsvp-form.tsx`. Define a typed RSVP copy contract in `packages/themes`, provide a shared default, and let individual theme modules override only the copy they need.

## Suggested Agent

- Suggested model: `GPT-5.6 Terra (gpt-5.6-terra)`
- Reasoning level: `high`

## Acceptance

- [ ] `packages/themes` exports a typed RSVP copy contract covering headings, descriptions, attendance labels, guest-name/message labels, button text, success text, and other theme-owned microcopy.
- [ ] A common/default RSVP copy implementation serves themes that do not define overrides.
- [ ] Each theme may override partial copy without duplicating the entire default object.
- [ ] `apps/invite/components/rsvp-form.tsx` receives resolved copy through the theme contract and contains no concrete theme names or IDs.
- [ ] Manager-configurable event copy, if supported, has a documented precedence over theme defaults without bypassing validation.
- [ ] Missing or incomplete theme copy fails safely to the common default.
- [ ] Tests cover default copy, partial overrides, manager overrides if supported, missing values, and multiple themes.

## UI Quality Checklist

- [ ] Dashboard controls use `@lumiere/dashboard-ui` shadcn/Base UI primitives where applicable.
- [ ] Invite and theme visuals remain fully custom and contain no shadcn/Base UI imports.
- [ ] Loading, empty, error, success, disabled, focus, hover, and active states are handled where relevant.
- [ ] Mobile, tablet, and desktop behavior is explicitly verified.
- [ ] Keyboard, screen-reader, contrast, focus-management, and reduced-motion basics are covered.
- [ ] The result follows `SKILL.md` and avoids generic AI-dashboard or invitation-template patterns.

## Notes

Keep functional validation/error messages separate when they are shared product behavior. Only theme/design voice and presentation copy should move into theme modules.

## Progress Log

- 2026-07-13T09:00:00+08:00: Task created from dashboard and invite follow-up review.
