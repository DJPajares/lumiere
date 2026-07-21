---
id: 't110-invite-home-demo-event-gallery'
status: 'todo'
priority: 'high'
assignee: null
epic: 'invite-discovery'
dueDate: null
created: '2026-07-22T01:10:41+08:00'
modified: '2026-07-22T01:22:35+08:00'
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

- [ ] The invite home has an obvious `View demo events` action that reveals or leads to the three curated seeded events.
- [ ] Each demo shows enough public context to distinguish wedding, kids birthday, and launch experiences, then navigates to the real `/e/[eventSlug]` route.
- [ ] The home consumes the typed curated demo catalog from t109 and contains no guest tokens, manager-only fields, or duplicated full event payloads.
- [ ] Missing/unseeded demo data is handled with a restrained unavailable state and setup guidance; one missing event does not break the other entries.
- [ ] The page works at 390px, 768px, and 1440px, has accessible focus and labels, and does not become a generic centered hero plus three indistinguishable cards.
- [ ] Metadata and robots behavior remain appropriate for the app root and public demo routes.
- [ ] Relevant existing invite route tests, typecheck, formatting, lint, and the `SKILL.md` UI pre-flight review pass.

## Notes

The demos are an explicit showcase, not a searchable directory. Use event-specific art direction and concise copy without competing with the invitations themselves.

## Progress Log

- 2026-07-22T01:10:41+08:00: Task created for a real seeded-demo entry point on the invite home URL.
