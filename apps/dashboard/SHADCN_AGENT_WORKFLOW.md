# shadcn Agent Workflow

Lumiere exposes the official shadcn MCP server to Claude Code and Codex for dashboard work. The server is repository-scoped and always resolves the project from `apps/dashboard`.

## Scope

Permitted targets:

- `apps/dashboard` for dashboard-specific compositions, hooks, and application code.
- `packages/dashboard-ui` for shared shadcn/Base UI wrappers, utilities, hooks, and dashboard styles.

Forbidden targets:

- `apps/invite`
- `packages/themes`
- invitation renderers, themes, or theme assets anywhere else in the repository

The public invitation system remains custom and theme-driven. Do not introduce imports from `@lumiere/dashboard-ui`, `shadcn`, or `@base-ui/react` into those targets.

## Project configuration

Claude Code reads the root `.mcp.json`. Codex reads the root `.codex/config.toml` when the repository is trusted. Both define a server named `shadcn` with this effective command:

```text
pnpm dlx shadcn@latest mcp --cwd apps/dashboard
```

The two `components.json` manifests intentionally share `base-nova`, neutral base color, CSS variables, Lucide icons, menu settings, and compatible aliases. The dashboard manifest routes shared UI and utilities to `@lumiere/dashboard-ui`; the package manifest resolves those files inside `packages/dashboard-ui`.

No secret or private registry credential belongs in either MCP configuration. If a private registry is introduced later, reference an environment variable and keep its value outside version control.

## Installed agent skills

`pnpm dlx skills add shadcn/ui` creates the following project-owned files:

- `.agents/skills/shadcn/` — shadcn project inspection, Base UI patterns, registry operations, and safe CLI update guidance.
- `.agents/skills/migrate-radix-to-base/` — the companion migration reference included by the official source.
- `skills-lock.json` — source paths and integrity hashes for reproducible updates.

Agents should load the shadcn skill only for work inside the permitted dashboard scope. The migration skill does not authorize a migration unless the active task explicitly requests one.

## Read-only discovery workflow

Run commands from the repository root and keep the dashboard working directory explicit:

```bash
pnpm dlx shadcn@latest info --json --cwd apps/dashboard
pnpm dlx shadcn@latest search @shadcn -q "select" --cwd apps/dashboard
pnpm dlx shadcn@latest docs select --cwd apps/dashboard
pnpm dlx shadcn@latest add select --dry-run --cwd apps/dashboard
```

Before changing an installed primitive, inspect the local wrapper and preview upstream changes:

```bash
pnpm dlx shadcn@latest add select --dry-run --cwd apps/dashboard
pnpm dlx shadcn@latest add select --diff select.tsx --cwd apps/dashboard
```

Merge relevant upstream fixes into the project-owned wrapper while preserving Lumiere behavior and tokens. Do not use `--overwrite` without explicit approval.

## Editor validation

After cloning or changing MCP configuration:

1. Restart Claude Code and run `/mcp`. Confirm `shadcn` reports `Connected`.
2. Restart Codex or reload its VS Code extension, then check the MCP panel or run `codex mcp list`. Confirm `shadcn` is enabled and its arguments contain `--cwd apps/dashboard`.
3. Try these read-only prompts:
   - “List the available UI components in the configured shadcn registry. Do not write files.”
   - “Inspect this project’s shadcn configuration and report its base, style, aliases, and resolved UI path. Do not write files.”
   - “Find the Base UI Select component and propose how it would be imported through Lumiere’s aliases. Do not add or edit files.”

Expected project facts are Base UI, `base-nova`, Tailwind v4, Lucide icons, and the shared UI path `packages/dashboard-ui/src/components`. A Select proposal should use `@lumiere/dashboard-ui/components/select`, group `SelectItem` elements inside `SelectGroup`, and avoid writing files until requested.

## Troubleshooting

### Node, pnpm, or PATH errors

- Run `node --version` and `pnpm --version` in the same terminal used to launch the editor.
- Launch the editor from a shell that has the project’s Node and pnpm paths, or configure the extension’s environment accordingly.
- Test startup directly with `pnpm dlx shadcn@latest mcp --cwd apps/dashboard` and stop it after confirming it remains running over stdio.

### Codex does not show the server

- Trust the repository; project-scoped `.codex/config.toml` is ignored for untrusted projects.
- Restart Codex after changing TOML, then run `codex mcp list`.
- Confirm the active workspace root is the repository root rather than `apps/dashboard`.

### Claude Code does not show the server

- Restart Claude Code after changing `.mcp.json`, then run `/mcp`.
- Confirm Claude opened the repository root and that the JSON parses successfully.

### Missing `components.json`

- Do not run `shadcn init` in `apps/invite` or a theme directory.
- Confirm both `apps/dashboard/components.json` and `packages/dashboard-ui/components.json` exist.
- Run `pnpm dlx shadcn@latest info --json --cwd apps/dashboard` and verify that the resolved UI path points to `packages/dashboard-ui/src/components`.

### MCP startup or registry failures

- Run the effective MCP command directly to surface Node, package-download, or JSON errors.
- Confirm network access to `ui.shadcn.com` and any configured registry.
- Check that registry names and URLs in `components.json` are valid and that private credentials come from environment variables.
- If the MCP tools load but return no items, rerun the project info command and inspect the editor’s MCP output logs before changing files.
