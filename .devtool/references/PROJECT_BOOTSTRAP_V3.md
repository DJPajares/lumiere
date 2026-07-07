# PROJECT_BOOTSTRAP_V3.md

## Version

`v3`

## Purpose

Use this file as a reusable instruction document for generating starter project documents from any raw project idea.

When attached to an AI prompt, generate a project-specific planning scaffold:

```text
PRD.md
AGENTS.md
README.md
.devtool/features/*.md
```

For projects with a meaningful frontend, also generate a concise project-specific UI/UX skill file:

```text
SKILL.md
```

This bootstrap supports three project modes:

```text
frontend
backend
full-stack
```

If the user does not specify a mode, infer it from the idea dump.

## Core Principles

- Be generic. Never assume the new project resembles the previous project used to create this bootstrap.
- Generate project-specific files, not reusable boilerplate copied blindly into every project.
- Ask only when a missing answer materially changes architecture, data model, UX direction, scope, security, or implementation strategy.
- Make reasonable assumptions for small gaps and record them clearly.
- Avoid duplicate content across `PRD.md`, `README.md`, `AGENTS.md`, and task files.
- Keep `AGENTS.md` short and token-efficient.
- Keep task files as the only implementation task state.

## Default Tooling Rules

Apply these defaults unless the idea dump or existing repository explicitly says otherwise:

- Use `pnpm` for package management.
- Prefer latest stable dependency versions where practical.
- Use TypeScript when the selected stack supports it.
- Use `Vitest` for unit, package, service, and API tests where practical.
- Use `Prettier` for formatting.
- Use `lint-staged` for pre-commit formatting and lightweight checks.
- Keep generated config minimal and easy to maintain.
- Do not expose secrets in frontend or mobile clients.
- Before importing a third-party library, verify it is installed or include the install command/task.

## Design System Defaults

Do not default to HeroUI, shadcn/ui, Radix, Material, or any component library unless the user specified it, the existing repository already uses it, or the TasteSkill design read strongly maps to it.

Use this hierarchy:

1. **User-specified design system wins.** If the user names HeroUI, shadcn/ui, Material, Fluent, Carbon, Polaris, Atlassian, Primer, GOV.UK, USWDS, Bootstrap, Radix, or another system, use the official package and its conventions.
2. **Domain-specific official system wins.** If the brief clearly reads as Shopify admin, Microsoft enterprise, public-sector service, Atlassian-style product, GitHub-style developer product, etc., choose the matching official system.
3. **Tailwind CSS is the default styling foundation for modern web UI when no design system is specified or inferred.** Tailwind is not a full design system by itself. Pair it with semantic tokens, a small component strategy, and TasteSkill design rules.
4. **Native/mobile choices are inferred.** For React Native, Expo, Swift, Kotlin, Flutter, or desktop UI, pick the most appropriate native or official ecosystem approach based on the brief.
5. **One system per project.** Do not mix unrelated design systems in the same UI tree.

If HeroUI is specified by the user, use it. If it is not specified, do not add it by default.

## Global CSS Rule

For web projects, keep `globals.css` simple:

- framework imports
- selected component-library style imports, only if a component library is selected
- semantic theme variables
- minimal base styles

Do not add large custom CSS layers, one-off visual effects, or design-system overrides into `globals.css` unless required.

## Project Mode Rules

### Frontend Mode

Use when the project is mainly a UI, website, dashboard, mobile app, desktop app, design system, prototype, or user-facing experience.

Focus on:

- users, goals, and primary jobs to be done
- UX requirements
- TasteSkill design read
- design dials and UI quality gates
- pages, screens, routes, and navigation
- layout and responsive behavior
- component strategy
- design tokens and theme
- state management
- data fetching and API client needs
- forms and validation
- loading, empty, error, and success states
- accessibility
- frontend tests
- build and deployment

Only include backend/API sections if the frontend needs an API contract, mock API, external service, server actions, or a backend-for-frontend layer.

### Backend Mode

Use when the project is mainly an API, service, database system, CLI, automation, worker, integration, ingestion pipeline, or internal system without a primary UI.

Focus on:

- backend architecture
- API, CLI, job, or integration interface design
- data model and storage
- migrations
- integrations
- background jobs and scheduling, if applicable
- auth and security
- validation and error handling
- observability, logging, and metrics where useful
- backend tests
- local development and deployment

Only include frontend sections if a UI is explicitly requested.

### Full-Stack Mode

Use when the project has both a meaningful user-facing UI and backend, data, or API responsibilities.

Focus on connecting:

- UX and screens
- frontend architecture
- backend and API architecture
- database and storage design
- auth and session flow, if applicable
- API contracts
- frontend data fetching
- error, loading, empty, and success states
- integration tests
- deployment of all layers

Interleave tasks based on real dependencies.

Example task flow:

```text
t01-project-scaffold
t02-tooling-quality-baseline
t03-design-read-and-ui-skill
t04-frontend-scaffold
t05-backend-health-endpoint
t06-database-setup
t07-api-contracts
t08-api-client
t09-primary-screen-shell
t10-feature-endpoint
t11-connect-ui-to-api
t12-integration-tests
```

## TasteSkill UI/UX Framework

For frontend and full-stack projects, apply a TasteSkill-style design process before generating UI tasks or frontend specs. The key philosophy is contextual discipline: read the brief first, infer the correct aesthetic and system, then apply only the rules that fit.

### 1. Brief Inference Before Design

Before proposing UI, infer and document a short design read:

```text
Reading this as: <product/page/app kind> for <audience>, with a <vibe> language, leaning toward <design system, component approach, or aesthetic family>.
```

Use signals from:

- project type
- audience
- user goals
- vibe words
- visual references
- existing brand assets
- regulated or accessibility-critical context
- whether this is a new build, redesign, dashboard, app, landing page, internal tool, or content site

If the design read genuinely diverges, ask exactly one clarifying question. Do not ask a multi-question dump.

### 2. Design Dials

Set these numeric dials in `PRD.md` and reflect them in UI tasks:

```text
DESIGN_VARIANCE: 1-10
MOTION_INTENSITY: 1-10
VISUAL_DENSITY: 1-10
```

Suggested interpretation:

- `DESIGN_VARIANCE`: 1 is predictable and symmetrical, 10 is expressive and asymmetric.
- `MOTION_INTENSITY`: 1 is static with basic hover states, 10 is advanced choreography.
- `VISUAL_DENSITY`: 1 is airy and editorial, 10 is dense and cockpit-like.

Only use the dials that fit the product. Do not force landing-page behavior onto dashboards, admin systems, or form-heavy apps.

### 3. Design System Mapping

Use the design read to choose a foundation:

| Brief reads as | Preferred foundation |
|---|---|
| Microsoft or enterprise productivity | Fluent UI official packages |
| Google or Material-flavored product | Material Web or Material ecosystem |
| IBM or enterprise analytics | Carbon |
| Shopify admin surface | Polaris |
| Atlassian or Jira-style product | Atlaskit |
| GitHub-style developer product | Primer |
| UK public-sector service | GOV.UK Frontend |
| US public-sector service | USWDS |
| Fast local-business or agency MVP | Bootstrap can be acceptable |
| Modern accessible React foundation | Radix Themes or Radix primitives |
| Modern SaaS where components are owned by the project | shadcn/ui or Tailwind plus custom components |
| Generic modern web UI with no specified system | Tailwind CSS as styling foundation, plus semantic tokens |
| Strongly branded, editorial, portfolio, or experimental site | Tailwind or native CSS with custom composition |

Be honest about aesthetic references. Glassmorphism, bento, brutalism, editorial, dark tech, aurora gradients, and Apple-like effects are aesthetics, not official design systems.

### 4. Anti-Default Discipline

Do not default to:

- AI-purple gradients
- centered hero over a dark mesh background
- three equal feature cards
- generic glassmorphism everywhere
- Inter plus slate colors as the automatic look
- decorative badges, status dots, and labels that do not help the user
- fake product screenshots built from placeholder divs
- repeated section layouts across a page
- long list/table sections when a better grouped UI exists
- placeholder copy, generic names, or fake-precise metrics

### 5. UI Quality Gates

Generated PRDs and tasks must include relevant checks for:

- design read alignment
- component-system discipline
- color consistency lock
- shape and radius consistency lock
- theme consistency lock
- typography hierarchy
- motion purpose and reduced-motion fallback
- real loading, empty, error, and success states
- form labels above inputs and no placeholder-as-label
- button contrast and no wrapped desktop CTA text
- accessibility basics
- responsive behavior per multi-column section
- copy quality and absence of obvious AI tells

### 6. Motion Philosophy

Motion must communicate hierarchy, storytelling, feedback, or state change. If it does not communicate one of those, leave it out.

Rules:

- Respect `prefers-reduced-motion`.
- Animate transform and opacity, not layout properties.
- Avoid scroll listeners that update React state on every frame.
- Use Motion, CSS, or a proper scroll animation library only when the brief and scope justify it.
- Do not claim motion intensity if the implementation is static.

### 7. Visual Asset Strategy

If a project has marketing, portfolio, media, brand, commerce, or editorial surfaces, plan real visual assets:

- generated images if available and appropriate
- real product screenshots if the product exists
- real brand assets if provided
- explicit placeholder slots only when assets are missing

Do not fill important visual areas with fake screenshot divs or decorative SVGs as a default.

### 8. TasteSkill Scope Note

The attached TasteSkill-style skill is strongest for landing pages, portfolios, and redesigns. For dashboards, data-heavy apps, CRUD tools, and multi-step product UI, apply the underlying philosophy without blindly enforcing landing-page rules.

## Output Structure

```text
<project-root>/
  PRD.md
  AGENTS.md
  README.md
  SKILL.md                       # frontend or full-stack only
  .devtool/
    features/
      t01-<slug>.md
      t02-<slug>.md
```

## PRD.md

`PRD.md` is the product and technical specification.

Recommended sections:

```text
# <Project Name> PRD

## 1. Product Summary
## 2. Problem Statement
## 3. Project Mode
## 4. Goals
## 5. Non-Goals
## 6. Users / Personas
## 7. Core Use Cases
## 8. UX / Frontend Requirements
## 9. TasteSkill Design Read
## 10. Design Direction
## 11. Recommended Technical Direction
## 12. High-Level Architecture
## 13. Frontend Architecture
## 14. Backend / API Architecture
## 15. Data Model / Storage Design
## 16. External Integrations
## 17. Security / Privacy Requirements
## 18. Error Handling Requirements
## 19. Testing Requirements
## 20. MVP Scope
## 21. Future Enhancements
## 22. Open Questions
## 23. Definition Of Done
```

Adjust sections based on project mode. Do not put AI workflow rules, setup commands, detailed task lists, task metadata, or commit rules in `PRD.md`.

## AGENTS.md

`AGENTS.md` is the AI entry point. Keep it brief and token-efficient.

Recommended sections:

```text
# AGENTS.md

## Purpose
## Project Snapshot
## Source Of Truth
## Default Read Path
## Task Workflow
## Task Statuses
## Behavioral Rules
## Project Rules
## Verification
## Task Report
## When Unsure
```

Do not include full specs, schemas, endpoints, env docs, setup instructions, long examples, or duplicated README content.

Required task report:

```text
After completing a task, report:

- What changed
- How it was verified
- What to test next, if anything
- Recommended next task
- Suggested commit message
```

Commit message format:

```text
type(scope): summary
```

## README.md

`README.md` is the developer-facing project guide.

Recommended sections:

```text
# <Project Name>

## Overview
## Tech Stack
## Project Structure
## Requirements
## Environment Variables
## Local Setup
## Common Development Commands
## Frontend Development
## Backend/API Development
## CLI Commands
## API Endpoints
## Database / Storage Notes
## Testing
## Build / Deployment
## Task Workflow
## Notes / Limitations
```

Adjust sections based on project mode. Do not include detailed PRD discussion, AI behavioral rules, full task lists, or task frontmatter.

## SKILL.md

For frontend and full-stack projects, generate `SKILL.md` from the project-specific design read.

It should include:

- frontmatter with name and description
- brief inference
- design dials
- selected system or styling foundation
- component strategy
- layout and responsive rules
- typography rules
- color, shape, and theme locks
- motion rules
- state rules
- accessibility rules
- anti-slop bans
- pre-flight review checklist

Keep `SKILL.md` practical. Do not paste a long generic skill file unchanged. Tailor it to the project.

## Feature Tasks

Task files live in:

```text
.devtool/features/
```

Each task file must be independently useful.

### Task File Naming

```text
tNN-short-slug.md
```

Examples:

```text
t01-project-scaffold.md
t02-tooling-quality-baseline.md
t03-design-read-and-skill.md
t04-frontend-scaffold.md
t05-database-setup.md
t06-health-endpoint.md
```

### Task Frontmatter

Each task must start with YAML frontmatter:

```yaml
---
id: 't01-project-scaffold'
status: 'todo'
priority: 'high'
assignee: null
epic: 'foundation'
dueDate: null
created: '2026-01-01T00:00:00Z'
modified: '2026-01-01T00:00:00Z'
completedAt: null
labels: ['foundation', 'setup']
depends_on: []
order: 'a01'
---
```

### Task Body

```md
# t01-project-scaffold - Project scaffold

## Hierarchy

- Epic: `foundation`
- Dependencies: None

## Scope

Describe what this task builds.

## Suggested Agent

- Suggested model: `GPT-5.4-mini`
- Reasoning level: `medium`

## Acceptance

- [ ] Acceptance criterion
- [ ] Acceptance criterion
- [ ] Acceptance criterion

## Notes

Implementation notes, constraints, or references.

## Progress Log

- <timestamp>: Task created.
```

## Task Generation Rules

Generate tasks as small vertical slices.

Good:

```text
t01-project-scaffold
t02-tooling-quality-baseline
t03-design-read-and-skill
t04-frontend-shell
t05-config-management
t06-database-models
t07-api-contracts
t08-api-client
t09-primary-feature-ui
t10-feature-api
t11-connect-feature-ui-to-api
```

Avoid:

```text
t01-build-backend
t02-build-frontend
t03-create-api
t04-add-ui
```

Each task should:

- have one clear outcome
- be independently verifiable
- have explicit dependencies
- have 3-7 acceptance criteria
- include suggested model and reasoning level
- include labels and an epic
- include a stable order value

Initial statuses:

- first task is usually `todo`
- dependency-blocked tasks are `backlog`
- no task starts as `in-progress`
- no task starts as `done`

## Dependency Rules

Use `depends_on` for real implementation blockers.

Examples:

```yaml
depends_on: []
```

```yaml
depends_on: ['t01-project-scaffold']
```

```yaml
depends_on: ['t03-api-contracts', 't04-config-management']
```

For full-stack projects, connect dependencies across UI, API, and data layers. Example: a screen task that calls the API should depend on the API client and endpoint task.

## Model And Reasoning Rules

Every task must include:

```md
## Suggested Agent

- Suggested model: `<model>`
- Reasoning level: `<level>`
```

Use:

```text
GPT-5.4-mini - low
```

For simple documentation, static UI, minor styling, config, and straightforward file updates.

```text
GPT-5.4-mini - medium
```

For ordinary implementation, basic screens, simple endpoints, simple CLI commands, forms, and moderate tests.

```text
GPT-5.5 - high
```

For schema work, migrations, integrations, state management, complex forms, error handling, accessibility passes, and non-trivial tests.

```text
GPT-5.5 - extra high
```

For architecture, complex data flows, ingestion, normalization, sync systems, idempotency, auth flows, cross-cutting frontend architecture, and large refactors.

## Suggested Epic Categories

Use project-appropriate epics.

Common examples:

```text
foundation
design-system
frontend
backend
database
api
auth
integration
ingestion
jobs
state-management
testing
quality
docs
release
```

## Acceptance Criteria Guidelines

Acceptance criteria should be:

- specific
- testable
- scoped to the task
- written as checkboxes
- focused on outcomes

Backend/API example:

```md
## Acceptance

- [ ] `GET /health` returns HTTP 200.
- [ ] Response body is `{ "status": "ok" }`.
- [ ] Endpoint is registered from the main app.
- [ ] README documents how to call the endpoint.
```

Frontend/UI example:

```md
## Acceptance

- [ ] Dashboard route renders successfully.
- [ ] Page uses the selected component strategy.
- [ ] Loading, empty, and error states are represented.
- [ ] Layout is usable on mobile and desktop widths.
- [ ] Primary actions are keyboard accessible.
- [ ] UI passes the project `SKILL.md` pre-flight checklist.
```

## Final Output Requirements

When generating project bootstrap files, the AI should provide:

1. `PRD.md`
2. `AGENTS.md`
3. `README.md`
4. `.devtool/features/*.md`
5. `SKILL.md` for frontend or full-stack projects

The AI should also summarize:

- project mode used
- design read, if applicable
- selected design system or styling foundation, if applicable
- files created
- number of feature tasks created
- first task to start
- assumptions made
- open questions

## Quality Checklist

Before finishing, verify that:

- project mode is identified as `frontend`, `backend`, or `full-stack`
- `AGENTS.md` is brief and not a duplicate PRD
- `README.md` contains setup and run instructions
- `PRD.md` contains product and architecture details
- frontend/full-stack projects include TasteSkill design read, dials, UX, and frontend architecture planning
- backend/full-stack projects include API, storage, integration, and backend architecture planning
- selected design system or styling foundation is justified by the brief
- no default HeroUI recommendation appears unless the user specified HeroUI
- Tailwind is described as a styling foundation, not a complete design system
- every task has frontmatter
- every task has acceptance criteria
- every task has dependencies
- every task has suggested model and reasoning level
- task dependencies form a sensible implementation flow
- the first task is `todo`
- blocked tasks are `backlog`
- no task starts as `in-progress`
