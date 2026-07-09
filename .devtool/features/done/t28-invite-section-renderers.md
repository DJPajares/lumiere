---
id: 't28-invite-section-renderers'
status: 'done'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-09T13:37:36+08:00'
completedAt: '2026-07-09T13:37:36+08:00'
labels: ['frontend', 'themes', 'sections']
depends_on: ['t06-theme-registry-package', 't26-invite-public-event-page']
order: 'a28'
---

# t28-invite-section-renderers - Initial invite section renderers

## Hierarchy

- Epic: `frontend`
- Dependencies: `t06-theme-registry-package`, `t26-invite-public-event-page`

## Scope

Build initial section renderers for common event sections such as introduction, date, story, people, location, gallery, dress code, RSVP slot, and outro. Renderers should expose enough structure for both simple card themes and richer immersive themes.

## Suggested Agent

- Suggested model: `GPT-5.5`
- Reasoning level: `extra high`

## Acceptance

- [x] Renderers consume validated section content and settings.
- [x] Renderers support mobile-first layout and desktop enhancements.
- [x] Renderers support theme-provided composition variants such as full-bleed, editorial split, layered media, timeline, gallery feature, and framed/basic card treatment.
- [x] Renderers expose stable hooks/classes/data attributes needed for theme motion without coupling section data to a single animation implementation.
- [x] Missing optional content degrades gracefully.
- [x] Location and gallery sections reserve image/embed space.
- [x] Renderers respect theme tokens and mode.
- [x] Component tests cover core section renderers.

## UI Quality Checklist

- [x] Uses Tailwind tokens and project-owned primitives before adding a component library.
- [x] Follows color, shape, and theme locks from `SKILL.md`.
- [x] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [x] Works on required mobile and desktop viewport widths.
- [x] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [x] Avoids generic AI-slop patterns listed in `SKILL.md`.

## Notes

Keep renderers reusable across event types. Specific themes can style them differently later, including immersive premium themes and simpler neutral themes.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
- 2026-07-09T13:18:44+08:00: Added composition-variant and motion-hook requirements so section renderers can support premium immersive themes without becoming one-off components.
- 2026-07-09T13:22:13+08:00: Started implementation, focusing on reusable invite section renderers with composition variants and stable motion hooks.
- 2026-07-09T13:37:36+08:00: Completed initial invite section renderers in `apps/invite/components/public-invite.tsx`, added renderer coverage in `apps/invite/components/public-invite.test.tsx`, and verified with invite typecheck, tests, lint placeholder, and focused Prettier check.
