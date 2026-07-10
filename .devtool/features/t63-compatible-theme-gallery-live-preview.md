---
id: 't63-compatible-theme-gallery-live-preview'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-10T18:00:00+08:00'
modified: '2026-07-10T19:15:00+08:00'
completedAt: null
labels: ['dashboard', 'shadcn', 'base-ui', 'themes', 'preview', 'compatibility']
depends_on: ['t22-dashboard-theme-selector', 't39-section-builder-live-preview-ux', 't46-theme-compatibility-matrix', 't56-dashboard-shadcn-foundation']
order: 'a63'
---

# t63-compatible-theme-gallery-live-preview - Show compatible themes with invite-renderer previews in the new dashboard system

## Hierarchy

- Epic: `frontend`
- Dependencies: `t22-dashboard-theme-selector`, `t39-section-builder-live-preview-ux`, `t46-theme-compatibility-matrix`, `t56-dashboard-shadcn-foundation`

## Scope

Redesign theme selection so managers see compatible themes first and preview representative output from the same theme modules used by the invite app. Use the dashboard-only shadcn Base UI primitives for gallery controls, filters, dialogs, and selection state. The actual preview must be rendered by the fully custom invite/theme implementation and must not consume dashboard UI components.

## Suggested Agent

- Suggested model: `GPT-5.6 Sol (gpt-5.6-sol)`
- Reasoning level: `xhigh`

## Acceptance

- [ ] Theme query and selection filter by current event type, supported sections, mode support, and publish readiness.
- [ ] An explicit control may reveal incompatible themes with reasons, but incompatible themes cannot be selected until conflicts are resolved.
- [ ] Theme gallery filters, menus, view controls, dialogs, and loading states use `@lumiere/dashboard-ui` Base UI-backed primitives.
- [ ] Each card renders a lightweight preview using actual theme tokens, font, backdrop, ornament, and a representative invite section renderer.
- [ ] Dashboard shadcn styles do not leak into the invite-renderer preview; use style isolation or a preview boundary where required.
- [ ] Preview code and invite theme modules contain no imports from `@lumiere/dashboard-ui`, shadcn, or Base UI.
- [ ] Expanded preview supports mobile/desktop simulation and available light/dark variants.
- [ ] Preview loading is lazy and performance-bounded; a gallery does not mount every full invite renderer at once.
- [ ] Tests cover compatibility filtering, incompatible reasons, renderer parity, style isolation, variants, selection, and preview fallback.

## UI Quality Checklist

- [ ] Uses the project-owned shadcn/ui Base UI components before creating custom controls.
- [ ] Follows Lumiere color, shape, typography, density, motion, and theme locks from `SKILL.md`.
- [ ] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [ ] Works on required mobile, tablet, and desktop viewport widths.
- [ ] Meets keyboard, label, contrast, focus-management, and reduced-motion basics.
- [ ] Avoids browser-default controls, duplicate navigation, and generic AI-dashboard patterns.

## Notes

This should not require duplicate theme implementations. Shared preview-safe render entry points may be necessary. Keep dashboard controls and fully custom invite visual output in separate code, dependency, and style boundaries.

## Progress Log

- 2026-07-10T18:00:00+08:00: Original task created.
- 2026-07-10T18:30:00+08:00: Updated to the current shadcn CLI v4 workflow with Base UI primitives and monorepo-aware component placement.
- 2026-07-10T19:15:00+08:00: Scoped shadcn/Base UI to the dashboard only and updated the suggested model to GPT-5.6 Terra with xhigh reasoning.
