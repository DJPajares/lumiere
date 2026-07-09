---
id: 't27-invite-guest-event-page'
status: 'done'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-09T00:00:00+08:00'
completedAt: '2026-07-09T00:00:00+08:00'
labels: ['frontend', 'invite', 'guest']
depends_on: ['t13-public-invite-api', 't26-invite-public-event-page']
order: 'a27'
---

# t27-invite-guest-event-page - Personalized guest invitation page

## Hierarchy

- Epic: `frontend`
- Dependencies: `t13-public-invite-api`, `t26-invite-public-event-page`

## Scope

Implement the guest invite route that validates a guest token and renders RSVP-enabled event content.

## Suggested Agent

- Suggested model: `GPT-5.5`
- Reasoning level: `extra high`

## Acceptance

- [x] `/e/[eventSlug]/g/[guestToken]` fetches personalized invite data.
- [x] Valid guest groups see public plus guest-only sections.
- [x] Invalid, disabled, expired, and RSVP-closed states are handled.
- [x] Guest group label and max pax are visible where useful.
- [x] Theme rendering remains consistent with the public page.
- [x] Tests cover valid guest page, invalid token, disabled group, and guest-only section visibility.

## UI Quality Checklist

- [x] Uses Tailwind tokens and project-owned primitives before adding a component library.
- [x] Follows color, shape, and theme locks from `SKILL.md`.
- [x] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [x] Works on required mobile and desktop viewport widths.
- [x] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [x] Avoids generic AI-slop patterns listed in `SKILL.md`.

## Notes

Do not show other guest groups or manager-only data.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
- 2026-07-09T00:00:00+08:00: Started as the next unblocked task after public invite completion; promoted from backlog because no lower-order todo tasks were available and dependencies are complete.
- 2026-07-09T00:00:00+08:00: Implemented the API-backed guest route, guest context panel, guest-only section rendering, RSVP placeholder, invalid/disabled unavailable states, and route tests. Expired links are represented through the current 404 unavailable path, and RSVP-closed copy is handled for 403 RSVP API errors because the guest invite fetch response does not expose separate expiry or closed fields yet.
