---
id: 't88-invite-typography-complete-migration'
status: 'done'
priority: 'high'
assignee: null
epic: 'design-system'
dueDate: null
created: '2026-07-16T00:00:00+08:00'
modified: '2026-07-16T20:30:00+08:00'
completedAt: '2026-07-16T20:30:00+08:00'
labels: ['invite', 'themes', 'typography', 'accessibility']
depends_on: ['t87-theme-typography-tokens']
order: 'a88'
---

# t88-invite-typography-complete-migration - Make shared typography tokens the invite source of truth

## Scope

Apply the shared typography roles across every text-bearing invite surface, including intro animation, RSVP controls and states, audio and mode controls, countdowns, placeholders, map metadata, and the public landing page. Remove duplicated semantic type declarations from theme CSS while preserving dedicated decorative and control-specific treatments.

## Acceptance

- [x] Every user-facing invite text surface uses a semantic typography role.
- [x] Intro, RSVP, shell controls, countdown, placeholders, and map metadata resolve through theme typography variables.
- [x] Semantic theme CSS no longer duplicates role size/style declarations.
- [x] Decorative numerals, icons, font-face declarations, and intentional control-specific type remain explicitly scoped.
- [x] Noel V2 and all other themes retain their visual hierarchy and responsive readability.
- [x] Focused tests, typechecks, formatting, boundary checks, and production build pass.

## Progress Log

- 2026-07-16T00:00:00+08:00: Audited remaining invite surfaces and confirmed t87 migrated shared section content but left intro, RSVP, shell controls, countdown, placeholder, map, and semantic theme CSS declarations for this follow-up.
- 2026-07-16T20:30:00+08:00: Added the pretitle role, migrated all remaining invite and RSVP copy/control surfaces, removed semantic typography declarations from all theme CSS, and retained only font-face/decorative print/ornament typography. Typechecks, 59 invite/theme tests, formatting, boundaries, and the production invite build pass.
- 2026-07-16T21:05:00+08:00: Added a shared control-icon role and applied it to RSVP +/- buttons so their larger glyphs remain theme-configurable.
- 2026-07-16T21:10:00+08:00: Restyled the theme mode toggle to rest as a semi-transparent icon-only control and expand its label on hover, focus, or active interaction with reduced-motion-safe transitions.
- 2026-07-16T21:20:00+08:00: Raised the toggle selectors to theme scope so theme-specific grid and padding rules cannot keep the idle label visible; applied the control-icon role to the mode glyph and verified the production CSS output.
- 2026-07-16T21:30:00+08:00: Blurred the toggle after selection, corrected border-box dimensions for even icon spacing, removed the inner icon border, and sized expansion from the longest theme mode label.
- 2026-07-16T21:50:00+08:00: Replaced character-count width estimates with live measurements of both theme labels (including uppercase tracking), then explicitly centered the label line box and verified the invite build.
