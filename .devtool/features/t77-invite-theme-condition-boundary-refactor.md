---
id: 't77-invite-theme-condition-boundary-refactor'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'architecture'
dueDate: null
created: '2026-07-13T09:00:00+08:00'
modified: '2026-07-13T09:00:00+08:00'
completedAt: null
labels: ['invite', 'themes', 'refactor', 'architecture', 'public-invite']
depends_on: ['t64-invite-theme-module-directory-refactor', 't76-theme-owned-rsvp-design-copy']
order: 'a77'
---

# t77-invite-theme-condition-boundary-refactor - Remove theme-specific conditions from invite application components

## Hierarchy

- Epic: `architecture`
- Dependencies: `t64-invite-theme-module-directory-refactor`, `t76-theme-owned-rsvp-design-copy`

## Scope

Audit `apps/invite`, especially `components/public-invite.tsx` and `components/rsvp-form.tsx`, and move every theme-specific branch, token, layout choice, copy map, section override, backdrop, ornament, and effect into `packages/themes`. Leave only genuinely shared invite behavior in the app.

## Suggested Agent

- Suggested model: `GPT-5.6 Sol (gpt-5.6-sol)`
- Reasoning level: `xhigh`

## Acceptance

- [ ] A documented boundary defines what belongs to the shared invite shell versus a theme module.
- [ ] `public-invite.tsx`, `rsvp-form.tsx`, and other invite components contain no direct comparisons against concrete theme IDs/names.
- [ ] Theme modules expose typed capabilities, slots, section renderers, tokens, or composition functions needed to replace removed branches.
- [ ] Shared conditions in `apps/invite` are limited to event state, guest/public access, enabled sections, RSVP availability, loading, errors, and other theme-neutral behavior.
- [ ] Theme resolution returns a safe common fallback when a configured theme is missing or invalid.
- [ ] Dashboard preview uses the same theme entry points without importing theme logic back into the dashboard app.
- [ ] No shadcn/Base UI/dashboard package is introduced into invite or theme code.
- [ ] Tests verify representative themes render correctly after removal of app-level theme conditions.

## UI Quality Checklist

- [ ] Dashboard controls use `@lumiere/dashboard-ui` shadcn/Base UI primitives where applicable.
- [ ] Invite and theme visuals remain fully custom and contain no shadcn/Base UI imports.
- [ ] Loading, empty, error, success, disabled, focus, hover, and active states are handled where relevant.
- [ ] Mobile, tablet, and desktop behavior is explicitly verified.
- [ ] Keyboard, screen-reader, contrast, focus-management, and reduced-motion basics are covered.
- [ ] The result follows `SKILL.md` and avoids generic AI-dashboard or invitation-template patterns.

## Notes

Prefer explicit typed theme capabilities and renderer slots over a growing boolean configuration object. Avoid moving one large `switch(themeId)` from the invite app into another centralized file; each theme should own its implementation directory.

## Progress Log

- 2026-07-13T09:00:00+08:00: Task created from dashboard and invite follow-up review.
