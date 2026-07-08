---
id: "t14-rsvp-api"
status: "done"
priority: "high"
assignee: null
epic: "api"
dueDate: null
created: "2026-07-07T00:00:00+08:00"
modified: "2026-07-07T00:00:00+08:00"
completedAt: "2026-07-08T19:55:00+08:00"
labels: ["api", "rsvp", "guests"]
depends_on: ["t13-public-invite-api"]
order: "a14"
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

- [x] `POST /public/events/:eventSlug/guest/:guestToken/rsvp` validates guest token and RSVP settings.
- [x] Attendee count cannot exceed guest group max pax.
- [x] Responses support attending, not attending, and maybe if enabled.
- [x] Submission creates or updates RSVP response according to MVP policy.
- [x] Activity event is created after RSVP submission.
- [x] Tests cover max pax, closed RSVP, invalid token, attending, not attending, and update behavior.

## Notes

Document whether updates are allowed in MVP. Default assumption: guests can update while RSVP is open.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
- 2026-07-08T15:30:00+08:00: Started RSVP submission endpoint, store, activity side effect, and route tests. MVP assumption: guests can update while RSVP is open.
- 2026-07-08T19:55:00+08:00: Completed RSVP submission route and store. MVP policy: guests can update while RSVP is open unless `rsvpSettings.allowUpdates` is `false`; `maybe` requires `rsvpSettings.allowMaybe`; RSVP closes when `enabled` is `false`, `closed` is `true`, or `closesAt` is in the past.
