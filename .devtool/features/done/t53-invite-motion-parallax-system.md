---
id: 't53-invite-motion-parallax-system'
status: 'done'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-09T00:00:00+08:00'
modified: '2026-07-10T15:15:09+08:00'
completedAt: '2026-07-10T15:15:09+08:00'
labels: ['invite', 'motion', 'parallax', 'tasteskill']
depends_on: ['t36-invite-visual-composition-system', 't51-reverie-inspired-invite-modernization']
order: 'a53'
---

# t53-invite-motion-parallax-system - Invite motion and parallax system

## Hierarchy

- Epic: `frontend`
- Dependencies: `t36-invite-visual-composition-system`, `t51-reverie-inspired-invite-modernization`

## Scope

Create a reusable motion system for invite pages with reveal, parallax, scroll progress, masked text, subtle hover/press feedback, and reduced-motion fallbacks.

## Suggested Agent

- Suggested model: `GPT-5.6 Sol` (`gpt-5.6-sol`)
- Reasoning level: `xhigh`

## Acceptance

- [x] Motion primitives support reveal, parallax layers, scroll progress, masked text, soft image movement, and section transitions.
- [x] Motion intensity can be controlled per theme and respects `prefers-reduced-motion`.
- [x] Parallax uses transform/opacity patterns and avoids React state updates on every scroll frame.
- [x] Animations improve hierarchy and storytelling without blocking reading or RSVP completion.
- [x] Motion components are isolated client leaves in Next.js where required.
- [x] Tests or stories demonstrate no-motion, low-motion, and premium-motion variants.

## UI Quality Checklist

- [x] Uses the selected dashboard or invite component strategy before custom UI.
- [x] Follows Lumiere color, shape, typography, motion, and theme locks from `SKILL.md`.
- [x] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [x] Works on required mobile, tablet, and desktop viewport widths.
- [x] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [x] Avoids generic AI-slop patterns listed in `SKILL.md`.


## Notes

Apply TasteSkill: motion must communicate hierarchy, storytelling, feedback, or state transition. If it does not, remove it.

## Progress Log

- 2026-07-09T00:00:00+08:00: Task created from dashboard and invite UX review concerns.
- 2026-07-10T00:00:00+08:00: Updated suggestion to GPT-5.6 Sol with xhigh reasoning; this task needs the flagship model for reusable, performance-safe motion architecture.
- 2026-07-10T00:00:00+08:00: Started implementation after confirming both dependencies are complete; preserving the existing theme-owned motion hooks while adding a reduced-motion-safe client runtime and reusable primitives.
- 2026-07-10T14:48:32+08:00: Completed theme-controlled none/low/premium motion presets, reusable reveal/parallax/masked-text/image/feedback primitives, an isolated IntersectionObserver and requestAnimationFrame client runtime, native scroll-timeline enhancement, reduced-motion fallbacks, and a viewport QA matrix. Invite and theme typechecks, 201 invite tests, 24 theme tests, focused formatting, diff checks, and the invite production build pass.
- 2026-07-10T15:12:03+08:00: Reopened after seeded Premium invite QA found scroll depth effectively imperceptible; strengthening the premium preset and making its animation-frame driver authoritative across browsers.
- 2026-07-10T15:15:09+08:00: Strengthened Premium to 88px media travel, opposing two-axis gallery drift, 42px chapter entrances, and image-only velocity blur up to 3.2px; Premium now consistently uses the animation-frame driver rather than relying on partial native timeline support. Invite and theme typechecks, 202 invite tests, 24 theme tests, focused formatting, diff checks, and the invite production build pass.
