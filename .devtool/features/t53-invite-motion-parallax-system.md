---
id: 't53-invite-motion-parallax-system'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-09T00:00:00+08:00'
modified: '2026-07-10T00:00:00+08:00'
completedAt: null
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

- [ ] Motion primitives support reveal, parallax layers, scroll progress, masked text, soft image movement, and section transitions.
- [ ] Motion intensity can be controlled per theme and respects `prefers-reduced-motion`.
- [ ] Parallax uses transform/opacity patterns and avoids React state updates on every scroll frame.
- [ ] Animations improve hierarchy and storytelling without blocking reading or RSVP completion.
- [ ] Motion components are isolated client leaves in Next.js where required.
- [ ] Tests or stories demonstrate no-motion, low-motion, and premium-motion variants.

## UI Quality Checklist

- [ ] Uses the selected dashboard or invite component strategy before custom UI.
- [ ] Follows Lumiere color, shape, typography, motion, and theme locks from `SKILL.md`.
- [ ] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [ ] Works on required mobile, tablet, and desktop viewport widths.
- [ ] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [ ] Avoids generic AI-slop patterns listed in `SKILL.md`.


## Notes

Apply TasteSkill: motion must communicate hierarchy, storytelling, feedback, or state transition. If it does not, remove it.

## Progress Log

- 2026-07-09T00:00:00+08:00: Task created from dashboard and invite UX review concerns.
- 2026-07-10T00:00:00+08:00: Updated suggestion to GPT-5.6 Sol with xhigh reasoning; this task needs the flagship model for reusable, performance-safe motion architecture.
