---
id: 't40-rsvp-flow-delight-and-recovery'
status: 'done'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-09T19:52:40+08:00'
completedAt: '2026-07-09T19:52:40+08:00'
labels: ['invite', 'rsvp', 'forms', 'uiux']
depends_on: ['t14-rsvp-api', 't27-invite-guest-event-page', 't29-invite-rsvp-form-flow']
order: 'a40'
---

# t40-rsvp-flow-delight-and-recovery - RSVP flow delight and recovery

## Hierarchy

- Epic: `frontend`
- Dependencies: `t14-rsvp-api`, `t27-invite-guest-event-page`, `t29-invite-rsvp-form-flow`

## Scope

Polish the guest RSVP flow so it feels integrated into Lumiere invitations, handles edge cases gracefully, and preserves guest confidence when errors occur.

## Suggested Agent

- Suggested model: `GPT-5.5`
- Reasoning level: `high`

## Acceptance

- [x] RSVP form clearly shows guest group name, max pax, RSVP status, and who the response applies to.
- [x] Attending, not attending, updating, closed, expired, disabled, and already-submitted states have distinct UI treatments.
- [x] Recoverable errors preserve form input and show contextual field messages.
- [x] Success state feels celebratory without noisy confetti or excessive motion by default.
- [x] Motion respects reduced-motion settings and does not block form completion.
- [x] Tests or stories cover primary RSVP states and error recovery states.

## UI Quality Checklist

- [x] Uses Tailwind tokens and project-owned primitives before adding a component library.
- [x] Follows Lumiere color, shape, brand, and theme locks from `SKILL.md`.
- [x] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [x] Works on required mobile and desktop viewport widths.
- [x] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [x] Avoids generic AI-slop patterns listed in `SKILL.md`.

## Notes

Do not make RSVP feel like a generic survey. It should feel like part of the invitation.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
- 2026-07-09T19:47:18+08:00: Started RSVP delight and recovery pass by reviewing `SKILL.md`, current invite RSVP form, public invite RSVP integration, API rejection reasons, guest disabled routing, and existing RSVP helper tests.
- 2026-07-09T19:52:40+08:00: Completed RSVP flow polish by adding invitation-native reply status panels, already-submitted update copy, distinct blocked states for closed/expired/disabled/unavailable/rate-limited RSVP failures, quieter success treatment, disabled locked states, and tests for primary reply/recovery states.
