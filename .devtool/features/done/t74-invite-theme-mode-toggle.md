---
id: 't74-invite-theme-mode-toggle'
status: 'done'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-13T09:00:00+08:00'
modified: '2026-07-13T16:52:00+08:00'
completedAt: '2026-07-13T16:52:00+08:00'
labels: ['invite', 'themes', 'light-mode', 'dark-mode', 'accessibility']
depends_on: ['t26-invite-public-event-page', 't27-invite-guest-event-page', 't50-event-theme-content-settings-model', 't64-invite-theme-module-directory-refactor']
order: 'a74'
---

# t74-invite-theme-mode-toggle - Expose the configured theme mode toggle in the invite app

## Hierarchy

- Epic: `frontend`
- Dependencies: `t26-invite-public-event-page`, `t27-invite-guest-event-page`, `t50-event-theme-content-settings-model`, `t64-invite-theme-module-directory-refactor`

## Scope

Implement the guest-facing light/dark theme toggle when the selected theme and event configuration allow both modes. Keep visual presentation fully custom and obtain supported modes, default mode, labels, and styling hooks from `packages/themes`.

## Suggested Agent

- Suggested model: `GPT-5.6 Terra (gpt-5.6-terra)`
- Reasoning level: `high`

## Acceptance

- [x] Theme metadata declares supported modes and any theme-specific toggle presentation through the theme contract.
- [x] Event settings distinguish fixed light, fixed dark, system/default mode, and guest-toggleable modes as supported by the product.
- [x] The invite app renders a toggle only when the resolved event/theme configuration permits guest switching.
- [x] Guest choice persists for the event or browser session without overriding a manager-enforced fixed mode.
- [x] The toggle is keyboard and screen-reader accessible and does not flash the wrong theme during hydration.
- [x] Theme switching updates theme tokens, backdrops, ornaments, maps, RSVP design, and other theme-owned surfaces consistently.
- [x] No invite component checks a concrete theme ID to decide whether or how the toggle renders.
- [x] Tests cover fixed modes, system mode, guest-toggle mode, persistence, hydration, and unsupported themes.

## UI Quality Checklist

- [x] Dashboard controls use `@lumiere/dashboard-ui` shadcn/Base UI primitives where applicable.
- [x] Invite and theme visuals remain fully custom and contain no shadcn/Base UI imports.
- [x] Loading, empty, error, success, disabled, focus, hover, and active states are handled where relevant.
- [x] Mobile, tablet, and desktop behavior is explicitly verified.
- [x] Keyboard, screen-reader, contrast, focus-management, and reduced-motion basics are covered.
- [x] The result follows `SKILL.md` and avoids generic AI-dashboard or invitation-template patterns.

## Notes

This is fully custom invite UI. Do not import shadcn, Base UI, or `@lumiere/dashboard-ui`. The shared invite shell may decide whether a toggle slot exists, while the theme module owns its visual treatment.

## Progress Log

- 2026-07-13T09:00:00+08:00: Task created from dashboard and invite follow-up review.
- 2026-07-13T16:46:00+08:00: Started T74 after confirming all dependencies are complete; implementing a theme-owned toggle contract, event-scoped guest persistence, and a pre-paint system/storage resolver without concrete theme checks in the invite app.
- 2026-07-13T16:52:00+08:00: Completed theme-owned toggle labels, defaults, placement, and style hooks; fixed/system/toggleable resolution; event-scoped persistence; pre-hydration token application; accessible custom controls; and responsive audio-control spacing.
- 2026-07-13T16:52:00+08:00: Verified the invite production build, full workspace typecheck and tests, lint placeholders, targeted Prettier, invite UI dependency boundaries, and diff checks. The production build required the permitted unsandboxed rerun because Turbopack binds an internal CSS worker port.
