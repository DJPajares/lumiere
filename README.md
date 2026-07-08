# Lumiere

Full-stack multi-event invitation and RSVP platform.

## Overview

Lumiere lets event managers create themed invitation websites, configure event sections, generate unique guest/group invite links, collect RSVP responses, and view response activity from a dashboard.

The project has three runtime apps:

- `apps/invite`: public invitation PWA
- `apps/dashboard`: authenticated event manager dashboard
- `apps/api`: Hono API

## Tech Stack

- Monorepo: Turborepo
- Package manager: pnpm
- Language: TypeScript
- Invite app: Next.js PWA
- Dashboard app: Next.js
- Styling foundation: Tailwind CSS with semantic tokens
- API: Hono
- Auth: Supabase Auth for managers
- Database: PostgreSQL locally, Supabase PostgreSQL production
- ORM: Drizzle
- Validation: schema validation shared where practical
- Testing: Vitest where practical, plus Testing Library for UI
- Formatting/hooks: Prettier and lint-staged

Prefer latest stable dependencies for new installs unless compatibility requires pinning.

## Project Structure

```text
apps/
  invite/
  dashboard/
  api/
packages/
  api-client/
  config/
  db/
  themes/
  types/
  ui-primitives/
.devtool/
  features/
PRD.md
AGENTS.md
SKILL.md
README.md
```

## Requirements

- Node.js LTS
- pnpm
- PostgreSQL for local development
- Supabase project for auth and production database

## Environment Variables

Use separate `.env` files per app/package.

Copy each app's committed example file before running local services:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/invite/.env.example apps/invite/.env.local
cp apps/dashboard/.env.example apps/dashboard/.env.local
```

`packages/config` validates environment variables. API configuration is server-only and
fails fast when required secrets are missing. Invite and dashboard client configuration
only uses `NEXT_PUBLIC_` variables.

### API

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/lumiere
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=
INVITE_TOKEN_SECRET=
PUBLIC_APP_BASE_URL=http://localhost:3000
DASHBOARD_APP_BASE_URL=http://localhost:3001
```

### Invite App

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_APP_NAME=Lumiere
```

### Dashboard App

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_NAME=Lumiere Dashboard
```

## Local Setup

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/invite/.env.example apps/invite/.env.local
cp apps/dashboard/.env.example apps/dashboard/.env.local
pnpm db:migrate
pnpm dev
```

Run the API service by creating `apps/api/.env`, then starting the API package:

```bash
cp apps/api/.env.example apps/api/.env
pnpm dev:api
```

By default the API listens on `http://localhost:4000`. Check `GET /health` for a status payload and request ID.

## Common Development Commands

```bash
pnpm dev
pnpm dev:invite
pnpm dev:dashboard
pnpm dev:api
pnpm build
pnpm lint
pnpm format
pnpm format:check
pnpm typecheck
pnpm test
pnpm test:watch
pnpm db:generate
pnpm db:migrate
pnpm db:studio
```

### Quality Commands

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:watch
pnpm format
pnpm format:check
pnpm lint-staged
```

- `pnpm lint`, `pnpm typecheck`, and `pnpm test` run through Turborepo across the workspace.
- `pnpm test` uses Vitest for the API and shared packages, with app-specific tests added in later app scaffold tasks.
- `pnpm format` and `pnpm format:check` use the root Prettier config.
- `pnpm lint-staged` formats staged files and runs a workspace typecheck for staged TypeScript changes.

### Database Commands

Drizzle schema and migrations live in `packages/db`. Commands read `DATABASE_URL`, falling back to `postgresql://postgres:postgres@localhost:5432/lumiere` for local development.

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:studio
```

Use a separate database for tests and point Drizzle at it when applying migrations. A disposable Compose-backed test database is available from `packages/db`:

```bash
docker compose -f packages/db/docker-compose.test.yml up -d --wait
DATABASE_URL=postgresql://postgres:postgres@localhost:54329/lumiere_test pnpm db:migrate
docker compose -f packages/db/docker-compose.test.yml down
```

For Supabase, set `DATABASE_URL` to the project Postgres connection string before running `pnpm db:migrate`.

## Brand / PWA Assets

Use separate Lumiere PWA assets for each app:

- `apps/invite/public/` uses the main Lumiere public invite assets.
- `apps/dashboard/public/` uses the Lumiere Dashboard assets.

Each app should include its own `favicon.ico`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, maskable icons, `manifest.webmanifest`, and metadata/head tags. Guest-specific URLs must avoid leaking private guest context in public share metadata.

## Frontend Development

- Use `SKILL.md` for UI/UX direction.
- Use `apps/invite/README.md` and `apps/dashboard/README.md` for app-specific design reads.
- Use Tailwind CSS as the styling foundation, not as a complete design system.
- Do not add HeroUI, shadcn/ui, Radix, Material, or another component library unless a task justifies it.
- Prefer semantic tokens and project-owned components.
- Keep `globals.css` simple.
- Implement loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- Invite app is mobile-first.
- Dashboard is responsive and optimized for event management.
- Run the `SKILL.md` pre-flight review for major UI changes.
- Use the Lumiere brand consistently without letting it overpower event-specific themes.

## Backend/API Development

- Hono API owns auth checks, guest token validation, database writes, and content/theme validation.
- Manager endpoints require Supabase-authenticated sessions.
- Guest invite endpoints use event slug plus high-entropy guest token.
- Store invite token hashes, not raw tokens.
- Validate all section content against supported schemas.
- Use a consistent error shape with request IDs.

## API Endpoints

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
GET    /events/:eventId/notifications

GET    /themes
GET    /themes/:themeId
```

## Database / Storage Notes

Use Drizzle migrations in `packages/db`.

Core tables:

- users
- events
- event_managers
- event_sections
- event_assets
- guest_groups
- rsvp_responses
- activity_events
- notifications
- theme_registry_snapshots, optional

Event sections and content should be stored in the database as validated JSON. Section renderers and theme definitions should live in code through `packages/themes`.

## Testing

- Use Vitest for API services, shared packages, validation, and API client tests.
- Use Testing Library for React components where practical.
- Mock Supabase auth in API tests.
- Test manager ownership checks, guest token behavior, RSVP max pax, and section validation.
- Add smoke coverage for create event, configure theme, create guest group, open invite, submit RSVP, and view dashboard summary.

## Build / Deployment

Expected deployable units:

- invite app
- dashboard app
- API service
- PostgreSQL/Supabase database migrations

Keep secrets in environment-managed configuration and never commit `.env` files.

## Task Workflow

Task files live in `.devtool/features/`. Start with the lowest-order `todo` task whose dependencies are complete. Update status and progress logs as tasks are implemented.

## Notes / Limitations

- Theme registry starts in code for safety and predictability.
- Database stores selected theme IDs, theme settings, section order, visibility, and section content.
- Email/SMS notifications are future work unless promoted into MVP.
- Guest users do not need accounts in the MVP.
