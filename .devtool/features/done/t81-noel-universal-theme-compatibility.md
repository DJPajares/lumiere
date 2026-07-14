---
id: 't81-noel-universal-theme-compatibility'
status: 'done'
priority: 'high'
assignee: null
epic: 'design-system'
dueDate: null
created: '2026-07-14T00:00:00+08:00'
modified: '2026-07-14T10:46:00+08:00'
completedAt: '2026-07-14T10:46:00+08:00'
labels: ['invite', 'themes', 'event-types', 'compatibility']
depends_on: ['t46-theme-compatibility-matrix', 't64-invite-theme-module-directory-refactor']
order: 'a81'
---

# t81-noel-universal-theme-compatibility - Make Noel compatible with every event type

## Scope

Complete the existing Noel Christmas theme so it can be selected for every event type and can render every invitation section without compatibility blockers.

## Acceptance

- [x] Noel is available for every event type in the shared event-type schema.
- [x] Noel supports every invitation section used by event blueprints.
- [x] Noel retains distinct Christmas styling, light/dark behavior, RSVP treatment, and reduced-motion-safe effects.
- [x] Theme specs and compatibility tests describe and prove the universal event fit.
- [x] Theme boundaries, focused tests, typecheck, formatting, lint, and the workspace regression suite pass.

## Progress Log

- 2026-07-14T00:00:00+08:00: Started from the user request; confirmed Noel already exists as a persisted theme ID but is limited to holiday, dinner, and private-event compatibility.
- 2026-07-14T10:46:00+08:00: Made Noel available to all eight event types and all twelve section types, added seasonal profile, entourage, and outro compositions, aligned specs and compatibility coverage, and completed the invite UI pre-flight review. Verified 10 workspace typechecks, 10 workspace test tasks, lint, focused formatting, and theme ownership boundaries.
