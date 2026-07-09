---
id: 't33-security-hardening'
status: 'done'
priority: 'high'
assignee: null
epic: 'security'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-09T15:12:00+08:00'
completedAt: '2026-07-09T15:12:00+08:00'
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

- [x] Manager endpoints enforce Supabase auth and event access consistently.
- [x] Public endpoints do not leak guest lists or manager-only fields.
- [x] Guest tokens are high entropy and stored hashed.
- [x] RSVP endpoints have basic abuse/rate-limit strategy or documented middleware extension.
- [x] Section content rejects unsafe HTML/script.
- [x] Security checklist and tests cover the main risks.

## Notes

Do this after core flows exist so the audit can exercise real paths.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
- 2026-07-09T15:02:00+08:00: Started security hardening audit across manager auth/access, public invite payloads, guest token storage, RSVP abuse strategy, and section content validation.
- 2026-07-09T15:12:00+08:00: Completed hardening pass with no-store headers for sensitive API routes, CORS denial coverage for unconfigured origins, per-app RSVP rate limiting keyed by client plus hashed guest token boundary, HTTP(S)-only media/map URL validation, unsafe section markup rejection, README security checklist, and focused plus workspace verification.
