---
id: 't101-event-collaboration-and-guest-management-regression'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'quality'
dueDate: null
created: '2026-07-18T00:00:00Z'
modified: '2026-07-18T00:00:00Z'
completedAt: null
labels: ['testing', 'integration', 'security', 'regression']
depends_on: ['t90-rsvp-attendee-checkbox-validation', 't91-invite-map-performance-and-zoom-bounds', 't92-dashboard-event-switcher', 't94-event-role-access-control', 't95-dashboard-content-detail-modal', 't97-dashboard-guest-view-modes', 't98-dashboard-guest-invite-link-actions', 't99-dashboard-guest-data-export', 't100-dashboard-response-view-modes']
order: 'a101'
---

# t101-event-collaboration-and-guest-management-regression - Event collaboration and guest management regression suite

## Hierarchy

- Epic: `quality`
- Dependencies: `t90-rsvp-attendee-checkbox-validation`, `t91-invite-map-performance-and-zoom-bounds`, `t92-dashboard-event-switcher`, `t94-event-role-access-control`, `t95-dashboard-content-detail-modal`, `t97-dashboard-guest-view-modes`, `t98-dashboard-guest-invite-link-actions`, `t99-dashboard-guest-data-export`, `t100-dashboard-response-view-modes`

## Scope

Add cross-layer regression coverage for event switching, multi-admin access, named attendee RSVP validation, guest management views, exports, content modals, and map behavior.

## Suggested Agent

- Suggested model: `GPT-5.6 Sol (gpt-5.6-sol)`
- Reasoning level: `xhigh`

## Acceptance

- [ ] Integration tests cover two managers with different roles across at least two events.
- [ ] Tests prove that event switching never leaks guest, response, content, notification, or analytics data between events.
- [ ] RSVP tests cover named attendees, party-size mismatch, decline flow, and unnamed additional-guest fallback.
- [ ] Guest directory tests cover filtering, sorting, both view modes, open/copy link actions, and exports.
- [ ] Response view totals match the underlying filtered data.
- [ ] Map tests confirm coordinates are reused and interactive requests are not made on every page render.
- [ ] Permission and export tests cover unauthorized access, role changes, removed collaborators, and audit records.

## Notes

Use Vitest for unit/API/integration coverage where practical. Add browser-level smoke coverage for the most important dashboard and invite flows using the repository's selected E2E tool.

## Progress Log

- 2026-07-18T00:00:00Z: Task created.
