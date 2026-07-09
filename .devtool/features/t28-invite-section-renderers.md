---
id: 't28-invite-section-renderers'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-09T13:18:44+08:00'
completedAt: null
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

- [ ] Renderers consume validated section content and settings.
- [ ] Renderers support mobile-first layout and desktop enhancements.
- [ ] Renderers support theme-provided composition variants such as full-bleed, editorial split, layered media, timeline, gallery feature, and framed/basic card treatment.
- [ ] Renderers expose stable hooks/classes/data attributes needed for theme motion without coupling section data to a single animation implementation.
- [ ] Missing optional content degrades gracefully.
- [ ] Location and gallery sections reserve image/embed space.
- [ ] Renderers respect theme tokens and mode.
- [ ] Component tests cover core section renderers.

## UI Quality Checklist

- [ ] Uses Tailwind tokens and project-owned primitives before adding a component library.
- [ ] Follows color, shape, and theme locks from `SKILL.md`.
- [ ] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [ ] Works on required mobile and desktop viewport widths.
- [ ] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [ ] Avoids generic AI-slop patterns listed in `SKILL.md`.

## Notes

Keep renderers reusable across event types. Specific themes can style them differently later, including immersive premium themes and simpler neutral themes.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
- 2026-07-09T13:18:44+08:00: Added composition-variant and motion-hook requirements so section renderers can support premium immersive themes without becoming one-off components.
