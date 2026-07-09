---
id: 't34-ci-and-release-readiness'
status: 'done'
priority: 'medium'
assignee: null
epic: 'release'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-09T15:31:00+08:00'
completedAt: '2026-07-09T15:31:00+08:00'
labels: ['ci', 'release', 'docs']
depends_on: ['t32-integration-smoke-tests', 't33-security-hardening']
order: 'a34'
---

# t34-ci-and-release-readiness - CI and release readiness

## Hierarchy

- Epic: `release`
- Dependencies: `t32-integration-smoke-tests`, `t33-security-hardening`

## Scope

Prepare CI checks, deployment notes, and MVP readiness documentation.

## Suggested Agent

- Suggested model: `GPT-5.4-mini`
- Reasoning level: `medium`

## Acceptance

- [x] CI runs pnpm install, format check, lint, typecheck, and tests.
- [x] CI uses pnpm-compatible caching.
- [x] Required environment variables are documented without secrets.
- [x] README includes local verification and deployment notes.
- [x] MVP readiness checklist maps to PRD Definition of Done.
- [x] CI does not require real production Supabase credentials for tests.

## Notes

Keep CI minimal and reliable before adding deployment automation.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
- 2026-07-09T15:23:00+08:00: Started CI and release readiness pass after verifying t32 and t33 are complete.
- 2026-07-09T15:31:00+08:00: Completed minimal GitHub Actions CI with pnpm store caching, placeholder non-secret CI env, frozen lockfile install, format/lint/typecheck/test commands, README local verification and deployment notes, and PRD Definition of Done readiness checklist.
