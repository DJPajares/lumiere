---
id: 't87-theme-typography-tokens'
status: 'done'
priority: 'high'
assignee: null
epic: 'design-system'
dueDate: null
created: '2026-07-16T00:00:00+08:00'
modified: '2026-07-16T19:30:00+08:00'
completedAt: '2026-07-16T19:30:00+08:00'
labels: ['invite', 'themes', 'typography', 'accessibility']
depends_on: ['t86-noel-v2-botanical-invitation']
order: 'a87'
---

# t87-theme-typography-tokens - Add theme-configurable invite typography roles

## Scope

Create common semantic typography roles for invitation content, expose their complete font treatment through each theme definition, and apply the roles consistently in the shared invite renderers. Preserve theme-specific art direction while improving small-screen description readability, especially for Noel V2 profiles.

## Acceptance

- [x] Shared roles cover hero, title, name, subtitle, description, body, label, eyebrow, and caption treatments.
- [x] Font family, size, style, weight, line height, letter spacing, and text transform can be configured by theme.
- [x] Shared invite renderers use semantic typography roles instead of local Tailwind font sizing for primary content.
- [x] Every theme receives a complete resolved typography scale and can override individual roles.
- [x] Noel V2 profile descriptions remain comfortably readable on mobile and desktop.
- [x] Existing theme tests, typechecks, lint, formatting, and invite build checks pass.

## Progress Log

- 2026-07-16T00:00:00+08:00: Audited renderer typography and theme CSS; identified repeated hero, section-title, profile-name, subtitle, and description declarations as the first migration boundary.
- 2026-07-16T19:30:00+08:00: Added ten typed semantic roles with complete style properties, resolved scale defaults, CSS-variable delivery through the invite shell, and per-theme overrides for all 13 themes. Migrated shared invite headings, names, descriptions, labels, and captions to role classes; Noel V2 now keeps profile descriptions at a 1.2rem minimum with an explicit italic book-serif treatment. Confirmed 59 focused tests, both package typechecks, formatting, theme boundaries, lint entry points, and the invite production build. Browser capture was unavailable because no browser backend was attached, so the responsive pre-flight used compiled CSS and selector-specificity review.
