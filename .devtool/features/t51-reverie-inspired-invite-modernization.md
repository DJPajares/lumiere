---
id: 't51-reverie-inspired-invite-modernization'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-09T00:00:00+08:00'
modified: '2026-07-10T00:00:00+08:00'
completedAt: null
labels: ['invite', 'themes', 'reverie', 'uiux']
depends_on: ['t28-invite-section-renderers', 't36-invite-visual-composition-system', 't37-theme-template-design-specs']
order: 'a51'
---

# t51-reverie-inspired-invite-modernization - Reverie-inspired invite modernization pass

## Hierarchy

- Epic: `frontend`
- Dependencies: `t28-invite-section-renderers`, `t36-invite-visual-composition-system`, `t37-theme-template-design-specs`

## Scope

Modernize Lumiere invite pages using Reverie as a quality reference: editorial typography, cinematic sections, smooth scroll, tasteful parallax, premium theme variants, and config-driven rendering without copying Reverie blindly.

## Suggested Agent

- Suggested model: `GPT-5.6 Sol` (`gpt-5.6-sol`)
- Reasoning level: `xhigh`

## Acceptance

- [ ] Invite page design read is updated to target premium editorial event invitations, not generic event landing pages.
- [ ] Invite app has a reference audit note identifying applicable Reverie patterns such as section composition, theme registry, motion wrappers, scroll progress, and premium typography.
- [ ] At least one wedding invite flow is redesigned with stronger hierarchy, typography, imagery, and section rhythm.
- [ ] Modernization keeps database-driven content and Lumiere theme registry architecture intact.
- [ ] Implementation avoids one-to-one copying of Reverie code unless intentionally ported with attribution and compatibility review.
- [ ] Tests or visual stories cover the redesigned invite page in public and guest-token states.

## UI Quality Checklist

- [ ] Uses the selected dashboard or invite component strategy before custom UI.
- [ ] Follows Lumiere color, shape, typography, motion, and theme locks from `SKILL.md`.
- [ ] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [ ] Works on required mobile, tablet, and desktop viewport widths.
- [ ] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [ ] Avoids generic AI-slop patterns listed in `SKILL.md`.


## Notes

Reverie's public repo describes a typographic editorial wedding invitation with config-driven themes, Tailwind v4, Motion, Lenis, and Leaflet. Use it as a taste and architecture reference while adapting to Lumiere's multi-event SaaS model.

## Progress Log

- 2026-07-09T00:00:00+08:00: Task created from dashboard and invite UX review concerns.
- 2026-07-10T00:00:00+08:00: Updated suggestion to GPT-5.6 Sol with xhigh reasoning; this task requires the flagship model for the broad visual and architectural modernization pass.
