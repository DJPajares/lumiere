---
id: 't56-dashboard-shadcn-foundation'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'design-system'
dueDate: null
created: '2026-07-10T18:00:00+08:00'
modified: '2026-07-10T19:15:00+08:00'
completedAt: null
labels: ['dashboard', 'shadcn', 'base-ui', 'monorepo', 'uiux']
depends_on: ['t49-dashboard-component-system-and-field-overhaul']
order: 'a56'
---

# t56-dashboard-shadcn-foundation - Adopt shadcn/ui Base UI as the dashboard component foundation

## Hierarchy

- Epic: `design-system`
- Dependencies: `t49-dashboard-component-system-and-field-overhaul`

## Scope

Adopt the latest stable shadcn/ui workflow as the dashboard-only component foundation. Use Base UI primitives, not Radix UI, and use shadcn CLI v4 monorepo support so reusable dashboard primitives live in `packages/dashboard-ui` while dashboard-specific compositions remain in `apps/dashboard`. The package name and import path must make the boundary explicit. `apps/invite`, invite section renderers, and all invitation theme components remain fully custom and must not import shadcn, Base UI, or `@lumiere/dashboard-ui`.

## Suggested Agent

- Suggested model: `GPT-5.6 Sol (gpt-5.6-sol)`
- Reasoning level: `xhigh`

## Acceptance

- [ ] Use `pnpm dlx shadcn@latest` for all shadcn operations and record the resolved CLI/package versions in the implementation notes or lockfile.
- [ ] Configure shadcn with Base UI using `--base base`; use the Base UI style variant consistently, with `base-nova` as the neutral baseline unless the dashboard design review selects another Base preset.
- [ ] Create or align `apps/dashboard/components.json` and `packages/dashboard-ui/components.json`; both use the same `style`, `baseColor`, `iconLibrary`, RSC setting, and Tailwind CSS-variable strategy.
- [ ] For Tailwind CSS v4, leave `tailwind.config` empty in both `components.json` files and point both workspaces to the shared `packages/dashboard-ui/src/styles/globals.css`.
- [ ] Route shadcn primitives, hooks, and utilities to `packages/dashboard-ui`; keep feature-level forms, navigation, theme gallery controls, and event compositions inside `apps/dashboard`.
- [ ] Add an explicit dependency-boundary check proving `apps/invite` and invite/theme packages do not import `@lumiere/dashboard-ui`, `shadcn`, or `@base-ui/react`.
- [ ] Add `@lumiere/dashboard-ui` to the dashboard as a workspace dependency and expose stable package exports for components, hooks, utilities, and shared styles.
- [ ] Install the required dashboard primitives through the CLI: Button, Field, Input, Textarea, Select, Combobox, Popover, Calendar, Dialog, Drawer/Sheet, Dropdown Menu, Avatar, Badge, Tabs, Tooltip, Alert Dialog, Skeleton, and toast/notification components as needed.
- [ ] Use `shadcn add --dry-run`, `--view`, or `--diff` before overwriting or updating an existing component; never blindly replace locally modified code.
- [ ] Do not add `@radix-ui/*` dependencies or Radix-specific APIs for the new dashboard foundation unless a documented blocker proves the Base UI variant cannot satisfy a requirement.
- [ ] Keep `globals.css` limited to Tailwind/shadcn imports, semantic tokens, and essential base styles; add a dashboard component showcase covering light/dark and major field states.

## UI Quality Checklist

- [ ] Uses the project-owned shadcn/ui Base UI components before creating custom controls.
- [ ] Follows Lumiere color, shape, typography, density, motion, and theme locks from `SKILL.md`.
- [ ] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [ ] Works on required mobile, tablet, and desktop viewport widths.
- [ ] Meets keyboard, label, contrast, focus-management, and reduced-motion basics.
- [ ] Avoids browser-default controls, duplicate navigation, and generic AI-dashboard patterns.

## Notes

The current official workflow supports both Base UI and Radix, but Lumiere intentionally standardizes on Base UI. Dashboard feature code should import the project-owned shadcn wrappers from `@lumiere/dashboard-ui`, not import `@base-ui/react` directly, except inside the dashboard UI implementation when required. Invite and theme code must remain fully custom and may share only neutral contracts, tokens, or data types that do not depend on shadcn/Base UI. Do not run `init --monorepo` against the existing repository because that command scaffolds a new monorepo; configure the existing workspaces using the official monorepo file layout and aliases.

## Progress Log

- 2026-07-10T18:00:00+08:00: Original task created.
- 2026-07-10T18:30:00+08:00: Updated to the current shadcn CLI v4 workflow with Base UI primitives and monorepo-aware component placement.
- 2026-07-10T19:15:00+08:00: Scoped shadcn/Base UI to the dashboard only and updated the suggested model to GPT-5.6 Terra with xhigh reasoning.
