---
id: 't27-invite-guest-event-page'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-07T00:00:00+08:00'
completedAt: null
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

- [ ] `/e/[eventSlug]/g/[guestToken]` fetches personalized invite data.
- [ ] Valid guest groups see public plus guest-only sections.
- [ ] Invalid, disabled, expired, and RSVP-closed states are handled.
- [ ] Guest group label and max pax are visible where useful.
- [ ] Theme rendering remains consistent with the public page.
- [ ] Tests cover valid guest page, invalid token, disabled group, and guest-only section visibility.

## UI Quality Checklist

- [ ] Uses Tailwind tokens and project-owned primitives before adding a component library.
- [ ] Follows color, shape, and theme locks from `SKILL.md`.
- [ ] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [ ] Works on required mobile and desktop viewport widths.
- [ ] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [ ] Avoids generic AI-slop patterns listed in `SKILL.md`.

## Notes

Do not show other guest groups or manager-only data.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
