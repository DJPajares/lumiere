---
id: 't01-project-scaffold'
status: 'done'
priority: 'high'
assignee: null
epic: 'foundation'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-07T23:44:52+08:00'
completedAt: '2026-07-07T23:44:52+08:00'
labels: ['foundation', 'setup', 'monorepo']
depends_on: []
order: 'a01'
---

# t01-project-scaffold - Project scaffold

## Hierarchy

- Epic: `foundation`
- Dependencies: None

## Scope

Create the Turborepo monorepo with `apps/invite`, `apps/dashboard`, `apps/api`, and shared packages. Configure pnpm workspaces, TypeScript base config, and root scripts.

## Suggested Agent

- Suggested model: `GPT-5.4-mini`
- Reasoning level: `medium`

## Acceptance

- [x] Workspace uses pnpm and includes `pnpm-workspace.yaml`.
- [x] Root scripts exist for dev, build, lint, typecheck, test, format, and format:check.
- [x] App and package directories have minimal package manifests.
- [x] New dependencies are installed with latest stable versions where practical.
- [x] Generated files, env files, build outputs, and local caches are ignored.
- [x] `pnpm install` completes successfully.

## Notes

Use create-turbo or an equivalent manual setup. Do not implement product features yet.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
- 2026-07-07T00:20:00+08:00: Started scaffold with pnpm workspace, Turborepo config, TypeScript base config, and minimal app/package manifests.
- 2026-07-07T23:44:52+08:00: Completed scaffold. Installed current stable root tooling, generated lockfile, added ignore rules, and verified install, build, typecheck, lint, test, and format check.
