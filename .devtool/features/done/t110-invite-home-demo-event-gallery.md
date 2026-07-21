---
id: 't110-invite-home-demo-event-gallery'
status: 'done'
priority: 'high'
assignee: null
epic: 'invite-discovery'
dueDate: null
created: '2026-07-22T01:10:41+08:00'
modified: '2026-07-22T02:30:30+08:00'
labels: ['invite', 'home', 'demo', 'navigation', 'frontend']
depends_on: ['t109-invite-demo-event-seed-catalog', 't26-invite-public-event-page']
order: 'a110'
---

# t110-invite-home-demo-event-gallery - Open seeded demos from the invite home

## Hierarchy

- Epic: `invite-discovery`
- Dependencies: `t109-invite-demo-event-seed-catalog`, `t26-invite-public-event-page`

## Scope

Replace the invite root's placeholder launch-night links with a clear demo entry point backed by the seeded wedding, kids birthday party, and launch events. Let a visitor choose a demo and open the real public event route while keeping the root page compact and brand-led.

## Suggested Agent

- Suggested model: `GPT-5.6 Terra (gpt-5.6-terra)`
- Reasoning level: `high`

## Acceptance

- [x] The invite home has an obvious `View demo events` action that reveals or leads to the three curated seeded events.
- [x] Each demo shows enough public context to distinguish wedding, kids birthday, and launch experiences, then navigates to the real `/e/[eventSlug]` route.
- [x] The home consumes the typed curated demo catalog from t109 and contains no guest tokens, manager-only fields, or duplicated full event payloads.
- [x] Missing/unseeded demo data is handled with a restrained unavailable state and setup guidance; one missing event does not break the other entries.
- [x] The page works at 390px, 768px, and 1440px, has accessible focus and labels, and does not become a generic centered hero plus three indistinguishable cards.
- [x] Metadata and robots behavior remain appropriate for the app root and public demo routes.
- [x] Relevant existing invite route tests, typecheck, formatting, lint, and the `SKILL.md` UI pre-flight review pass.

## Notes

The demos are an explicit showcase, not a searchable directory. Use event-specific art direction and concise copy without competing with the invitations themselves.

## Progress Log

- 2026-07-22T01:10:41+08:00: Task created for a real seeded-demo entry point on the invite home URL.
- 2026-07-22T02:25:00+08:00: Started from the t109 public-only catalog contract. The root will check each curated public event independently, keep available demos navigable when another is missing, and show seed guidance without introducing a public event-directory API or exposing guest links.
- 2026-07-22T02:30:30+08:00: Replaced the placeholder root with a brand-led, responsive gallery that resolves the typed t109 demo catalog against public event summaries. Ready entries open `/e/[eventSlug]`; unavailable entries remain non-interactive and show independent seed guidance, with no guest links or manager data.
- 2026-07-22T02:30:30+08:00: Added root-specific metadata and robots directives, event-specific art direction, accessible labels and focus treatment, and layouts reviewed for 390px, 768px, and 1440px. The browser backend was unavailable, so UI pre-flight used the compiled live route, rendered HTML, and responsive class inspection.
- 2026-07-22T02:30:30+08:00: Verification passed: all 37 existing invite tests, invite TypeScript typecheck, invite lint task, live root/API smoke checks, and `git diff --check`. No Prettier command was run, per the current repository instructions.
