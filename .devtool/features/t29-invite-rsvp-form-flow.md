---
id: 't29-invite-rsvp-form-flow'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-07T00:00:00+08:00'
completedAt: null
labels: ['frontend', 'rsvp', 'forms']
depends_on: ['t14-rsvp-api', 't27-invite-guest-event-page']
order: 'a29'
---

# t29-invite-rsvp-form-flow - Guest RSVP form flow

## Hierarchy

- Epic: `frontend`
- Dependencies: `t14-rsvp-api`, `t27-invite-guest-event-page`

## Scope

Implement RSVP form UI on guest invite pages with attendee count, guest names, custom answers, message, submission, and confirmation.

## Suggested Agent

- Suggested model: `GPT-5.5`
- Reasoning level: `extra high`

## Acceptance

- [ ] RSVP form appears only for valid guest contexts and RSVP-enabled events.
- [ ] Attendee count cannot exceed max pax.
- [ ] Form validates required fields and shows field-level errors.
- [ ] Submission calls the RSVP API and shows confirmation.
- [ ] Recoverable errors preserve entered data.
- [ ] Tests cover attending, not attending, max pax, validation error, submit success, and submit failure.

## UI Quality Checklist

- [ ] Uses Tailwind tokens and project-owned primitives before adding a component library.
- [ ] Follows color, shape, and theme locks from `SKILL.md`.
- [ ] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [ ] Works on required mobile and desktop viewport widths.
- [ ] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [ ] Avoids generic AI-slop patterns listed in `SKILL.md`.

## Notes

The form must feel integrated with the invitation design, not like a dashboard form.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
