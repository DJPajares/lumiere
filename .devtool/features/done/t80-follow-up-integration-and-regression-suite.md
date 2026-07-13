---
id: 't80-follow-up-integration-and-regression-suite'
status: 'done'
priority: 'high'
assignee: null
epic: 'testing'
dueDate: null
created: '2026-07-13T09:00:00+08:00'
modified: '2026-07-14T03:47:00+08:00'
completedAt: '2026-07-14T03:47:00+08:00'
labels: ['integration', 'regression', 'dashboard', 'invite', 'api', 'themes']
depends_on: ['t68-next-image-migration', 't69-dashboard-notification-interactions', 't70-rsvp-response-field-settings', 't71-event-deletion-lifecycle', 't72-story-paragraph-optional-title', 't73-event-publishing-workflow', 't74-invite-theme-mode-toggle', 't75-invite-location-map-experience', 't78-theme-aware-rsvp-renderer-contract', 't79-theme-ownership-boundary-enforcement']
order: 'a80'
---

# t80-follow-up-integration-and-regression-suite - Integrate and regression-test the follow-up dashboard and invite changes

## Hierarchy

- Epic: `testing`
- Dependencies: `t68-next-image-migration`, `t69-dashboard-notification-interactions`, `t70-rsvp-response-field-settings`, `t71-event-deletion-lifecycle`, `t72-story-paragraph-optional-title`, `t73-event-publishing-workflow`, `t74-invite-theme-mode-toggle`, `t75-invite-location-map-experience`, `t78-theme-aware-rsvp-renderer-contract`, `t79-theme-ownership-boundary-enforcement`

## Scope

Run a focused cross-layer integration and visual regression pass for the new image, notification, RSVP settings, deletion, story, publishing, theme mode, map, and theme-ownership work. Resolve interaction conflicts and document the final manager and guest workflows.

## Suggested Agent

- Suggested model: `GPT-5.6 Sol (gpt-5.6-sol)`
- Reasoning level: `xhigh`

## Acceptance

- [x] Automated smoke flow covers manager sign-in, notification navigation/dismissal, RSVP setting changes, story editing, preview, publishing, and event deletion safeguards.
- [x] Guest smoke flow covers public/guest invite loading, light/dark toggle when allowed, map display/open action, common/custom RSVP designs, configurable fields, and successful submission.
- [x] Visual regression snapshots cover representative dashboard breakpoints and at least three materially different invite themes.
- [x] Image checks confirm no unexpected raw `<img>` elements, layout shifts, broken remote images, or incorrect eager-loading behavior.
- [x] Theme boundary checks prove invite/theme code has no dashboard UI imports or app-level concrete-theme branches.
- [x] Accessibility checks cover notification controls, publish flow, destructive confirmation, theme toggle, map, and both RSVP renderer paths.
- [x] README or implementation notes document any intentionally deferred behavior and the commands used to verify the increment.

## UI Quality Checklist

- [x] Dashboard controls use `@lumiere/dashboard-ui` shadcn/Base UI primitives where applicable.
- [x] Invite and theme visuals remain fully custom and contain no shadcn/Base UI imports.
- [x] Loading, empty, error, success, disabled, focus, hover, and active states are handled where relevant.
- [x] Mobile, tablet, and desktop behavior is explicitly verified.
- [x] Keyboard, screen-reader, contrast, focus-management, and reduced-motion basics are covered.
- [x] The result follows `SKILL.md` and avoids generic AI-dashboard or invitation-template patterns.

## Notes

Keep this focused on the t68-t79 increment. It should not become a substitute for the broader project release task.

## Progress Log

- 2026-07-13T09:00:00+08:00: Task created from dashboard and invite follow-up review.
- 2026-07-14T03:20:00+08:00: Started as the next unblocked task; auditing the t68-t79 workflow, accessibility, image, boundary, and visual-regression coverage before closing integration gaps.
- 2026-07-14T03:47:00+08:00: Completed manager and guest smoke extensions, responsive/theme contract snapshots, stricter image and theme CI gates, accessible Base UI sign-in integration, and the follow-up QA runbook. Pinned TypeScript 6.0.3 because Next 16 still embeds the JavaScript compiler API. Verified the full regression gate, typecheck, production build, lint task, targeted formatting, and diff checks. Live browser screenshots, pixel diffs, provider uptime, and the already-deferred permanent purge worker remain documented release-review or infrastructure follow-ups.
