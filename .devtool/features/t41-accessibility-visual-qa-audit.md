---
id: 't41-accessibility-visual-qa-audit'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'quality'
dueDate: null
created: '2026-07-07T00:00:00+08:00'
modified: '2026-07-09T13:18:44+08:00'
completedAt: null
labels: ['accessibility', 'visual-qa', 'uiux', 'quality']
depends_on: ['t35-brand-identity-and-pwa-assets', 't36-invite-visual-composition-system', 't37-theme-template-design-specs', 't38-dashboard-manager-ux-pass', 't39-section-builder-live-preview-ux', 't40-rsvp-flow-delight-and-recovery', 't42-invite-ambient-audio-and-media-controls', 't32-integration-smoke-tests']
order: 'a41'
---

# t41-accessibility-visual-qa-audit - Accessibility and visual QA audit

## Hierarchy

- Epic: `quality`
- Dependencies: `t35-brand-identity-and-pwa-assets`, `t36-invite-visual-composition-system`, `t37-theme-template-design-specs`, `t38-dashboard-manager-ux-pass`, `t39-section-builder-live-preview-ux`, `t40-rsvp-flow-delight-and-recovery`, `t32-integration-smoke-tests`

## Scope

Perform final accessibility, visual QA, and TasteSkill pre-flight audits across the Lumiere public invite and dashboard experiences.

## Suggested Agent

- Suggested model: `GPT-5.5`
- Reasoning level: `extra high`

## Acceptance

- [ ] Audit covers public event page, guest invite page, RSVP states, dashboard overview, theme selector, section builder, guest management, and responses/activity.
- [ ] Contrast, focus states, labels, alt text, keyboard access, and reduced-motion behavior are checked on representative screens.
- [ ] Light and dark variants are checked for supported themes.
- [ ] Mobile, tablet, and desktop screenshots or manual QA notes are captured for critical flows.
- [ ] Premium invite screenshots/video notes verify the experience no longer reads as a simple card stack and includes intended immersive motion where enabled.
- [ ] Audio controls, autoplay fallback behavior, mute/pause state, and missing-audio state are checked on public and guest invite pages.
- [ ] Anti-slop checklist is applied to invitation pages and theme previews.
- [ ] Findings are documented with fixes or follow-up tasks.

## UI Quality Checklist

- [ ] Uses Tailwind tokens and project-owned primitives before adding a component library.
- [ ] Follows Lumiere color, shape, brand, and theme locks from `SKILL.md`.
- [ ] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [ ] Works on required mobile and desktop viewport widths.
- [ ] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [ ] Avoids generic AI-slop patterns listed in `SKILL.md`.

## Notes

This is the UI/UX quality gate before considering the MVP visually ready.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
- 2026-07-09T13:18:44+08:00: Added immersive Premium visual QA and ambient audio QA coverage, and made the final audit depend on the new media controls task.
