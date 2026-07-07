---
id: 't14-rsvp-api'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'api'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-07T00:00:00+08:00'
completedAt: null
labels: ['api', 'rsvp', 'guests']
depends_on: ['t13-public-invite-api']
order: 'a14'
---

# t14-rsvp-api - RSVP submission API

## Hierarchy

- Epic: `api`
- Dependencies: `t13-public-invite-api`

## Scope

Implement guest RSVP submission/update behavior through the public guest invite endpoint.

## Suggested Agent

- Suggested model: `GPT-5.5`
- Reasoning level: `extra high`

## Acceptance

- [ ] `POST /public/events/:eventSlug/guest/:guestToken/rsvp` validates guest token and RSVP settings.
- [ ] Attendee count cannot exceed guest group max pax.
- [ ] Responses support attending, not attending, and maybe if enabled.
- [ ] Submission creates or updates RSVP response according to MVP policy.
- [ ] Activity event is created after RSVP submission.
- [ ] Tests cover max pax, closed RSVP, invalid token, attending, not attending, and update behavior.

## Notes

Document whether updates are allowed in MVP. Default assumption: guests can update while RSVP is open.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
