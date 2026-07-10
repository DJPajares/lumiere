---
id: 't55-dashboard-design-review-from-screenshots'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'quality'
dueDate: null
created: '2026-07-09T00:00:00+08:00'
modified: '2026-07-10T00:00:00+08:00'
completedAt: null
labels: ['dashboard', 'visual-qa', 'uiux', 'review']
depends_on: ['t42-dashboard-navigation-ia-reset', 't49-dashboard-component-system-and-field-overhaul', 't43-dashboard-event-edit-flow', 't56-dashboard-shadcn-foundation', 't57-dashboard-select-combobox-overhaul', 't58-dashboard-date-time-picker-overhaul', 't59-responsive-dashboard-top-navigation', 't60-dashboard-user-menu-and-notifications', 't61-manager-consolidated-dashboard-root', 't62-dashboard-responsive-modal-workflows', 't63-compatible-theme-gallery-live-preview', 't64-invite-theme-module-directory-refactor', 't65-event-public-id-and-slug-implementation', 't66-dashboard-redesign-integration-and-visual-regression', 't67-shadcn-mcp-agent-workflow']
order: 'a55'
---

# t55-dashboard-design-review-from-screenshots - Dashboard design review from current screenshots

## Hierarchy

- Epic: `quality`
- Dependencies: `t42-dashboard-navigation-ia-reset`, `t49-dashboard-component-system-and-field-overhaul`, `t43-dashboard-event-edit-flow`

## Scope

Run a focused visual and UX review against the current dashboard screens and convert remaining issues into concrete fixes before marking the dashboard MVP visually acceptable.

## Suggested Agent

- Suggested model: `GPT-5.6 Terra` (`gpt-5.6-terra`)
- Reasoning level: `xhigh`

## Acceptance

- [ ] Review event list, create form, event overview, tabs, sidebar, buttons, inputs, selects, date/time controls, cards, and badges.
- [ ] Document which current patterns are removed, kept, or redesigned.
- [ ] Verify dashboard no longer looks like raw wireframes or unstyled browser controls.
- [ ] Verify spacing, typography, button hierarchy, card density, and form layouts are consistent across dashboard pages.
- [ ] Capture before/after screenshots or QA notes for desktop and mobile widths.
- [ ] Create follow-up tasks only for issues that cannot fit in this pass.

## UI Quality Checklist

- [ ] Uses the selected dashboard or invite component strategy before custom UI.
- [ ] Follows Lumiere color, shape, typography, motion, and theme locks from `SKILL.md`.
- [ ] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [ ] Works on required mobile, tablet, and desktop viewport widths.
- [ ] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [ ] Avoids generic AI-slop patterns listed in `SKILL.md`.


## Notes

This is a quality gate specifically for the issues visible in the current screenshots: duplicate navigation, weak field controls, unclear edit paths, and low-polish dashboard composition.

## Progress Log

- 2026-07-09T00:00:00+08:00: Task created from dashboard and invite UX review concerns.
- 2026-07-10T00:00:00+08:00: Updated suggestion to GPT-5.6 Terra with xhigh reasoning; this focused review and remediation pass benefits from the balanced model.
