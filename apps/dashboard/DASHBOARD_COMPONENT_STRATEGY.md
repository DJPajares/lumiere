# Dashboard Component Strategy

## Decision

Use project-owned shadcn/ui `base-nova` components backed by Base UI for the dashboard. Reusable
primitives, hooks, utilities, and semantic styles live in `@lumiere/dashboard-ui`; event forms,
navigation, gallery controls, and workflow compositions remain in `apps/dashboard`.

This supersedes the earlier local-only primitive decision from t49. The public invite app and theme
renderers remain custom and cannot import shadcn, Base UI, or `@lumiere/dashboard-ui`.

## Workflow

- Run shadcn through `pnpm dlx shadcn@latest` from `apps/dashboard`.
- Review `add` operations with `--dry-run`, `--view`, or `--diff` before changing existing files.
- Use Base UI registry output only. Do not introduce Radix-specific dependencies or APIs.
- Keep the two `components.json` files aligned on style, base color, icons, RSC, and CSS variables.
- Import app styles through `@lumiere/dashboard-ui/globals.css`; keep feature CSS out of globals.

## Migration Boundary

The t49 controls in `components/ui/dashboard-fields.tsx` remain compatibility wrappers while feature
flows migrate in t57 and t58. New dashboard work starts with `@lumiere/dashboard-ui` components.
The explicit boundary check is `pnpm check:dashboard-ui-boundary`.

## Showcase

Use `/ui-showcase` in the dashboard app to review light/dark tokens, common field states, loading,
overlay focus behavior, destructive confirmation, and toast feedback.
