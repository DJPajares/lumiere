---
id: 't86-noel-v2-botanical-invitation'
status: 'done'
priority: 'high'
assignee: null
epic: 'design-system'
dueDate: null
created: '2026-07-15T00:00:00+08:00'
modified: '2026-07-15T14:20:00+08:00'
completedAt: '2026-07-15T14:20:00+08:00'
labels: ['invite', 'themes', 'noel', 'visual-design']
depends_on: ['t85-noel-premium-christmas-crest']
order: 'a86'
---

# t86-noel-v2-botanical-invitation - Create the Noel v2 botanical invitation

## Scope

Add a separate Noel V2 theme around the supplied printed Christmas invitation reference: warm cotton paper, a dense evergreen, holly, berry, and pine-cone frame, formal red and forest typography, and an intimate vertical invitation composition. Keep the original Noel theme and persisted Noel selections unchanged.

## Acceptance

- [x] The Noel V2 hero closely reflects the reference's botanical paper invitation while remaining an original responsive composition.
- [x] Noel V2 is independently selectable and the original Noel definition, styles, behavior, and asset namespace remain unchanged.
- [x] Cover-image and no-image states both feel intentional, with event facts remaining readable.
- [x] Supporting sections, location, gallery, guest context, and RSVP share the paper-and-botanical visual system.
- [x] Snowlight and Candlelight remain accessible and visually distinct without relying on red/green alone for status.
- [x] Ambient motion is restrained and fully disabled by reduced-motion preferences.
- [x] Theme contracts, SVG assets, formatting, boundaries, focused tests, typecheck, and the invite compile-mode production build pass.

## Progress Log

- 2026-07-15T00:00:00+08:00: Started from the supplied printed invitation reference; chose an original code-native botanical frame and a responsive paper-folio composition.
- 2026-07-15T00:20:00+08:00: Clarified Noel V2 as a separate selectable theme, restored the original Noel implementation unchanged, and moved the new visual system into the independent `noel-v2` ID and asset namespace.
- 2026-07-15T14:20:00+08:00: Completed the separate registry module, Snowlight/Candlelight tokens, portrait botanical folio, optional companion print, paper-led section treatments, RSVP styling, independent SVG assets, specifications, and responsive/reduced-motion pass. Confirmed zero diff in the original Noel files, WCAG contrast from 5.27:1 to 15.04:1 across key pairings, valid SVG, 11 clean theme modules, 49 focused tests, and typechecks for themes, invite, dashboard, and API. The Next compile-mode production build passes; the standard build also compiles the CSS successfully before Next 16 attempts to reinstall TypeScript because the repository's TypeScript 7 package no longer exports `typescript/lib/typescript.js`.
