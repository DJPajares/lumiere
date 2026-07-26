---
id: 't112-brand-logo-asset-refresh'
status: 'done'
priority: 'medium'
assignee: null
epic: 'design-system'
dueDate: null
created: '2026-07-22T01:10:41+08:00'
modified: '2026-07-26T13:47:48+08:00'
labels: ['brand', 'logo', 'invite', 'dashboard', 'pwa']
depends_on: ['t35-brand-identity-and-pwa-assets']
order: 'a112'
---

# t112-brand-logo-asset-refresh - Update Lumiere app logos

## Hierarchy

- Epic: `design-system`
- Dependencies: `t35-brand-identity-and-pwa-assets`

## Scope

Replace the current invite and dashboard logo packs with the approved updated Lumiere artwork. Refresh visible lockups, metadata, favicons, Apple touch icons, standard PWA icons, and maskable assets while keeping the invite identity distinct from the dashboard shell identity.

## Suggested Agent

- Suggested model: `GPT-5.6 Terra (gpt-5.6-terra)`
- Reasoning level: `medium`

## Acceptance

- [x] Approved source artwork and usage guidance are recorded before asset replacement; placeholder or AI-invented brand marks are not substituted for missing source files.
- [x] `apps/invite/public` and `apps/dashboard/public` contain the correct visible `logo.png`, favicon, Apple touch icon, 192/512 icons, and maskable 192/512 icons derived from the approved sources.
- [x] Layout metadata and both manifests reference the refreshed files with appropriate names, background colors, theme colors, sizes, purposes, safe areas, and cache behavior.
- [x] Invite root branding, dashboard shell branding, login/signup surfaces, and install surfaces render crisply without stretching, clipping, unintended backgrounds, or overpowering event themes.
- [x] Accessible names are meaningful where the mark conveys identity; decorative duplicates remain hidden from assistive technology.
- [x] `README.md` logo-pack guidance is updated if the source format or regeneration workflow changes.
- [x] Relevant existing metadata/manifest tests, image dimension checks, app typechecks, formatting, and a visual review at small and large sizes pass.

## Notes

The user authorized a new premium, simple, native-app-style Lumiere mark for this task. The approved SVG masters and usage guidance now live in `assets/brand/`; derived public packs are reproducible through the root asset generator.

## Progress Log

- 2026-07-22T01:10:41+08:00: Task created for the requested logo refresh; queued pending approved source artwork.
- 2026-07-26T00:00:00+08:00: User requested and authorized a new premium, simple, native-app-style Lumiere mark across PWA, dashboard, favicon, and related brand surfaces; implementation started with a vector master and complete derived asset pack.
- 2026-07-26T13:47:48+08:00: Completed coordinated Invite and Dashboard vector sources, generated all PNG/ICO packs, added cache-versioned metadata/manifests and theme colors, refreshed visible lockups, documented regeneration, and verified source parity, alpha behavior, dimensions, live asset serving, both app typechecks, 22 route tests, formatting, and 16–192 px visual quality.
