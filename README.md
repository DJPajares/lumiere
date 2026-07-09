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
- PostgreSQL for local development, either installed locally or run with Docker Compose
- Docker, if you want the Compose-backed local database
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
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lumiere
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

### Where Env Values Come From

Local development can use local Postgres or Docker Postgres for app data, while
the dashboard still uses Supabase Auth for manager sign-in. Production uses the
deployed API/apps and a production Postgres connection string, usually Supabase
Postgres.

#### API: `apps/api/.env`

| Key | Local value | Production value | Notes |
| --- | --- | --- | --- |
| `NODE_ENV` | `development` | `production` | Controls runtime mode and health payload. |
| `PORT` | `4000` | hosting platform port, if required | Local API defaults to `http://localhost:4000`. |
| `DATABASE_URL` | Docker/local Postgres URL | production Postgres URL | Local Docker default is `postgresql://postgres:postgres@localhost:5432/lumiere`. For production Supabase Postgres, copy the project database connection string. |
| `SUPABASE_URL` | Supabase project URL | Supabase project URL | `Project Settings` -> `API` -> project URL. Use the same project as the dashboard. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role secret | Supabase service role secret | `Project Settings` -> `API keys` -> reveal/copy `service_role`. Do not use `anon public` here. Keep server-side only. |
| `SUPABASE_JWT_SECRET` | Supabase JWT secret | Supabase JWT secret | `Project Settings` -> `JWT Keys` -> `Legacy JWT Secret` -> `Legacy JWT secret (still used)`. Used for legacy `HS256` tokens. |
| `INVITE_TOKEN_SECRET` | any long random secret | production secret manager value | Used to hash guest invite tokens. Generate a strong value and keep it private. |
| `PUBLIC_APP_BASE_URL` | `http://localhost:3000` | public invite app URL | Used to build guest invite links and allow CORS. |
| `DASHBOARD_APP_BASE_URL` | `http://localhost:3001` | dashboard app URL | Used for CORS and dashboard-facing links. |

Database examples:

```env
# Docker or default local Postgres
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lumiere

# Custom local Postgres
DATABASE_URL=postgresql://user:password@localhost:5432/lumiere

# Production/Supabase Postgres
DATABASE_URL=postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres
```

Supabase projects that use JWT Signing Keys may issue dashboard access tokens
with `alg: "ES256"`. The API supports those by fetching the project's JWKS from
`<SUPABASE_URL>/auth/v1/.well-known/jwks.json`. Legacy `alg: "HS256"` tokens
are verified with `SUPABASE_JWT_SECRET`.

#### Invite App: `apps/invite/.env.local`

| Key | Local value | Production value | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:4000` | deployed API URL | Browser-safe API base URL for public invite requests. |
| `NEXT_PUBLIC_APP_NAME` | `Lumiere` | public app display name | Browser-safe display name. |

#### Dashboard App: `apps/dashboard/.env.local`

| Key | Local value | Production value | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:4000` | deployed API URL | Browser-safe API base URL for dashboard requests. |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase project URL | Same project as `SUPABASE_URL`. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public key | Supabase public key | `Project Settings` -> `API keys` -> browser-safe public key. The legacy `anon public` key works; prefer the newer publishable key when available. |
| `NEXT_PUBLIC_APP_NAME` | `Lumiere Dashboard` | dashboard display name | Browser-safe display name. |

Only `NEXT_PUBLIC_` variables are exposed to browsers. Do not put service role
keys, database URLs, JWT secrets, or invite token secrets in invite/dashboard
client env files.

## Local Setup

### First-Time Setup With Docker Postgres

Use this path on machines that do not have a local Postgres service.

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/invite/.env.example apps/invite/.env.local
cp apps/dashboard/.env.example apps/dashboard/.env.local
pnpm db:up
pnpm db:migrate
```

The Docker database uses this local connection string:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lumiere
```

`pnpm db:up` starts a persistent `lumiere` database. The data stays in the
Docker volume until you remove the volume manually.

After migrations finish, start the API:

```bash
pnpm dev:api
```

By default the API listens on `http://localhost:4000`. Check `GET /health` for a status payload and request ID.

### First-Time Setup With Local Postgres

Use this path on machines that already run Postgres locally.

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/invite/.env.example apps/invite/.env.local
cp apps/dashboard/.env.example apps/dashboard/.env.local
createdb lumiere
pnpm db:migrate
pnpm dev:api
```

If your local Postgres user, password, host, or port differs from the default,
update `DATABASE_URL` in `apps/api/.env` and pass the same URL when running
Drizzle commands:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/lumiere pnpm db:migrate
```

### Succeeding Local Runs

For Docker Postgres:

```bash
pnpm db:up
pnpm db:migrate
pnpm dev:api
```

For an already-running local Postgres service:

```bash
pnpm db:migrate
pnpm dev:api
```

Run all apps together when the API database is ready:

```bash
pnpm dev
```

### Seed Demo Data

After migrations, seed a published demo invite with sections, guest groups, RSVP
responses, activity, and notifications:

```bash
pnpm db:seed
```

The command reads `apps/api/.env` by default, including `DATABASE_URL`,
`INVITE_TOKEN_SECRET`, `PUBLIC_APP_BASE_URL`, and `DASHBOARD_APP_BASE_URL`.
It prints ready-to-open dashboard, public invite, and guest invite URLs.

For dashboard access, seed the event against your Supabase auth user. If you
know your Supabase user id, run:

```bash
SEED_MANAGER_EMAIL=you@example.com SEED_SUPABASE_USER_ID=your-supabase-user-id pnpm db:seed
```

If you do not know the id, sign in to the dashboard once so the API mirrors your
user into the local database, then rerun:

```bash
SEED_MANAGER_EMAIL=you@example.com pnpm db:seed
```

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
pnpm db:seed
pnpm db:up
pnpm db:down
pnpm db:logs
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

### Integration Smoke Tests

The fast MVP smoke path lives in the API Vitest suite and exercises the HTTP routes with injected
test stores plus mocked Supabase bearer tokens:

```bash
pnpm --filter @lumiere/api test
```

This covers the host-to-guest flow without requiring a live database on every local run. For
database-backed verification, use the disposable PostgreSQL test container documented below and run
the same API test command after migrations are applied.

### Database Commands

Drizzle schema and migrations live in `packages/db`. Commands read `DATABASE_URL`, falling back to `postgresql://postgres:postgres@localhost:5432/lumiere` for local development.

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:up
pnpm db:down
pnpm db:logs
pnpm db:studio
```

The development Compose database is defined in the root `docker-compose.yml`
and binds Postgres to `localhost:5432`.

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

### Security Checklist

- Manager endpoints require Supabase bearer auth and per-event access checks before returning or mutating event data.
- Public event endpoints return public event summaries only; guest endpoints return the invite context needed for RSVP without guest contact details, invite tokens, or manager-only fields.
- Guest invite tokens are generated from 32 random bytes, returned only inside share URLs, and stored as HMAC-SHA256 hashes using `INVITE_TOKEN_SECRET`.
- Sensitive `/events/*` and `/public/events/*` API responses send `Cache-Control: no-store` and `Pragma: no-cache`.
- Public RSVP submissions have a basic per-app rate limiter keyed by client, event slug, and hashed guest token. For multi-instance production, replace or extend this with a shared Redis, edge, or gateway limiter using the same route and token-hash boundary.
- Section content is schema-validated and rejects executable-looking markup, inline event handlers, `javascript:` URLs, and non-HTTP media/map URLs before persistence.

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
