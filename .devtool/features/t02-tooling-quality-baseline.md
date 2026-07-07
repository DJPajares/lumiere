---
id: 't02-tooling-quality-baseline'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'quality'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-07T00:00:00+08:00'
completedAt: null
labels: ['quality', 'tooling', 'vitest', 'prettier']
depends_on: ['t01-project-scaffold']
order: 'a02'
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

- [ ] Prettier is configured at the root.
- [ ] lint-staged runs formatting and lightweight checks on staged files.
- [ ] Vitest is available for packages and API tests where practical.
- [ ] Root scripts run scoped app/package checks through the workspace.
- [ ] README documents common quality commands.
- [ ] Tooling dependencies use latest stable versions where practical.

## Notes

Keep configs minimal. Do not introduce strict rules that block early scaffolding without clear value.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
