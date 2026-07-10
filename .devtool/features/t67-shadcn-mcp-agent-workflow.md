---
id: 't67-shadcn-mcp-agent-workflow'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'tooling'
dueDate: null
created: '2026-07-10T18:00:00+08:00'
modified: '2026-07-10T19:15:00+08:00'
completedAt: null
labels: ['dashboard', 'shadcn', 'mcp', 'claude-code', 'codex', 'vscode']
depends_on: ['t56-dashboard-shadcn-foundation']
order: 'a67'
---

# t67-shadcn-mcp-agent-workflow - Configure shadcn MCP and agent workflow for Claude Code and Codex

## Hierarchy

- Epic: `tooling`
- Dependencies: `t56-dashboard-shadcn-foundation`

## Scope

Configure the official shadcn MCP server for both the Claude Code and Codex VS Code extensions at project scope. The MCP server is dashboard-only and targets `apps/dashboard`. Add the current shadcn agent skill where supported so both agents understand Base UI APIs, monorepo aliases, registry operations, and the CLI update workflow without applying shadcn to `apps/invite` or invitation theme modules.

## Suggested Agent

- Suggested model: `GPT-5.6 Luna (gpt-5.6-luna)`
- Reasoning level: `medium`

## Acceptance

- [ ] Add a repository-root `.mcp.json` entry named `shadcn` for Claude Code using `shadcn@latest mcp` and targeting `apps/dashboard` as the working project.
- [ ] Add a project-scoped `.codex/config.toml` entry named `shadcn` so the Codex IDE extension uses the same server without requiring a separate per-editor setup.
- [ ] Keep MCP configuration free of secrets and commit only project-safe configuration.
- [ ] Run `pnpm dlx shadcn@latest mcp init --client claude` and `--client codex` as reference/validation commands, then preserve the project-scoped files required by this monorepo.
- [ ] Install or update the official shadcn agent skill with `pnpm dlx skills add shadcn/ui` when the local agent setup supports skills; document any generated agent-specific directories.
- [ ] Verify Claude Code reports the shadcn server through `/mcp` after restarting the extension.
- [ ] Verify Codex sees the server through the IDE MCP panel or `codex mcp list` after restarting the extension.
- [ ] Run test prompts that list available components, inspect project configuration, and propose a Base UI Select addition without writing files.
- [ ] Add agent guidance stating that shadcn MCP operations are permitted only for `apps/dashboard` and `packages/dashboard-ui`; prompts must not add shadcn components to `apps/invite` or theme directories.
- [ ] Document troubleshooting for PATH/Node issues, untrusted Codex projects, missing `components.json`, and MCP server startup failures.

## UI Quality Checklist

- [ ] Uses the project-owned shadcn/ui Base UI components before creating custom controls.
- [ ] Follows Lumiere color, shape, typography, density, motion, and theme locks from `SKILL.md`.
- [ ] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [ ] Works on required mobile, tablet, and desktop viewport widths.
- [ ] Meets keyboard, label, contrast, focus-management, and reduced-motion basics.
- [ ] Avoids browser-default controls, duplicate navigation, and generic AI-dashboard patterns.

## Notes

The official shadcn initializer generates a Claude project `.mcp.json`. For Codex, keep a repository `.codex/config.toml` because Codex supports project-scoped configuration in trusted repositories and the IDE extension shares that configuration with the CLI. The MCP server should target the dashboard workspace because that is where `components.json` and dashboard component operations originate.

## Progress Log

- 2026-07-10T18:00:00+08:00: Original task created.
- 2026-07-10T18:30:00+08:00: Updated to the current shadcn CLI v4 workflow with Base UI primitives and monorepo-aware component placement.
- 2026-07-10T19:15:00+08:00: Scoped shadcn/Base UI to the dashboard only and updated the suggested model to GPT-5.6 Terra with xhigh reasoning.
