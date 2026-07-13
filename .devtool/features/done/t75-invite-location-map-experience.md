---
id: 't75-invite-location-map-experience'
status: 'done'
priority: 'high'
assignee: null
epic: 'full-stack'
dueDate: null
created: '2026-07-13T09:00:00+08:00'
modified: '2026-07-13T17:13:00+08:00'
completedAt: '2026-07-13T17:13:00+08:00'
labels: ['invite', 'location', 'maps', 'external-links', 'themes', 'api']
depends_on: ['t11-theme-and-section-api', 't28-invite-section-renderers', 't64-invite-theme-module-directory-refactor']
order: 'a75'
---

# t75-invite-location-map-experience - Show an actual event map and open directions in a new tab

## Hierarchy

- Epic: `full-stack`
- Dependencies: `t11-theme-and-section-api`, `t28-invite-section-renderers`, `t64-invite-theme-module-directory-refactor`

## Scope

Upgrade location sections to display a real map or map preview and ensure the Open Map action launches an external mapping destination in a new tab. Normalize location/map data so all themes can render the same safe location contract with theme-specific presentation.

## Suggested Agent

- Suggested model: `GPT-5.6 Terra (gpt-5.6-terra)`
- Reasoning level: `high`

## Acceptance

- [x] Location content supports a normalized address plus optional latitude/longitude, place identifier, embed URL, and directions URL as required by the selected provider strategy.
- [x] The invite location section renders an actual map/embed or approved static map preview when valid map data exists.
- [x] The Open Map action opens in a new tab with `target="_blank"` and `rel="noopener noreferrer"`.
- [x] Map and directions URLs are generated or validated server-side against an allowlist rather than accepting arbitrary executable URLs.
- [x] The map has an accessible title/label and a non-map fallback showing the address and directions action.
- [x] Map loading is lazy, responsive, and does not block the initial invite render or cause major layout shift.
- [x] Theme modules own map framing, overlays, and ornamental treatment; the invite app contains no theme-ID branches.
- [x] Tests cover valid/invalid map data, external-link attributes, no-map fallback, responsive layout, and at least two themes.

## UI Quality Checklist

- [x] Dashboard controls use `@lumiere/dashboard-ui` shadcn/Base UI primitives where applicable.
- [x] Invite and theme visuals remain fully custom and contain no shadcn/Base UI imports.
- [x] Loading, empty, error, success, disabled, focus, hover, and active states are handled where relevant.
- [x] Mobile, tablet, and desktop behavior is explicitly verified.
- [x] Keyboard, screen-reader, contrast, focus-management, and reduced-motion basics are covered.
- [x] The result follows `SKILL.md` and avoids generic AI-dashboard or invitation-template patterns.

## Notes

Choose the provider/embed strategy during implementation based on existing configuration and privacy/cost constraints. An iframe is not an `<img>` and is outside the Next Image migration.

## Progress Log

- 2026-07-13T09:00:00+08:00: Task created from dashboard and invite follow-up review.
- 2026-07-13T17:01:00+08:00: Started T75 after confirming dependencies; selected a no-key provider strategy with server-normalized Google Maps directions URLs, coordinate-driven lazy OpenStreetMap embeds, safe fallbacks, and theme-owned map presentation hooks.
- 2026-07-13T17:13:00+08:00: Completed normalized location fields and dashboard editing, HTTPS provider allowlists, server-side URL sanitization/generation, coordinate-driven OpenStreetMap embeds, safe Google Maps directions, accessible fallbacks and attribution, and theme-owned aspect/frame/overlay hooks.
- 2026-07-13T17:13:00+08:00: Verified full workspace typecheck, tests, lint placeholders, targeted Prettier and dependency boundaries; API, invite, and dashboard production builds; and the invite UI pre-flight. Next.js builds required permitted unsandboxed reruns because Turbopack binds an internal CSS worker port.
