---
id: 't40-rsvp-flow-delight-and-recovery'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-07T00:00:00+08:00'
completedAt: null
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

- [ ] RSVP form clearly shows guest group name, max pax, RSVP status, and who the response applies to.
- [ ] Attending, not attending, updating, closed, expired, disabled, and already-submitted states have distinct UI treatments.
- [ ] Recoverable errors preserve form input and show contextual field messages.
- [ ] Success state feels celebratory without noisy confetti or excessive motion by default.
- [ ] Motion respects reduced-motion settings and does not block form completion.
- [ ] Tests or stories cover primary RSVP states and error recovery states.

## UI Quality Checklist

- [ ] Uses Tailwind tokens and project-owned primitives before adding a component library.
- [ ] Follows Lumiere color, shape, brand, and theme locks from `SKILL.md`.
- [ ] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [ ] Works on required mobile and desktop viewport widths.
- [ ] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [ ] Avoids generic AI-slop patterns listed in `SKILL.md`.

## Notes

Do not make RSVP feel like a generic survey. It should feel like part of the invitation.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
