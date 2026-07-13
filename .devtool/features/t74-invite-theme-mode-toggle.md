---
id: 't74-invite-theme-mode-toggle'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-13T09:00:00+08:00'
modified: '2026-07-13T09:00:00+08:00'
completedAt: null
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

- [ ] Theme metadata declares supported modes and any theme-specific toggle presentation through the theme contract.
- [ ] Event settings distinguish fixed light, fixed dark, system/default mode, and guest-toggleable modes as supported by the product.
- [ ] The invite app renders a toggle only when the resolved event/theme configuration permits guest switching.
- [ ] Guest choice persists for the event or browser session without overriding a manager-enforced fixed mode.
- [ ] The toggle is keyboard and screen-reader accessible and does not flash the wrong theme during hydration.
- [ ] Theme switching updates theme tokens, backdrops, ornaments, maps, RSVP design, and other theme-owned surfaces consistently.
- [ ] No invite component checks a concrete theme ID to decide whether or how the toggle renders.
- [ ] Tests cover fixed modes, system mode, guest-toggle mode, persistence, hydration, and unsupported themes.

## UI Quality Checklist

- [ ] Dashboard controls use `@lumiere/dashboard-ui` shadcn/Base UI primitives where applicable.
- [ ] Invite and theme visuals remain fully custom and contain no shadcn/Base UI imports.
- [ ] Loading, empty, error, success, disabled, focus, hover, and active states are handled where relevant.
- [ ] Mobile, tablet, and desktop behavior is explicitly verified.
- [ ] Keyboard, screen-reader, contrast, focus-management, and reduced-motion basics are covered.
- [ ] The result follows `SKILL.md` and avoids generic AI-dashboard or invitation-template patterns.

## Notes

This is fully custom invite UI. Do not import shadcn, Base UI, or `@lumiere/dashboard-ui`. The shared invite shell may decide whether a toggle slot exists, while the theme module owns its visual treatment.

## Progress Log

- 2026-07-13T09:00:00+08:00: Task created from dashboard and invite follow-up review.
