# Lumiere PRD

## 1. Product Summary

Lumiere is a full-stack, multi-event invitation and RSVP platform. It lets event managers create and manage multiple events, choose premium invitation themes, configure event-specific sections, manage guest groups, generate unique guest invite links, collect RSVP responses, and monitor guest activity from a dashboard.

The public invitation experience is delivered through a mobile-first Next.js PWA that works as both a generic event invitation website and a personalized invite flow. The dashboard is a separate responsive Next.js app for event managers. The API is a Hono service backed by PostgreSQL, Drizzle ORM, and Supabase Auth.

### Brand Positioning

Lumiere means light and should feel like a premium event platform, not a generic form builder. The public invite experience should feel luminous, intimate, and memorable. The dashboard should feel calm, precise, and trustworthy while still carrying the same refined brand language.

Brand principles:

- luminous, elegant, and warm
- premium but not over-decorated
- celebratory without feeling childish
- flexible enough for weddings, birthdays, holidays, launches, dinners, and private events
- operationally clear for event managers


## 2. Problem Statement

People often need beautiful invitation websites and RSVP tracking for different event types such as weddings, birthdays, Christmas parties, kids' parties, and premium private events. Existing solutions are either too rigid, too template-driven, too event-type-specific, or do not give the host enough control over event sections, themes, guest groups, and unique RSVP links.

Lumiere should provide a flexible event platform where:

- one manager can run multiple separate events
- each event can have its own theme, content, section structure, mode, and guest groups
- public visitors can view the invitation without RSVP access
- invited guests with a unique link can RSVP for their assigned group
- dashboard users only see events they manage
- design quality remains modern and premium across both the invitation site and the dashboard

## 3. Project Mode

`full-stack`

Reason: the project requires two meaningful Next.js frontends, a Hono API, authentication, PostgreSQL storage, Drizzle migrations, event/theme data contracts, unique guest links, RSVP workflows, notification/activity tracking, and cross-layer integration between dashboard, API, database, and public invite pages.

## 4. Goals

- Support multiple event types and multiple events per authenticated manager.
- Provide a public event URL that shows the invitation without RSVP-only content.
- Provide unique guest/group invite links that unlock RSVP sections.
- Let managers configure sections per event type and theme.
- Let managers choose event designs such as Premium, Kids, Noel, Moana-inspired, or other future templates.
- Support light mode, dark mode, or toggleable variants per event theme.
- Track guest groups, max pax, RSVP status, guest answers, and activity.
- Notify managers when guests RSVP or update responses.
- Provide a dashboard with response cards, guest activity, and event management tools.
- Keep the design system flexible and TasteSkill-driven instead of tied to one component library by default.
- Keep the architecture suitable for local PostgreSQL development and Supabase PostgreSQL production.
- Use Lumiere brand assets consistently across invite app, dashboard, PWA manifests, and public metadata.
- Add explicit UI/UX quality gates for invitation themes, dashboard management flows, and RSVP interactions.

## 5. Non-Goals

- Native mobile apps in the MVP.
- Seat-map planning, catering inventory, or vendor management in the MVP.
- Payment collection in the MVP.
- Fully custom drag-and-drop page builder in the MVP.
- Arbitrary untrusted code or component rendering from the database.
- Email/SMS delivery infrastructure as a hard MVP requirement. In-app notifications and activity logs come first.
- Guest account creation in the MVP.
- Multi-tenant billing or organizations in the MVP.

## 6. Users / Personas

### Event Manager

Creates and manages one or more events. Needs clean tools for theme selection, event content, guest grouping, RSVP tracking, and guest activity.

### Invited Guest

Receives a unique invite link for a guest group. Needs a beautiful invitation experience, event details, and a simple RSVP flow that respects the group's max pax.

### Public Visitor

Opens a generic event URL without a guest token. Can view public invitation content but cannot access personalized RSVP content.

### Theme Builder / Developer

Adds new event designs and section renderers. Needs shared theme contracts, clear registry metadata, and predictable rendering boundaries.

## 7. Core Use Cases

1. Manager signs in and creates an event.
2. Manager selects an event type, theme design, and light/dark mode behavior.
3. Manager configures event sections such as introduction, date, story, location, entourage, gallery, RSVP, and outro.
4. Manager creates guest groups with labels, max pax, and unique invite links.
5. Manager copies or shares a guest group's unique invite link.
6. Public visitor opens the generic event URL and sees the invitation without RSVP content.
7. Invited guest opens a unique invite link and sees RSVP-enabled content.
8. Guest submits RSVP with attendee count and optional responses.
9. Manager receives an activity/notification entry for the RSVP.
10. Manager views response summary cards, guest list statuses, and activity timeline.
11. Manager edits event theme or content and the public invite reflects the update.

## 8. UX / Frontend Requirements

### Apps

#### Main Invitation App

- Next.js PWA.
- Mobile-first, polished on web and phone-sized screens.
- Serves generic public event pages.
- Serves personalized guest invite pages.
- Handles multiple event themes and section layouts.
- Shows RSVP only when the URL includes a valid guest invite token.
- Uses server-rendered or statically optimized pages where practical.

#### Dashboard App

- Next.js responsive dashboard.
- Works on desktop and mobile, but desktop/tablet are primary for management tasks.
- Authenticated through Supabase.
- Shows only events the authenticated manager can access.
- Manages events, themes, sections, guest groups, RSVP responses, and activity.

### Main Invitation Routes

```text
/e/[eventSlug]
```

Generic public event page. Shows public sections only and hides RSVP content.

```text
/e/[eventSlug]/g/[guestToken]
```

Personalized guest invite page. Shows public sections plus RSVP-enabled content for that guest group.

Optional future short route:

```text
/i/[inviteCode]
```

Resolves to the event and guest group without exposing event slug structure.

### Dashboard Routes

```text
/
/login
/events
/events/new
/events/[eventId]
/events/[eventId]/content
/events/[eventId]/theme
/events/[eventId]/guests
/events/[eventId]/responses
/events/[eventId]/activity
/settings
```

### Event Section Requirements

Section structure should come from database configuration so every event can be configured from the dashboard. The implementation should not store executable components in the database.

Recommended model:

- code owns section renderer components and schemas
- shared theme registry owns supported designs and section types
- database stores event content, section order, visibility, per-section settings, and selected theme IDs
- API validates dashboard updates against supported section schemas
- invitation app renders configured sections through the registry

Example wedding sections:

- introduction
- couple profile
- date and countdown
- story
- labels and copy
- entourage
- color coding / dress code
- location
- gallery / photo URLs
- RSVP
- outro

Example birthday sections:

- introduction
- celebrant profile
- date and venue
- party details
- gift note
- gallery
- RSVP
- outro

### Main Invitation UX States

- Public event page available.
- Private RSVP section unavailable without guest token.
- Invalid invite link.
- Expired or disabled invite link.
- RSVP open.
- RSVP closed.
- RSVP submitted.
- RSVP updated.
- Event not published.
- Event not found.

### Dashboard UX States

- Loading event data.
- Empty event list with create CTA.
- Empty guest list with add/import CTA.
- No RSVP responses yet.
- RSVP activity timeline.
- Validation errors for max pax, guest group labels, duplicate slugs, missing required sections, and invalid theme settings.
- Unauthorized or missing access state.

### Accessibility

- Dashboard forms use labels above inputs, not placeholder-only labels.
- Invite pages preserve contrast for theme variants.
- RSVP controls are keyboard accessible on web.
- Important images have alt text or are marked decorative.
- Error text is associated with fields.
- Reduced-motion preference is respected.
- Color-coded dress code or status labels also include text.

### Responsive Behavior

- Main invitation: mobile-first single-column composition, then richer tablet/desktop layouts.
- Dashboard: desktop-first management density with responsive mobile fallback.
- Multi-column sections must declare explicit mobile collapse behavior.
- Navigation must remain usable on phone widths.
- RSVP form must remain comfortable for thumb use.

## 9. TasteSkill Design Read

```text
Reading this as: a premium multi-event invitation and RSVP platform for hosts and guests, with a polished editorial/event-brand language for the public invite and a calm modern admin language for the dashboard, leaning toward Tailwind CSS as styling foundation with project-owned components and theme-specific section renderers.
```

### Design Dials

```text
DESIGN_VARIANCE: 7
MOTION_INTENSITY: 5
VISUAL_DENSITY: 4 for invitation pages, 7 for dashboard management screens
```

### Selected Design Foundation

- Design system or styling foundation: `Tailwind CSS with semantic tokens and project-owned components`
- Reason: the project needs multiple branded event themes and a flexible invitation renderer rather than one fixed official design system.
- Tailwind note: Tailwind is the styling foundation only. It must be paired with shared tokens, section schemas, component rules, accessibility checks, and theme registry constraints.

## 10. Design Direction

### Public Invitation App

- Premium, modern, editorial, and emotionally warm.
- Each theme can have its own atmosphere while preserving shared structure and accessibility.
- Use real imagery where supplied by the event manager.
- Avoid generic hero plus card layouts.
- Use section rhythm: hero, detail blocks, story sections, gallery, location, RSVP, outro.
- RSVP should feel like part of the invitation, not a separate form slapped at the end.
- Motion should be subtle and purposeful: section reveal, RSVP confirmation, theme transitions, and page load polish.

### Dashboard App

- Calm, clean, efficient, and trustworthy.
- Prioritize scanability and data clarity over decorative event styling.
- Use clear cards for attending, not attending, pending, total invited, max pax, and recent activity.
- Use tables or grouped lists for guests, but avoid dense border stacks where grouped cards or sections are clearer.
- Editing flows should feel safe, with previews and validation.

### Consistency Locks

- Color lock: each event theme has one primary accent and semantic status colors.
- Shape lock: theme-specific radius scale, documented per theme.
- Theme lock: each event chooses light-only, dark-only, or toggleable light/dark variants.
- Dashboard lock: neutral administrative palette with one product accent.

### Anti-Slop Constraints

- No generic purple AI gradients unless a chosen theme explicitly calls for violet.
- No default centered hero plus three cards.
- No fake product UI blocks on public invite pages.
- No placeholder copy in generated themes.
- No decorative badges that do not help the host or guest.
- No arbitrary guest-facing emojis unless a playful theme explicitly calls for them.

### Lumiere Brand Application

- Main invite app should use the Lumiere mark for public metadata, install prompts, favicon, and empty/public states.
- Dashboard should use the dashboard mark or a simplified Lumiere lockup for authenticated manager surfaces.
- PWA assets should be app-specific: public invite assets for `apps/invite`, dashboard/admin assets for `apps/dashboard`.
- Brand visuals must not overpower event themes. Lumiere should frame the experience, while each event theme remains the star.

### Theme Quality Requirements

Every production theme should define:

- design read and intended event type
- light/dark/system support
- token palette with accent, surfaces, text, borders, status colors, and focus
- radius and shadow rules
- typography scale and display font guidance
- section layout rhythm
- image treatment and placeholder strategy
- RSVP form treatment
- dashboard preview thumbnail
- accessibility notes and contrast expectations

### UI/UX Review Requirements

Before MVP completion, run a specific design review for:

- public event page without guest token
- guest invite page with RSVP content
- RSVP success, update, closed, invalid-link, and expired-link states
- dashboard event overview
- dashboard section builder
- dashboard guest management
- dashboard responses and activity
- theme selector and previews
- mobile widths for both apps
- light and dark variants for supported themes

## 11. Recommended Technical Direction

### Monorepo

Use Turborepo with pnpm workspaces.

```text
apps/
  invite/       # public invitation PWA
  dashboard/    # event manager dashboard
  api/          # Hono API
packages/
  api-client/
  config/
  db/
  themes/
  types/
  ui-primitives/
```

### Frontend

- Invite app: Next.js, PWA, TypeScript, Tailwind CSS.
- Dashboard app: Next.js, TypeScript, Tailwind CSS.
- Brand/PWA assets: separate Lumiere public invite and Lumiere Dashboard asset sets under each app public folder.
- Styling: Tailwind CSS as the default foundation, semantic CSS variables, simple `globals.css`.
- Component strategy: project-owned components and small accessible primitives. Add a library such as Radix only when a task justifies it.
- Server state: TanStack Query or framework-native fetching where practical.
- Forms: React Hook Form with schema validation, or equivalent.
- Tests: Vitest and Testing Library where practical.

### Backend

- API: Hono with TypeScript.
- Local database: PostgreSQL.
- Production database: Supabase PostgreSQL.
- ORM: Drizzle.
- Auth: Supabase Auth for managers.
- Guest access: signed/random guest invite tokens, not Supabase user accounts.
- Validation: schema validation shared where practical.
- Tests: Vitest with API and service tests.

## 12. High-Level Architecture

```text
Next.js Invite PWA ───┐
                      ├── Shared API Client ── Hono API ── Drizzle ── PostgreSQL/Supabase PostgreSQL
Next.js Dashboard ────┘                         │
                                                 ├── Supabase Auth
                                                 ├── Theme Registry Package
                                                 ├── Notification / Activity Service
                                                 └── Future Email/SMS Providers
```

The API owns persistence, authorization, invite token validation, notification records, and theme/content validation. Frontend apps render data and submit actions through typed API contracts.

## 13. Frontend Architecture

### Invite App

- Uses event slug and optional guest token to request public or personalized invitation data.
- Renders sections from `packages/themes` registry.
- Hides RSVP section unless a valid guest invite context exists.
- Supports PWA manifest, icons, metadata, and install-friendly behavior.
- Uses theme variables for light/dark variants.
- Keeps `globals.css` minimal.

### Dashboard App

- Authenticated Supabase session.
- Layout with event switcher, navigation, response summary, and activity preview.
- Event editor split into content, theme, guests, responses, and activity.
- Uses preview mode where practical for invitation changes.
- Uses typed API client and shared schemas.

### Shared Frontend Packages

- `packages/types`: domain and API types.
- `packages/themes`: design registry, section schemas, theme metadata, renderer contracts.
- `packages/api-client`: typed client for API calls.
- `packages/ui-primitives`: project-owned primitives shared by both apps where practical.

## 14. Backend / API Architecture

### API Principles

- REST-style JSON endpoints for MVP.
- Typed request and response contracts.
- Server-side validation for all inputs.
- Supabase auth only for manager endpoints.
- Guest invite endpoints validate event slug and guest token.
- Manager endpoints enforce event ownership through an `event_managers` relationship.
- Public event endpoints never expose private guest lists.
- Theme/content updates are validated against the theme and section registry.
- Consistent error shape with request ID.

### Endpoint Groups

```text
GET    /health

GET    /public/events/:eventSlug
GET    /public/events/:eventSlug/guest/:guestToken
POST   /public/events/:eventSlug/guest/:guestToken/rsvp

GET    /events
POST   /events
GET    /events/:eventId
PATCH  /events/:eventId
DELETE /events/:eventId

GET    /events/:eventId/theme
PUT    /events/:eventId/theme
GET    /events/:eventId/sections
PUT    /events/:eventId/sections

GET    /events/:eventId/guest-groups
POST   /events/:eventId/guest-groups
PATCH  /events/:eventId/guest-groups/:groupId
DELETE /events/:eventId/guest-groups/:groupId
POST   /events/:eventId/guest-groups/:groupId/regenerate-link

GET    /events/:eventId/responses
GET    /events/:eventId/activity
GET    /events/:eventId/summary

GET    /themes
GET    /themes/:themeId
```

## 15. Data Model / Storage Design

### users

Supabase-authenticated manager profile mirror.

- id
- supabase_user_id
- email
- display_name
- created_at
- updated_at

### events

- id
- owner_user_id
- slug
- title
- event_type
- status: draft, published, archived
- timezone
- starts_at
- ends_at
- access_expires_at: nullable global public and guest access ceiling
- venue_name
- venue_address
- selected_theme_id
- theme_mode: light, dark, system, toggleable
- theme_config_json
- public_settings_json
- rsvp_settings_json
- created_at
- updated_at

### event_managers

Allows future shared management.

- id
- event_id
- user_id
- role: owner, editor, viewer
- created_at

### event_sections

Configured sections for an event.

- id
- event_id
- section_type
- section_key
- sort_order
- visibility: public, guest_only, hidden
- enabled
- content_json
- settings_json
- created_at
- updated_at

### event_assets

Photos, gallery images, cover images, maps, or future uploaded media metadata.

- id
- event_id
- asset_type
- url
- alt_text
- metadata_json
- created_at

### guest_groups

- id
- event_id
- label
- contact_name
- contact_email
- max_pax
- invite_token_hash
- invite_code
- status: pending, opened, responded, declined, disabled
- notes
- last_opened_at
- access_expires_at: nullable private-link deadline that cannot extend effective access beyond the event ceiling
- created_at
- updated_at

### rsvp_responses

- id
- event_id
- guest_group_id
- response_status: attending, not_attending, maybe
- attendee_count
- guest_names_json
- answers_json
- message
- submitted_at
- updated_at

### activity_events

- id
- event_id
- actor_type: manager, guest, system
- actor_id
- activity_type
- metadata_json
- created_at

### notifications

- id
- event_id
- user_id
- notification_type
- title
- message
- read_at
- metadata_json
- created_at

### theme_registry_snapshots

Optional table for tracking selected theme metadata at publish time.

- id
- event_id
- theme_id
- version
- metadata_json
- created_at

## 16. External Integrations

- Supabase Auth for dashboard manager authentication.
- Supabase PostgreSQL for online production database.
- Future Supabase Storage or compatible object storage for image uploads.
- Future email provider for RSVP notifications and guest invitations.
- Future SMS or WhatsApp link generation if needed.
- Optional map provider for venue links.

## 17. Security / Privacy Requirements

- Dashboard endpoints require Supabase-authenticated manager sessions.
- Every manager request enforces event ownership or manager role.
- Guest invite tokens must be high-entropy and stored hashed.
- Public event endpoints must not expose guest list details.
- RSVP endpoints must enforce group max pax.
- Rate limit public RSVP endpoints where practical.
- Validate all JSON content and section settings before persistence.
- Do not allow arbitrary HTML/script from dashboard content.
- Secrets remain server-side.
- Event slugs must be unique and safe for URLs.

### Invite Access Expiration Policy

Lumiere uses explicit access expiration rather than inferring availability from the event schedule. The policy has two levels:

| Term | Contract |
| --- | --- |
| Event access expiry | Nullable `events.access_expires_at`. It is the global ceiling for the readable public event URL, every private guest URL, and RSVP submission. |
| Guest access expiry | Nullable `guest_groups.access_expires_at`. It may end that current private link earlier, but it never extends access beyond the event ceiling. |
| Effective guest expiry | The earlier non-null value of the event and guest expiry. If both are null, the link does not expire. |
| Schedule end | `events.ends_at`. It describes when the event ends and never expires access by itself. |
| RSVP close | The explicit RSVP closed flag or close timestamp. It blocks response writes while the invitation can remain readable. |
| Unpublish | A publication lifecycle action that immediately makes public and guest routes unavailable without changing either expiry. |
| Delete | A soft-delete lifecycle action that immediately makes all invite access unavailable and remains higher precedence than expiry. |
| Guest disable | An immediate manual revocation for one guest group, independent of its expiry. |
| Token rotation | Replaces the current secret. The old URL becomes invalid immediately; the guest group's expiry is retained for the new URL. |

#### Defaults, scheduling, and time contract

- New events and guest groups default to `null` access expiry. Migration/backfill must write no deadline, so every existing public URL and guest link keeps its current behavior until a manager explicitly opts in.
- Managers may use an unselected dashboard suggestion based on `endsAt`, such as **Use event end time**, but Lumiere must never copy or recalculate that value automatically. The manager reviews and saves the deadline explicitly because an invitation can remain useful after the scheduled event.
- Removing or changing `endsAt` never changes access expiry. Changing the event timezone never reinterprets an already-saved expiry instant.
- Manager inputs accept RFC 3339 timestamps with an explicit UTC offset. API responses serialize them as UTC ISO 8601 timestamps. Dashboard controls display and edit them in the event timezone, show the timezone beside the value, and convert the chosen local time to an instant before submission.
- Server time is authoritative. Access is expired at exact equality: `now >= accessExpiresAt`. Reads and RSVP writes must use the same rule and effective-expiry calculation.
- A guest-expiry mutation is valid when the value is null, when the event expiry is null, or when the guest instant is less than or equal to the current event expiry. Equality is valid. A later guest value returns a field-level `VALIDATION_ERROR`; it is never treated as an extension.
- Event expiry remains the ceiling if it is shortened after guest deadlines exist. Stored guest deadlines do not override it, and the dashboard must show the effective earlier value. Extending or clearing the event deadline does not clear or extend a guest-specific deadline.

#### Manager use cases and reopening behavior

- An owner or editor can set, clear, shorten, or extend event access expiry. Viewers can read it but cannot mutate it.
- An owner or editor can set, clear, shorten, or extend a guest deadline within the event ceiling. Clearing it means **inherit the event deadline**, not **never expire**, unless the event deadline is also null.
- Managers may save a past deadline to expire access immediately. The UI must warn that the next request will be blocked and offer unpublish or guest disable when those lifecycle actions better express intent.
- Clearing or extending an elapsed event deadline makes the published event reachable again on the next request, except for deleted, unpublished, disabled, rotated, independently expired, or otherwise invalid access. Clearing or extending one guest deadline affects only its current token.
- Deadline changes do not delete RSVP responses, guest activity, or invitation content. They are access-control changes and must be auditable.

#### Request precedence and safe external states

The server evaluates availability in the following order. A higher row wins when multiple states apply.

| Precedence | Condition | Result |
| --- | --- | --- |
| 1 | Event deleted, archived, or not published | Generic `NOT_FOUND` (404). No event or guest details are returned. |
| 2 | Event access expiry reached | Generic `INVITE_EXPIRED` (410) for both public and guest routes. It does not reveal whether a guest token matches. |
| 3 | Private token missing, malformed, unknown, or rotated | Generic `NOT_FOUND` (404). The old and never-valid tokens are indistinguishable. |
| 4 | Current guest group disabled | `FORBIDDEN` (403) with the existing disabled-link state. |
| 5 | Current guest deadline reached | Generic `INVITE_EXPIRED` (410), identical to event-level expiry and without guest identity, title, deadline, or scope. |
| 6 | RSVP closed | Invitation GET remains readable. RSVP POST returns the existing closed-response `FORBIDDEN` state and preserves entered form data. |

`INVITE_EXPIRED` is the only new public error code. It deliberately does not distinguish event-level from guest-level expiration. Public slugs are identifiers, not secrets; a private expiry state is emitted only for a current high-entropy token or for the event-wide ceiling without resolving a guest. Error payloads and logs must not include tokens, guest labels, response data, or the configured deadline.

An already-rendered page is not forcibly blanked or disconnected at the deadline. Every subsequent API read, refresh, metadata request, and RSVP submission re-evaluates access against server time. A submission that crosses the boundary fails with `INVITE_EXPIRED`, saves no response, and keeps recoverable client input. Public and private invite fetches, error metadata, and expiry responses use private/no-store cache behavior so a CDN or framework cache cannot continue serving invite data after expiration.

#### t116 implementation map

t116 must implement this policy across these exact surfaces:

- **Schema and migration:** add nullable timezone-aware `access_expires_at` columns to `events` and `guest_groups` in `packages/db/src/schema.ts` and a reversible Drizzle migration. Existing rows remain null. Point lookups already resolve by slug/token, so add no expiry index unless an implemented query or cleanup job demonstrates a need.
- **Shared contracts:** wire `accessExpiresAt` into manager event/guest reads and mutation schemas in `packages/types/src/domain.ts` and `packages/types/src/api.ts`; reuse the shared effective-expiry and equality helpers; keep all serialized values UTC ISO strings.
- **Manager API:** extend event and guest-group mutations in `apps/api/src/events.ts`, `apps/api/src/guest-groups.ts`, and `apps/api/src/routes.ts`; enforce owner/editor authorization, field errors, optimistic event conflicts where applicable, and preservation of guest expiry during token rotation.
- **Public API and RSVP:** enforce the same server-authoritative rule in `apps/api/src/public-invites.ts` and `apps/api/src/rsvps.ts`; emit `INVITE_EXPIRED` through `apps/api/src/errors.ts`; apply no-store/private response headers and never rely on dashboard/client checks.
- **API client:** expose the new manager fields and stable error code through `packages/api-client/src/index.ts` without parsing error-message text.
- **Dashboard:** add the global control in `apps/dashboard/components/events/[eventId]/[section]/event-settings-workspace.tsx` and the inherited/earlier per-link control in `guest-management-workspace.tsx`; extend the existing API client wiring rather than creating separate state. Show event-timezone labels, effective deadline, expired status, clear/extend actions, past-time warnings, and accessible loading/error/success states at mobile and desktop widths.
- **Invite state:** add public-expired handling in `apps/invite/app/e/[eventSlug]/page.tsx`, guest-expired handling in `apps/invite/app/e/[eventSlug]/g/[guestToken]/page.tsx`, and presentations in `apps/invite/components/invite-access-state.tsx`; keep `noindex, nofollow` and preserve RSVP input when a submission expires.
- **Activity and audit:** add `event_access_expiry_changed` and `guest_access_expiry_changed` to the shared/database activity enums and emit them from the corresponding manager mutations. Record actor, target IDs, previous/new timestamps, and action; never record raw or encrypted tokens. No guest notification is implied by changing a deadline.
- **Verification:** extend `packages/db/src/schema.test.ts`, `packages/types/src/domain.test.ts`, `apps/api/src/index.test.ts`, `packages/api-client/src/index.test.ts`, the existing event-settings and guest-management workspace tests, `apps/invite/tests/invite-routes.test.tsx`, and RSVP form tests. Cover null backfill, UTC offsets, exact equality, event-versus-guest precedence, deleted/unpublished/disabled/rotated distinctions, past deadlines, clear/extend, stale open pages, and token rotation retention.
- **Smoke checks:** verify one non-expiring legacy event, one event-wide expiry, one earlier guest expiry, a boundary-time RSVP rejection with preserved input, manager reopen behavior, no-store metadata, keyboard access, and dashboard/invite layouts at 390px, 768px, and 1440px.

## 18. Error Handling Requirements

Common error shape:

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "requestId": "string"
  }
}
```

Frontend behavior:

- Show field-level validation for forms.
- Show contextual errors for invalid invite links, closed RSVP, disabled guest groups, and not-found events.
- Preserve guest-entered RSVP data when recoverable submission errors occur.
- Dashboard should show retry actions for data load failures.

Backend behavior:

- Return 401 for missing/invalid manager auth.
- Return 403 for authenticated managers without event access.
- Return 404 when event or guest token cannot be resolved.
- Return 410 with `INVITE_EXPIRED` when explicit invitation access expiration is reached.
- Return 409 for duplicate slugs or conflicting RSVP updates.
- Return 422 for validation errors.

## 19. Testing Requirements

### Frontend

- Component tests for invite sections and dashboard forms.
- Route/screen tests for public invite, personalized invite, event list, guest management, and RSVP form.
- Accessibility checks for forms and primary actions.
- Visual QA checklist based on `SKILL.md`.

### Backend

- Unit tests for services and validation.
- API tests for auth, event ownership, theme validation, guest token access, RSVP submission, and summary endpoints.
- Drizzle migration verification.
- Token hashing and max pax tests.

### Full-Stack

- Smoke path: create event, select theme, configure sections, add guest group, open public URL, open guest URL, submit RSVP, view dashboard summary.

## 20. MVP Scope

- Turborepo monorepo with two Next.js apps and one Hono API.
- Supabase Auth for managers.
- PostgreSQL/Drizzle schema and migrations.
- Event CRUD.
- Theme registry with at least three initial theme IDs.
- Section configuration stored in database.
- Public event route without RSVP.
- Guest invite route with RSVP.
- Guest group management with unique links.
- RSVP submission and update.
- Dashboard summary cards and activity feed.
- Simple in-app notifications.
- PWA manifest for invite app.
- Tailwind-based design foundation with semantic tokens.

## 21. Future Enhancements

- Drag-and-drop section builder.
- Theme marketplace or custom theme authoring.
- Email invitation sending.
- SMS/WhatsApp invitation flows.
- Supabase Storage image uploads.
- Event collaborators and roles beyond owner/editor/viewer.
- Guest import/export via CSV.
- QR codes for invite links.
- Seating charts and meal preferences.
- Event schedule modules.
- Paid plans and multi-tenant organizations.

## 22. Open Questions

- What is the final product name and domain?
- Should RSVP responses allow guests to edit after submission?
- Should public event pages be searchable/indexable or noindex by default?
- Should the MVP support file uploads or only external photo URLs?
- Which notification channels are required first: in-app only, email, or both?
- Should unique guest links use `/e/[eventSlug]/g/[guestToken]` or short `/i/[inviteCode]` as the primary share URL?

## 23. Definition Of Done

- Manager can sign in and manage only their own events.
- Manager can create and publish an event.
- Manager can configure theme, mode, and sections.
- Manager can create guest groups with max pax and unique invite links.
- Public event URL shows invite without RSVP content.
- Guest invite URL shows RSVP flow for valid guest groups.
- Guest can submit RSVP and manager can see the response.
- Dashboard shows response summary and activity.
- Core APIs are validated, tested, and documented.
- UI passes project `SKILL.md` pre-flight checks.
- All generated task files have clear dependencies and verification criteria.
