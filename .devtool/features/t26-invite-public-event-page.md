---
id: 't26-invite-public-event-page'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-07T00:00:00+08:00'
completedAt: null
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

- [ ] `/e/[eventSlug]` fetches public event data.
- [ ] Configured public sections render through the theme registry.
- [ ] RSVP and guest-only sections are hidden.
- [ ] Event not found, unpublished, and archived states are handled.
- [ ] Theme mode and selected design are applied.
- [ ] Tests cover public sections, hidden RSVP, and not-found state.

## UI Quality Checklist

- [ ] Uses Tailwind tokens and project-owned primitives before adding a component library.
- [ ] Follows color, shape, and theme locks from `SKILL.md`.
- [ ] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [ ] Works on required mobile and desktop viewport widths.
- [ ] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [ ] Avoids generic AI-slop patterns listed in `SKILL.md`.

## Notes

This page should feel complete even without guest personalization.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
