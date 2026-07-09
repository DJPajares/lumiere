---
id: 't35-brand-identity-and-pwa-assets'
status: 'done'
priority: 'high'
assignee: null
epic: 'design-system'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-09T16:09:00+08:00'
completedAt: '2026-07-09T16:09:00+08:00'
labels: ['brand', 'pwa', 'design-system', 'frontend']
depends_on: ['t04-design-read-skill-and-globals', 't17-invite-app-scaffold', 't18-dashboard-app-scaffold', 't31-pwa-and-public-metadata']
order: 'a35'
---

# t35-brand-identity-and-pwa-assets - Brand identity and PWA asset integration

## Hierarchy

- Epic: `design-system`
- Dependencies: `t04-design-read-skill-and-globals`, `t17-invite-app-scaffold`, `t18-dashboard-app-scaffold`, `t31-pwa-and-public-metadata`

## Scope

Integrate the Lumiere brand identity into both apps without hard-coding the brand into every event theme. Wire the main app logo assets into the public invite PWA and the dashboard logo assets into the dashboard app.

## Suggested Agent

- Suggested model: `GPT-5.5`
- Reasoning level: `high`

## Acceptance

- [x] `apps/invite/public` contains the main Lumiere PWA asset set with favicon, Apple touch icon, 192/512 icons, and maskable icons.
- [x] `apps/dashboard/public` contains the Lumiere Dashboard PWA asset set with favicon, Apple touch icon, 192/512 icons, and maskable icons.
- [x] Both apps expose correct manifest names, short names, theme colors, background colors, and icon paths.
- [x] Brand assets appear in app metadata, install surfaces, and selected app-shell locations without overpowering event-specific themes.
- [x] Public guest URLs avoid private guest data in Open Graph, title, description, and share metadata.
- [x] README documents where to place and update Lumiere brand/PWA assets.

## UI Quality Checklist

- [x] Uses Tailwind tokens and project-owned primitives before adding a component library.
- [x] Follows Lumiere color, shape, brand, and theme locks from `SKILL.md`.
- [x] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [x] Works on required mobile and desktop viewport widths.
- [x] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [x] Avoids generic AI-slop patterns listed in `SKILL.md`.

## Notes

Use the generated Lumiere logo pack as the source assets. Keep theme-specific visuals separate from app-level brand identity.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
- 2026-07-09T15:42:00+08:00: Started brand/PWA asset pass after reading `SKILL.md`, auditing existing app metadata, manifests, public assets, and app-shell brand placements.
- 2026-07-09T16:09:00+08:00: Completed brand/PWA integration with explicit Apple touch and maskable icon assets for both apps, regenerated solid-background launcher icons, manifest and metadata wiring, restrained invite root branding, dashboard shell/login/protected brand lockups, route tests for metadata/manifests, README asset documentation, and UI pre-flight review.
- 2026-07-09T16:18:00+08:00: Revised branding to remove invite/dashboard SVG mark assets, use each app's `logo.png` for visible app branding, keep install surfaces on PNG icon assets, and assert metadata/manifests are SVG-free.
