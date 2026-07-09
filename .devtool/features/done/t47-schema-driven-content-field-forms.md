---
id: 't47-schema-driven-content-field-forms'
status: 'done'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-09T00:00:00+08:00'
modified: '2026-07-10T01:43:51+08:00'
completedAt: '2026-07-10T01:43:51+08:00'
labels: ['dashboard', 'content', 'forms', 'sections']
depends_on: ['t11-theme-and-section-api', 't23-dashboard-section-builder', 't45-event-type-section-blueprints']
order: 'a47'
---

# t47-schema-driven-content-field-forms - Schema-driven content field forms replacing JSON editing

## Hierarchy

- Epic: `frontend`
- Dependencies: `t11-theme-and-section-api`, `t23-dashboard-section-builder`, `t45-event-type-section-blueprints`

## Scope

Replace raw JSON content editing with manager-friendly field forms generated from section schemas. Managers should edit names, labels, dates, story chapters, people, images, locations, and RSVP copy through proper controls.

## Suggested Agent

- Suggested model: `GPT-5.5`
- Reasoning level: `extra high`

## Acceptance

- [x] Raw JSON editor is removed from normal manager flow or moved behind a developer/debug-only affordance.
- [x] Section schemas map to typed field components such as text, textarea, rich text, date/time, image URL, gallery list, people group list, color palette, location, and repeatable blocks.
- [x] Forms validate required fields and show errors near the exact field.
- [x] Repeatable content such as entourage groups, story chapters, gallery images, schedule items, and FAQs has add/reorder/remove controls.
- [x] Changes produce the same validated data shape expected by invite renderers and APIs.
- [x] Managers can save draft content without publishing public changes if the data model supports drafts.
- [x] Tests cover editing a simple section, repeatable section, validation failure, and saving to the API.

## UI Quality Checklist

- [x] Uses the selected dashboard or invite component strategy before custom UI.
- [x] Follows Lumiere color, shape, typography, motion, and theme locks from `SKILL.md`.
- [x] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [x] Works on required mobile, tablet, and desktop viewport widths.
- [x] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [x] Avoids generic AI-slop patterns listed in `SKILL.md`.


## Notes

This directly addresses JSON being too hard for non-technical managers.

## Progress Log

- 2026-07-09T00:00:00+08:00: Task created from dashboard and invite UX review concerns.
- 2026-07-10T01:32:55+08:00: Started schema-driven field form work by reviewing section-builder JSON editing, section schemas, preview validation, and dashboard tests.
- 2026-07-10T01:43:51+08:00: Replaced normal section JSON editing with typed content/settings controls, moved JSON into a developer details panel, added repeatable field controls, and verified with dashboard section-builder tests, dashboard typecheck, and format check.
