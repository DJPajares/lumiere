---
id: 't33-security-hardening'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'security'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-07T00:00:00+08:00'
completedAt: null
labels: ['security', 'privacy', 'hardening']
depends_on: ['t32-integration-smoke-tests']
order: 'a33'
---

# t33-security-hardening - Security and privacy hardening

## Hierarchy

- Epic: `security`
- Dependencies: `t32-integration-smoke-tests`

## Scope

Audit and harden auth, guest token handling, public/private data boundaries, validation, rate limiting, and secret exposure.

## Suggested Agent

- Suggested model: `GPT-5.5`
- Reasoning level: `extra high`

## Acceptance

- [ ] Manager endpoints enforce Supabase auth and event access consistently.
- [ ] Public endpoints do not leak guest lists or manager-only fields.
- [ ] Guest tokens are high entropy and stored hashed.
- [ ] RSVP endpoints have basic abuse/rate-limit strategy or documented middleware extension.
- [ ] Section content rejects unsafe HTML/script.
- [ ] Security checklist and tests cover the main risks.

## Notes

Do this after core flows exist so the audit can exercise real paths.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
