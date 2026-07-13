---
id: 't72-story-paragraph-optional-title'
status: 'done'
priority: 'medium'
assignee: null
epic: 'full-stack'
dueDate: null
created: '2026-07-13T09:00:00+08:00'
modified: '2026-07-13T16:09:39+08:00'
completedAt: '2026-07-13T16:09:39+08:00'
labels: ['story', 'sections', 'dashboard', 'invite', 'schema', 'themes']
depends_on: ['t23-dashboard-section-builder', 't28-invite-section-renderers', 't47-schema-driven-content-field-forms', 't64-invite-theme-module-directory-refactor']
order: 'a72'
---

# t72-story-paragraph-optional-title - Add optional titles to story paragraphs

## Hierarchy

- Epic: `full-stack`
- Dependencies: `t23-dashboard-section-builder`, `t28-invite-section-renderers`, `t47-schema-driven-content-field-forms`, `t64-invite-theme-module-directory-refactor`

## Scope

Extend story-section paragraph content so each paragraph can optionally include a short title. Update schema, migration/normalization, dashboard editing, theme contracts, and invite rendering while keeping older paragraph-only data valid.

## Suggested Agent

- Suggested model: `GPT-5.6 Terra (gpt-5.6-terra)`
- Reasoning level: `high`

## Acceptance

- [x] Story paragraph data supports `{ title?: string, body: string }` or an equivalent typed structure.
- [x] Existing string-only paragraph content is migrated or normalized without data loss.
- [x] Dashboard story forms display an optional title input paired with each paragraph body and support add, remove, and reorder behavior.
- [x] Validation applies reasonable title/body lengths and requires the body even when the title is absent.
- [x] Theme renderers receive the same typed story model and choose how to present or omit paragraph titles without invite-app theme checks.
- [x] Themes without special story styling render the optional title through a shared accessible fallback.
- [x] Tests cover legacy data, titled and untitled paragraphs, reordering, validation, and at least two theme renderers.

## UI Quality Checklist

- [x] Dashboard controls use `@lumiere/dashboard-ui` shadcn/Base UI primitives where applicable.
- [x] Invite and theme visuals remain fully custom and contain no shadcn/Base UI imports.
- [x] Loading, empty, error, success, disabled, focus, hover, and active states are handled where relevant.
- [x] Mobile, tablet, and desktop behavior is explicitly verified.
- [x] Keyboard, screen-reader, contrast, focus-management, and reduced-motion basics are covered.
- [x] The result follows `SKILL.md` and avoids generic AI-dashboard or invitation-template patterns.

## Notes

Do not make the title a separate section-level heading. It belongs to an individual story paragraph/entry and remains optional.

## Progress Log

- 2026-07-13T09:00:00+08:00: Task created from dashboard and invite follow-up review.
- 2026-07-13T16:01:43+08:00: Started T72 after confirming all dependencies were complete; preserving legacy string paragraphs through shared normalization and keeping invite/theme rendering independent from dashboard UI primitives.
- 2026-07-13T16:09:39+08:00: Completed the shared typed story paragraph schema, legacy string normalization, structured dashboard editor and preview, composition-aware invite titles, accessible fallback rendering, and regression coverage across four theme configurations.
- 2026-07-13T16:09:39+08:00: Verified workspace typecheck, full tests, lint placeholders, targeted Prettier, dashboard UI boundary, Next Image policy, and diff checks. The repository-wide format check still reports four unrelated pre-existing files outside T72.
