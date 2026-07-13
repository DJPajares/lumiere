---
id: 't79-theme-ownership-boundary-enforcement'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'quality'
dueDate: null
created: '2026-07-13T09:00:00+08:00'
modified: '2026-07-13T09:00:00+08:00'
completedAt: null
labels: ['themes', 'architecture', 'eslint', 'tests', 'boundaries']
depends_on: ['t77-invite-theme-condition-boundary-refactor', 't78-theme-aware-rsvp-renderer-contract']
order: 'a79'
---

# t79-theme-ownership-boundary-enforcement - Enforce theme ownership boundaries with lint and contract tests

## Hierarchy

- Epic: `quality`
- Dependencies: `t77-invite-theme-condition-boundary-refactor`, `t78-theme-aware-rsvp-renderer-contract`

## Scope

Add automated safeguards so theme-specific logic cannot drift back into `apps/invite` and dashboard-only shadcn components cannot leak into custom invitation themes.

## Suggested Agent

- Suggested model: `GPT-5.6 Terra (gpt-5.6-terra)`
- Reasoning level: `high`

## Acceptance

- [ ] Lint/import rules prevent `apps/invite` and `packages/themes` from importing `@lumiere/dashboard-ui`, shadcn-generated dashboard paths, or Base UI.
- [ ] A static check or test flags concrete theme-ID comparisons and theme-specific copy maps inside `apps/invite` outside a tightly documented resolver boundary.
- [ ] Theme package contract tests validate required metadata, supported modes, sections, RSVP configuration, copy fallback, renderer exports, and asset declarations.
- [ ] Every registered theme can be loaded independently without importing another theme implementation.
- [ ] The dashboard theme preview consumes public theme APIs rather than private theme files.
- [ ] CI runs the boundary and registry contract checks.
- [ ] Violation messages explain where the code should move rather than only failing generically.

## Notes

Allow a small centralized registry to map theme IDs to independently owned modules. The banned pattern is theme-specific behavioral or rendering logic inside the invite app, not the existence of a typed registry key.

## Progress Log

- 2026-07-13T09:00:00+08:00: Task created from dashboard and invite follow-up review.
