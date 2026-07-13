---
id: 't68-next-image-migration'
status: 'done'
priority: 'high'
assignee: null
epic: 'quality'
dueDate: null
created: '2026-07-13T09:00:00+08:00'
modified: '2026-07-13T10:06:48+08:00'
completedAt: '2026-07-13T10:06:48+08:00'
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

- [x] All raw `<img>` elements rendered by `apps/dashboard`, `apps/invite`, and compatible Next.js theme components are replaced with `next/image`, except documented cases where Next Image is technically inappropriate.
- [x] `next.config` avoids hostname allowlisting and uses direct image loading for arbitrary external image URLs.
- [x] Images use intrinsic `width`/`height` or a constrained `fill` container and a meaningful `sizes` value to prevent layout shift and oversized downloads.
- [x] Only actual above-the-fold/LCP images use `priority` or eager loading; galleries and below-the-fold assets remain lazy.
- [x] Theme image abstractions, if added, live in the invite/theme layer and do not import dashboard shadcn components.
- [x] Decorative images use empty alt text while meaningful images have context-specific alternatives.
- [x] Tests or static checks prevent new raw `<img>` usage in the scoped Next.js code, with an explicit allowlist for justified exceptions.

## UI Quality Checklist

- [ ] Dashboard controls use `@lumiere/dashboard-ui` shadcn/Base UI primitives where applicable.
- [ ] Invite and theme visuals remain fully custom and contain no shadcn/Base UI imports.
- [ ] Loading, empty, error, success, disabled, focus, hover, and active states are handled where relevant.
- [ ] Mobile, tablet, and desktop behavior is explicitly verified.
- [ ] Keyboard, screen-reader, contrast, focus-management, and reduced-motion basics are covered.
- [ ] The result follows `SKILL.md` and avoids generic AI-dashboard or invitation-template patterns.

## Notes

Do not replace CSS background images, map iframes, SVG component imports, or unsupported external embeds with `next/image`. If `packages/themes` imports `next/image`, declare `next` as a compatible peer dependency and verify both the invite renderer and dashboard preview build.

Both Next apps use `images.unoptimized: true`, and the image wrappers set `unoptimized` explicitly so authored images can come from different external hosts without routing through the Next image optimizer. Intrinsic sizing, responsive `sizes`, lazy loading, and meaningful alt text remain provided by `next/image`.

## Progress Log

- 2026-07-13T09:00:00+08:00: Task created from dashboard and invite follow-up review.
- 2026-07-13T10:06:48+08:00: Migrated dashboard and invite-rendered images to `next/image`, added responsive sizing and LCP/lazy loading rules, and narrowed both app configs to the seeded Unsplash host.
- 2026-07-13T10:06:48+08:00: Added `check:next-image-usage` with an empty documented exception allowlist; test fixtures are excluded because they are not rendered app source.
- 2026-07-13T10:06:48+08:00: Verified raw-image guard, formatting, both app typechecks, invite tests (32), dashboard tests (81), and both production builds.
- 2026-07-13T10:20:34+08:00: Removed hostname-specific optimizer configuration after external image URLs produced 500s; switched both apps and image wrappers to host-agnostic direct loading and reverified tests and production builds.
