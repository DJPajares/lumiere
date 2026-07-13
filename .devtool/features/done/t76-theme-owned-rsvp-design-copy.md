---
id: 't76-theme-owned-rsvp-design-copy'
status: 'done'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-13T09:00:00+08:00'
modified: '2026-07-13T17:28:15+08:00'
completedAt: '2026-07-13T17:28:15+08:00'
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

- [x] `packages/themes` exports a typed RSVP copy contract covering headings, descriptions, attendance labels, guest-name/message labels, button text, success text, and other theme-owned microcopy.
- [x] A common/default RSVP copy implementation serves themes that do not define overrides.
- [x] Each theme may override partial copy without duplicating the entire default object.
- [x] `apps/invite/components/rsvp-form.tsx` receives resolved copy through the theme contract and contains no concrete theme names or IDs.
- [x] Manager-configurable event copy, if supported, has a documented precedence over theme defaults without bypassing validation.
- [x] Missing or incomplete theme copy fails safely to the common default.
- [x] Tests cover default copy, partial overrides, manager overrides if supported, missing values, and multiple themes.

## UI Quality Checklist

- [x] Dashboard controls use `@lumiere/dashboard-ui` shadcn/Base UI primitives where applicable.
- [x] Invite and theme visuals remain fully custom and contain no shadcn/Base UI imports.
- [x] Loading, empty, error, success, disabled, focus, hover, and active states are handled where relevant.
- [x] Mobile, tablet, and desktop behavior is explicitly verified.
- [x] Keyboard, screen-reader, contrast, focus-management, and reduced-motion basics are covered.
- [x] The result follows `SKILL.md` and avoids generic AI-dashboard or invitation-template patterns.

## Notes

Keep functional validation/error messages separate when they are shared product behavior. Only theme/design voice and presentation copy should move into theme modules.

## Progress Log

- 2026-07-13T09:00:00+08:00: Task created from dashboard and invite follow-up review.
- 2026-07-13T17:20:00+08:00: Started T76 after confirming dependencies; moving invitation voice into a typed theme copy contract with validated manager section copy taking precedence over partial theme overrides and a complete shared fallback.
- 2026-07-13T17:28:15+08:00: Completed the typed copy contract, shared resolver, partial theme overrides, and manager precedence. Kept shared validation/recovery messaging in the invite form, removed the schema-level submit-label override, and verified responsive/accessibility state markup remained unchanged. Themes, invite, API, and dashboard typechecks/builds passed; 230 existing tests passed.
