---
id: 't89-guest-group-member-fields'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'guest-management'
dueDate: null
created: '2026-07-18T00:00:00Z'
modified: '2026-07-18T00:00:00Z'
completedAt: null
labels: ['dashboard', 'guests', 'forms', 'data-model']
depends_on: ['t62-dashboard-responsive-modal-workflows', 't70-rsvp-response-field-settings']
order: 'a89'
---

# t89-guest-group-member-fields - Guest group member fields

## Hierarchy

- Epic: `guest-management`
- Dependencies: `t62-dashboard-responsive-modal-workflows`, `t70-rsvp-response-field-settings`

## Scope

Replace the single free-form guest-name experience with a structured guest-group member editor in the dashboard. Managers can add, rename, reorder, and remove multiple named members within one guest group while preserving the group-level maximum party size and invite link.

## Suggested Agent

- Suggested model: `GPT-5.6 Terra (gpt-5.6-terra)`
- Reasoning level: `high`

## Acceptance

- [ ] Guest groups support zero or more structured member records instead of relying on one combined name string.
- [ ] Dashboard create/edit guest-group workflows provide repeatable guest-name fields with add, remove, and reorder actions.
- [ ] Validation prevents blank duplicate rows and enforces the configured maximum party size.
- [ ] Existing guest groups without structured names remain editable through a documented migration or compatibility path.
- [ ] Dashboard implementation uses shadcn/Base UI only within dashboard-owned components.
- [ ] API and database tests cover create, update, reorder, removal, and maximum-party-size validation.

## Notes

Store names as structured child records or a clearly versioned ordered structure. Do not expose dashboard component-library code to `apps/invite` or `packages/themes`.

## Progress Log

- 2026-07-18T00:00:00Z: Task created.
