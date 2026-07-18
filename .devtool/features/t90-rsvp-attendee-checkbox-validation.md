---
id: 't90-rsvp-attendee-checkbox-validation'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'rsvp'
dueDate: null
created: '2026-07-18T00:00:00Z'
modified: '2026-07-18T00:00:00Z'
completedAt: null
labels: ['invite', 'rsvp', 'validation', 'accessibility']
depends_on: ['t89-guest-group-member-fields', 't70-rsvp-response-field-settings']
order: 'a90'
---

# t90-rsvp-attendee-checkbox-validation - RSVP attendee checkbox validation

## Hierarchy

- Epic: `rsvp`
- Dependencies: `t89-guest-group-member-fields`, `t70-rsvp-response-field-settings`

## Scope

Add an accessible attendee-selection step to the custom invite RSVP flow. When a group has named members and guest-name capture is enabled, each member is represented by a checkbox. The checked attendee count must agree with the selected number of guests before submission.

## Suggested Agent

- Suggested model: `GPT-5.6 Terra (gpt-5.6-terra)`
- Reasoning level: `high`

## Acceptance

- [ ] Named group members render as accessible checkboxes in the invite RSVP form when enabled for the event.
- [ ] The number of checked names must equal the selected attending-party size before an attending response can be submitted.
- [ ] Selecting a smaller party size prompts the guest to deselect extra names rather than silently changing selections.
- [ ] Declined responses do not require attendee-name selection.
- [ ] Unnamed additional guests are handled through an explicit, documented fallback when the allowed party size exceeds named members.
- [ ] Inline validation clearly explains mismatches and is announced to assistive technologies.
- [ ] Invite components remain fully custom and do not import shadcn, Base UI, or dashboard UI packages.

## Notes

Keep common RSVP behavior in shared invite components. Theme-specific copy or presentation must come from `packages/themes` through the existing theme contract.

## Progress Log

- 2026-07-18T00:00:00Z: Task created.
