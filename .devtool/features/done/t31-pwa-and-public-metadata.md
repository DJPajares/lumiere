---
id: 't31-pwa-and-public-metadata'
status: 'done'
priority: 'medium'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-09T14:33:30+08:00'
completedAt: '2026-07-09T14:33:30+08:00'
labels: ['frontend', 'pwa', 'metadata']
depends_on: ['t26-invite-public-event-page', 't27-invite-guest-event-page']
order: 'a31'
---

# t31-pwa-and-public-metadata - PWA and public metadata polish

## Hierarchy

- Epic: `frontend`
- Dependencies: `t26-invite-public-event-page`, `t27-invite-guest-event-page`

## Scope

Polish PWA metadata, install behavior, Lumiere brand icons, Open Graph metadata, robots/noindex defaults, and public page sharing behavior for both public invite and dashboard apps.

## Suggested Agent

- Suggested model: `GPT-5.4-mini`
- Reasoning level: `medium`

## Acceptance

- [x] Invite app has Lumiere main app manifest, icons, and mobile-friendly metadata.
- [x] Dashboard app has Lumiere Dashboard favicon, manifest, and app metadata.
- [x] Public event pages generate appropriate title and description metadata.
- [x] Guest-token URLs are noindex by default.
- [x] Generic event URLs follow the documented indexing policy.
- [x] Share previews avoid leaking private guest context.
- [x] PWA icon paths align with the final `public/` folder placement for both apps.
- [x] Smoke checks verify metadata on public and guest pages.

## UI Quality Checklist

- [x] Uses Tailwind tokens and project-owned primitives before adding a component library.
- [x] Follows color, shape, and theme locks from `SKILL.md`.
- [x] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [x] Works on required mobile and desktop viewport widths.
- [x] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [x] Avoids generic AI-slop patterns listed in `SKILL.md`.

## Notes

Open question: whether generic public event pages should be indexable. Default safely to noindex until product decision is made.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
- 2026-07-09T14:28:46+08:00: Started metadata/PWA pass for invite and dashboard apps, including noindex policy and route smoke coverage.
- 2026-07-09T14:33:30+08:00: Completed app manifest/icon metadata, safe noindex public/guest route metadata, guest privacy-safe share previews, and metadata smoke tests.
