# AGENTS.md

## Purpose

Guide AI agents working in this repository.

## Project Snapshot

Lumiere is a full-stack multi-event invitation and RSVP platform with two Next.js apps, a Hono API, Supabase Auth, PostgreSQL, Drizzle, and a TasteSkill-driven UI approach.

## Source Of Truth

- Product and architecture: `PRD.md`
- UI/UX guardrails: `SKILL.md`
- Setup and commands: `README.md`
- Task state: `.devtool/features/*.md`

## Default Read Path

1. Read this file.
2. Read the active task in `.devtool/features/`.
3. Read `SKILL.md` for UI work.
4. Read `PRD.md` only for needed product or architecture context.
5. Read `README.md` only for setup, commands, APIs, or workflow.

## Task Workflow

- Work on one task at a time.
- Start with the lowest-order `todo` task whose dependencies are complete.
- Do not start tasks blocked by `depends_on`.
- Update task status and append concise progress notes.
- Only create a new task or update when specifically asked

## Task Statuses

Use only `backlog`, `todo`, `in-progress`, `done`, and `blocked`.

## Behavioral Rules

- Keep changes small and scoped to the active task.
- Avoid duplicating PRD or README content.
- Prefer shared contracts before wiring UI to API.
- Follow `SKILL.md` and run the pre-flight review for UI tasks.
- Ask only when a missing decision materially affects architecture, data model, UX, or security.

## Project Rules

- Use `pnpm`.
- Prefer latest stable dependencies where practical.
- Use TypeScript and lint-staged where practical; do not run Prettier.
- Do not add a component library unless justified by the task.
- Use Tailwind CSS as styling foundation with semantic tokens (be aware of lint suggestCanonicalClasses).
- Keep `globals.css` simple.
- Keep secrets server-side.

## shadcn Agent Boundary

- shadcn MCP, CLI, registry, and installed skill operations are permitted only for `apps/dashboard` and `packages/dashboard-ui`.
- Run project-aware shadcn commands with `--cwd apps/dashboard`; shared primitives must resolve through the aliases in both `components.json` files.
- Never add shadcn, Base UI, or dashboard UI imports to `apps/invite`, `packages/themes`, or invitation theme modules.
- Inspect installed components first and use `--dry-run` plus `--diff` before updating a wrapper. Never use `--overwrite` without explicit user approval.
- Follow `apps/dashboard/SHADCN_AGENT_WORKFLOW.md` for editor setup, validation prompts, and troubleshooting.
- Stop creating new tests but make sure existing tests work

## Verification

Run the narrowest useful checks first:

- typecheck
- lint
- format check
- tests
- app/API smoke checks
- UI pre-flight review for frontend work

## Task Report

After completing a task, report:

- What changed
- How to check the changes (if possible)
- Recommended next task
- Suggested commit message

Commit format:

```text
type(scope): summary
```

## When Unsure

Prefer the smallest reversible implementation aligned with `PRD.md`, then document the assumption in the task progress log.
