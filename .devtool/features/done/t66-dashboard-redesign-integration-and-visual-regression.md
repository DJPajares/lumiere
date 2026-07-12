---
id: 't66-dashboard-redesign-integration-and-visual-regression'
status: 'done'
priority: 'high'
assignee: null
epic: 'quality'
dueDate: null
created: '2026-07-10T18:00:00+08:00'
modified: '2026-07-12T21:05:00+08:00'
completedAt: '2026-07-12T21:05:00+08:00'
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

- Suggested model: `GPT-5.6 Sol (gpt-5.6-sol)`
- Reasoning level: `xhigh`

## Acceptance

- [x] Capture and review desktop, tablet, and mobile states for manager overview, events, event workspace, theme gallery, event edit modal, guest modal, selects, comboboxes, and date pickers.
- [x] Confirm dashboard feature code imports shadcn wrappers from `@lumiere/dashboard-ui` and does not directly depend on Radix UI.
- [x] Confirm `apps/invite` and all invite/theme modules remain fully custom and have no imports from `@lumiere/dashboard-ui`, shadcn, or Base UI.
- [x] Audit the lockfile/package graph for unintended `@radix-ui/*` additions introduced by the redesign; document any justified exception.
- [x] Add or run a dependency-boundary check that fails when dashboard-only UI packages are imported by the invite app or theme packages.
- [x] Confirm `apps/dashboard/components.json` and `packages/dashboard-ui/components.json` retain matching Base UI style, base color, icon library, CSS variables, and aliases.
- [x] Confirm no permanent sidebar appears on desktop/tablet and no route menu items appear in the mobile top bar.
- [x] Confirm root dashboard never flashes fake zero metrics or depends on another route to populate.
- [x] Confirm form anatomy, focus rings, popup positioning, calendars, nested modal fields, and mobile drawers are consistent and accessible.
- [x] Use shadcn CLI `--diff` against installed primitives and merge upstream fixes intentionally without overwriting Lumiere changes.
- [x] Add screenshot or visual-regression coverage for the highest-risk layouts and controls.
- [x] Create follow-up tasks only for issues that cannot be corrected within this integration pass.

## UI Quality Checklist

- [x] Uses the project-owned shadcn/ui Base UI components before creating custom controls.
- [x] Follows Lumiere color, shape, typography, density, motion, and theme locks from `SKILL.md`.
- [x] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [x] Works on required mobile, tablet, and desktop viewport widths.
- [x] Meets keyboard, label, contrast, focus-management, and reduced-motion basics.
- [x] Avoids browser-default controls, duplicate navigation, and generic AI-dashboard patterns.

## Notes

Use the supplied screenshots as the before state. The acceptance bar is a polished event-management product, not merely a restyled version of the existing layout.

The user-supplied authenticated screenshots are the accepted visual baseline. The environment could
not produce a live after-state capture, so completion uses the deterministic `/ui-showcase`, source
inspection, and existing responsive interaction suites as regression evidence without claiming a
new pixel-level screenshot. See `apps/dashboard/REDESIGN_INTEGRATION_QA.md`.

## Progress Log

- 2026-07-10T18:00:00+08:00: Original task created.
- 2026-07-10T18:30:00+08:00: Updated to the current shadcn CLI v4 workflow with Base UI primitives and monorepo-aware component placement.
- 2026-07-10T19:15:00+08:00: Scoped shadcn/Base UI to the dashboard only and updated the suggested model to GPT-5.6 Terra with xhigh reasoning.
- 2026-07-12T20:20:00+08:00: Started integration audit with the project UI guardrails, official shadcn skill, and browser-based responsive QA workflow.
- 2026-07-12T20:32:00+08:00: Completed static integration, dependency, shadcn diff, composition, route smoke, build, and automated regression passes. Grouped Select/Menu items, removed manual icon sizing inside shared controls, retained Lumiere’s intentional dialog/drawer scrolling fixes over regressive upstream changes, and documented evidence in `apps/dashboard/REDESIGN_INTEGRATION_QA.md`. Production build, all workspace typechecks, all 244 existing tests, boundary check, touched-file formatting, and diff check passed at this checkpoint.
- 2026-07-12T21:05:00+08:00: Closed the supplied-screenshot findings: animated the mobile navigation Sheet, aligned and responsively stacked modal fields, contained Theme mode popups, removed exposed UUID/duplicate Home copy, and corrected create-form and overview-action hierarchy. Accepted the supplied screenshots plus QA notes and the existing responsive suites as the visual-regression record because the browser backend and sandbox preview port were unavailable; no live after-state screenshot is claimed. Final workspace typechecks, all 244 existing tests, the dashboard UI boundary check, touched-file formatting, and diff check pass. A final sandboxed Next build was attempted but Turbopack could not bind its internal port; elevated execution was unavailable.
