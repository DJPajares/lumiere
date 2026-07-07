---
id: "t02-tooling-quality-baseline"
status: "done"
priority: "high"
assignee: null
epic: "quality"
dueDate: null
created: "2026-07-07T00:00:00+08:00"
modified: "2026-07-07T23:50:44+08:00"
completedAt: "2026-07-07T23:50:44+08:00"
labels: ["quality", "tooling", "vitest", "prettier"]
depends_on: ["t01-project-scaffold"]
order: "a02"
---

# t02-tooling-quality-baseline - Tooling quality baseline

## Hierarchy

- Epic: `quality`
- Dependencies: `t01-project-scaffold`

## Scope

Add shared formatting, linting, testing, and pre-commit tooling for the monorepo.

## Suggested Agent

- Suggested model: `GPT-5.4-mini`
- Reasoning level: `medium`

## Acceptance

- [x] Prettier is configured at the root.
- [x] lint-staged runs formatting and lightweight checks on staged files.
- [x] Vitest is available for packages and API tests where practical.
- [x] Root scripts run scoped app/package checks through the workspace.
- [x] README documents common quality commands.
- [x] Tooling dependencies use latest stable versions where practical.

## Notes

Keep configs minimal. Do not introduce strict rules that block early scaffolding without clear value.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
- 2026-07-07T23:47:29+08:00: Started minimal quality baseline with root formatting, lint-staged, and Vitest setup.
- 2026-07-07T23:50:44+08:00: Completed quality baseline. Added Prettier, lint-staged, Vitest, workspace test/watch scripts, README command docs, and verified install, build, typecheck, lint, test, format check, and lint-staged no-op execution.
