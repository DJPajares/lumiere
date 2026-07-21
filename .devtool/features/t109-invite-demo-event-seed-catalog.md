---
id: 't109-invite-demo-event-seed-catalog'
status: 'todo'
priority: 'high'
assignee: null
epic: 'invite-discovery'
dueDate: null
created: '2026-07-22T01:10:41+08:00'
modified: '2026-07-22T01:10:41+08:00'
labels: ['invite', 'database', 'seed', 'demo', 'events']
depends_on: ['t30-initial-theme-implementations', 't45-event-type-section-blueprints', 't73-event-publishing-workflow']
order: 'a109'
---

# t109-invite-demo-event-seed-catalog - Seed the invite demo event catalog

## Hierarchy

- Epic: `invite-discovery`
- Dependencies: `t30-initial-theme-implementations`, `t45-event-type-section-blueprints`, `t73-event-publishing-workflow`

## Scope

Expand the current single-event demo seed into an idempotent catalog of three published events: a wedding, a kids birthday party, and a launch event. Give each event complete, event-appropriate content and a compatible theme so the invite home screen can link to real public invitation data rather than placeholder routes.

## Acceptance

- [ ] `pnpm db:seed` creates or replaces deterministic wedding, kids birthday party, and launch demo events without duplicating managers, memberships, events, sections, publications, or related demo records across repeated runs.
- [ ] Each event has a stable public slug, valid timezone and schedule, compatible theme and mode, complete public section content, intentional imagery/fallbacks, and published data that renders through the real public invite API.
- [ ] Seeded copy, sections, guest groups, RSVP examples, activity, and notifications are appropriate to each event type rather than clones with renamed titles.
- [ ] A small typed demo-catalog contract exposes only the stable public metadata the invite home needs; it does not import database code into the invite app or expose manager/private guest data.
- [ ] Seed output prints ready-to-open dashboard, public, and representative guest URLs for all three events.
- [ ] Existing manager binding through `SEED_MANAGER_EMAIL` and `SEED_SUPABASE_USER_ID` continues to work and is documented in `README.md` with the three-event behavior.
- [ ] Focused seed/schema/API checks, typecheck, formatting, and `git diff --check` pass.

## Notes

Keep the seed local/development-friendly and deterministic. Do not turn the public invite API into an unrestricted event directory; the home screen only needs an explicit curated demo catalog.

## Progress Log

- 2026-07-22T01:10:41+08:00: Task created for the wedding, kids birthday, and launch demo data requested by the invite home experience.
