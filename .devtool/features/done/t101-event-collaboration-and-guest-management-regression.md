---
id: 't101-event-collaboration-and-guest-management-regression'
status: 'done'
priority: 'high'
assignee: null
epic: 'quality'
dueDate: null
created: '2026-07-18T00:00:00Z'
modified: '2026-07-18T19:23:30+08:00'
completedAt: '2026-07-18T19:23:30+08:00'
labels: ['testing', 'integration', 'security', 'regression']
depends_on: ['t90-rsvp-attendee-checkbox-validation', 't91-invite-map-performance-and-zoom-bounds', 't92-dashboard-event-switcher', 't94-event-role-access-control', 't95-dashboard-content-detail-modal', 't96-dashboard-guest-filter-and-sort', 't97-dashboard-guest-view-modes', 't98-dashboard-guest-invite-link-actions', 't99-dashboard-guest-data-export', 't100-dashboard-response-view-modes']
order: 'a101'
---

# t101-event-collaboration-and-guest-management-regression - Event collaboration and guest management regression suite

## Hierarchy

- Epic: `quality`
- Dependencies: `t90-rsvp-attendee-checkbox-validation`, `t91-invite-map-performance-and-zoom-bounds`, `t92-dashboard-event-switcher`, `t94-event-role-access-control`, `t95-dashboard-content-detail-modal`, `t96-dashboard-guest-filter-and-sort`, `t97-dashboard-guest-view-modes`, `t98-dashboard-guest-invite-link-actions`, `t99-dashboard-guest-data-export`, `t100-dashboard-response-view-modes`

## Scope

Run a focused release regression pass over event switching, collaborator access, named-attendee RSVP, guest filtering/views/link actions/export, response views and attendee details, content editing, and map loading. Reuse the repository's existing test files and smoke tooling; do not introduce a new E2E framework or standalone test suite.

## Suggested Agent

- Suggested model: `GPT-5.6 Sol (gpt-5.6-sol)`
- Reasoning level: `xhigh`

## Acceptance

- [x] Integration tests cover two managers with different roles across at least two events.
- [x] Tests prove that event switching never leaks guest, response, content, notification, or analytics data between events.
- [x] Existing RSVP tests cover structured attendee selection, legacy-name fallback, decline flow, and max-pax enforcement.
- [x] Existing guest workspace tests cover filtering, sorting, both views, open/copy link actions, and CSV/XLSX export authorization.
- [x] Existing response tests cover both views and prove selected attendee details match the stored response without changing established event-summary totals.
- [x] Existing map tests confirm persisted coordinates, deferred third-party loading, fallback content, and safe directions links.
- [x] Permission and export tests cover unauthorized access, role changes, removed collaborators, and audit records.

## Notes

Follow the repository rule to stop creating new test files. Extend affected existing Vitest coverage only where behavior changed, then run the established regression and browser smoke commands already documented by the project.

## Progress Log

- 2026-07-18T00:00:00Z: Task created.
- 2026-07-18T13:12:11+08:00: Reworked the generated suite proposal into a regression pass over existing tests and aligned the requested guest/response views with structured members and legacy records.
- 2026-07-18T19:15:00+08:00: Started the regression audit after confirming all dependencies are complete. Reusing existing test files and smoke tooling as required.
- 2026-07-18T19:23:30+08:00: Added cross-event API isolation coverage for two managers across owner, editor, and viewer roles; verified guest, response, content, notification, summary, and activity payloads remain event-scoped. Extended existing dashboard tests for workspace-preserving event links, viewer-authorized CSV/XLSX actions, stored attendee details, and unchanged summary group totals. API (100), dashboard (102), invite (37), and theme (26) tests pass, along with affected typechecks, formatting, and ownership-boundary checks.
