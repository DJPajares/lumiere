---
id: 't29-invite-rsvp-form-flow'
status: 'done'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-09T14:01:38+08:00'
completedAt: '2026-07-09T14:01:38+08:00'
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

- [x] RSVP form appears only for valid guest contexts and RSVP-enabled events.
- [x] Attendee count cannot exceed max pax.
- [x] Form validates required fields and shows field-level errors.
- [x] Submission calls the RSVP API and shows confirmation.
- [x] Recoverable errors preserve entered data.
- [x] Tests cover attending, not attending, max pax, validation error, submit success, and submit failure.

## UI Quality Checklist

- [x] Uses Tailwind tokens and project-owned primitives before adding a component library.
- [x] Follows color, shape, and theme locks from `SKILL.md`.
- [x] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [x] Works on required mobile and desktop viewport widths.
- [x] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [x] Avoids generic AI-slop patterns listed in `SKILL.md`.

## Notes

The form must feel integrated with the invitation design, not like a dashboard form.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
- 2026-07-09T13:55:00+08:00: Started implementation of the guest RSVP form flow using the existing public submit RSVP API client.
- 2026-07-09T14:01:38+08:00: Completed the guest RSVP form flow with attendee count, guest names, custom answers, message, API submission, confirmation, validation, recoverable error handling, and focused helper/route tests.
