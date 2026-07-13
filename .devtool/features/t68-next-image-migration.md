---
id: 't68-next-image-migration'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'quality'
dueDate: null
created: '2026-07-13T09:00:00+08:00'
modified: '2026-07-13T09:00:00+08:00'
completedAt: null
labels: ['nextjs', 'images', 'performance', 'dashboard', 'invite', 'themes']
depends_on: ['t17-invite-app-scaffold', 't18-dashboard-app-scaffold', 't64-invite-theme-module-directory-refactor']
order: 'a68'
---

# t68-next-image-migration - Migrate Next.js-rendered images to next/image

## Hierarchy

- Epic: `quality`
- Dependencies: `t17-invite-app-scaffold`, `t18-dashboard-app-scaffold`, `t64-invite-theme-module-directory-refactor`

## Scope

Audit the dashboard, invite app, and Next.js-rendered theme modules for raw `<img>` elements and migrate them to `next/image` where supported. Establish correct sizing, remote-image configuration, loading priority, and reusable image patterns without breaking the fully custom invite theme renderer.

## Suggested Agent

- Suggested model: `GPT-5.6 Terra (gpt-5.6-terra)`
- Reasoning level: `high`

## Acceptance

- [ ] All raw `<img>` elements rendered by `apps/dashboard`, `apps/invite`, and compatible Next.js theme components are replaced with `next/image`, except documented cases where Next Image is technically inappropriate.
- [ ] `next.config` uses narrow `remotePatterns` for approved external image hosts instead of broad wildcard access.
- [ ] Images use intrinsic `width`/`height` or a constrained `fill` container and a meaningful `sizes` value to prevent layout shift and oversized downloads.
- [ ] Only actual above-the-fold/LCP images use `priority` or eager loading; galleries and below-the-fold assets remain lazy.
- [ ] Theme image abstractions, if added, live in the invite/theme layer and do not import dashboard shadcn components.
- [ ] Decorative images use empty alt text while meaningful images have context-specific alternatives.
- [ ] Tests or static checks prevent new raw `<img>` usage in the scoped Next.js code, with an explicit allowlist for justified exceptions.

## UI Quality Checklist

- [ ] Dashboard controls use `@lumiere/dashboard-ui` shadcn/Base UI primitives where applicable.
- [ ] Invite and theme visuals remain fully custom and contain no shadcn/Base UI imports.
- [ ] Loading, empty, error, success, disabled, focus, hover, and active states are handled where relevant.
- [ ] Mobile, tablet, and desktop behavior is explicitly verified.
- [ ] Keyboard, screen-reader, contrast, focus-management, and reduced-motion basics are covered.
- [ ] The result follows `SKILL.md` and avoids generic AI-dashboard or invitation-template patterns.

## Notes

Do not replace CSS background images, map iframes, SVG component imports, or unsupported external embeds with `next/image`. If `packages/themes` imports `next/image`, declare `next` as a compatible peer dependency and verify both the invite renderer and dashboard preview build.

## Progress Log

- 2026-07-13T09:00:00+08:00: Task created from dashboard and invite follow-up review.
