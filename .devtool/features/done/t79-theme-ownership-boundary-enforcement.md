---
id: 't79-theme-ownership-boundary-enforcement'
status: 'done'
priority: 'high'
assignee: null
epic: 'quality'
dueDate: null
created: '2026-07-13T09:00:00+08:00'
modified: '2026-07-14T03:16:00+08:00'
completedAt: '2026-07-14T03:16:00+08:00'
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

- [x] Lint/import rules prevent `apps/invite` and `packages/themes` from importing `@lumiere/dashboard-ui`, shadcn-generated dashboard paths, or Base UI.
- [x] A static check or test flags concrete theme-ID comparisons and theme-specific copy maps inside `apps/invite` outside a tightly documented resolver boundary.
- [x] Theme package contract tests validate required metadata, supported modes, sections, RSVP configuration, copy fallback, renderer exports, and asset declarations.
- [x] Every registered theme can be loaded independently without importing another theme implementation.
- [x] The dashboard theme preview consumes public theme APIs rather than private theme files.
- [x] CI runs the boundary and registry contract checks.
- [x] Violation messages explain where the code should move rather than only failing generically.

## Notes

Allow a small centralized registry to map theme IDs to independently owned modules. The banned pattern is theme-specific behavioral or rendering logic inside the invite app, not the existence of a typed registry key.

## Progress Log

- 2026-07-13T09:00:00+08:00: Task created from dashboard and invite follow-up review.
- 2026-07-14T00:00:00+08:00: Started as the next unblocked task; auditing lint, theme registry contracts, preview imports, and CI wiring.
- 2026-07-14T03:16:00+08:00: Added the comprehensive theme ownership checker, public module registry contract coverage, dashboard-preview API guard, and explicit CI commands. Boundary/contracts, lint, typecheck, and all existing tests pass; targeted formatting passes, while the repository-wide format check remains blocked by five unrelated pre-existing files. UI pre-flight confirmed no rendered UI or interaction behavior changed.
