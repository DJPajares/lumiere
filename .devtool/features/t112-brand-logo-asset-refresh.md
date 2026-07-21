---
id: 't112-brand-logo-asset-refresh'
status: 'backlog'
priority: 'medium'
assignee: null
epic: 'design-system'
dueDate: null
created: '2026-07-22T01:10:41+08:00'
modified: '2026-07-22T01:10:41+08:00'
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

## Acceptance

- [ ] Approved source artwork and usage guidance are recorded before asset replacement; placeholder or AI-invented brand marks are not substituted for missing source files.
- [ ] `apps/invite/public` and `apps/dashboard/public` contain the correct visible `logo.png`, favicon, Apple touch icon, 192/512 icons, and maskable 192/512 icons derived from the approved sources.
- [ ] Layout metadata and both manifests reference the refreshed files with appropriate names, background colors, theme colors, sizes, purposes, safe areas, and cache behavior.
- [ ] Invite root branding, dashboard shell branding, login/signup surfaces, and install surfaces render crisply without stretching, clipping, unintended backgrounds, or overpowering event themes.
- [ ] Accessible names are meaningful where the mark conveys identity; decorative duplicates remain hidden from assistive technology.
- [ ] `README.md` logo-pack guidance is updated if the source format or regeneration workflow changes.
- [ ] Relevant existing metadata/manifest tests, image dimension checks, app typechecks, formatting, and a visual review at small and large sizes pass.

## Notes

This task remains in `backlog` until the updated approved logo sources are available. Preserve the existing assets until replacements can be verified as a complete pack.

## Progress Log

- 2026-07-22T01:10:41+08:00: Task created for the requested logo refresh; queued pending approved source artwork.
