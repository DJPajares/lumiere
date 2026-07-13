---
id: 't77-invite-theme-condition-boundary-refactor'
status: 'done'
priority: 'high'
assignee: null
epic: 'architecture'
dueDate: null
created: '2026-07-13T09:00:00+08:00'
modified: '2026-07-13T17:47:43+08:00'
completedAt: '2026-07-13T17:47:43+08:00'
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

- [x] A documented boundary defines what belongs to the shared invite shell versus a theme module.
- [x] `public-invite.tsx`, `rsvp-form.tsx`, and other invite components contain no direct comparisons against concrete theme IDs/names.
- [x] Theme modules expose typed capabilities, slots, section renderers, tokens, or composition functions needed to replace removed branches.
- [x] Shared conditions in `apps/invite` are limited to event state, guest/public access, enabled sections, RSVP availability, loading, errors, and other theme-neutral behavior.
- [x] Theme resolution returns a safe common fallback when a configured theme is missing or invalid.
- [x] Dashboard preview uses the same theme entry points without importing theme logic back into the dashboard app.
- [x] No shadcn/Base UI/dashboard package is introduced into invite or theme code.
- [x] Tests verify representative themes render correctly after removal of app-level theme conditions.

## UI Quality Checklist

- [x] Dashboard controls use `@lumiere/dashboard-ui` shadcn/Base UI primitives where applicable.
- [x] Invite and theme visuals remain fully custom and contain no shadcn/Base UI imports.
- [x] Loading, empty, error, success, disabled, focus, hover, and active states are handled where relevant.
- [x] Mobile, tablet, and desktop behavior is explicitly verified.
- [x] Keyboard, screen-reader, contrast, focus-management, and reduced-motion basics are covered.
- [x] The result follows `SKILL.md` and avoids generic AI-dashboard or invitation-template patterns.

## Notes

Prefer explicit typed theme capabilities and renderer slots over a growing boolean configuration object. Avoid moving one large `switch(themeId)` from the invite app into another centralized file; each theme should own its implementation directory.

## Progress Log

- 2026-07-13T09:00:00+08:00: Task created from dashboard and invite follow-up review.
- 2026-07-13T17:31:00+08:00: Started T77 after confirming T64 and T76 are complete. Auditing direct theme conditions and moving hero, RSVP, and stylesheet ownership behind typed per-theme presentation capabilities with a safe package-level fallback.
- 2026-07-13T17:47:43+08:00: Completed the boundary refactor. Theme modules now own typed hero/RSVP presentation and optional stylesheets; invite and dashboard preview resolve the same safe theme definition without local fallback logic. Preserved responsive, reduced-motion, interaction, and accessibility behavior; verified generated Tailwind classes and package CSS in production builds. Four package typechecks/builds, boundary/image checks, formatting, and 230 existing tests passed; lint scripts remain placeholders.
