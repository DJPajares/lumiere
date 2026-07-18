---
id: 't91-invite-map-performance-and-zoom-bounds'
status: 'backlog'
priority: 'medium'
assignee: null
epic: 'invite-experience'
dueDate: null
created: '2026-07-18T00:00:00Z'
modified: '2026-07-18T00:00:00Z'
completedAt: null
labels: ['invite', 'map', 'performance', 'location']
depends_on: ['t75-invite-location-map-experience']
order: 'a91'
---

# t91-invite-map-performance-and-zoom-bounds - Invite map performance and zoom bounds

## Hierarchy

- Epic: `invite-experience`
- Dependencies: `t75-invite-location-map-experience`

## Scope

Reduce map-related API usage and prevent guests from zooming out beyond a useful event-location range. Load the interactive map only when needed, reuse resolved coordinates, and apply bounded viewport behavior without blocking external directions links.

## Suggested Agent

- Suggested model: `GPT-5.6 Terra (gpt-5.6-terra)`
- Reasoning level: `high`

## Acceptance

- [ ] Geocoding or place-resolution requests are performed server-side or during event-location save, not on every invite render.
- [ ] Resolved coordinates and normalized map metadata are persisted or cached for reuse.
- [ ] The interactive map is lazy-loaded only when the location section approaches the viewport or the guest requests it.
- [ ] Map configuration defines a minimum zoom or geographic bounds that prevent excessive zoom-out.
- [ ] The map still supports useful local pan and zoom interactions around the venue.
- [ ] External directions continue to open in a new tab with safe link attributes.
- [ ] Tests verify request deduplication, cached coordinates, lazy loading, and zoom-bound configuration.

## Notes

Prefer a static preview or lightweight placeholder before interactive map initialization. Avoid exposing provider secrets in the invite client.

## Progress Log

- 2026-07-18T00:00:00Z: Task created.
