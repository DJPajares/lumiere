---
id: 't30-initial-theme-implementations'
status: 'done'
priority: 'high'
assignee: null
epic: 'design-system'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-09T14:26:23+08:00'
completedAt: '2026-07-09T14:26:23+08:00'
labels: ['themes', 'frontend', 'design']
depends_on: ['t28-invite-section-renderers', 't22-dashboard-theme-selector']
order: 'a30'
---

# t30-initial-theme-implementations - Initial theme implementations

## Hierarchy

- Epic: `design-system`
- Dependencies: `t28-invite-section-renderers`, `t22-dashboard-theme-selector`

## Scope

Implement initial visual theme variants for Premium, Kids, Noel, and neutral default using the theme registry and Tailwind tokens. The Premium theme should be the first high-fidelity invitation benchmark, not just a color variant.

## Suggested Agent

- Suggested model: `GPT-5.5`
- Reasoning level: `extra high`

## Acceptance

- [x] Each initial theme has metadata, token values, supported modes, and preview data.
- [x] Premium theme feels polished, modern, immersive, and event-worthy without generic AI gradients.
- [x] Premium theme includes a full-viewport hero, layered imagery, refined typography, varied section rhythm, tasteful scroll reveals/parallax, and editorial gallery/location treatments.
- [x] Premium theme reserves clean ambient media hooks in theme metadata/composition, while keeping audio controls separate from visual content.
- [x] Neutral default may remain simpler and more card-friendly, but Premium must not read as a basic card-based website.
- [x] Kids theme is playful but still accessible.
- [x] Noel theme suggests holiday styling without overusing emojis or clutter.
- [x] Neutral default works for generic events.
- [x] Themes pass the `SKILL.md` pre-flight checklist.

## UI Quality Checklist

- [x] Uses Tailwind tokens and project-owned primitives before adding a component library.
- [x] Follows color, shape, and theme locks from `SKILL.md`.
- [x] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [x] Works on required mobile and desktop viewport widths.
- [x] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [x] Avoids generic AI-slop patterns listed in `SKILL.md`.

## Notes

Names such as Moana may imply trademarked styling. Use a generic ocean/adventure-inspired theme unless the final product has rights to use branded assets.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
- 2026-07-09T13:18:44+08:00: Raised priority and clarified that Premium must deliver a high-fidelity immersive invite experience with layered imagery, varied rhythm, and motion.
- 2026-07-09T14:17:24+08:00: Started implementation by expanding theme registry composition metadata and wiring invite rendering to selected theme behavior.
- 2026-07-09T14:26:23+08:00: Completed initial theme implementations with richer composition metadata, theme-aware invite rendering, reduced-motion-safe reveal/parallax CSS, API metadata exposure, and focused tests.
