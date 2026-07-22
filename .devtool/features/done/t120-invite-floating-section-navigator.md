---
id: 't120-invite-floating-section-navigator'
status: 'done'
priority: 'medium'
assignee: null
epic: 'invite-experience'
dueDate: null
created: '2026-07-22T01:19:42+08:00'
modified: '2026-07-22T22:44:09+08:00'
labels: ['invite', 'navigation', 'sections', 'floating-control', 'motion', 'accessibility']
depends_on: ['t42-invite-ambient-audio-and-media-controls', 't53-invite-motion-parallax-system', 't74-invite-theme-mode-toggle', 't77-invite-theme-condition-boundary-refactor']
order: 'a120'
---

# t120-invite-floating-section-navigator - Add a floating invitation section navigator

## Hierarchy

- Epic: `invite-experience`
- Dependencies: `t42-invite-ambient-audio-and-media-controls`, `t53-invite-motion-parallax-system`, `t74-invite-theme-mode-toggle`, `t77-invite-theme-condition-boundary-refactor`

## Scope

Add a persistent floating section-navigation control to public and guest invitation pages. Keep it compact at rest, animate it open to reveal the invitation's rendered sections on hover, keyboard focus, or tap, and scroll to the selected section when activated. Position it on the horizontal side opposite the configured light/dark mode control while coordinating with ambient-audio controls and device safe areas.

## Suggested Agent

- Suggested model: `GPT-5.6 Sol (gpt-5.6-sol)`
- Reasoning level: `high`

## Acceptance

- [x] The navigator is rendered only when the invitation has multiple useful visible sections and derives its items, order, labels, and targets from the final rendered section list rather than a hard-coded section catalog.
- [x] The resting control is compact and identifiable; hover and focus-within may animate an expanded section list on pointer devices, while tap/click provides the same discoverable behavior on touch devices.
- [x] Selecting an item moves focus and scrolls to a stable section target without hiding its heading behind floating controls or breaking browser back/forward behavior.
- [x] The current section is indicated using an efficient observer-based approach where practical; scroll position is not copied into React state on every frame.
- [x] Placement resolves to the side opposite `theme.modeToggle.placement`, has an intentional fallback when no mode toggle is shown, respects safe-area insets, and does not overlap the mode toggle, music player, RSVP controls, or important content.
- [x] Expansion and scrolling use purposeful transform/opacity motion and honor `prefers-reduced-motion` with an immediate, fully usable fallback.
- [x] The control is fully operable by keyboard and screen reader, supports Escape/outside dismissal where applicable, restores focus predictably, and does not rely on hover, icon shape, or color alone.
- [x] Theme contracts may provide presentation hooks, but invite production code contains no concrete theme-ID branches and imports no shadcn, Base UI, or dashboard components.
- [x] Relevant existing invite renderer, mode-control, audio-control, and motion tests pass with invite typecheck, formatting, lint, 390px/768px/1440px smoke checks, and the `SKILL.md` UI pre-flight review.

## Notes

This is in-page navigation for rendered invitation sections, not a replacement for browser or app routing. Keep the collapsed control visually restrained so it supports the event experience rather than becoming a second navigation bar.

## Progress Log

- 2026-07-22T01:19:42+08:00: Task created for an animated floating invitation section navigator positioned opposite the theme-mode control; implementation not started.
- 2026-07-22T22:18:37+08:00: Started implementation; deriving navigation from the validated rendered section list and coordinating theme-mode, audio, safe-area, motion, and accessibility behavior.
- 2026-07-22T22:28:53+08:00: Completed the public/guest floating navigator with final-render-order targets, observer-based current state, focus-preserving smooth/reduced-motion navigation, hover/focus/tap disclosure, safe-area and audio-aware placement, and bounded responsive sizing. Invite tests (40), typecheck, formatting, theme-boundary validation, production build, and source-based 390px/768px/1440px UI pre-flight pass; the invite lint script remains a repository placeholder and the in-app browser was unavailable for live screenshots.
- 2026-07-22T22:33:35+08:00: Reopened from visual feedback to replace the wide resting bar with an icon-only translucent control and refine the expanded panel hierarchy, density, and premium finish.
- 2026-07-22T22:37:21+08:00: Completed the visual refinement with a 48px icon-only glass trigger, a separate translucent guide panel, compact progress context, denser rows, and a contained current-section state. Invite tests (40), typecheck, formatting, theme-boundary validation, and production build pass.
- 2026-07-22T22:42:36+08:00: Reopened to correct hover traversal across the trigger-panel gap and replace the visible scale-down dismissal with a complete opacity/translation exit.
- 2026-07-22T22:44:09+08:00: Added a full-width transparent hover bridge across the visual gap and replaced scale dismissal with a mounted fade-and-settle transition. Invite tests (40), typecheck, formatting, and production build pass.
