---
id: 't91-invite-map-performance-and-zoom-bounds'
status: 'backlog'
priority: 'medium'
assignee: null
epic: 'invite-experience'
dueDate: null
created: '2026-07-18T00:00:00Z'
modified: '2026-07-18T13:12:11+08:00'
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

Harden the existing no-key, coordinate-driven OpenStreetMap embed. Avoid adding a geocoding pipeline that the app does not currently need, defer third-party map loading until useful, and prevent an unbounded interactive map from becoming the primary invite experience. Keep the safe external directions action as the reliable fallback.

## Suggested Agent

- Suggested model: `GPT-5.6 Terra (gpt-5.6-terra)`
- Reasoning level: `high`

## Acceptance

- [ ] Invite rendering continues to use persisted location-section coordinates or an approved embed URL and makes no client-side geocoding request.
- [ ] The current server-normalized location contract and coordinate-derived OpenStreetMap bounding box remain the single source for map and directions URLs.
- [ ] The third-party iframe is not loaded before the location section approaches the viewport; a user-initiated load is acceptable if it produces a clearer fallback.
- [ ] If the no-key embed cannot enforce useful zoom bounds, it remains a bounded preview rather than exposing unrestricted map interaction.
- [ ] The venue name, address, and directions action remain usable before and without iframe initialization.
- [ ] External directions continue to open in a new tab with safe link attributes.
- [ ] Existing map tests are updated to cover deferred loading, the persisted-coordinate path, fallback content, and safe external links.

## Notes

The current implementation already uses `loading="lazy"`, persisted coordinates, normalized URLs, and no provider secret. Improve actual network deferral without introducing speculative caching, place-resolution APIs, or a client-visible key.

## Progress Log

- 2026-07-18T00:00:00Z: Task created.
- 2026-07-18T13:12:11+08:00: Reframed the task around the existing no-key OpenStreetMap embed and removed assumptions about repeated geocoding requests or a new coordinate cache.
