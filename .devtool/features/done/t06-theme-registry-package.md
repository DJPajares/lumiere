---
id: "t06-theme-registry-package"
status: "done"
priority: "high"
assignee: null
epic: "design-system"
dueDate: null
created: "2026-07-07T00:00:00+08:00"
modified: "2026-07-08T00:28:36+08:00"
completedAt: "2026-07-08T00:28:36+08:00"
labels: ["themes", "registry", "sections"]
depends_on: ["t05-shared-types-and-schemas", "t04-design-read-skill-and-globals"]
order: "a06"
---

# t06-theme-registry-package - Theme registry package

## Hierarchy

- Epic: `design-system`
- Dependencies: `t05-shared-types-and-schemas`, `t04-design-read-skill-and-globals`

## Scope

Create `packages/themes` with theme metadata, section type definitions, allowed section schemas, and renderer contracts for the invite app.

## Suggested Agent

- Suggested model: `GPT-5.5`
- Reasoning level: `extra high`

## Acceptance

- [x] Theme registry exports available theme IDs, labels, supported event types, modes, and section capabilities.
- [x] Section registry defines supported section types and validation schemas.
- [x] Initial theme metadata includes Premium, Kids, Noel, and one neutral default design.
- [x] Registry does not execute database-provided code.
- [x] Dashboard and invite app can both consume the registry.
- [x] Tests verify that sample event sections validate against registry schemas.

## UI Quality Checklist

- [x] Uses Tailwind tokens and project-owned primitives before adding a component library.
- [x] Follows color, shape, and theme locks from `SKILL.md`.
- [x] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [x] Works on required mobile and desktop viewport widths.
- [x] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [x] Avoids generic AI-slop patterns listed in `SKILL.md`.

## Notes

Design templates live in code. Database stores selected IDs, settings, order, visibility, and content.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
- 2026-07-08T00:20:30+08:00: Started code-owned theme registry with section schemas and renderer contracts.
- 2026-07-08T00:28:36+08:00: Completed theme registry package. Added theme metadata for Lumiere Default, Premium, Kids, and Noel; section content/settings schemas; renderer-key contracts; theme validation helpers; app workspace dependencies; and registry tests.
