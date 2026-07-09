---
id: 't26-invite-public-event-page'
status: 'done'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-09T00:00:00+08:00'
completedAt: '2026-07-09T00:00:00+08:00'
labels: ['frontend', 'invite', 'public']
depends_on: ['t13-public-invite-api', 't17-invite-app-scaffold', 't06-theme-registry-package']
order: 'a26'
---

# t26-invite-public-event-page - Public event invitation page

## Hierarchy

- Epic: `frontend`
- Dependencies: `t13-public-invite-api`, `t17-invite-app-scaffold`, `t06-theme-registry-package`

## Scope

Implement the generic public event page that renders published invitation sections without RSVP content.

## Suggested Agent

- Suggested model: `GPT-5.5`
- Reasoning level: `extra high`

## Acceptance

- [x] `/e/[eventSlug]` fetches public event data.
- [x] Configured public sections render through the theme registry.
- [x] RSVP and guest-only sections are hidden.
- [x] Event not found, unpublished, and archived states are handled.
- [x] Theme mode and selected design are applied.
- [x] Tests cover public sections, hidden RSVP, and not-found state.

## UI Quality Checklist

- [x] Uses Tailwind tokens and project-owned primitives before adding a component library.
- [x] Follows color, shape, and theme locks from `SKILL.md`.
- [x] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [x] Works on required mobile and desktop viewport widths.
- [x] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [x] Avoids generic AI-slop patterns listed in `SKILL.md`.

## Notes

This page should feel complete even without guest personalization.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
- 2026-07-09T00:00:00+08:00: Started as the next unblocked task after dashboard responses/activity completion; promoted from backlog because no lower-order todo tasks were available and dependencies are complete.
- 2026-07-09T00:00:00+08:00: Completed public invite route with typed public API fetch, unavailable state for not-found/unpublished/archived responses, registry-validated public section rendering, defensive RSVP/guest-only filtering, selected theme mode application, and route tests. Used a generic renderer here; richer theme-specific renderers remain in the later invite section renderer task. Verified with invite tests, typecheck, lint placeholder, and targeted Prettier check.
