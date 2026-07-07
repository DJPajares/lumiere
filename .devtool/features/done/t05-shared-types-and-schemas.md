---
id: "t05-shared-types-and-schemas"
status: "done"
priority: "high"
assignee: null
epic: "contracts"
dueDate: null
created: "2026-07-07T00:00:00+08:00"
modified: "2026-07-08T00:18:26+08:00"
completedAt: "2026-07-08T00:18:26+08:00"
labels: ["types", "schemas", "contracts"]
depends_on: ["t03-environment-config"]
order: "a05"
---

# t05-shared-types-and-schemas - Shared types and validation schemas

## Hierarchy

- Epic: `contracts`
- Dependencies: `t03-environment-config`

## Scope

Create shared TypeScript domain types and runtime validation schemas for events, themes, sections, guest groups, RSVP responses, activity, notifications, and API errors.

## Suggested Agent

- Suggested model: `GPT-5.5`
- Reasoning level: `high`

## Acceptance

- [x] `packages/types` exports domain and API types.
- [x] Runtime schemas exist for event creation, section updates, guest group mutation, RSVP submission, and API errors.
- [x] Shared enums cover event status, event type, theme mode, section visibility, RSVP status, and manager roles.
- [x] Schemas are usable by API and frontend forms.
- [x] Vitest tests cover critical schema validation cases.

## Notes

Prefer shared validation contracts before building API endpoints or forms.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
- 2026-07-08T00:14:32+08:00: Started shared domain contracts and zod runtime schemas for API and form inputs.
- 2026-07-08T00:18:26+08:00: Completed shared contracts. Added domain enums, reusable primitives, event/theme/section/guest/RSVP/activity/notification schemas, API request/error schemas, and validation tests.
