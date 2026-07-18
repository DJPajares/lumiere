---
id: 't90-rsvp-attendee-checkbox-validation'
status: 'done'
priority: 'high'
assignee: null
epic: 'rsvp'
dueDate: null
created: '2026-07-18T00:00:00Z'
modified: '2026-07-18T13:29:44+08:00'
completedAt: '2026-07-18T13:29:44+08:00'
labels: ['invite', 'rsvp', 'validation', 'accessibility']
depends_on: ['t89-guest-group-member-fields', 't70-rsvp-response-field-settings']
order: 'a90'
---

# t90-rsvp-attendee-checkbox-validation - RSVP attendee checkbox validation

## Hierarchy

- Epic: `rsvp`
- Dependencies: `t89-guest-group-member-fields`, `t70-rsvp-response-field-settings`

## Scope

Extend the existing custom RSVP form for guest groups that have structured named members. When guest-name capture is enabled, guests choose their attending-party size with the current pax control and then check exactly that many named members. Preserve the current free-text-name flow for legacy groups that do not yet have structured members.

## Suggested Agent

- Suggested model: `GPT-5.6 Terra (gpt-5.6-terra)`
- Reasoning level: `high`

## Acceptance

- [x] Named group members render as accessible checkboxes when `collectGuestNames` is enabled and structured members are present.
- [x] The number of checked members must equal the selected attending-party size before an attending response can be submitted.
- [x] Reducing the party size does not silently choose who is removed; extra selections remain visible with a clear prompt to deselect.
- [x] Declined responses do not require attendee-name selection.
- [x] Legacy groups without structured members retain the existing attendee-count and free-text guest-name behavior.
- [x] Existing submitted responses initialize the structured selection where stored names match current members without inventing selections for unmatched names.
- [x] Inline validation is announced to assistive technologies and explains any required selection or stale-response mismatch.
- [x] Invite components remain fully custom and do not import shadcn, Base UI, or dashboard UI packages.

## Notes

Newly created or edited groups now keep the structured member count aligned with max pax. The legacy fallback is still required for records created before that behavior. Keep common RSVP behavior in shared invite components; theme-specific copy or presentation must come from `packages/themes` through the existing theme contract.

## Progress Log

- 2026-07-18T00:00:00Z: Task created.
- 2026-07-18T13:12:11+08:00: Reconciled the task with the max-pax-driven member editor and the existing RSVP count/name flow; retained explicit pax-versus-checkbox validation and a legacy-record fallback.
- 2026-07-18T13:21:48+08:00: Started after confirming t89 and t70 are complete; extending the current public guest context and custom RSVP renderer without changing the invitation component boundary.
- 2026-07-18T13:29:44+08:00: Completed structured named-member checkboxes, exact pax validation, non-destructive count changes, saved-response matching/stale-name recovery, accessible inline errors, and legacy text-input compatibility. Verified 36 invite tests, 88 API tests, direct typechecks across affected dependents, theme/UI boundaries, formatting, diff checks, and the invite production build.
