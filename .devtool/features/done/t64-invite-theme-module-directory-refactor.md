---
id: 't64-invite-theme-module-directory-refactor'
status: 'done'
priority: 'high'
assignee: null
epic: 'design-system'
dueDate: null
created: '2026-07-10T18:00:00+08:00'
modified: '2026-07-11T08:22:02+08:00'
completedAt: '2026-07-11T08:22:02+08:00'
labels: ['invite', 'themes', 'architecture', 'refactor']
depends_on: ['t06-theme-registry-package', 't28-invite-section-renderers', 't30-initial-theme-implementations', 't46-theme-compatibility-matrix']
order: 'a64'
---

# t64-invite-theme-module-directory-refactor - Refactor invite themes into isolated modules

## Hierarchy

- Epic: `design-system`
- Dependencies: `t06-theme-registry-package`, `t28-invite-section-renderers`, `t30-initial-theme-implementations`, `t46-theme-compatibility-matrix`

## Scope

Replace the cramped `themes.ts` implementation with a scalable directory-per-theme architecture. Every invite theme and section renderer is fully custom. Each theme owns its metadata, tokens, typography, backdrop, ornaments, motion configuration, and section variants behind a shared typed contract, with no dependency on shadcn, Base UI, or dashboard UI packages.

## Suggested Agent

- Suggested model: `GPT-5.6 Sol (gpt-5.6-sol)`
- Reasoning level: `xhigh`

## Acceptance

- [x] Create a `themes/<theme-id>/` directory for every theme with a consistent module structure.
- [x] Each theme exports metadata, compatibility, light/dark modes, token overrides, font configuration, backdrop, ornaments/effects, motion settings, and section renderer variants.
- [x] A central registry imports theme modules and exposes typed lookup without containing theme implementation details.
- [x] Common invite primitives live in an invite-specific custom package or directory outside individual themes; themes do not import each other.
- [x] `apps/invite` and theme packages do not depend on `@lumiere/dashboard-ui`, shadcn, or `@base-ui/react`.
- [x] Theme-specific assets are colocated or referenced through a documented asset convention.
- [x] Existing event theme IDs remain compatible or include an explicit migration.
- [x] Vitest validates duplicate IDs, missing metadata, unsupported renderer slots, invalid mode declarations, and registry loading.
- [x] Document the steps for adding a new theme without editing a monolithic file.
## UI Quality Checklist

- [x] Invite themes and section components are fully custom and theme-led.
- [x] No dashboard shadcn/Base UI dependency crosses into the invite app or theme modules.
- [x] Typography, backdrops, ornaments, motion, and layouts are distinct enough to justify separate themes.
- [x] Light/dark variants and responsive behavior are explicit where supported.
- [x] Motion respects reduced-motion preferences and remains performant on mobile.
- [x] Theme modules follow Lumiere's TasteSkill rules and avoid templated AI-event-page patterns.

## Notes

Suggested shape: `themes/<id>/{index.ts, metadata.ts, tokens.ts, fonts.ts, motion.ts, components/, sections/, assets/}`. Adjust to repository conventions, but retain strong isolation. All files under this theme system are custom invite code. Sharing with the dashboard is limited to serializable theme metadata, compatibility contracts, and preview-safe renderer entry points.

## Progress Log

- 2026-07-10T18:00:00+08:00: Task created from the second dashboard, invite theme, and public URL UX review.

- 2026-07-10T18:30:00+08:00: Reviewed during shadcn Base UI update; no component-system changes required for this task.
- 2026-07-10T19:15:00+08:00: Scoped shadcn/Base UI to the dashboard only and updated the suggested model to GPT-5.6 Terra with xhigh reasoning.
- 2026-07-11T08:13:56+08:00: Started t64 after confirming all dependencies are complete. Mapping the monolithic registry into shared contracts/helpers plus isolated directory-per-theme definitions while preserving all public IDs and exports.
- 2026-07-11T08:22:02+08:00: Completed the directory-per-theme architecture for all eight shipped themes. Added typed module contracts, local definitions/effects/asset manifests, a thin central aggregator, shared serializable helpers, asset and add-theme documentation, and stronger assertions in the existing registry suite. Verified all 10 workspace typechecks, all 10 workspace test tasks, 25 theme tests, formatting, whitespace, and the dashboard/invite dependency boundary.
