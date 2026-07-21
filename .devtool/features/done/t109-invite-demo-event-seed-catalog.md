---
id: 't109-invite-demo-event-seed-catalog'
status: 'done'
priority: 'high'
assignee: null
epic: 'invite-discovery'
dueDate: null
created: '2026-07-22T01:10:41+08:00'
modified: '2026-07-22T02:18:31+08:00'
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

## Suggested Agent

- Suggested model: `GPT-5.6 Sol (gpt-5.6-sol)`
- Reasoning level: `high`

## Acceptance

- [x] `pnpm db:seed` creates or replaces deterministic wedding, kids birthday party, and launch demo events without duplicating managers, memberships, events, sections, publications, or related demo records across repeated runs.
- [x] Each event has a stable public slug, valid timezone and schedule, compatible theme and mode, complete public section content, intentional imagery/fallbacks, and published data that renders through the real public invite API.
- [x] Seeded copy, sections, guest groups, RSVP examples, activity, and notifications are appropriate to each event type rather than clones with renamed titles.
- [x] A small typed demo-catalog contract exposes only the stable public metadata the invite home needs; it does not import database code into the invite app or expose manager/private guest data.
- [x] Seed output prints ready-to-open dashboard, public, and representative guest URLs for all three events.
- [x] Existing manager binding through `SEED_MANAGER_EMAIL` and `SEED_SUPABASE_USER_ID` continues to work and is documented in `README.md` with the three-event behavior.
- [x] Focused seed/schema/API checks, typecheck, formatting, and `git diff --check` pass.

## Notes

Keep the seed local/development-friendly and deterministic. Do not turn the public invite API into an unrestricted event directory; the home screen only needs an explicit curated demo catalog.

## Progress Log

- 2026-07-22T01:10:41+08:00: Task created for the wedding, kids birthday, and launch demo data requested by the invite home experience.
- 2026-07-22T02:05:00+08:00: Started from the empty-database requirement. The default seed identity will be a deterministic synthetic local manager owned by the seed itself; optional `SEED_MANAGER_EMAIL` and `SEED_SUPABASE_USER_ID` values may bind dashboard access but are not prerequisites for creating or rendering the public demos.
- 2026-07-22T02:18:31+08:00: Replaced the single-event seed with a transactional three-event catalog: Premium garden wedding, Kids sunroom birthday, and Neon Signal studio launch. Each event has distinct copy, schedules, imagery, sections, named guests, representative pending links, RSVP history, activity, and notifications; output now prints all dashboard/public/guest URLs.
- 2026-07-22T02:18:31+08:00: Verified from a separately created empty migrated PostgreSQL database. Two consecutive seed runs retained identical counts (1 synthetic user, 3 events, 3 memberships, 25 sections, 3 publications, 9 guest groups, 17 members, 5 responses, 17 activity rows, and 5 notifications). All three public Hono routes returned 200, guest records resolved through the real store, and theme/mode plus every section schema validated without issues. The temporary verification database was removed afterward.
- 2026-07-22T02:18:31+08:00: Shared types (10 tests), database (5 tests), API (100 tests), and invite (37 tests) pass with affected typechecks. Focused Prettier, lint placeholders, and `git diff --check` are clean. README now documents empty-database behavior, repeatability, three-event output, and optional Supabase binding.
