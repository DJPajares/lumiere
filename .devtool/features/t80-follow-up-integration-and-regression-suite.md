---
id: 't80-follow-up-integration-and-regression-suite'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'testing'
dueDate: null
created: '2026-07-13T09:00:00+08:00'
modified: '2026-07-13T09:00:00+08:00'
completedAt: null
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

- [ ] Automated smoke flow covers manager sign-in, notification navigation/dismissal, RSVP setting changes, story editing, preview, publishing, and event deletion safeguards.
- [ ] Guest smoke flow covers public/guest invite loading, light/dark toggle when allowed, map display/open action, common/custom RSVP designs, configurable fields, and successful submission.
- [ ] Visual regression snapshots cover representative dashboard breakpoints and at least three materially different invite themes.
- [ ] Image checks confirm no unexpected raw `<img>` elements, layout shifts, broken remote images, or incorrect eager-loading behavior.
- [ ] Theme boundary checks prove invite/theme code has no dashboard UI imports or app-level concrete-theme branches.
- [ ] Accessibility checks cover notification controls, publish flow, destructive confirmation, theme toggle, map, and both RSVP renderer paths.
- [ ] README or implementation notes document any intentionally deferred behavior and the commands used to verify the increment.

## UI Quality Checklist

- [ ] Dashboard controls use `@lumiere/dashboard-ui` shadcn/Base UI primitives where applicable.
- [ ] Invite and theme visuals remain fully custom and contain no shadcn/Base UI imports.
- [ ] Loading, empty, error, success, disabled, focus, hover, and active states are handled where relevant.
- [ ] Mobile, tablet, and desktop behavior is explicitly verified.
- [ ] Keyboard, screen-reader, contrast, focus-management, and reduced-motion basics are covered.
- [ ] The result follows `SKILL.md` and avoids generic AI-dashboard or invitation-template patterns.

## Notes

Keep this focused on the t68-t79 increment. It should not become a substitute for the broader project release task.

## Progress Log

- 2026-07-13T09:00:00+08:00: Task created from dashboard and invite follow-up review.
