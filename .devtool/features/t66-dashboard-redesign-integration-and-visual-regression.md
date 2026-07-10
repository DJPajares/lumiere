---
id: 't66-dashboard-redesign-integration-and-visual-regression'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'quality'
dueDate: null
created: '2026-07-10T18:00:00+08:00'
modified: '2026-07-10T19:15:00+08:00'
completedAt: null
labels: ['dashboard', 'shadcn', 'base-ui', 'visual-qa', 'integration', 'regression']
depends_on: ['t57-dashboard-select-combobox-overhaul', 't58-dashboard-date-time-picker-overhaul', 't59-responsive-dashboard-top-navigation', 't60-dashboard-user-menu-and-notifications', 't61-manager-consolidated-dashboard-root', 't62-dashboard-responsive-modal-workflows', 't63-compatible-theme-gallery-live-preview', 't67-shadcn-mcp-agent-workflow']
order: 'a66'
---

# t66-dashboard-redesign-integration-and-visual-regression - Integrate and validate the shadcn Base UI dashboard redesign

## Hierarchy

- Epic: `quality`
- Dependencies: `t57-dashboard-select-combobox-overhaul`, `t58-dashboard-date-time-picker-overhaul`, `t59-responsive-dashboard-top-navigation`, `t60-dashboard-user-menu-and-notifications`, `t61-manager-consolidated-dashboard-root`, `t62-dashboard-responsive-modal-workflows`, `t63-compatible-theme-gallery-live-preview`, `t67-shadcn-mcp-agent-workflow`

## Scope

Run an integration, dependency, accessibility, and visual-regression pass over the redesigned dashboard. Verify that the Base UI-backed shadcn components and Lumiere-specific compositions form one coherent manager experience.

## Suggested Agent

- Suggested model: `GPT-5.6 Terra (gpt-5.6-terra)`
- Reasoning level: `xhigh`

## Acceptance

- [ ] Capture and review desktop, tablet, and mobile states for manager overview, events, event workspace, theme gallery, event edit modal, guest modal, selects, comboboxes, and date pickers.
- [ ] Confirm dashboard feature code imports shadcn wrappers from `@lumiere/dashboard-ui` and does not directly depend on Radix UI.
- [ ] Confirm `apps/invite` and all invite/theme modules remain fully custom and have no imports from `@lumiere/dashboard-ui`, shadcn, or Base UI.
- [ ] Audit the lockfile/package graph for unintended `@radix-ui/*` additions introduced by the redesign; document any justified exception.
- [ ] Add or run a dependency-boundary check that fails when dashboard-only UI packages are imported by the invite app or theme packages.
- [ ] Confirm `apps/dashboard/components.json` and `packages/dashboard-ui/components.json` retain matching Base UI style, base color, icon library, CSS variables, and aliases.
- [ ] Confirm no permanent sidebar appears on desktop/tablet and no route menu items appear in the mobile top bar.
- [ ] Confirm root dashboard never flashes fake zero metrics or depends on another route to populate.
- [ ] Confirm form anatomy, focus rings, popup positioning, calendars, nested modal fields, and mobile drawers are consistent and accessible.
- [ ] Use shadcn CLI `--diff` against installed primitives and merge upstream fixes intentionally without overwriting Lumiere changes.
- [ ] Add screenshot or visual-regression coverage for the highest-risk layouts and controls.
- [ ] Create follow-up tasks only for issues that cannot be corrected within this integration pass.

## UI Quality Checklist

- [ ] Uses the project-owned shadcn/ui Base UI components before creating custom controls.
- [ ] Follows Lumiere color, shape, typography, density, motion, and theme locks from `SKILL.md`.
- [ ] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [ ] Works on required mobile, tablet, and desktop viewport widths.
- [ ] Meets keyboard, label, contrast, focus-management, and reduced-motion basics.
- [ ] Avoids browser-default controls, duplicate navigation, and generic AI-dashboard patterns.

## Notes

Use the supplied screenshots as the before state. The acceptance bar is a polished event-management product, not merely a restyled version of the existing layout.

## Progress Log

- 2026-07-10T18:00:00+08:00: Original task created.
- 2026-07-10T18:30:00+08:00: Updated to the current shadcn CLI v4 workflow with Base UI primitives and monorepo-aware component placement.
- 2026-07-10T19:15:00+08:00: Scoped shadcn/Base UI to the dashboard only and updated the suggested model to GPT-5.6 Terra with xhigh reasoning.
