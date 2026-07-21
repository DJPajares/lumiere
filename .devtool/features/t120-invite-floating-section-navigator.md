---
id: 't120-invite-floating-section-navigator'
status: 'todo'
priority: 'medium'
assignee: null
epic: 'invite-experience'
dueDate: null
created: '2026-07-22T01:19:42+08:00'
modified: '2026-07-22T01:22:35+08:00'
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

- [ ] The navigator is rendered only when the invitation has multiple useful visible sections and derives its items, order, labels, and targets from the final rendered section list rather than a hard-coded section catalog.
- [ ] The resting control is compact and identifiable; hover and focus-within may animate an expanded section list on pointer devices, while tap/click provides the same discoverable behavior on touch devices.
- [ ] Selecting an item moves focus and scrolls to a stable section target without hiding its heading behind floating controls or breaking browser back/forward behavior.
- [ ] The current section is indicated using an efficient observer-based approach where practical; scroll position is not copied into React state on every frame.
- [ ] Placement resolves to the side opposite `theme.modeToggle.placement`, has an intentional fallback when no mode toggle is shown, respects safe-area insets, and does not overlap the mode toggle, music player, RSVP controls, or important content.
- [ ] Expansion and scrolling use purposeful transform/opacity motion and honor `prefers-reduced-motion` with an immediate, fully usable fallback.
- [ ] The control is fully operable by keyboard and screen reader, supports Escape/outside dismissal where applicable, restores focus predictably, and does not rely on hover, icon shape, or color alone.
- [ ] Theme contracts may provide presentation hooks, but invite production code contains no concrete theme-ID branches and imports no shadcn, Base UI, or dashboard components.
- [ ] Relevant existing invite renderer, mode-control, audio-control, and motion tests pass with invite typecheck, formatting, lint, 390px/768px/1440px smoke checks, and the `SKILL.md` UI pre-flight review.

## Notes

This is in-page navigation for rendered invitation sections, not a replacement for browser or app routing. Keep the collapsed control visually restrained so it supports the event experience rather than becoming a second navigation bar.

## Progress Log

- 2026-07-22T01:19:42+08:00: Task created for an animated floating invitation section navigator positioned opposite the theme-mode control; implementation not started.
