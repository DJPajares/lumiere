---
id: 't34-ci-and-release-readiness'
status: 'backlog'
priority: 'medium'
assignee: null
epic: 'release'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-07T00:00:00+08:00'
completedAt: null
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

- [ ] CI runs pnpm install, format check, lint, typecheck, and tests.
- [ ] CI uses pnpm-compatible caching.
- [ ] Required environment variables are documented without secrets.
- [ ] README includes local verification and deployment notes.
- [ ] MVP readiness checklist maps to PRD Definition of Done.
- [ ] CI does not require real production Supabase credentials for tests.

## Notes

Keep CI minimal and reliable before adding deployment automation.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
